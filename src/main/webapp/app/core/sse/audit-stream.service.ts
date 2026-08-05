import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ENABLE_REALTIME } from 'app/app.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';

/**
 * Live admin events, over Server-Sent Events.
 *
 * <p>This replaces a SockJS/STOMP client that pointed at `/websocket` — a path no backend in this
 * stack ever implemented. It connected to nothing, forever, while the widget above it reported
 * "connected". Meanwhile the api had a working Kafka-to-SSE bridge
 * (`HcAdminServiceKafkaResource#register`) with no callers at all. This talks to that bridge.
 *
 * <p><b>Why fetch and not EventSource.</b> The browser's `EventSource` cannot set request headers,
 * and the api is an OAuth2 resource server that reads the bearer token from `Authorization` only.
 * The usual workaround — putting the token in the query string — writes it into nginx's access log
 * and every proxy in between, which for a 24-hour admin token is not worth the convenience. So the
 * stream is read with `fetch` and the SSE framing is parsed here. It is a small format: events are
 * separated by a blank line, payload lines are prefixed `data:`.
 */
@Injectable({ providedIn: 'root' })
export class AuditStreamService {
  private static readonly MAX_RETRIES = 5;
  private static readonly BASE_RETRY_MILLIS = 1000;

  /** True only while a response body is actually being read. Nothing else may set this. */
  readonly connected = signal(false);

  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly authServerProvider = inject(AuthServerProvider);
  private readonly destroyRef = inject(DestroyRef);

  private readonly events = new Subject<unknown>();
  private controller: AbortController | null = null;
  private retries = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  /** Emits one value per event received. Cold until {@link connect} is called. */
  stream(): Observable<unknown> {
    return this.events.asObservable();
  }

  connect(): void {
    if (!ENABLE_REALTIME || this.controller) {
      return;
    }
    const token = this.authServerProvider.getToken();
    if (!token) {
      return;
    }
    void this.read(token);
  }

  disconnect(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.controller?.abort();
    this.controller = null;
    this.retries = 0;
    this.connected.set(false);
  }

  private async read(token: string): Promise<void> {
    const controller = new AbortController();
    this.controller = controller;

    try {
      const response = await fetch(this.applicationConfigService.getEndpointFor('api/hc-admin-service-kafka/register', 'hcadminservice'), {
        headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
        signal: controller.signal,
      });

      // A 401 or 403 is not a transient fault — retrying it just burns requests against a token
      // that will not become valid on its own.
      if (response.status === 401 || response.status === 403) {
        this.connected.set(false);
        this.controller = null;
        return;
      }
      if (!response.ok || !response.body) {
        throw new Error(`audit stream responded ${response.status}`);
      }

      this.connected.set(true);
      this.retries = 0;
      await this.consume(response.body);

      // The server closed cleanly. SseEmitter times out by design, so this is the normal path back
      // to reconnecting rather than an error.
      this.connected.set(false);
      this.controller = null;
      this.scheduleRetry(token);
    } catch (error) {
      this.connected.set(false);
      this.controller = null;
      if (!controller.signal.aborted) {
        this.scheduleRetry(token);
      }
    }
  }

  private async consume(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      buffer += decoder.decode(value, { stream: true });

      // Events are terminated by a blank line. Anything after the last one is a partial event and
      // stays in the buffer until the rest of it arrives — splitting eagerly is how SSE parsers
      // end up emitting half a JSON document.
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        this.emit(frame);
        boundary = buffer.indexOf('\n\n');
      }
    }
  }

  private emit(frame: string): void {
    const data = frame
      .split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart())
      .join('\n');

    if (!data) {
      return;
    }
    try {
      this.events.next(JSON.parse(data));
    } catch {
      // The bridge sends text/plain for anything it cannot type. Pass it through rather than
      // dropping the event — the mapper downstream copes with a bare string.
      this.events.next(data);
    }
  }

  private scheduleRetry(token: string): void {
    if (this.retries >= AuditStreamService.MAX_RETRIES) {
      return;
    }
    const delay = AuditStreamService.BASE_RETRY_MILLIS * 2 ** this.retries;
    this.retries++;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.read(token);
    }, delay);
  }
}

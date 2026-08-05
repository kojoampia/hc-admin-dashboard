import { TestBed } from '@angular/core/testing';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AuthServerProvider } from 'app/core/auth/auth-jwt.service';

(globalThis as { REALTIME_ENABLED?: boolean }).REALTIME_ENABLED = true;

import { AuditStreamService } from './audit-stream.service';

/**
 * A minimal stand-in for the parts of `fetch`'s Response that the service touches: `status`, `ok`
 * and `body.getReader()`. jsdom provides neither `Response` nor `ReadableStream`, and pulling in a
 * polyfill to test our own parser would only add a second implementation to be wrong about.
 *
 * Chunks are delivered one `read()` at a time, so a payload split across reads is exercised exactly
 * as the network delivers it — the case a naive parser gets wrong.
 */
function streamingResponse(chunks: string[], status = 200): Response {
  const encoder = new TextEncoder();
  let index = 0;
  return {
    status,
    ok: status >= 200 && status < 300,
    body: {
      getReader: () => ({
        read: () =>
          Promise.resolve(index < chunks.length ? { done: false, value: encoder.encode(chunks[index++]) } : { done: true, value: undefined }),
      }),
    },
  } as unknown as Response;
}

function errorResponse(status: number): Response {
  return { status, ok: false, body: null } as unknown as Response;
}

describe('AuditStreamService', () => {
  let service: AuditStreamService;
  let fetchSpy: jest.Mock;
  let originalFetch: typeof globalThis.fetch | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuditStreamService,
        { provide: AuthServerProvider, useValue: { getToken: () => 'a-token' } },
        { provide: ApplicationConfigService, useValue: { getEndpointFor: (path: string) => `/services/hcadminservice/${path}` } },
      ],
    });
    service = TestBed.inject(AuditStreamService);
    // Assigned rather than spied: jsdom does not provide fetch, so there is nothing to wrap.
    originalFetch = globalThis.fetch;
    fetchSpy = jest.fn();
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    service.disconnect();
    globalThis.fetch = originalFetch as typeof globalThis.fetch;
  });

  const settle = async (): Promise<void> => {
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
  };

  it('sends the bearer token as a header, not a query parameter', async () => {
    fetchSpy.mockResolvedValue(streamingResponse([]));

    service.connect();
    await settle();

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('/services/hcadminservice/api/hc-admin-service-kafka/register');
    expect((init as RequestInit).headers).toMatchObject({ Authorization: 'Bearer a-token' });
    // The whole reason this uses fetch rather than EventSource: a token in the query string ends up
    // in nginx's access log and every proxy in between.
    expect(String(url)).not.toContain('a-token');
  });

  it('emits one value per SSE frame', async () => {
    fetchSpy.mockResolvedValue(streamingResponse(['data:{"type":"Security"}\n\n', 'data:{"type":"Audit Log"}\n\n']));
    const received: unknown[] = [];
    service.stream().subscribe(event => received.push(event));

    service.connect();
    await settle();

    expect(received).toEqual([{ type: 'Security' }, { type: 'Audit Log' }]);
  });

  it('waits for the frame terminator when a payload is split across reads', async () => {
    // The failure this guards: splitting on every newline emits `{"type":"Sec` as its own event.
    fetchSpy.mockResolvedValue(streamingResponse(['data:{"type":"Sec', 'urity"}\n\n']));
    const received: unknown[] = [];
    service.stream().subscribe(event => received.push(event));

    service.connect();
    await settle();

    expect(received).toEqual([{ type: 'Security' }]);
  });

  it('passes non-JSON payloads through rather than dropping them', async () => {
    fetchSpy.mockResolvedValue(streamingResponse(['data:a plain string\n\n']));
    const received: unknown[] = [];
    service.stream().subscribe(event => received.push(event));

    service.connect();
    await settle();

    expect(received).toEqual(['a plain string']);
  });

  it('reports connected only while a body is being read', async () => {
    fetchSpy.mockResolvedValue(streamingResponse(['data:{}\n\n']));
    expect(service.connected()).toBe(false);

    service.connect();
    await settle();

    // The stream above closes immediately, so by now it is back to disconnected — the point is that
    // nothing sets this flag optimistically at connect() time.
    expect(service.connected()).toBe(false);
  });

  it('does not retry a 401', async () => {
    fetchSpy.mockResolvedValue(errorResponse(401));

    service.connect();
    await settle();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(service.connected()).toBe(false);
  });

  it('does not open a second connection while one is open', async () => {
    fetchSpy.mockReturnValue(new Promise(() => undefined));

    service.connect();
    service.connect();
    await settle();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

});

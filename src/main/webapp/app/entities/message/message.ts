import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import dayjs from 'dayjs/esm';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MessageType } from 'app/entities/enumerations/message-type.model';
import { IMessage, NewMessage } from 'app/entities/message/message.model';
import { MessageService } from 'app/entities/message/service/message.service';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';

/** `All` plus the three values the api's MessageType actually defines. */
export type MessageCategory = keyof typeof MessageType;

export interface MessageRow {
  id: string;
  senderId: string;
  recipients: string;
  content: string;
  timestamp: dayjs.Dayjs | null;
  type: MessageCategory;
}

/**
 * The message list, on the sidebar's `/messages` route.
 *
 * <p>This screen used to render nine hardcoded messages — "MediCorp Systems", "System Autobot" and
 * friends — with no api call anywhere in the file.
 *
 * <h2>What went, and why</h2>
 *
 * <p>It was built against a richer model than the service has. The api's {@code Message} holds
 * {@code senderId}, {@code recipients}, {@code content}, {@code timestamp} and {@code type} — and
 * nothing else. So four things the old UI showed are gone rather than faked:
 *
 * <ul>
 *   <li><b>read / unread</b> — 12 template bindings, a mark-as-unread action and per-row styling,
 *       all driven by a field with no server-side existence. Read state is per-user and needs a
 *       backend to mean anything.
 *   <li><b>subject</b> — messages have content, not a subject line. The list shows a content
 *       preview instead of a fabricated title.
 *   <li><b>sender name and email</b> — the api stores a sender <em>id</em>. Showing a name would
 *       mean resolving it, and unlike Profile there is no id to join on here.
 *   <li><b>compose templates</b> — a template manager backed by nothing and persisted nowhere, so
 *       every one of its snippets vanished on refresh.
 * </ul>
 *
 * <p>The category filter is now the api's own {@code MessageType}, replacing the invented
 * Urgent/Inquiry/System/Other set. Replying posts a real message; deleting deletes one.
 */
@Component({
  selector: 'hpd-messages',
  standalone: true,
  imports: [NgClass, FormsModule, FormatMediumDatePipe, FormatMediumDatetimePipe, MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, MatDividerModule],
  templateUrl: './message.html',
})
export class MessageComponent {
  readonly categories: readonly ('All' | MessageCategory)[] = ['All', 'NOTIFICATION', 'ALERT', 'REMINDER'];

  readonly messages = signal<MessageRow[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  readonly activeCategory = signal<'All' | MessageCategory>('All');
  readonly searchQuery = signal<string>('');
  readonly selectedMessage = signal<MessageRow | null>(null);
  readonly replyContent = signal<string>('');
  readonly isSending = signal(false);

  readonly filteredMessages = computed(() => {
    const category = this.activeCategory();
    const query = this.searchQuery().toLowerCase().trim();
    return this.messages().filter(message => {
      const matchesCategory = category === 'All' || message.type === category;
      const matchesQuery =
        !query || message.senderId.toLowerCase().includes(query) || message.content.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  });

  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.load();
  }

  selectMessage(message: MessageRow): void {
    this.selectedMessage.set(message);
    this.replyContent.set('');
  }

  closeDetails(): void {
    this.selectedMessage.set(null);
  }

  deleteMessage(): void {
    const message = this.selectedMessage();
    if (!message) {
      return;
    }
    this.messageService
      .delete(message.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messages.update(list => list.filter(m => m.id !== message.id));
          this.selectedMessage.set(null);
        },
      });
  }

  /**
   * Posts a real message back to the sender. The old implementation cleared the textarea and did
   * nothing else, which looked identical to success.
   */
  sendReply(): void {
    const message = this.selectedMessage();
    const content = this.replyContent().trim();
    if (!message || !content || this.isSending()) {
      return;
    }

    const reply: NewMessage = {
      id: null,
      content,
      recipients: message.senderId,
      timestamp: dayjs(),
      type: 'NOTIFICATION',
    };

    this.isSending.set(true);
    this.messageService
      .create(reply)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.replyContent.set('');
          this.isSending.set(false);
          this.load();
        },
        error: () => this.isSending.set(false),
      });
  }

  getCategoryClasses(type: string): string {
    switch (type) {
      case 'ALERT':
        return 'bg-rose-100 text-rose-700';
      case 'REMINDER':
        return 'bg-amber-100 text-amber-700';
      case 'NOTIFICATION':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  private load(): void {
    this.isLoading.set(true);
    this.loadFailed.set(false);

    this.messageService
      .query()
      .pipe(
        catchError(() => {
          this.loadFailed.set(true);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(response => {
        this.messages.set((response?.body ?? []).map(message => this.toRow(message)));
        this.isLoading.set(false);
      });
  }

  private toRow(message: IMessage): MessageRow {
    return {
      id: message.id,
      // The api stores an id, not a name. Shown as-is rather than dressed up as a person.
      senderId: message.senderId ?? 'unknown',
      recipients: message.recipients ?? '',
      content: message.content ?? '',
      timestamp: message.timestamp ?? null,
      // `type` is optional on IMessage but MessageRow requires one; NOTIFICATION is the neutral
      // default rather than inventing a severity.
      type: message.type ?? 'NOTIFICATION',
    };
  }
}

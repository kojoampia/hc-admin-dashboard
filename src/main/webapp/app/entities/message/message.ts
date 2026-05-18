import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

export type MessageCategory = 'Urgent' | 'Inquiry' | 'System' | 'Other';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export interface Message {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  category: MessageCategory;
}

@Component({
  selector: 'hpd-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, MatDividerModule],
  templateUrl: './message.html',
})
export class MessageComponent {
  // ── State Signals ──────────────────────────────────────────────────────────

  messages = signal<Message[]>([
    {
      id: 1,
      sender: 'MediCorp Systems',
      senderEmail: 'accounts@medicorp.com',
      subject: 'New Vendor Application',
      content:
        'Dear Admin,\n\nMediCorp Systems has submitted a new vendor application requesting to join the Health Connect network as an approved medical supplies partner. Please review the attached documentation and approve or reject the application at your earliest convenience.\n\nReference: VND-2023-1024\nCategory: Medical Supplies\nContact: accounts@medicorp.com',
      date: 'Oct 24, 2023',
      isRead: false,
      category: 'Inquiry',
    },
    {
      id: 2,
      sender: 'System Autobot',
      senderEmail: 'noreply@system.local',
      subject: 'Shift Schedule Update',
      content:
        'This is an automated notification.\n\nThe shift schedule for the week of Oct 23–29 has been updated. Three professionals have been reassigned due to availability changes. Please log in to the Duty Roster module to review the updated schedule and confirm coverage for all open shifts.\n\nAffected departments: Emergency Care, General Ward, ICU.',
      date: 'Oct 23, 2023',
      isRead: true,
      category: 'System',
    },
    {
      id: 3,
      sender: 'DevOps Team',
      senderEmail: 'devops@system.local',
      subject: 'System Maintenance',
      content:
        'Scheduled Maintenance Notice\n\nThe Health Connect platform will undergo scheduled maintenance on Saturday, Oct 28, 2023 from 02:00–04:00 UTC. During this window, the following services will be temporarily unavailable:\n\n- API Gateway\n- Document Storage\n- Notification Engine\n\nPlease inform relevant stakeholders. No data loss is expected. Rollback procedures are in place.',
      date: 'Oct 22, 2023',
      isRead: true,
      category: 'System',
    },
    {
      id: 4,
      sender: 'Health Monitor AI',
      senderEmail: 'alerts@system.local',
      subject: 'Patient Data Alert',
      content:
        'URGENT — Anomaly Detected\n\nThe Health Monitor AI has flagged an unusual access pattern on patient records associated with account group PG-447. Seventeen records were accessed within a 90-second window from an unrecognised IP range (192.168.77.x).\n\nRecommended actions:\n1. Verify with IT Security\n2. Temporarily suspend affected account group\n3. Initiate audit log review\n\nThis alert was generated automatically and requires human review.',
      date: 'Oct 21, 2023',
      isRead: false,
      category: 'Urgent',
    },
  ]);

  activeCategory = signal<'All' | MessageCategory>('All');
  searchQuery = signal<string>('');
  selectedMessage = signal<Message | null>(null);
  replyContent = signal<string>('');

  templates = signal<MessageTemplate[]>([
    {
      id: 'tpl-1',
      name: 'Acknowledge Receipt',
      content: 'Thank you for your message. We have received your inquiry and will respond within 2 business days.',
    },
    {
      id: 'tpl-2',
      name: 'Request More Info',
      content: 'Thank you for reaching out. To process your request, we require additional information. Could you please provide further details regarding your inquiry?',
    },
    {
      id: 'tpl-3',
      name: 'Issue Resolved',
      content: 'We are pleased to inform you that the issue you reported has been resolved. Please do not hesitate to contact us if you experience any further difficulties.',
    },
    {
      id: 'tpl-4',
      name: 'Follow Up',
      content: 'We are following up on our previous correspondence. Please let us know if you require any further assistance or if there are any updates on your end.',
    },
  ]);

  showTemplateManager = signal(false);
  editingTemplate = signal<MessageTemplate | null>(null);

  // ── Editor state (local, not a signal — only used inside modal) ────────────
  editorState: { name: string; content: string } = { name: '', content: '' };

  // ── Computed ───────────────────────────────────────────────────────────────

  readonly filteredMessages = computed(() => {
    const cat = this.activeCategory();
    const q = this.searchQuery().toLowerCase().trim();
    return this.messages().filter(msg => {
      const matchesCategory = cat === 'All' || msg.category === cat;
      const matchesQuery =
        !q ||
        msg.sender.toLowerCase().includes(q) ||
        msg.subject.toLowerCase().includes(q) ||
        msg.content.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  });

  // ── Template CRUD ──────────────────────────────────────────────────────────

  openTemplateManager(): void {
    this.editingTemplate.set(this.templates()[0] ?? null);
    if (this.templates()[0]) {
      this.editorState = { name: this.templates()[0].name, content: this.templates()[0].content };
    }
    this.showTemplateManager.set(true);
  }

  closeTemplateManager(): void {
    this.showTemplateManager.set(false);
    this.editingTemplate.set(null);
  }

  createNewTemplate(): void {
    const newTpl: MessageTemplate = { id: `tpl-${Date.now()}`, name: 'New Template', content: '' };
    this.templates.update(list => [...list, newTpl]);
    this.editTemplate(newTpl);
  }

  editTemplate(tpl: MessageTemplate): void {
    this.editingTemplate.set(tpl);
    this.editorState = { name: tpl.name, content: tpl.content };
  }

  deleteTemplate(id: string): void {
    this.templates.update(list => list.filter(t => t.id !== id));
    if (this.editingTemplate()?.id === id) {
      const remaining = this.templates();
      const next = remaining[0] ?? null;
      this.editingTemplate.set(next);
      this.editorState = next ? { name: next.name, content: next.content } : { name: '', content: '' };
    }
  }

  saveTemplate(): void {
    const tpl = this.editingTemplate();
    if (!tpl || !this.editorState.name.trim()) return;
    this.templates.update(list =>
      list.map(t => (t.id === tpl.id ? { ...t, name: this.editorState.name, content: this.editorState.content } : t)),
    );
    this.editingTemplate.update(current => (current ? { ...current, name: this.editorState.name, content: this.editorState.content } : null));
  }

  applyTemplate(content: string): void {
    this.replyContent.set(content);
  }

  // ── Reply ──────────────────────────────────────────────────────────────────

  sendReply(): void {
    if (this.replyContent().trim() !== '') {
      this.replyContent.set('');
    }
  }

  // ── Categorization ─────────────────────────────────────────────────────────

  getCategoryClasses(category: string): string {
    switch (category) {
      case 'Urgent':
        return 'bg-rose-100 text-rose-700';
      case 'Inquiry':
        return 'bg-indigo-100 text-indigo-700';
      case 'System':
        return 'bg-slate-200 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  // ── List Interaction ───────────────────────────────────────────────────────

  selectMessage(msg: Message): void {
    this.messages.update(list => list.map(m => (m.id === msg.id ? { ...m, isRead: true } : m)));
    this.selectedMessage.set({ ...msg, isRead: true });
    this.replyContent.set('');
  }

  markAsUnread(): void {
    const msg = this.selectedMessage();
    if (!msg) return;
    this.messages.update(list => list.map(m => (m.id === msg.id ? { ...m, isRead: false } : m)));
    this.selectedMessage.update(current => (current ? { ...current, isRead: false } : null));
  }

  deleteMessage(): void {
    const msg = this.selectedMessage();
    if (!msg) return;
    this.messages.update(list => list.filter(m => m.id !== msg.id));
    this.selectedMessage.set(null);
  }

  closeDetails(): void {
    this.selectedMessage.set(null);
  }
}

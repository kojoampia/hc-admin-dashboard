import { Injectable, signal, computed, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketAuthService } from 'app/widgets/chatbot/websocket-auth.service';

export type AppResource =
  | 'DASHBOARD'
  | 'MESSAGES'
  | 'DUTY_ROSTER'
  | 'PRICE_PLANS'
  | 'CATALOG'
  | 'FACILITIES'
  | 'TEAMS'
  | 'PROFILES';

export type Permission = 'READ' | 'WRITE' | 'DELETE' | 'CREATE' | 'UPDATE';

export type UserRole = 'USER' | 'ADMIN' | 'PATIENT' | 'PROFESSIONAL' | 'VENDOR' | 'EDITOR';

export interface AppUser {
  name: string;
  role: string;
}

export interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}

const AUDIT_TOPIC = '/topic/audit-events';

const TYPE_ICON_MAP: Record<string, string> = {
  'Audit Log': 'receipt_long',
  Security: 'security',
  'Role Change': 'manage_accounts',
  'Vendor Mgt': 'storefront',
  'Patient Mgt': 'person',
  Professional: 'assignment',
  Message: 'chat',
  Permission: 'lock',
  'System Configuration': 'settings',
};

const TYPE_COLOR_MAP: Record<string, string> = {
  'Audit Log': 'bg-indigo-100 text-indigo-600',
  Security: 'bg-rose-100 text-rose-600',
  'Role Change': 'bg-amber-100 text-amber-600',
  'Vendor Mgt': 'bg-emerald-100 text-emerald-600',
  'Patient Mgt': 'bg-blue-100 text-blue-600',
  Professional: 'bg-purple-100 text-purple-600',
  Message: 'bg-slate-100 text-slate-600',
  Permission: 'bg-rose-100 text-rose-600',
  'System Configuration': 'bg-indigo-100 text-indigo-600',
};

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  private readonly wsService = inject(WebsocketAuthService);

  readonly currentUser = signal<AppUser>({ name: 'Admin User', role: 'ADMIN' });

  readonly menu = computed(() => this.activeMenu());

  readonly sidebarExpanded = signal(true);

  readonly operationLogs = signal<ActivityEvent[]>(buildInitialLogs());

  private readonly activeMenu = signal<string>('DASHBOARD');

  private auditSubscription: Subscription | null = null;
  private logCounter = 50;

  setMenu(label: string): void {
    this.activeMenu.set(label);
  }

  toggleSidebar(): void {
    this.sidebarExpanded.update(v => !v);
  }

  setUser(user: AppUser): void {
    this.currentUser.set(user);
  }

  canAccess(resource: AppResource, permission: Permission): boolean {
    const role = this.currentUser().role;
    if (role === 'ADMIN') {
      return true;
    }
    // Default: all authenticated users can READ all resources
    if (permission === 'READ') {
      return true;
    }
    return false;
  }

  canAssignRole(role: UserRole): boolean {
    const currentRole = this.currentUser().role;
    if (currentRole === 'ADMIN') {
      return true;
    }
    const nonAdminAssignable: UserRole[] = ['USER', 'PATIENT', 'PROFESSIONAL', 'EDITOR'];
    return nonAdminAssignable.includes(role);
  }

  connectAuditTrail(): void {
    if (this.auditSubscription) {
      return;
    }
    this.wsService.connect();
    this.auditSubscription = this.wsService.subscribe(AUDIT_TOPIC).subscribe((raw: any) => {
      this.operationLogs.update(logs => [this.mapToActivityEvent(raw), ...logs]);
    });
  }

  disconnectAuditTrail(): void {
    if (this.auditSubscription) {
      this.auditSubscription.unsubscribe();
      this.auditSubscription = null;
    }
  }

  private mapToActivityEvent(raw: any): ActivityEvent {
    this.logCounter++;
    const type: string = raw.type ?? 'Audit Log';
    return {
      id: raw.id ?? `evt-ws-${this.logCounter}`,
      type,
      message: raw.message ?? raw.description ?? 'System event received.',
      timestamp: 'just now',
      icon: TYPE_ICON_MAP[type] ?? 'receipt_long',
      colorClass: TYPE_COLOR_MAP[type] ?? 'bg-indigo-100 text-indigo-600',
    };
  }
}

function buildInitialLogs(): ActivityEvent[] {
  const types = ['Audit Log', 'Security', 'Role Change', 'Vendor Mgt', 'Patient Mgt', 'Professional', 'Message', 'Permission', 'System Configuration'];
  const messages = [
    'User login detected from new IP address.',
    'Shift successfully reassigned to active personnel.',
    'Vendor profile updated with new credentials.',
    'Patient record accessed by administrative user.',
    'Role permissions modified for support team.',
    'System configuration change applied to scheduler.',
    'New professional onboarded to platform.',
    'Message flagged for compliance review.',
    'Permission granted for document export.',
    'Audit log reviewed and cleared by admin.',
    'Security alert triggered by failed login attempts.',
    'Patient plan updated to premium tier.',
    'Duty roster conflict resolved automatically.',
    'Notification sent to all active professionals.',
    'Pricing plan adjusted for new billing cycle.',
  ];
  const icons = ['security', 'manage_accounts', 'storefront', 'chat', 'person', 'assignment', 'notifications', 'lock', 'settings', 'receipt_long'];
  const colorClasses = [
    'bg-indigo-100 text-indigo-600',
    'bg-rose-100 text-rose-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-slate-100 text-slate-600',
  ];
  return Array.from({ length: 50 }).map((_, i) => ({
    id: `evt-${i}`,
    type: types[i % types.length],
    message: messages[i % messages.length],
    timestamp: `${(i * 3 + 1) % 60} minutes ago`,
    icon: icons[i % icons.length],
    colorClass: colorClasses[i % colorClasses.length],
  }));
}

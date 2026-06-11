import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WebsocketAuthService } from 'app/widgets/chatbot/websocket-auth.service';
import { AuditLogService } from 'app/entities/audit-log/service/audit-log.service';
import { AccountService } from 'app/core/auth/account.service';
import { IAuditLog } from 'app/entities/audit-log/audit-log.model';

export type AppResource = 'DASHBOARD' | 'MESSAGES' | 'DUTY_ROSTER' | 'PRICE_PLANS' | 'CATALOG' | 'FACILITIES' | 'TEAMS' | 'PROFILES';

export type Permission = 'READ' | 'WRITE' | 'DELETE' | 'CREATE' | 'UPDATE';

export type UserRole = 'USER' | 'ADMIN' | 'PATIENT' | 'PROFESSIONAL' | 'VENDOR' | 'EDITOR' | 'OPERATOR';

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
  readonly currentUser = signal<AppUser>({ name: 'Loading...', role: 'USER' });

  readonly menu = computed(() => this.activeMenu());

  readonly sidebarExpanded = signal(true);

  readonly operationLogs = signal<ActivityEvent[]>([]);

  private readonly wsService = inject(WebsocketAuthService);
  private readonly auditLogService = inject(AuditLogService);
  private readonly accountService = inject(AccountService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeMenu = signal<string>('OPERATIONS');

  private auditSubscription: Subscription | null = null;
  private auditConsumers = 0;
  private logCounter = 0;

  constructor() {
    this.init();
  }

  private init(): void {
    this.accountService
      .identity()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(account => {
        if (account) {
          const name = [account.firstName, account.lastName].filter(Boolean).join(' ') || account.login;
          const role = account.authorities.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER';
          this.currentUser.set({ name, role });
        }
      });

    this.auditLogService
      .query({ sort: ['createdDate,desc'], size: 50 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.body) {
          this.operationLogs.set(res.body.map(log => this.mapAuditLogToActivityEvent(log)));
        }
      });
  }

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
    this.auditConsumers++;
    if (this.auditSubscription) {
      return;
    }
    this.wsService.connect();
    this.auditSubscription = this.wsService.subscribe(AUDIT_TOPIC).subscribe((raw: any) => {
      this.operationLogs.update(logs => [this.mapToActivityEvent(raw), ...logs]);
    });
  }

  disconnectAuditTrail(): void {
    this.auditConsumers = Math.max(this.auditConsumers - 1, 0);
    if (this.auditConsumers === 0 && this.auditSubscription) {
      this.auditSubscription.unsubscribe();
      this.auditSubscription = null;
    }
  }

  private mapAuditLogToActivityEvent(log: IAuditLog): ActivityEvent {
    const type = log.actionType ?? 'Audit Log';
    return {
      id: log.id,
      type,
      message: log.metadata ?? 'System event recorded.',
      timestamp: log.createdDate ? log.createdDate.fromNow() : 'unknown',
      icon: TYPE_ICON_MAP[type] ?? 'receipt_long',
      colorClass: TYPE_COLOR_MAP[type] ?? 'bg-indigo-100 text-indigo-600',
    };
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


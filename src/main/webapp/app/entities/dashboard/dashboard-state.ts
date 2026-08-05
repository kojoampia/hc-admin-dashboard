import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuditStreamService } from 'app/core/sse/audit-stream.service';
import { AuditLogService } from 'app/entities/audit-log/service/audit-log.service';
import { AccountService } from 'app/core/auth/account.service';
import { IAuditLog } from 'app/entities/audit-log/audit-log.model';

export type AppResource = 'DASHBOARD' | 'MESSAGES' | 'DUTY_ROSTER' | 'PRICE_PLANS' | 'CATALOG' | 'FACILITIES' | 'TEAMS' | 'PROFILES';

export type Permission = 'READ' | 'WRITE' | 'DELETE' | 'CREATE' | 'UPDATE';

/**
 * The three authorities this stack actually issues — the gateway's `AuthoritiesMigration` seeds
 * exactly these. PATIENT, PROFESSIONAL, VENDOR and EDITOR used to be listed here and no backend
 * ever minted them, so `canAssignRole` was reasoning about roles that could not exist.
 */
export type UserRole = 'USER' | 'OPERATOR' | 'ADMIN';

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

  /** Live connection state, straight from the stream — see {@link AuditStreamService.connected}. */
  readonly auditTrailConnected = computed(() => this.auditStream.connected());

  private readonly auditStream = inject(AuditStreamService);
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

  setMenu(label: string): void {
    this.activeMenu.set(label);
  }

  toggleSidebar(): void {
    this.sidebarExpanded.update(v => !v);
  }

  setUser(user: AppUser): void {
    this.currentUser.set(user);
  }

  /**
   * Mirrors the api's filter chain: admins do everything, operators read, a bare USER reaches
   * nothing. This is a hint for hiding controls, not a gate — the server decides.
   */
  canAccess(resource: AppResource, permission: Permission): boolean {
    const role = this.currentUser().role;
    if (role === 'ADMIN') {
      return true;
    }
    if (role === 'OPERATOR') {
      return permission === 'READ';
    }
    return false;
  }

  canAssignRole(role: UserRole): boolean {
    // Only an admin assigns authorities at all — /api/admin/users is ROLE_ADMIN on every method,
    // so anyone else offering the choice is offering a request the gateway will reject.
    return this.currentUser().role === 'ADMIN' && (['USER', 'OPERATOR', 'ADMIN'] as UserRole[]).includes(role);
  }

  connectAuditTrail(): void {
    this.auditConsumers++;
    if (this.auditSubscription) {
      return;
    }
    this.auditStream.connect();
    this.auditSubscription = this.auditStream.stream().subscribe((raw: any) => {
      this.operationLogs.update(logs => [this.mapToActivityEvent(raw), ...logs]);
    });
  }

  disconnectAuditTrail(): void {
    this.auditConsumers = Math.max(this.auditConsumers - 1, 0);
    if (this.auditConsumers === 0 && this.auditSubscription) {
      this.auditSubscription.unsubscribe();
      this.auditSubscription = null;
      // The old code stopped here, leaving the transport open for the lifetime of the app. Refcount
      // reaching zero means nothing is listening, so the stream should close too.
      this.auditStream.disconnect();
    }
  }

  private init(): void {
    this.accountService
      .identity()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(account => {
        if (account) {
          const name = [account.firstName, account.lastName].filter(Boolean).join(' ') || account.login;
          // `.some` on the name, not `.includes` of a literal: authorities are IAuthority objects,
          // and includes() compares by reference, so a fresh literal never matches.
          const has = (authority: string): boolean => account.authorities.some(held => held.name === authority);
          // Checked most-privileged first: the operator account also holds ROLE_USER as a baseline,
          // so the order is what stops it reading as a plain user.
          const role: UserRole = has('ROLE_ADMIN') ? 'ADMIN' : has('ROLE_OPERATOR') ? 'OPERATOR' : 'USER';
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

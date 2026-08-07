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
  'Audit Log': 'bg-hpd-primary/15 text-hpd-primary',
  Security: 'bg-hpd-danger-tint text-hpd-danger',
  'Role Change': 'bg-hpd-warning-tint text-hpd-warning',
  'Vendor Mgt': 'bg-hpd-success-tint text-hpd-success',
  'Patient Mgt': 'bg-hpd-chart-blue/25 text-hpd-primary',
  Professional: 'bg-hpd-gold-tint text-hpd-gold',
  Message: 'bg-hpd-surface text-hpd-muted',
  Permission: 'bg-hpd-danger-tint text-hpd-danger',
  'System Configuration': 'bg-hpd-primary/15 text-hpd-primary',
};

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  readonly currentUser = signal<AppUser>({ name: 'Loading...', role: 'USER' });

  /** The dashboard's active section — one of DashboardComponent's DashboardSectionIds. */
  readonly menu = computed(() => this.activeMenu());

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

  // `sidebarExpanded` / `toggleSidebar()` went with the BridgeCare shell: the sidebar no longer
  // collapses to an icon rail, so nothing owned that flag any more. The one caller outside this
  // service was DashboardComponent.toggleSidebar(), which no template ever bound to.

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
          // Authorities are plain strings on the wire — see the note on Account.authorities.
          const has = (authority: string): boolean => account.authorities.includes(authority);
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
      colorClass: TYPE_COLOR_MAP[type] ?? 'bg-hpd-primary/15 text-hpd-primary',
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
      colorClass: TYPE_COLOR_MAP[type] ?? 'bg-hpd-primary/15 text-hpd-primary',
    };
  }
}

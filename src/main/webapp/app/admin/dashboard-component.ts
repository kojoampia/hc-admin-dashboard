import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { Account } from 'app/core/auth/account.model';
import { AccountService } from 'app/core/auth/account.service';
import SharedModule from 'app/shared/shared.module';
import AccessControlComponent from './access-control/access-control';
import AlertsComponent from './alerts/alerts';
import CustomizableLayoutComponent from './customizable-layout/customizable-layout';
import DataExportComponent from './data-export/data-export';
import { DashboardLayoutService, DashboardWidgetId, DashboardWidgetLayout } from './dashboard-layout.service';
import RealTimeDataComponent from './real-time-data/real-time-data';
import SystemHealthComponent from './system-health/system-health';
import UsageStatisticsComponent from './usage-statistics/usage-statistics';
import UserActivityComponent from './user-activity/user-activity';

type DashboardLink = {
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly icon: string;
};

type DashboardSectionId = 'overview' | 'monitoring' | 'analytics' | 'settings';

type DashboardSection = {
  readonly id: DashboardSectionId;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly widgetIds: readonly DashboardWidgetId[];
};

type DashboardSectionView = DashboardSection & {
  readonly widgets: DashboardWidgetLayout[];
};

@Component({
  selector: 'hpd-admin-dashboard',
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    AccessControlComponent,
    UserActivityComponent,
    AlertsComponent,
    CustomizableLayoutComponent,
    DataExportComponent,
    RealTimeDataComponent,
    SystemHealthComponent,
    UsageStatisticsComponent,
  ],
})
export default class DashboardComponent implements OnInit {
  readonly layout = this.dashboardLayoutService;
  readonly account = signal<Account | null>(null);
  readonly maximizedWidgetId = signal<DashboardWidgetId | null>(null);
  readonly minimizedWidgetIds = signal<DashboardWidgetId[]>([]);
  readonly dashboardSections: readonly DashboardSection[] = [
    {
      id: 'monitoring',
      title: 'Operations',
      description: 'Real-time monitoring and health surfaces for day-to-day platform supervision.',
      icon: 'monitoring',
      widgetIds: ['systemHealth', 'alerts', 'realtimeData'],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Request trends, reporting exports, and other data-heavy operational insights.',
      icon: 'query_stats',
      widgetIds: ['usageStatistics', 'dataExport'],
    },
    {
      id: 'overview',
      title: 'User management',
      description: 'Identity, access, and operator controls grouped around account administration.',
      icon: 'admin_panel_settings',
      widgetIds: ['userActivity', 'accessControl', 'customizableLayout'],
    },
    {
      id: 'settings',
      title: 'Admin tools',
      description: 'Direct navigation into the existing administration screens.',
      icon: 'settings',
      widgetIds: [],
    },
  ];
  readonly hiddenWidgetCount = computed(() => this.layout.widgets().filter(widget => !widget.visible).length);
  readonly visibleWidgetCount = computed(() => this.layout.widgets().filter(widget => widget.visible).length);
  readonly visibleSections = computed<DashboardSectionView[]>(() => {
    const maximizedWidgetId = this.maximizedWidgetId();
    const widgetsById = new Map(this.layout.widgets().map(widget => [widget.id, widget]));

    return this.dashboardSections
      .map(section => ({
        ...section,
        widgets: section.widgetIds
          .map(widgetId => widgetsById.get(widgetId))
          .filter((widget): widget is DashboardWidgetLayout => Boolean(widget))
          .filter(widget => widget.visible && (!maximizedWidgetId || widget.id === maximizedWidgetId)),
      }))
      .filter(section => section.widgets.length > 0 || section.id === 'settings');
  });
  readonly adminLinks: DashboardLink[] = [
    {
      title: 'User management',
      description: 'Review accounts, activation state, and administrator access.',
      route: '/admin/user-management',
      icon: 'groups',
    },
    {
      title: 'Health',
      description: 'Inspect service components, dependencies, and availability.',
      route: '/admin/health',
      icon: 'favorite',
    },
    {
      title: 'Metrics',
      description: 'Analyze request volume, JVM activity, and service usage.',
      route: '/admin/metrics',
      icon: 'monitoring',
    },
    {
      title: 'Configuration',
      description: 'Check runtime configuration exposed by the admin API.',
      route: '/admin/configuration',
      icon: 'settings',
    },
    {
      title: 'Gateway',
      description: 'Monitor registered routes and upstream gateway services.',
      route: '/admin/gateway',
      icon: 'lan',
    },
    {
      title: 'Logs',
      description: 'Inspect runtime logs and troubleshoot operational issues.',
      route: '/admin/logs',
      icon: 'receipt_long',
    },
    {
      title: 'API docs',
      description: 'Open the administrative API reference and endpoint details.',
      route: '/admin/docs',
      icon: 'description',
    },
  ];

  constructor(
    private dashboardLayoutService: DashboardLayoutService,
    private accountService: AccountService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.accountService
      .identity()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(account => this.account.set(account));
  }

  openWidget(widgetId: DashboardWidgetId): void {
    if (!this.isWidgetVisible(widgetId)) {
      this.layout.setWidgetVisibility(widgetId, true);
    }

    this.minimizedWidgetIds.update(widgetIds => widgetIds.filter(id => id !== widgetId));
    this.maximizedWidgetId.set(widgetId);
    this.scrollToElement(this.widgetElementId(widgetId));
  }

  closeWidget(widgetId: DashboardWidgetId): void {
    this.layout.setWidgetVisibility(widgetId, false);
    this.minimizedWidgetIds.update(widgetIds => widgetIds.filter(id => id !== widgetId));
    if (this.maximizedWidgetId() === widgetId) {
      this.maximizedWidgetId.set(null);
    }
  }

  toggleMaximizeWidget(widgetId: DashboardWidgetId): void {
    this.maximizedWidgetId.update(current => (current === widgetId ? null : widgetId));
    this.minimizedWidgetIds.update(widgetIds => widgetIds.filter(id => id !== widgetId));
    this.scrollToElement(this.widgetElementId(widgetId));
  }

  toggleMinimizeWidget(widgetId: DashboardWidgetId): void {
    if (this.maximizedWidgetId() === widgetId) {
      this.maximizedWidgetId.set(null);
      return;
    }

    this.minimizedWidgetIds.update(widgetIds =>
      widgetIds.includes(widgetId) ? widgetIds.filter(id => id !== widgetId) : [...widgetIds, widgetId],
    );
  }

  isWidgetMinimized(widgetId: DashboardWidgetId): boolean {
    return this.minimizedWidgetIds().includes(widgetId);
  }

  isWidgetMaximized(widgetId: DashboardWidgetId): boolean {
    return this.maximizedWidgetId() === widgetId;
  }

  isWidgetVisible(widgetId: DashboardWidgetId): boolean {
    return this.layout.widgets().some(widget => widget.id === widgetId && widget.visible);
  }

  widgetContainerClasses(widgetId: DashboardWidgetId): string {
    if (this.isWidgetMaximized(widgetId)) {
      return 'min-h-[calc(100vh-12rem)] border-indigo-400 shadow-2xl shadow-indigo-950/15';
    }

    return 'border-slate-200 shadow-sm';
  }

  currentUserName(): string {
    const account = this.account();
    const fullName = [account?.firstName, account?.lastName].filter(Boolean).join(' ').trim();
    // `||` is deliberate, not a missed `??`: an account with no names joins to the empty string,
    // and an empty login should fall through too. `??` would return '' for both.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return fullName || account?.login || 'Administrator';
  }

  currentUserRole(): string {
    const authorities = this.account()?.authorities ?? [];
    // `.some` on the name, not `.includes` of a literal: authorities are IAuthority objects, and
    // includes() compares by reference, so a fresh literal never matches.
    return authorities.some(authority => authority.name === 'ROLE_ADMIN') ? 'Administrator' : 'Operator';
  }

  currentUserInitials(): string {
    const words = this.currentUserName().split(/\s+/).filter(Boolean);
    return words
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase() ?? '')
      .join('');
  }

  sectionElementId(sectionId: DashboardSectionId): string {
    return `admin-dashboard-section-${sectionId}`;
  }

  widgetElementId(widgetId: DashboardWidgetId): string {
    return `admin-dashboard-widget-${widgetId}`;
  }

  navigateToSection(sectionId: DashboardSectionId): void {
    this.maximizedWidgetId.set(null);
    this.scrollToElement(this.sectionElementId(sectionId));
  }

  private scrollToElement(elementId: string): void {
    setTimeout(() => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal, DOCUMENT } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CustomerSignalsComponent } from './metrics/customer-signals.component';
import { FinancePulseComponent } from './metrics/finance-pulse.component';
import { LiveActivityFeedComponent } from './metrics/live-activity-feed.component';
import { OperationsOverviewComponent } from './metrics/operations-overview.component';
import { RevenueBreakdownComponent } from './metrics/revenue-breakdown.component';
import { ShiftCoverageComponent } from './metrics/shift-coverage.component';
import { ShiftPerformanceComponent } from './metrics/shift-performance.component';
import { DashboardStateService } from './dashboard-state';

type DashboardSectionId = 'OPERATIONS' | 'SHIFT' | 'CUSTOMER' | 'FINANCE' | 'REVENUE';
type DashboardWidgetId =
  | 'operationsOverview'
  | 'liveActivity'
  | 'shiftPerformance'
  | 'shiftCoverage'
  | 'customerSignals'
  | 'financePulse'
  | 'revenueBreakdown';

type DashboardSection = {
  readonly id: DashboardSectionId;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
};

type DashboardWidget = {
  readonly id: DashboardWidgetId;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly sectionId: DashboardSectionId;
  readonly accentClass: string;
  readonly visible: boolean;
};

type DashboardSectionView = DashboardSection & {
  readonly widgets: DashboardWidget[];
};

@Component({
  selector: 'hpd-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    OperationsOverviewComponent,
    LiveActivityFeedComponent,
    ShiftPerformanceComponent,
    ShiftCoverageComponent,
    CustomerSignalsComponent,
    FinancePulseComponent,
    RevenueBreakdownComponent,
  ],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly state = inject(DashboardStateService);
  readonly isLightMode = signal(false);
  readonly maximizedWidgetId = signal<DashboardWidgetId | null>(null);
  readonly minimizedWidgetIds = signal<DashboardWidgetId[]>([]);
  readonly sections: readonly DashboardSection[] = [
    {
      id: 'OPERATIONS',
      title: 'Operations',
      description: 'Live operational visibility, workforce activity, and current execution status.',
      icon: 'space_dashboard',
    },
    {
      id: 'SHIFT',
      title: 'Shift management',
      description: 'Demand, coverage, fill-rate, and exception metrics for active staffing workflows.',
      icon: 'calendar_month',
    },
    {
      id: 'CUSTOMER',
      title: 'Patients',
      description: 'Operator engagement, satisfaction, retention, and support indicators.',
      icon: 'groups',
    },
    {
      id: 'FINANCE',
      title: 'Finance',
      description: 'Revenue health, margin, acquisition cost, and commercial performance.',
      icon: 'payments',
    },
    {
      id: 'REVENUE',
      title: 'Revenue',
      description: 'Growth channels, conversion trends, and recurring revenue movements.',
      icon: 'trending_up',
    },
  ];
  readonly widgets = signal<DashboardWidget[]>([
    {
      id: 'operationsOverview',
      title: 'Operations snapshot',
      description: 'Top operational KPIs for active shifts and profile inventory.',
      icon: 'dashboard_customize',
      sectionId: 'OPERATIONS',
      accentClass: 'from-indigo-500/20 via-indigo-500/10 to-transparent',
      visible: true,
    },
    {
      id: 'liveActivity',
      title: 'Live activity',
      description: 'Real-time operator and audit events from the dashboard activity stream.',
      icon: 'bolt',
      sectionId: 'OPERATIONS',
      accentClass: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
      visible: true,
    },
    {
      id: 'shiftPerformance',
      title: 'Shift performance',
      description: 'Request demand, assignment efficiency, and fill velocity trends.',
      icon: 'insights',
      sectionId: 'SHIFT',
      accentClass: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
      visible: true,
    },
    {
      id: 'shiftCoverage',
      title: 'Coverage risks',
      description: 'Unassigned, overtime, cancellation, and no-show pressure points.',
      icon: 'warning',
      sectionId: 'SHIFT',
      accentClass: 'from-amber-500/20 via-amber-500/10 to-transparent',
      visible: true,
    },
    {
      id: 'customerSignals',
      title: 'User signals',
      description: 'Operator adoption, satisfaction, retention, and support feedback.',
      icon: 'forum',
      sectionId: 'CUSTOMER',
      accentClass: 'from-fuchsia-500/20 via-fuchsia-500/10 to-transparent',
      visible: true,
    },
    {
      id: 'financePulse',
      title: 'Finance pulse',
      description: 'Revenue, margins, acquisition spend, and monetization health.',
      icon: 'account_balance_wallet',
      sectionId: 'FINANCE',
      accentClass: 'from-teal-500/20 via-teal-500/10 to-transparent',
      visible: true,
    },
    {
      id: 'revenueBreakdown',
      title: 'Revenue breakdown',
      description: 'Channel contribution and recurring growth trends across the platform.',
      icon: 'monitoring',
      sectionId: 'REVENUE',
      accentClass: 'from-rose-500/20 via-rose-500/10 to-transparent',
      visible: true,
    },
  ]);
  readonly visibleWidgetCount = computed(() => this.widgets().filter(widget => widget.visible).length);
  readonly hiddenWidgetCount = computed(() => this.widgets().filter(widget => !widget.visible).length);
  readonly currentSection = computed(() => this.state.menu() as DashboardSectionId);
  readonly visibleSections = computed<DashboardSectionView[]>(() => {
    const maximizedWidgetId = this.maximizedWidgetId();
    const widgets = this.widgets();

    return this.sections
      .map(section => ({
        ...section,
        widgets: widgets.filter(
          widget => widget.sectionId === section.id && widget.visible && (!maximizedWidgetId || widget.id === maximizedWidgetId),
        ),
      }))
      .filter(section => section.widgets.length > 0);
  });

  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    this.state.setMenu('OPERATIONS');
    this.state.connectAuditTrail();
  }

  ngOnDestroy(): void {
    this.state.disconnectAuditTrail();
  }

  toggleSidebar(): void {
    this.state.toggleSidebar();
  }

  toggleTheme(): void {
    this.isLightMode.update(mode => !mode);
  }

  openWidget(widgetId: DashboardWidgetId): void {
    this.widgets.update(widgets => widgets.map(widget => (widget.id === widgetId ? { ...widget, visible: true } : widget)));
    this.minimizedWidgetIds.update(widgetIds => widgetIds.filter(id => id !== widgetId));
    this.maximizedWidgetId.set(widgetId);
    this.scrollToElement(this.widgetElementId(widgetId));
  }

  closeWidget(widgetId: DashboardWidgetId): void {
    this.widgets.update(widgets => widgets.map(widget => (widget.id === widgetId ? { ...widget, visible: false } : widget)));
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
    }

    this.minimizedWidgetIds.update(widgetIds =>
      widgetIds.includes(widgetId) ? widgetIds.filter(id => id !== widgetId) : [...widgetIds, widgetId],
    );
  }

  navigateToSection(sectionId: DashboardSectionId): void {
    this.state.setMenu(sectionId);
    this.maximizedWidgetId.set(null);
    this.scrollToElement(this.sectionElementId(sectionId));
  }

  isWidgetVisible(widgetId: DashboardWidgetId): boolean {
    return this.widgets().some(widget => widget.id === widgetId && widget.visible);
  }

  isWidgetMinimized(widgetId: DashboardWidgetId): boolean {
    return this.minimizedWidgetIds().includes(widgetId);
  }

  isWidgetMaximized(widgetId: DashboardWidgetId): boolean {
    return this.maximizedWidgetId() === widgetId;
  }

  sectionButtonClasses(sectionId: DashboardSectionId): string {
    if (this.isLightMode()) {
      return this.currentSection() === sectionId
        ? '!bg-slate-900 !text-white shadow-md shadow-slate-300/40'
        : '!bg-slate-100 !text-slate-700 hover:!bg-slate-200';
    }

    return this.currentSection() === sectionId
      ? '!bg-white !text-slate-950 shadow-md shadow-slate-950/20'
      : '!bg-white/5 !text-slate-100 hover:!bg-white/10';
  }

  widgetContainerClasses(widgetId: DashboardWidgetId): string {
    if (this.isWidgetMaximized(widgetId)) {
      return this.isLightMode()
        ? 'xl:col-span-2 min-h-[calc(100vh-14rem)] border-slate-300 shadow-2xl shadow-slate-300/50'
        : 'xl:col-span-2 min-h-[calc(100vh-14rem)] border-indigo-300 shadow-2xl shadow-indigo-950/20';
    }

    return this.isLightMode() ? 'border-slate-200 shadow-lg shadow-slate-300/40' : 'border-white/10 shadow-lg shadow-slate-950/20';
  }

  currentUserName(): string {
    return this.state.currentUser().name || 'Operations Lead';
  }

  currentUserRole(): string {
    return this.state.currentUser().role || 'OPERATOR';
  }

  currentUserInitials(): string {
    return this.currentUserName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0]?.toUpperCase() ?? '')
      .join('');
  }

  sectionElementId(sectionId: DashboardSectionId): string {
    return `entity-dashboard-section-${sectionId.toLowerCase()}`;
  }

  widgetElementId(widgetId: DashboardWidgetId): string {
    return `entity-dashboard-widget-${widgetId}`;
  }

  private scrollToElement(elementId: string): void {
    setTimeout(() => {
      this.document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

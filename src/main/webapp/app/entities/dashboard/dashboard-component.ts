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
  /**
   * Gradient wash behind the widget head. The seven were seven different Tailwind hues; the
   * BridgeCare palette has no such range, so they now cycle the six brand tones that exist —
   * navy, chart blue, success, warning, gold, navy-hover — and no two adjacent widgets repeat.
   */
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
      accentClass: 'from-hpd-primary/20 via-hpd-primary/10 to-transparent',
      visible: true,
    },
    {
      id: 'liveActivity',
      title: 'Live activity',
      description: 'Real-time operator and audit events from the dashboard activity stream.',
      icon: 'bolt',
      sectionId: 'OPERATIONS',
      accentClass: 'from-hpd-chart-blue/20 via-hpd-chart-blue/10 to-transparent',
      visible: true,
    },
    {
      id: 'shiftPerformance',
      title: 'Shift performance',
      description: 'Request demand, assignment efficiency, and fill velocity trends.',
      icon: 'insights',
      sectionId: 'SHIFT',
      accentClass: 'from-hpd-success-accent/20 via-hpd-success-accent/10 to-transparent',
      visible: true,
    },
    {
      id: 'shiftCoverage',
      title: 'Coverage risks',
      description: 'Unassigned, overtime, cancellation, and no-show pressure points.',
      icon: 'warning',
      sectionId: 'SHIFT',
      accentClass: 'from-hpd-warning-accent/20 via-hpd-warning-accent/10 to-transparent',
      visible: true,
    },
    {
      id: 'customerSignals',
      title: 'User signals',
      description: 'Operator adoption, satisfaction, retention, and support feedback.',
      icon: 'forum',
      sectionId: 'CUSTOMER',
      accentClass: 'from-hpd-gold/20 via-hpd-gold/10 to-transparent',
      visible: true,
    },
    {
      id: 'financePulse',
      title: 'Finance pulse',
      description: 'Revenue, margins, acquisition spend, and monetization health.',
      icon: 'account_balance_wallet',
      sectionId: 'FINANCE',
      accentClass: 'from-hpd-primary-hover/20 via-hpd-primary-hover/10 to-transparent',
      visible: true,
    },
    {
      id: 'revenueBreakdown',
      title: 'Revenue breakdown',
      description: 'Channel contribution and recurring growth trends across the platform.',
      icon: 'monitoring',
      sectionId: 'REVENUE',
      accentClass: 'from-hpd-danger-accent/20 via-hpd-danger-accent/10 to-transparent',
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
        ? '!bg-hpd-primary-deep !text-white shadow-hpd shadow-hpd-border/40'
        : '!bg-hpd-surface !text-hpd-muted hover:!bg-hpd-border';
    }

    return this.currentSection() === sectionId
      ? '!bg-white !text-hpd-primary-dark shadow-hpd shadow-hpd-primary-deep/20'
      : '!bg-white/5 !text-white hover:!bg-white/10';
  }

  widgetContainerClasses(widgetId: DashboardWidgetId): string {
    if (this.isWidgetMaximized(widgetId)) {
      return this.isLightMode()
        ? 'xl:col-span-2 min-h-[calc(100vh-14rem)] border-hpd-border shadow-2xl shadow-hpd-border/50'
        : 'xl:col-span-2 min-h-[calc(100vh-14rem)] border-hpd-primary/40 shadow-2xl shadow-hpd-primary-deep/20';
    }

    return this.isLightMode()
      ? 'border-hpd-border shadow-hpd-lg shadow-hpd-border/40'
      : 'border-white/10 shadow-hpd-lg shadow-hpd-primary-deep/20';
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

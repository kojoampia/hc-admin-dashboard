import { computed, Injectable, Signal, signal, WritableSignal, inject } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

export type DashboardWidgetId =
  | 'userActivity'
  | 'systemHealth'
  | 'alerts'
  | 'usageStatistics'
  | 'dataExport'
  | 'accessControl'
  | 'customizableLayout'
  | 'realtimeData';

export type DashboardLayoutPreset = 'balanced' | 'operations' | 'security' | 'custom';

export type DashboardWidgetDefinition = {
  id: DashboardWidgetId;
  title: string;
  description: string;
  icon: string;
  span: 'single' | 'full';
};

export type DashboardWidgetLayout = DashboardWidgetDefinition & {
  visible: boolean;
};

type StoredDashboardLayout = {
  preset: DashboardLayoutPreset;
  order: DashboardWidgetId[];
  hidden: DashboardWidgetId[];
};

const STORAGE_KEY = 'admin-dashboard-layout';

const DASHBOARD_WIDGETS: readonly DashboardWidgetDefinition[] = [
  {
    id: 'userActivity',
    title: 'User activity',
    description: 'Account activation and onboarding insights.',
    icon: 'groups',
    span: 'single',
  },
  {
    id: 'systemHealth',
    title: 'System health',
    description: 'Health checks and runtime stability.',
    icon: 'favorite',
    span: 'single',
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: 'Threshold alerts and real-time notifications.',
    icon: 'notifications_active',
    span: 'single',
  },
  {
    id: 'usageStatistics',
    title: 'Usage statistics',
    description: 'Traffic, response codes, and service activity.',
    icon: 'monitoring',
    span: 'full',
  },
  {
    id: 'dataExport',
    title: 'Data export',
    description: 'Download JSON and CSV dashboard snapshots.',
    icon: 'download',
    span: 'full',
  },
  {
    id: 'accessControl',
    title: 'Access control',
    description: 'Review dashboard access and admin coverage.',
    icon: 'shield',
    span: 'single',
  },
  {
    id: 'customizableLayout',
    title: 'Customizable layout',
    description: 'Show, hide, and reorder dashboard widgets.',
    icon: 'dashboard_customize',
    span: 'single',
  },
  {
    id: 'realtimeData',
    title: 'Real-time data',
    description: 'Monitor the live audit activity feed.',
    icon: 'bolt',
    span: 'single',
  },
];

const DEFAULT_ORDER: DashboardWidgetId[] = DASHBOARD_WIDGETS.map(widget => widget.id);

const PRESET_STATES: Record<Exclude<DashboardLayoutPreset, 'custom'>, Omit<StoredDashboardLayout, 'preset'>> = {
  balanced: {
    order: DEFAULT_ORDER,
    hidden: [],
  },
  operations: {
    order: [
      'alerts',
      'realtimeData',
      'systemHealth',
      'usageStatistics',
      'userActivity',
      'accessControl',
      'dataExport',
      'customizableLayout',
    ],
    hidden: [],
  },
  security: {
    order: [
      'alerts',
      'accessControl',
      'realtimeData',
      'systemHealth',
      'userActivity',
      'usageStatistics',
      'dataExport',
      'customizableLayout',
    ],
    hidden: ['dataExport'],
  },
};

@Injectable({ providedIn: 'root' })
export class DashboardLayoutService {
  private localStorageService = inject(LocalStorageService);

  readonly activePreset: Signal<DashboardLayoutPreset>;
  readonly widgets: Signal<DashboardWidgetLayout[]>;
  readonly visibleWidgetIds: Signal<DashboardWidgetId[]>;

  private readonly layoutState: WritableSignal<StoredDashboardLayout>;

  constructor() {
    this.layoutState = signal<StoredDashboardLayout>(this.loadState());
    this.activePreset = computed(() => this.layoutState().preset);
    this.widgets = computed<DashboardWidgetLayout[]>(() => {
      const state = this.layoutState();
      const hidden = new Set(state.hidden);
      const orderIndex = new Map(state.order.map((id, index) => [id, index]));

      return [...DASHBOARD_WIDGETS]
        .sort((left, right) => (orderIndex.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (orderIndex.get(right.id) ?? Number.MAX_SAFE_INTEGER))
        .map(widget => ({
          ...widget,
          visible: !hidden.has(widget.id),
        }));
    });
    this.visibleWidgetIds = computed(() =>
      this.widgets()
        .filter(widget => widget.visible)
        .map(widget => widget.id),
    );
  }

  setWidgetVisibility(widgetId: DashboardWidgetId, visible: boolean): void {
    const widget = DASHBOARD_WIDGETS.find(item => item.id === widgetId);
    if (!widget) {
      return;
    }

    const state = this.layoutState();
    const hidden = new Set(state.hidden);
    if (visible) {
      hidden.delete(widgetId);
    } else {
      hidden.add(widgetId);
    }

    this.persist({
      ...state,
      preset: 'custom',
      hidden: [...hidden],
    });
  }

  moveWidget(widgetId: DashboardWidgetId, direction: -1 | 1): void {
    const state = this.layoutState();
    const order = [...state.order];
    const index = order.indexOf(widgetId);
    if (index === -1) {
      return;
    }

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= order.length) {
      return;
    }

    // Both indices are in range: `index` was found in `order`, `targetIndex` is bounds-checked above.
    [order[index], order[targetIndex]] = [order[targetIndex]!, order[index]!];
    this.persist({
      ...state,
      preset: 'custom',
      order,
    });
  }

  canMove(widgetId: DashboardWidgetId, direction: -1 | 1): boolean {
    const index = this.layoutState().order.indexOf(widgetId);
    if (index === -1) {
      return false;
    }

    const targetIndex = index + direction;
    return targetIndex >= 0 && targetIndex < this.layoutState().order.length;
  }

  applyPreset(preset: Exclude<DashboardLayoutPreset, 'custom'>): void {
    this.persist({
      preset,
      order: [...PRESET_STATES[preset].order],
      hidden: [...PRESET_STATES[preset].hidden],
    });
  }

  reset(): void {
    this.applyPreset('balanced');
  }

  private loadState(): StoredDashboardLayout {
    const stored = this.localStorageService.retrieve(STORAGE_KEY) as Partial<StoredDashboardLayout> | null;
    if (!stored) {
      return {
        preset: 'balanced',
        order: [...DEFAULT_ORDER],
        hidden: [],
      };
    }

    return this.normalizeState(stored);
  }

  private normalizeState(stored: Partial<StoredDashboardLayout>): StoredDashboardLayout {
    const sanitizedOrder = [
      ...(stored.order ?? []).filter(this.isWidgetId),
      ...DEFAULT_ORDER.filter(id => !(stored.order ?? []).includes(id)),
    ];
    const hidden = (stored.hidden ?? []).filter((id): id is DashboardWidgetId => this.isWidgetId(id));
    const preset = stored.preset && ['balanced', 'operations', 'security', 'custom'].includes(stored.preset) ? stored.preset : 'custom';

    return {
      preset,
      order: sanitizedOrder,
      hidden,
    };
  }

  private persist(state: StoredDashboardLayout): void {
    this.layoutState.set(this.normalizeState(state));
    this.localStorageService.store(STORAGE_KEY, this.layoutState());
  }

  private isWidgetId(value: string): value is DashboardWidgetId {
    return DASHBOARD_WIDGETS.some(widget => widget.id === value);
  }
}

import { TestBed } from '@angular/core/testing';
import '@angular/compiler';

jest.mock('app/entities/dashboard/dashboard-state', () => ({
  DashboardStateService: class DashboardStateService {},
}));

import { ChangeDetectorRef, DestroyRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ActivityEvent, DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { Health } from '../health/health.model';
import { HealthService } from '../health/health.service';
import { Metrics } from '../metrics/metrics.model';
import { MetricsService } from '../metrics/metrics.service';
import AlertsComponent, { ALERTS_REFRESH_INTERVAL_MS } from './alerts';

describe('AlertsComponent', () => {
  let component: AlertsComponent;
  let dashboardState: {
    connectAuditTrail: jest.Mock;
    disconnectAuditTrail: jest.Mock;
    operationLogs: jest.Mock<ActivityEvent[], []>;
  };
  let healthService: jest.Mocked<Pick<HealthService, 'checkHealth'>>;
  let metricsService: jest.Mocked<Pick<MetricsService, 'getMetrics'>>;
  let changeDetectorRef: jest.Mocked<Pick<ChangeDetectorRef, 'markForCheck'>>;
  let destroyCallbacks: Array<() => void>;
  let destroyRef: DestroyRef;

  beforeEach(() => {
    jest.useFakeTimers();

    dashboardState = {
      connectAuditTrail: jest.fn(),
      disconnectAuditTrail: jest.fn(),
      operationLogs: jest.fn(() => [
        {
          id: 'evt-1',
          type: 'Security',
          message: 'Security alert triggered by failed login attempts.',
          timestamp: 'just now',
          icon: 'security',
          colorClass: 'bg-hpd-danger-tint text-hpd-danger',
        },
      ]),
    };
    healthService = {
      checkHealth: jest.fn(),
    };
    metricsService = {
      getMetrics: jest.fn(),
    };
    changeDetectorRef = {
      markForCheck: jest.fn(),
    };
    destroyCallbacks = [];
    destroyRef = {
      onDestroy(callback: () => void) {
        destroyCallbacks.push(callback);
        return () => {
          destroyCallbacks = destroyCallbacks.filter(cb => cb !== callback);
        };
      },
    } as DestroyRef;

    // The component takes its dependencies through inject() now, so it can no longer be
    // constructed with them. TestBed supplies the same doubles through the injector; the
    // mocks and every assertion below are unchanged.
    TestBed.configureTestingModule({
      providers: [
        { provide: DashboardStateService, useValue: dashboardState },
        { provide: HealthService, useValue: healthService },
        { provide: MetricsService, useValue: metricsService },
        { provide: ChangeDetectorRef, useValue: changeDetectorRef },
        { provide: DestroyRef, useValue: destroyRef },
      ],
    });
    component = TestBed.runInInjectionContext(() => new AlertsComponent());
  });

  afterEach(() => {
    destroyCallbacks.forEach(callback => callback());
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('creates threshold and realtime alerts from health, metrics, and audit events', async () => {
    healthService.checkHealth.mockReturnValue(of(createHealth('DOWN')));
    metricsService.getMetrics.mockReturnValue(of(createMetrics()));

    component.ngOnInit();

    jest.advanceTimersByTime(1);
    await Promise.resolve();
    jest.advanceTimersByTime(2_000);
    await Promise.resolve();

    expect(dashboardState.connectAuditTrail).toHaveBeenCalled();
    expect(component.alerts.map(alert => alert.id)).toEqual(
      expect.arrayContaining(['threshold-system-cpu', 'threshold-error-responses', 'threshold-unhealthy-components', 'realtime-evt-1']),
    );
    expect(component.criticalAlertCount()).toBeGreaterThan(0);
    expect(component.lastUpdated).not.toBeNull();

    component.toggleRule('securityEvents');
    component.adjustThreshold('systemCpu', 5);
    expect(component.rules.find(rule => rule.key === 'securityEvents')?.enabled).toBe(false);
    expect(component.rules.find(rule => rule.key === 'systemCpu')?.threshold).toBe(80);

    component.ngOnDestroy();
    expect(dashboardState.disconnectAuditTrail).toHaveBeenCalled();
  });

  it('surfaces threshold evaluation failures', async () => {
    healthService.checkHealth.mockReturnValue(throwError(() => new Error('health failed')));
    metricsService.getMetrics.mockReturnValue(of(createMetrics()));

    component.ngOnInit();

    jest.advanceTimersByTime(ALERTS_REFRESH_INTERVAL_MS);
    await Promise.resolve();

    expect(component.errorMessage).toBe('Unable to evaluate alert thresholds.');
    expect(component.isLoading).toBe(false);
  });
});

function createHealth(status: Health['status'] = 'UP'): Health {
  return {
    status,
    components: {
      diskSpace: { status },
      ping: { status: 'UP' },
      readinessState: { status },
    },
  };
}

function createMetrics(): Metrics {
  return {
    jvm: {},
    databases: {
      min: { value: 0 },
      idle: { value: 0 },
      max: { value: 0 },
      usage: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      pending: { value: 0 },
      active: { value: 5 },
      acquire: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      creation: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      connections: { value: 12 },
    },
    'http.server.requests': {
      all: { count: 40 },
      percode: {
        '200': { count: 32, mean: 120, max: 300 },
        '500': { count: 8, mean: 450, max: 900 },
      },
    },
    cache: {},
    garbageCollector: {
      'jvm.gc.max.data.size': 0,
      'jvm.gc.pause': { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      'jvm.gc.memory.promoted': 0,
      'jvm.gc.memory.allocated': 0,
      classesLoaded: 0,
      'jvm.gc.live.data.size': 0,
      classesUnloaded: 0,
    },
    services: {},
    processMetrics: {
      'system.cpu.usage': 0.84,
      'system.cpu.count': 4,
      'system.load.average.1m': 1.1,
      'process.cpu.usage': 0.22,
      'process.files.max': 256,
      'process.files.open': 32,
      'process.start.time': 0,
      'process.uptime': 5_000,
    },
  };
}

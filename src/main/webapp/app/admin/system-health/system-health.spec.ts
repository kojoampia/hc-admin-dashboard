import { TestBed } from '@angular/core/testing';
import '@angular/compiler';

import { ChangeDetectorRef, DestroyRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { Metrics } from '../metrics/metrics.model';
import { MetricsService } from '../metrics/metrics.service';
import { Health } from '../health/health.model';
import { HealthService } from '../health/health.service';
import SystemHealthComponent, { SYSTEM_HEALTH_REFRESH_INTERVAL_MS } from './system-health';

describe('SystemHealthComponent', () => {
  let component: SystemHealthComponent;
  let healthService: jest.Mocked<Pick<HealthService, 'checkHealth'>>;
  let metricsService: jest.Mocked<Pick<MetricsService, 'getMetrics'>>;
  let changeDetectorRef: jest.Mocked<Pick<ChangeDetectorRef, 'markForCheck'>>;
  let destroyCallbacks: Array<() => void>;
  let destroyRef: DestroyRef;

  beforeEach(() => {
    jest.useFakeTimers();

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
        { provide: HealthService, useValue: healthService },
        { provide: MetricsService, useValue: metricsService },
        { provide: ChangeDetectorRef, useValue: changeDetectorRef },
        { provide: DestroyRef, useValue: destroyRef },
      ],
    });
    component = TestBed.runInInjectionContext(() => new SystemHealthComponent());
  });

  afterEach(() => {
    destroyCallbacks.forEach(callback => callback());
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('refreshes health data on an interval', async () => {
    healthService.checkHealth.mockReturnValue(of(createHealth()));
    metricsService.getMetrics
      .mockReturnValueOnce(of(createMetrics({ 'system.cpu.usage': 0.12, 'process.cpu.usage': 0.05, 'process.uptime': 7200 })))
      .mockReturnValueOnce(of(createMetrics({ 'system.cpu.usage': 0.41, 'process.cpu.usage': 0.25, 'process.uptime': 10_800 })));

    component.ngOnInit();

    jest.advanceTimersByTime(1);
    await Promise.resolve();

    expect(healthService.checkHealth).toHaveBeenCalledTimes(1);
    expect(metricsService.getMetrics).toHaveBeenCalledTimes(1);
    expect(component.systemCpuUsage).toBe(12);
    expect(component.processCpuUsage).toBe(5);
    expect(component.uptimeHours).toBe(2);
    expect(component.lastUpdated).not.toBeNull();
    expect(component.refreshIntervalSeconds).toBe(30);

    jest.advanceTimersByTime(SYSTEM_HEALTH_REFRESH_INTERVAL_MS);
    await Promise.resolve();

    expect(healthService.checkHealth).toHaveBeenCalledTimes(2);
    expect(metricsService.getMetrics).toHaveBeenCalledTimes(2);
    expect(component.systemCpuUsage).toBe(41);
    expect(component.processCpuUsage).toBe(25);
    expect(component.uptimeHours).toBe(3);
    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });

  it('keeps degraded 503 health payloads visible', async () => {
    const degradedHealth = createHealth('DOWN');
    healthService.checkHealth.mockReturnValue(
      throwError(() => ({
        status: 503,
        error: degradedHealth,
      })),
    );
    metricsService.getMetrics.mockReturnValue(of(createMetrics()));

    component.ngOnInit();

    jest.advanceTimersByTime(1);
    await Promise.resolve();

    expect(component.overallStatus).toBe('DOWN');
    expect(component.errorMessage).toContain('degraded health');
    expect(component.healthDistribution[1]).toEqual({ name: 'Needs attention', value: 1 });
  });
});

function createHealth(status: Health['status'] = 'UP'): Health {
  return {
    status,
    components: {
      diskSpace: { status },
      ping: { status: 'UP' },
    },
  };
}

function createMetrics(processMetricsOverrides: Partial<Metrics['processMetrics']> = {}): Metrics {
  return {
    jvm: {},
    databases: {
      min: { value: 0 },
      idle: { value: 0 },
      max: { value: 0 },
      usage: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      pending: { value: 0 },
      active: { value: 3 },
      acquire: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      creation: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      connections: { value: 18 },
    },
    'http.server.requests': {
      all: { count: 0 },
      percode: {},
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
      'system.cpu.usage': 0.12,
      'system.cpu.count': 4,
      'system.load.average.1m': 0.4,
      'process.cpu.usage': 0.05,
      'process.files.max': 512,
      'process.files.open': 18,
      'process.start.time': 0,
      'process.uptime': 7200,
      ...processMetricsOverrides,
    },
  };
}

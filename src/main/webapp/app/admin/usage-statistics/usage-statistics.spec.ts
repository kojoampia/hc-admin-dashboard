import '@angular/compiler';

import { ChangeDetectorRef, DestroyRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { Metrics } from '../metrics/metrics.model';
import { MetricsService } from '../metrics/metrics.service';
import UsageStatisticsComponent, { USAGE_STATISTICS_REFRESH_INTERVAL_MS } from './usage-statistics';

describe('UsageStatisticsComponent', () => {
  let component: UsageStatisticsComponent;
  let metricsService: jest.Mocked<Pick<MetricsService, 'getMetrics'>>;
  let changeDetectorRef: jest.Mocked<Pick<ChangeDetectorRef, 'markForCheck'>>;
  let destroyCallbacks: Array<() => void>;
  let destroyRef: DestroyRef;

  beforeEach(() => {
    jest.useFakeTimers();

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

    component = new UsageStatisticsComponent(
      metricsService as unknown as MetricsService,
      changeDetectorRef as unknown as ChangeDetectorRef,
      destroyRef,
    );
  });

  afterEach(() => {
    destroyCallbacks.forEach(callback => callback());
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('builds usage insights from metrics data and refreshes on an interval', async () => {
    metricsService.getMetrics
      .mockReturnValueOnce(of(createMetrics()))
      .mockReturnValueOnce(of(createMetrics({ allRequests: 200, response2xx: 190, response5xx: 10, busiestServiceRequests: 140 })));

    component.ngOnInit();

    jest.advanceTimersByTime(1);
    await Promise.resolve();

    expect(component.totalRequests).toBe(120);
    expect(component.successRate).toBe(75);
    expect(component.averageResponseMillis).toBe(186.7);
    expect(component.topResponseCode).toBe('200');
    expect(component.peakResponseMillis).toBe(900);
    expect(component.busiestServiceName).toBe('api/users');
    expect(component.busiestServiceRequests).toBe(90);
    expect(component.trackedServices).toBe(3);
    expect(component.activeDatabaseConnections).toBe(7);
    expect(component.systemLoadAverage).toBe(1.24);
    expect(component.serviceHighlights).toHaveLength(3);
    expect(component.serviceHighlights[0]).toEqual({
      name: 'api/users',
      totalRequests: 90,
      methods: 'GET, POST',
    });
    expect(component.lastUpdated).not.toBeNull();

    jest.advanceTimersByTime(USAGE_STATISTICS_REFRESH_INTERVAL_MS);
    await Promise.resolve();

    expect(metricsService.getMetrics).toHaveBeenCalledTimes(2);
    expect(component.totalRequests).toBe(200);
    expect(component.successRate).toBe(95);
    expect(component.busiestServiceRequests).toBe(140);
    expect(changeDetectorRef.markForCheck).toHaveBeenCalled();
  });

  it('surfaces permission errors from the metrics endpoint', async () => {
    metricsService.getMetrics.mockReturnValue(
      throwError(() => ({
        status: 403,
      })),
    );

    component.ngOnInit();

    jest.advanceTimersByTime(1);
    await Promise.resolve();

    expect(component.errorMessage).toBe('You do not have access to usage statistics.');
    expect(component.isLoading).toBe(false);
  });
});

function createMetrics(overrides?: {
  allRequests?: number;
  response2xx?: number;
  response4xx?: number;
  response5xx?: number;
  busiestServiceRequests?: number;
}): Metrics {
  const allRequests = overrides?.allRequests ?? 120;
  const response2xx = overrides?.response2xx ?? 90;
  const response4xx = overrides?.response4xx ?? 20;
  const response5xx = overrides?.response5xx ?? 10;
  const busiestServiceRequests = overrides?.busiestServiceRequests ?? 90;

  return {
    jvm: {},
    databases: {
      min: { value: 0 },
      idle: { value: 0 },
      max: { value: 0 },
      usage: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      pending: { value: 0 },
      active: { value: 7 },
      acquire: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      creation: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      connections: { value: 10 },
    },
    'http.server.requests': {
      all: { count: allRequests },
      percode: {
        '200': { count: response2xx, mean: 150, max: 300 },
        '404': { count: response4xx, mean: 120, max: 250 },
        '500': { count: response5xx, mean: 650, max: 900 },
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
    services: {
      'api/users': {
        GET: { count: Math.max(busiestServiceRequests - 25, 0), mean: 120, max: 200 },
        POST: { count: 25, mean: 160, max: 240 },
      },
      'api/reports': {
        GET: { count: 20, mean: 210, max: 320 },
      },
      'api/notifications': {
        GET: { count: 8, mean: 95, max: 140 },
        POST: { count: 2, mean: 130, max: 170 },
      },
    },
    processMetrics: {
      'system.cpu.usage': 0.18,
      'system.cpu.count': 4,
      'system.load.average.1m': 1.24,
      'process.cpu.usage': 0.11,
      'process.files.max': 256,
      'process.files.open': 64,
      'process.start.time': 0,
      'process.uptime': 14_400,
    },
  };
}

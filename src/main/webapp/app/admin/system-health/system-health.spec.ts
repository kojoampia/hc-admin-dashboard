import '@angular/compiler';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { Metrics } from '../metrics/metrics.model';
import { MetricsService } from '../metrics/metrics.service';
import { Health } from '../health/health.model';
import { HealthService } from '../health/health.service';
import SystemHealthComponent, { SYSTEM_HEALTH_REFRESH_INTERVAL_MS } from './system-health';

describe('SystemHealthComponent', () => {
  let comp: SystemHealthComponent;
  let fixture: ComponentFixture<SystemHealthComponent>;
  let healthService: jest.Mocked<Pick<HealthService, 'checkHealth'>>;
  let metricsService: jest.Mocked<Pick<MetricsService, 'getMetrics'>>;

  beforeEach(async () => {
    healthService = {
      checkHealth: jest.fn(),
    };
    metricsService = {
      getMetrics: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NoopAnimationsModule, SystemHealthComponent],
      providers: [
        { provide: HealthService, useValue: healthService },
        { provide: MetricsService, useValue: metricsService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    jest.useFakeTimers();
    fixture = TestBed.createComponent(SystemHealthComponent);
    comp = fixture.componentInstance;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('refreshes health data on an interval', async () => {
    healthService.checkHealth.mockReturnValue(of(createHealth()));
    metricsService.getMetrics
      .mockReturnValueOnce(of(createMetrics({ 'system.cpu.usage': 0.12, 'process.cpu.usage': 0.05, 'process.uptime': 7200 })))
      .mockReturnValueOnce(of(createMetrics({ 'system.cpu.usage': 0.41, 'process.cpu.usage': 0.25, 'process.uptime': 10_800 })));

    fixture.detectChanges();
    jest.advanceTimersByTime(1);
    await Promise.resolve();
    fixture.detectChanges();

    expect(healthService.checkHealth).toHaveBeenCalledTimes(1);
    expect(metricsService.getMetrics).toHaveBeenCalledTimes(1);
    expect(comp.systemCpuUsage).toBe(12);
    expect(comp.processCpuUsage).toBe(5);
    expect(comp.uptimeHours).toBe(2);
    expect(comp.lastUpdated).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Live updates every 30 seconds');

    jest.advanceTimersByTime(SYSTEM_HEALTH_REFRESH_INTERVAL_MS);
    await Promise.resolve();
    fixture.detectChanges();

    expect(healthService.checkHealth).toHaveBeenCalledTimes(2);
    expect(metricsService.getMetrics).toHaveBeenCalledTimes(2);
    expect(comp.systemCpuUsage).toBe(41);
    expect(comp.processCpuUsage).toBe(25);
    expect(comp.uptimeHours).toBe(3);
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

    fixture.detectChanges();
    jest.advanceTimersByTime(1);
    await Promise.resolve();
    fixture.detectChanges();

    expect(comp.overallStatus).toBe('DOWN');
    expect(comp.errorMessage).toContain('degraded health');
    expect(fixture.nativeElement.textContent).toContain('DOWN');
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

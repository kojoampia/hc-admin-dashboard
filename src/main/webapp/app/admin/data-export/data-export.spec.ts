import '@angular/compiler';

import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { Health } from '../health/health.model';
import { HealthService } from '../health/health.service';
import { Metrics } from '../metrics/metrics.model';
import { MetricsService } from '../metrics/metrics.service';
import { UserManagementService } from '../user-management/service/user-management.service';
import { IUser } from '../user-management/user-management.model';
import DataExportComponent from './data-export';

describe('DataExportComponent', () => {
  let component: DataExportComponent;
  let userManagementService: jest.Mocked<Pick<UserManagementService, 'query'>>;
  let healthService: jest.Mocked<Pick<HealthService, 'checkHealth'>>;
  let metricsService: jest.Mocked<Pick<MetricsService, 'getMetrics'>>;
  let changeDetectorRef: jest.Mocked<Pick<ChangeDetectorRef, 'markForCheck'>>;
  let anchor: { href: string; download: string; click: jest.Mock };
  let createElementSpy: jest.SpyInstance;

  beforeEach(() => {
    userManagementService = {
      query: jest.fn(),
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
    anchor = {
      href: '',
      download: '',
      click: jest.fn(),
    };

    window.URL.createObjectURL = jest.fn(() => 'blob:admin-dashboard-export');
    window.URL.revokeObjectURL = jest.fn();
    createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLAnchorElement);

    component = new DataExportComponent(
      userManagementService as unknown as UserManagementService,
      healthService as unknown as HealthService,
      metricsService as unknown as MetricsService,
      changeDetectorRef as unknown as ChangeDetectorRef,
    );
  });

  afterEach(() => {
    createElementSpy.mockRestore();
  });

  it('exports a JSON dashboard snapshot using the existing admin endpoints', () => {
    userManagementService.query.mockReturnValue(
      of(
        new HttpResponse<IUser[]>({
          body: [
            createUser({ id: '1', activated: true, authorities: ['ROLE_ADMIN'], createdDate: new Date() }),
            createUser({ id: '2', activated: false, authorities: ['ROLE_USER'] }),
          ],
          headers: new HttpHeaders({ 'X-Total-Count': '2' }),
        }),
      ),
    );
    healthService.checkHealth.mockReturnValue(of(createHealth('DOWN')));
    metricsService.getMetrics.mockReturnValue(of(createMetrics()));

    component.exportSnapshotJson();

    expect(anchor.click).toHaveBeenCalled();
    expect(anchor.download).toMatch(/^admin-dashboard-snapshot-.*\.json$/);
    expect(component.errorMessage).toBe('');
    expect(component.lastExportedAt).not.toBeNull();

    const blob = (window.URL.createObjectURL as jest.Mock).mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/json;charset=utf-8');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('surfaces permission errors when export data cannot be fetched', () => {
    userManagementService.query.mockReturnValue(
      throwError(() => ({
        status: 403,
      })),
    );
    healthService.checkHealth.mockReturnValue(of(createHealth()));
    metricsService.getMetrics.mockReturnValue(of(createMetrics()));

    component.exportSummaryCsv();

    expect(component.errorMessage).toBe('You do not have access to export admin dashboard data.');
    expect(component.isExporting).toBe(false);
    expect(anchor.click).not.toHaveBeenCalled();
  });
});

function createUser(overrides: Partial<IUser>): IUser {
  return {
    id: overrides.id ?? 'user-id',
    login: overrides.login ?? 'user',
    activated: overrides.activated ?? false,
    authorities: overrides.authorities ?? ['ROLE_USER'],
    createdDate: overrides.createdDate,
    ...overrides,
  };
}

function createHealth(status: Health['status'] = 'UP'): Health {
  return {
    status,
    components: {
      diskSpace: { status },
      ping: { status: 'UP' },
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
      active: { value: 4 },
      acquire: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      creation: { '0.0': 0, '1.0': 0, max: 0, totalTime: 0, mean: 0, '0.5': 0, count: 0, '0.99': 0, '0.75': 0, '0.95': 0 },
      connections: { value: 14 },
    },
    'http.server.requests': {
      all: { count: 50 },
      percode: {
        '200': { count: 42, mean: 120, max: 250 },
        '500': { count: 8, mean: 480, max: 900 },
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
        GET: { count: 30, mean: 110, max: 160 },
        POST: { count: 10, mean: 160, max: 240 },
      },
      'api/reports': {
        GET: { count: 10, mean: 220, max: 300 },
      },
    },
    processMetrics: {
      'system.cpu.usage': 0.31,
      'system.cpu.count': 4,
      'system.load.average.1m': 1.2,
      'process.cpu.usage': 0.14,
      'process.files.max': 256,
      'process.files.open': 64,
      'process.start.time': 0,
      'process.uptime': 7200,
    },
  };
}

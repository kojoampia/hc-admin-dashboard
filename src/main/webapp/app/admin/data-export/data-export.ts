import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, forkJoin, of, throwError } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { Health } from '../health/health.model';
import { HealthService } from '../health/health.service';
import { Metrics } from '../metrics/metrics.model';
import { MetricsService } from '../metrics/metrics.service';
import { UserManagementService } from '../user-management/service/user-management.service';
import { IUser } from '../user-management/user-management.model';

type ExportFormat = 'json' | 'csv';

type DashboardExportSnapshot = {
  generatedAt: string;
  users: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    recentUsers: number;
  };
  health: {
    status: string;
    degradedComponents: number;
    openFiles: number;
    systemCpuUsage: number;
    processCpuUsage: number;
    uptimeHours: number;
  };
  usage: {
    totalRequests: number;
    successRate: number;
    averageResponseMillis: number;
    topResponseCode: string;
    busiestServiceName: string;
    busiestServiceRequests: number;
    activeDatabaseConnections: number;
  };
};

@Component({
  selector: 'hpd-data-export',
  templateUrl: './data-export.html',
  styleUrl: './data-export.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SharedModule, MatButtonModule, MatIconModule],
})
export default class DataExportComponent {
  isExporting = false;
  errorMessage = '';
  lastExportedAt: Date | null = null;

  constructor(
    private userManagementService: UserManagementService,
    private healthService: HealthService,
    private metricsService: MetricsService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  exportSnapshotJson(): void {
    this.exportDashboardData('json');
  }

  exportSummaryCsv(): void {
    this.exportDashboardData('csv');
  }

  private exportDashboardData(format: ExportFormat): void {
    this.isExporting = true;
    this.errorMessage = '';
    this.changeDetectorRef.markForCheck();

    forkJoin({
      users: this.userManagementService.query({
        page: 0,
        size: 1000,
        sort: ['createdDate,desc'],
      }),
      health: this.healthService.checkHealth().pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 503 && error.error) {
            return of(error.error as Health);
          }
          return throwError(() => error);
        }),
      ),
      metrics: this.metricsService.getMetrics(),
    }).subscribe({
      next: ({ users, health, metrics }) => {
        const snapshot = this.buildSnapshot(users, health, metrics);
        if (format === 'json') {
          this.downloadBlob(
            new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json;charset=utf-8' }),
            this.buildFileName('admin-dashboard-snapshot', 'json'),
          );
        } else {
          this.downloadBlob(
            new Blob([this.buildSummaryCsv(snapshot)], { type: 'text/csv;charset=utf-8' }),
            this.buildFileName('admin-dashboard-summary', 'csv'),
          );
        }

        this.lastExportedAt = new Date();
        this.isExporting = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage =
          error.status === 403 ? 'You do not have access to export admin dashboard data.' : 'Unable to export dashboard data.';
        this.isExporting = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  private buildSnapshot(usersResponse: HttpResponse<IUser[]>, health: Health, metrics: Metrics): DashboardExportSnapshot {
    const users = usersResponse.body ?? [];
    const totalUsers = this.resolveTotalUsers(usersResponse.headers, users.length);
    const activeUsers = users.filter(user => user.activated).length;
    const adminUsers = users.filter(user => user.authorities?.includes('ROLE_ADMIN')).length;
    const recentUsers = users.filter(user => this.isRecentlyCreated(user.createdDate)).length;
    const degradedComponents = Object.values(health.components ?? {}).filter(component => component?.status !== 'UP').length;
    const responseCodes = Object.entries(metrics['http.server.requests'].percode).sort((left, right) => right[1].count - left[1].count);
    const busiestService = Object.entries(metrics.services)
      .map(([name, serviceMetrics]) => ({
        name,
        totalRequests: Object.values(serviceMetrics).reduce((sum, value) => sum + (value?.count ?? 0), 0),
      }))
      .sort((left, right) => right.totalRequests - left.totalRequests)[0];

    return {
      generatedAt: new Date().toISOString(),
      users: {
        totalUsers,
        activeUsers,
        inactiveUsers: Math.max(totalUsers - activeUsers, 0),
        adminUsers,
        recentUsers,
      },
      health: {
        status: health.status,
        degradedComponents,
        openFiles: metrics.processMetrics['process.files.open'] ?? metrics.databases.connections.value ?? 0,
        systemCpuUsage: this.toPercentage(metrics.processMetrics['system.cpu.usage']),
        processCpuUsage: this.toPercentage(metrics.processMetrics['process.cpu.usage']),
        uptimeHours: Math.round(((metrics.processMetrics['process.uptime'] ?? 0) / 3600) * 10) / 10,
      },
      usage: {
        totalRequests: metrics['http.server.requests'].all.count,
        successRate: this.calculateSuccessRate(metrics),
        averageResponseMillis: this.calculateAverageResponseMillis(metrics),
        topResponseCode: responseCodes[0]?.[0] ?? 'No data',
        busiestServiceName: busiestService?.name ?? 'No traffic',
        busiestServiceRequests: busiestService?.totalRequests ?? 0,
        activeDatabaseConnections: metrics.databases.active.value,
      },
    };
  }

  private resolveTotalUsers(headers: HttpHeaders, usersLength: number): number {
    const totalCountHeader = Number(headers.get('X-Total-Count'));
    return Number.isFinite(totalCountHeader) && totalCountHeader > 0 ? totalCountHeader : usersLength;
  }

  private isRecentlyCreated(createdDate: IUser['createdDate']): boolean {
    if (!createdDate) {
      return false;
    }

    const createdTime = new Date(createdDate).getTime();
    if (Number.isNaN(createdTime)) {
      return false;
    }

    return createdTime >= Date.now() - 30 * 24 * 60 * 60 * 1000;
  }

  private calculateSuccessRate(metrics: Metrics): number {
    const totalRequests = metrics['http.server.requests'].all.count;
    if (totalRequests === 0) {
      return 0;
    }

    const successfulRequests = Object.entries(metrics['http.server.requests'].percode)
      .filter(([code]) => code.startsWith('2'))
      .reduce((sum, [, value]) => sum + value.count, 0);

    return Math.round((successfulRequests / totalRequests) * 1000) / 10;
  }

  private calculateAverageResponseMillis(metrics: Metrics): number {
    const values = Object.values(metrics['http.server.requests'].percode);
    const totalCount = values.reduce((sum, value) => sum + value.count, 0);
    if (totalCount === 0) {
      return 0;
    }

    const weightedMean = values.reduce((sum, value) => sum + value.mean * value.count, 0);
    return Math.round((weightedMean / totalCount) * 10) / 10;
  }

  private toPercentage(value: number | undefined): number {
    return Math.round((value ?? 0) * 1000) / 10;
  }

  private buildSummaryCsv(snapshot: DashboardExportSnapshot): string {
    const rows: Array<[string, string | number]> = [
      ['generated_at', snapshot.generatedAt],
      ['total_users', snapshot.users.totalUsers],
      ['active_users', snapshot.users.activeUsers],
      ['inactive_users', snapshot.users.inactiveUsers],
      ['admin_users', snapshot.users.adminUsers],
      ['recent_users_30_days', snapshot.users.recentUsers],
      ['health_status', snapshot.health.status],
      ['degraded_components', snapshot.health.degradedComponents],
      ['system_cpu_usage_percent', snapshot.health.systemCpuUsage],
      ['process_cpu_usage_percent', snapshot.health.processCpuUsage],
      ['uptime_hours', snapshot.health.uptimeHours],
      ['open_files', snapshot.health.openFiles],
      ['total_requests', snapshot.usage.totalRequests],
      ['success_rate_percent', snapshot.usage.successRate],
      ['average_response_millis', snapshot.usage.averageResponseMillis],
      ['top_response_code', snapshot.usage.topResponseCode],
      ['busiest_service_name', snapshot.usage.busiestServiceName],
      ['busiest_service_requests', snapshot.usage.busiestServiceRequests],
      ['active_database_connections', snapshot.usage.activeDatabaseConnections],
    ];

    return ['metric,value', ...rows.map(([metric, value]) => `${metric},${this.formatCsvValue(value)}`)].join('\n');
  }

  private formatCsvValue(value: string | number): string {
    const normalized = String(value).replace(/"/g, '""');
    return `"${normalized}"`;
  }

  private buildFileName(prefix: string, extension: 'json' | 'csv'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}-${timestamp}.${extension}`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  }
}

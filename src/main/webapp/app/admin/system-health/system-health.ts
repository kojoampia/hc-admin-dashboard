import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of, switchMap, throwError, timer } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { PiechartComponent } from 'app/widgets/piechart/piechart.component';
import { Health, HealthDetails } from '../health/health.model';
import { HealthService } from '../health/health.service';
import { MetricsService } from '../metrics/metrics.service';

type HealthComponentStatus = {
  name: string;
  status: string;
};

type ChartDatum = {
  name: string;
  value: number;
};

export const SYSTEM_HEALTH_REFRESH_INTERVAL_MS = 30_000;

@Component({
  selector: 'hpd-system-health',
  templateUrl: './system-health.html',
  styleUrl: './system-health.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, SharedModule, MatButtonModule, MatIconModule, PiechartComponent],
})
export default class SystemHealthComponent implements OnInit {
  readonly refreshIntervalSeconds = SYSTEM_HEALTH_REFRESH_INTERVAL_MS / 1000;

  isLoading = true;
  errorMessage = '';
  overallStatus = 'UNKNOWN';
  uptimeHours = 0;
  systemCpuUsage = 0;
  processCpuUsage = 0;
  openFiles = 0;
  lastUpdated: Date | null = null;
  componentStatuses: HealthComponentStatus[] = [];
  healthDistribution: ChartDatum[] = [];

  constructor(
    private healthService: HealthService,
    private metricsService: MetricsService,
    private changeDetectorRef: ChangeDetectorRef,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.loadHealthData();
  }

  healthBadgeClasses(status: string): string {
    return status === 'UP' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  }

  private loadHealthData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    timer(0, SYSTEM_HEALTH_REFRESH_INTERVAL_MS)
      .pipe(
        switchMap(() =>
          forkJoin({
            health: this.healthService.checkHealth().pipe(
              catchError((error: HttpErrorResponse) => {
                if (error.status === 503 && error.error) {
                  return of(error.error as Health);
                }
                return throwError(() => error);
              }),
            ),
            metrics: this.metricsService.getMetrics(),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ health, metrics }) => {
          const processMetrics = metrics.processMetrics;
          const databaseMetrics = metrics.databases;
          const components = Object.entries(health.components ?? {}).map(([name, details]) => ({
            name,
            status: this.getHealthStatus(details),
          }));
          const upCount = components.filter(component => component.status === 'UP').length;
          const downCount = components.length - upCount;

          this.overallStatus = health.status;
          this.uptimeHours = Math.round(((processMetrics['process.uptime'] ?? 0) / 3600) * 10) / 10;
          this.systemCpuUsage = this.toPercentage(processMetrics['system.cpu.usage']);
          this.processCpuUsage = this.toPercentage(processMetrics['process.cpu.usage']);
          this.openFiles = processMetrics['process.files.open'] ?? databaseMetrics.connections.value;
          this.componentStatuses = components;
          this.healthDistribution = [
            { name: 'Healthy', value: upCount },
            { name: 'Needs attention', value: Math.max(downCount, 0) },
          ];
          this.lastUpdated = new Date();
          this.errorMessage = health.status === 'UP' ? '' : 'Some monitored components are reporting degraded health.';
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage =
            error.status === 503 ? 'Some monitored components are reporting degraded health.' : 'Unable to load system health.';
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  private getHealthStatus(details?: HealthDetails): string {
    return details?.status ?? 'UNKNOWN';
  }

  private toPercentage(value: number | undefined): number {
    return Math.round((value ?? 0) * 1000) / 10;
  }
}

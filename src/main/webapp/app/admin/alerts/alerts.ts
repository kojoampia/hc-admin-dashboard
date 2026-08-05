import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { catchError, forkJoin, of, switchMap, throwError, timer } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ActivityEvent, DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { Health } from '../health/health.model';
import { HealthService } from '../health/health.service';
import { Metrics } from '../metrics/metrics.model';
import { MetricsService } from '../metrics/metrics.service';

type AlertSeverity = 'critical' | 'warning' | 'info';

type AlertRuleKey = 'systemCpu' | 'errorResponses' | 'unhealthyComponents' | 'securityEvents';

type AlertRule = {
  key: AlertRuleKey;
  label: string;
  description: string;
  threshold: number;
  enabled: boolean;
  step: number;
  unit: string;
};

type DashboardAlert = {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  source: 'metrics' | 'health' | 'notifications';
  timestamp: string;
};

export const ALERTS_REFRESH_INTERVAL_MS = 30_000;
const REALTIME_ALERT_CHECK_MS = 2_000;
const MAX_ALERTS = 8;

@Component({
  selector: 'hpd-alerts',
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, SharedModule, MatButtonModule, MatIconModule],
})
export default class AlertsComponent implements OnInit, OnDestroy {
  dashboardState = inject(DashboardStateService);
  private healthService = inject(HealthService);
  private metricsService = inject(MetricsService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  readonly refreshIntervalSeconds = ALERTS_REFRESH_INTERVAL_MS / 1000;

  isLoading = true;
  errorMessage = '';
  lastUpdated: Date | null = null;
  alerts: DashboardAlert[] = [];
  rules: AlertRule[] = [
    {
      key: 'systemCpu',
      label: 'System CPU usage',
      description: 'Create an alert when average CPU usage crosses this percentage.',
      threshold: 75,
      enabled: true,
      step: 5,
      unit: '%',
    },
    {
      key: 'errorResponses',
      label: '5xx responses',
      description: 'Trigger when server-side error responses exceed this count.',
      threshold: 5,
      enabled: true,
      step: 1,
      unit: 'events',
    },
    {
      key: 'unhealthyComponents',
      label: 'Unhealthy components',
      description: 'Raise an alert when the number of degraded health checks crosses this threshold.',
      threshold: 1,
      enabled: true,
      step: 1,
      unit: 'components',
    },
    {
      key: 'securityEvents',
      label: 'Security events',
      description: 'Notify on new security-related audit events in the real-time feed.',
      threshold: 1,
      enabled: true,
      step: 1,
      unit: 'events',
    },
  ];

  ngOnInit(): void {
    this.dashboardState.connectAuditTrail();
    this.monitorThresholdAlerts();
    this.monitorRealtimeAlerts();
  }

  ngOnDestroy(): void {
    this.dashboardState.disconnectAuditTrail();
  }

  toggleRule(ruleKey: AlertRuleKey): void {
    this.rules = this.rules.map(rule => (rule.key === ruleKey ? { ...rule, enabled: !rule.enabled } : rule));
  }

  adjustThreshold(ruleKey: AlertRuleKey, delta: number): void {
    this.rules = this.rules.map(rule =>
      rule.key === ruleKey
        ? {
            ...rule,
            threshold: Math.max(rule.step, rule.threshold + delta),
          }
        : rule,
    );
  }

  criticalAlertCount(): number {
    return this.alerts.filter(alert => alert.severity === 'critical').length;
  }

  severityClasses(severity: AlertSeverity): string {
    if (severity === 'critical') {
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    }
    if (severity === 'warning') {
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    }
    return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200';
  }

  sourceLabel(source: DashboardAlert['source']): string {
    if (source === 'notifications') {
      return 'Realtime';
    }
    if (source === 'health') {
      return 'Health';
    }
    return 'Metrics';
  }

  private monitorThresholdAlerts(): void {
    timer(0, ALERTS_REFRESH_INTERVAL_MS)
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
          this.upsertThresholdAlerts(health, metrics);
          this.lastUpdated = new Date();
          this.isLoading = false;
          this.errorMessage = '';
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.errorMessage = 'Unable to evaluate alert thresholds.';
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  private monitorRealtimeAlerts(): void {
    timer(0, REALTIME_ALERT_CHECK_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const securityRule = this.findRule('securityEvents');
        if (!securityRule?.enabled) {
          return;
        }

        const realtimeAlerts = this.dashboardState
          .operationLogs()
          .filter(event => this.isSecurityEvent(event))
          .slice(0, securityRule.threshold + 4)
          .map(event => this.mapRealtimeAlert(event));

        this.mergeRealtimeAlerts(realtimeAlerts);
      });
  }

  private upsertThresholdAlerts(health: Health, metrics: Metrics): void {
    const thresholdAlerts: DashboardAlert[] = [];
    const systemCpuUsage = Math.round((metrics.processMetrics['system.cpu.usage'] ?? 0) * 1000) / 10;
    const unhealthyComponents = Object.values(health.components ?? {}).filter(component => component.status !== 'UP').length;
    const errorResponses = Object.entries(metrics['http.server.requests'].percode)
      .filter(([code]) => code.startsWith('5'))
      .reduce((sum, [, details]) => sum + details.count, 0);

    const systemCpuRule = this.findRule('systemCpu');
    if (systemCpuRule?.enabled && systemCpuUsage >= systemCpuRule.threshold) {
      thresholdAlerts.push({
        id: 'threshold-system-cpu',
        title: 'System CPU threshold reached',
        description: `CPU usage is at ${systemCpuUsage}% which exceeds the ${systemCpuRule.threshold}% alert threshold.`,
        severity: systemCpuUsage >= systemCpuRule.threshold + systemCpuRule.step ? 'critical' : 'warning',
        source: 'metrics',
        timestamp: 'just now',
      });
    }

    const errorResponseRule = this.findRule('errorResponses');
    if (errorResponseRule?.enabled && errorResponses >= errorResponseRule.threshold) {
      thresholdAlerts.push({
        id: 'threshold-error-responses',
        title: '5xx response threshold reached',
        description: `${errorResponses} server error responses were reported, exceeding the ${errorResponseRule.threshold}-event threshold.`,
        severity: errorResponses >= errorResponseRule.threshold + errorResponseRule.step ? 'critical' : 'warning',
        source: 'metrics',
        timestamp: 'just now',
      });
    }

    const unhealthyComponentsRule = this.findRule('unhealthyComponents');
    if (unhealthyComponentsRule?.enabled && unhealthyComponents >= unhealthyComponentsRule.threshold) {
      thresholdAlerts.push({
        id: 'threshold-unhealthy-components',
        title: 'Health check degradation detected',
        description: `${unhealthyComponents} component checks are degraded, exceeding the ${unhealthyComponentsRule.threshold}-component threshold.`,
        severity: health.status === 'DOWN' ? 'critical' : 'warning',
        source: 'health',
        timestamp: 'just now',
      });
    }

    this.replaceThresholdAlerts(thresholdAlerts);
  }

  private replaceThresholdAlerts(thresholdAlerts: DashboardAlert[]): void {
    const realtimeAlerts = this.alerts.filter(alert => !alert.id.startsWith('threshold-'));
    this.alerts = [...thresholdAlerts, ...realtimeAlerts].slice(0, MAX_ALERTS);
  }

  private mergeRealtimeAlerts(realtimeAlerts: DashboardAlert[]): void {
    const thresholdAlerts = this.alerts.filter(alert => alert.id.startsWith('threshold-'));
    const existingRealtimeAlerts = this.alerts.filter(alert => !alert.id.startsWith('threshold-'));
    const dedupedRealtime = [...realtimeAlerts, ...existingRealtimeAlerts].reduce<DashboardAlert[]>((acc, alert) => {
      if (!acc.some(existing => existing.id === alert.id)) {
        acc.push(alert);
      }
      return acc;
    }, []);

    this.alerts = [...thresholdAlerts, ...dedupedRealtime].slice(0, MAX_ALERTS);
  }

  private findRule(ruleKey: AlertRuleKey): AlertRule | undefined {
    return this.rules.find(rule => rule.key === ruleKey);
  }

  private isSecurityEvent(event: ActivityEvent): boolean {
    return ['Security', 'Permission', 'Role Change', 'System Configuration'].includes(event.type);
  }

  private mapRealtimeAlert(event: ActivityEvent): DashboardAlert {
    return {
      id: `realtime-${event.id}`,
      title: `${event.type} notification`,
      description: event.message,
      severity: event.type === 'Security' || event.type === 'Permission' ? 'critical' : 'info',
      source: 'notifications',
      timestamp: event.timestamp,
    };
  }
}

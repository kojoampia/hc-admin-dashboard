import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { switchMap, timer } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { HttpMethod, MaxMeanCount, Metrics, Services } from '../metrics/metrics.model';
import { MetricsService } from '../metrics/metrics.service';

type ChartDatum = {
  name: string;
  value: number;
};

type LineSeries = {
  name: string;
  series: Array<{ name: string; value: number }>;
};

type ServiceTrafficEntry = LineSeries & {
  totalRequests: number;
  methods: string[];
};

export const USAGE_STATISTICS_REFRESH_INTERVAL_MS = 30_000;

@Component({
  selector: 'hpd-usage-statistics',
  templateUrl: './usage-statistics.html',
  styleUrl: './usage-statistics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, SharedModule, MatButtonModule, MatIconModule, NgxChartsModule],
})
export default class UsageStatisticsComponent implements OnInit {
  private metricsService = inject(MetricsService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  /**
   * BridgeCare chart domain — one series colour per tracked service.
   *
   * It replaced a 23-entry teal/blue/orange grab-bag carried over from a deleted chart wrapper,
   * which had two entries repeated and no relationship to any palette in the app. These are the
   * brand tones (navy, gold, chart blue, and the three status accents) plus tints of each, ordered
   * so that adjacent series stay distinguishable. Literal hexes rather than `var(--hpd-color-*)`
   * because ngx-charts hands the domain to d3 as a value, not to CSS — a custom property arrives
   * as an unresolvable string and the series renders black. Keep them in step with
   * content/scss/global.scss.
   */
  readonly serviceTrafficScheme = {
    name: 'serviceTraffic',
    selectable: true,
    group: ScaleType.Linear,
    domain: [
      '#0d3058', // primary (navy)
      '#c59437', // gold
      '#8ba9c4', // chart blue
      '#2e7d5b', // success accent
      '#b4741a', // warning accent
      '#b3402f', // danger
      '#12406f', // primary hover
      '#ddb868', // gold bright
      '#5b6470', // text muted
      '#2a7554', // success
      '#96600f', // warning
      '#092239', // primary deep
    ],
  };

  readonly refreshIntervalSeconds = USAGE_STATISTICS_REFRESH_INTERVAL_MS / 1000;

  isLoading = true;
  errorMessage = '';
  lastUpdated: Date | null = null;
  totalRequests = 0;
  successRate = 0;
  averageResponseMillis = 0;
  trackedServices = 0;
  activeDatabaseConnections = 0;
  busiestServiceName = 'No traffic';
  busiestServiceRequests = 0;
  topResponseCode = 'No data';
  peakResponseMillis = 0;
  systemLoadAverage = 0;
  responseCodeData: ChartDatum[] = [];
  serviceTrafficData: LineSeries[] = [];
  serviceHighlights: Array<{ name: string; totalRequests: number; methods: string }> = [];

  ngOnInit(): void {
    this.loadUsageMetrics();
  }

  private loadUsageMetrics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    timer(0, USAGE_STATISTICS_REFRESH_INTERVAL_MS)
      .pipe(
        switchMap(() => this.metricsService.getMetrics()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: metrics => {
          this.updateMetrics(metrics);
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.status === 403 ? 'You do not have access to usage statistics.' : 'Unable to load usage statistics.';
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  private updateMetrics(metrics: Metrics): void {
    const allRequests = metrics['http.server.requests'].all.count;
    const responseCodes = Object.entries(metrics['http.server.requests'].percode)
      .map(([code, details]) => ({ name: code, value: details.count }))
      .sort((left, right) => right.value - left.value);
    const serviceTraffic = this.buildServiceTrafficData(metrics.services);
    const topService = serviceTraffic[0];

    this.totalRequests = allRequests;
    this.successRate = this.calculateSuccessRate(metrics['http.server.requests'].percode, allRequests);
    this.averageResponseMillis = this.calculateAverageResponseTime(metrics['http.server.requests'].percode);
    this.trackedServices = Object.keys(metrics.services).length;
    this.activeDatabaseConnections = metrics.databases.active.value;
    this.busiestServiceName = topService?.name ?? 'No traffic';
    this.busiestServiceRequests = topService?.totalRequests ?? 0;
    this.topResponseCode = responseCodes[0]?.name ?? 'No data';
    this.peakResponseMillis = this.calculatePeakResponseTime(metrics['http.server.requests'].percode);
    this.systemLoadAverage = metrics.processMetrics['system.load.average.1m'] ?? 0;
    this.responseCodeData = responseCodes;
    this.serviceTrafficData = serviceTraffic.map(({ name, series }) => ({ name, series }));
    this.serviceHighlights = serviceTraffic.slice(0, 3).map(service => ({
      name: service.name,
      totalRequests: service.totalRequests,
      methods: service.methods.join(', '),
    }));
    this.lastUpdated = new Date();
    this.errorMessage = '';
  }

  private calculateAverageResponseTime(perCode: Record<string, MaxMeanCount>): number {
    const values = Object.values(perCode);
    if (values.length === 0) {
      return 0;
    }

    const totalWeightedMean = values.reduce((sum, metric) => sum + metric.mean * metric.count, 0);
    const totalCount = values.reduce((sum, metric) => sum + metric.count, 0);
    if (totalCount === 0) {
      return 0;
    }

    return Math.round((totalWeightedMean / totalCount) * 10) / 10;
  }

  private calculateSuccessRate(perCode: Record<string, MaxMeanCount>, totalRequests: number): number {
    if (totalRequests === 0) {
      return 0;
    }

    const successfulRequests = Object.entries(perCode)
      .filter(([code]) => code.startsWith('2'))
      .reduce((sum, [, metrics]) => sum + metrics.count, 0);

    return Math.round((successfulRequests / totalRequests) * 1000) / 10;
  }

  private calculatePeakResponseTime(perCode: Record<string, MaxMeanCount>): number {
    const maxValues = Object.values(perCode).map(metric => metric.max);
    return maxValues.length ? Math.round(Math.max(...maxValues) * 10) / 10 : 0;
  }

  private buildServiceTrafficData(services: Services): ServiceTrafficEntry[] {
    return Object.entries(services)
      .map(([name, serviceMetrics]) => ({
        name,
        totalRequests: this.sumServiceRequests(serviceMetrics),
        series: Object.entries(serviceMetrics)
          .map(([method, details]) => ({
            name: method,
            value: details.count,
          }))
          .sort((left, right) => this.httpMethodRank(left.name) - this.httpMethodRank(right.name))
          .filter(entry => entry.value > 0),
        methods: Object.entries(serviceMetrics)
          .filter(([, details]) => details.count > 0)
          .map(([method]) => method),
      }))
      .filter(service => service.totalRequests > 0)
      .sort((left, right) => right.totalRequests - left.totalRequests)
      .slice(0, 6);
  }

  private sumServiceRequests(serviceMetrics: Partial<Record<HttpMethod, MaxMeanCount>>): number {
    return Object.values(serviceMetrics).reduce((sum, metric) => sum + metric.count, 0);
  }

  private httpMethodRank(method: string): number {
    const order: string[] = [HttpMethod.Get, HttpMethod.Post, HttpMethod.Put, HttpMethod.Patch, HttpMethod.Delete];
    const index = order.indexOf(method);
    return index === -1 ? order.length : index;
  }
}

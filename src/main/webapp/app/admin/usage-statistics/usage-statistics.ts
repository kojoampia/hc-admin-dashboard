import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { LineChartComponent } from 'app/widgets/linechart/linechart.component';
import { PiechartComponent } from 'app/widgets/piechart/piechart.component';
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

@Component({
  selector: 'hpd-usage-statistics',
  templateUrl: './usage-statistics.html',
  styleUrl: './usage-statistics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, SharedModule, MatButtonModule, MatIconModule, PiechartComponent, LineChartComponent],
})
export default class UsageStatisticsComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  totalRequests = 0;
  averageResponseMillis = 0;
  trackedServices = 0;
  activeDatabaseConnections = 0;
  responseCodeData: ChartDatum[] = [];
  serviceTrafficData: LineSeries[] = [];

  constructor(private metricsService: MetricsService) {}

  ngOnInit(): void {
    this.loadUsageMetrics();
  }

  private loadUsageMetrics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.metricsService.getMetrics().subscribe({
      next: metrics => {
        this.updateMetrics(metrics);
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.status === 403 ? 'You do not have access to usage statistics.' : 'Unable to load usage statistics.';
        this.isLoading = false;
      },
    });
  }

  private updateMetrics(metrics: Metrics): void {
    const allRequests = metrics['http.server.requests'].all.count;
    const responseCodes = Object.entries(metrics['http.server.requests'].percode)
      .map(([code, details]) => ({ name: code, value: details.count }))
      .sort((left, right) => right.value - left.value);
    const serviceTraffic = this.buildServiceTrafficData(metrics.services);

    this.totalRequests = allRequests;
    this.averageResponseMillis = this.calculateAverageResponseTime(metrics['http.server.requests'].percode);
    this.trackedServices = Object.keys(metrics.services).length;
    this.activeDatabaseConnections = metrics.databases.active.value;
    this.responseCodeData = responseCodes;
    this.serviceTrafficData = serviceTraffic;
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

  private buildServiceTrafficData(services: Services): LineSeries[] {
    return Object.entries(services)
      .map(([name, serviceMetrics]) => ({
        name,
        total: this.sumServiceRequests(serviceMetrics),
        series: Object.entries(serviceMetrics)
          .map(([method, details]) => ({
            name: method,
            value: details?.count ?? 0,
          }))
          .sort((left, right) => this.httpMethodRank(left.name) - this.httpMethodRank(right.name)),
      }))
      .filter(service => service.total > 0)
      .sort((left, right) => right.total - left.total)
      .slice(0, 6)
      .map(({ name, series }) => ({ name, series }));
  }

  private sumServiceRequests(serviceMetrics: Partial<Record<HttpMethod, MaxMeanCount>>): number {
    return Object.values(serviceMetrics).reduce((sum, metric) => sum + (metric?.count ?? 0), 0);
  }

  private httpMethodRank(method: string): number {
    const order: string[] = [HttpMethod.Get, HttpMethod.Post, HttpMethod.Put, HttpMethod.Patch, HttpMethod.Delete];
    const index = order.indexOf(method);
    return index === -1 ? order.length : index;
  }
}

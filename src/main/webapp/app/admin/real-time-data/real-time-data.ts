import { computed, ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { ActivityEvent, DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'hpd-real-time-data',
  templateUrl: './real-time-data.html',
  styleUrl: './real-time-data.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, SharedModule, MatButtonModule, MatIconModule],
})
export default class RealTimeDataComponent implements OnInit, OnDestroy {
  readonly latestEvents = computed(() => this.dashboardState.operationLogs().slice(0, 6));
  readonly securityEventCount = computed(() => this.dashboardState.operationLogs().filter(event => this.isSecurityEvent(event)).length);
  readonly distinctEventTypes = computed(() => new Set(this.dashboardState.operationLogs().map(event => event.type)).size);
  readonly eventTypeSummary = computed(() =>
    Array.from(
      this.dashboardState.operationLogs().reduce<Map<string, number>>((summary, event) => {
        summary.set(event.type, (summary.get(event.type) ?? 0) + 1);
        return summary;
      }, new Map<string, number>()),
    )
      .map(([type, count]) => ({ type, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4),
  );

  /**
   * Reflects the transport, not the intent to use it. This used to be a plain field set to `true`
   * on the line after `connectAuditTrail()` — so the tile read "Live" whether or not anything had
   * connected, which is how a stream pointed at a nonexistent `/websocket` endpoint went unnoticed.
   */
  readonly isConnected = computed(() => this.dashboardState.auditTrailConnected());

  constructor(public dashboardState: DashboardStateService) {}

  ngOnInit(): void {
    this.dashboardState.connectAuditTrail();
  }

  ngOnDestroy(): void {
    this.dashboardState.disconnectAuditTrail();
  }

  private isSecurityEvent(event: ActivityEvent): boolean {
    return ['Security', 'Permission', 'Role Change'].includes(event.type);
  }
}

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardStateService } from 'app/entities/dashboard/dashboard-state';

@Component({
  selector: 'hpd-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard-component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly state = inject(DashboardStateService);

  isAuditTrailOpen = signal(false);

  toggleAuditTrail(): void {
    this.isAuditTrailOpen.update(v => !v);
  }

  ngOnInit(): void {
    this.state.connectAuditTrail();
  }

  ngOnDestroy(): void {
    this.state.disconnectAuditTrail();
  }

  weeklyStats = [
    { day: 'Mon', value: 142, percentage: 45 },
    { day: 'Tue', value: 215, percentage: 68 },
    { day: 'Wed', value: 189, percentage: 60 },
    { day: 'Thu', value: 314, percentage: 100 },
    { day: 'Fri', value: 285, percentage: 90 },
    { day: 'Sat', value: 92, percentage: 29 },
    { day: 'Sun', value: 45, percentage: 14 },
  ];

  healthMetrics = [
    { name: 'CPU Usage', value: 24, colorClass: 'bg-emerald-500' },
    { name: 'Memory Allocation', value: 68, colorClass: 'bg-amber-500' },
    { name: 'Storage Capacity', value: 85, colorClass: 'bg-rose-500' },
    { name: 'Network Traffic', value: 42, colorClass: 'bg-indigo-500' },
  ];
}

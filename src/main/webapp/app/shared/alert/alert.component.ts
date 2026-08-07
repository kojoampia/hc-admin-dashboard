import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AlertService, Alert } from 'app/core/util/alert.service';

@Component({
  selector: 'hpd-alert',
  templateUrl: './alert.component.html',
  imports: [CommonModule, MatButtonModule, MatIconModule],
})
export class AlertComponent implements OnInit, OnDestroy {
  private alertService = inject(AlertService);

  alerts: Alert[] = [];

  ngOnInit(): void {
    this.alerts = this.alertService.get();
  }

  setClasses(alert: Alert): { [key: string]: boolean } {
    const classes = { 'hpd-toast': Boolean(alert.toast) };
    if (alert.position) {
      return { ...classes, [alert.position]: true };
    }
    return classes;
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }

  close(alert: Alert): void {
    alert.close?.(this.alerts);
  }

  iconFor(alert: Alert): string {
    switch (alert.type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      default:
        return 'info';
    }
  }

  panelClasses(alert: Alert): string {
    switch (alert.type) {
      case 'success':
        return 'border-hpd-success-accent/30 bg-hpd-success-tint text-hpd-success';
      case 'warning':
        return 'border-hpd-warning-accent/30 bg-hpd-warning-tint text-hpd-warning';
      case 'danger':
        return 'border-hpd-danger/30 bg-hpd-danger-tint text-hpd-danger';
      default:
        return 'border-hpd-primary/30 bg-hpd-chart-blue/15 text-hpd-primary-deep';
    }
  }
}

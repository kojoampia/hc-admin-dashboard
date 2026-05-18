import { Component, OnDestroy, OnInit } from '@angular/core';
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
  alerts: Alert[] = [];

  constructor(private alertService: AlertService) {}

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
        return 'border-emerald-200 bg-emerald-50 text-emerald-900';
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-900';
      case 'danger':
        return 'border-rose-200 bg-rose-50 text-rose-900';
      default:
        return 'border-sky-200 bg-sky-50 text-sky-900';
    }
  }
}

import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

type OverviewMetric = {
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly detail: string;
  readonly icon: string;
  readonly accentClass: string;
};

@Component({
  selector: 'hpd-operations-overview',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="grid gap-4 sm:grid-cols-2">
      @for (metric of metrics; track metric.label) {
        <article class="rounded-hpd border border-white/10 bg-white/5 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-hpd-subtle">{{ metric.label }}</p>
              <p class="mt-3 text-3xl font-semibold text-white">{{ metric.value }}</p>
            </div>
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-hpd" [class]="metric.accentClass">
              <mat-icon>{{ metric.icon }}</mat-icon>
            </span>
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="text-sm text-hpd-on-navy-muted">{{ metric.detail }}</p>
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-hpd-success-accent">{{ metric.delta }}</span>
          </div>
        </article>
      }
    </div>
  `,
})
export class OperationsOverviewComponent {
  readonly metrics: readonly OverviewMetric[] = [
    {
      label: 'Active shifts',
      value: '128',
      delta: '+12%',
      detail: 'Open and in-progress shifts across all active regions.',
      icon: 'medical_services',
      accentClass: 'bg-hpd-success-accent/15 text-hpd-success-accent',
    },
    {
      label: 'Professional profiles',
      value: '2,184',
      delta: '+5.6%',
      detail: 'Verified professionals currently available for assignment.',
      icon: 'badge',
      accentClass: 'bg-hpd-primary/15 text-hpd-on-navy-muted',
    },
    {
      label: 'Patient profiles',
      value: '8,942',
      delta: '+3.1%',
      detail: 'Active patient records with recent operator-managed activity.',
      icon: 'personal_injury',
      accentClass: 'bg-hpd-chart-blue/15 text-hpd-chart-blue',
    },
    {
      label: 'Vendor profiles',
      value: '164',
      delta: '+1.4%',
      detail: 'Approved vendors supporting operational supply coverage.',
      icon: 'storefront',
      accentClass: 'bg-hpd-warning-accent/15 text-hpd-warning-accent',
    },
  ];
}

import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

type CoverageMetric = {
  readonly label: string;
  readonly value: string;
  readonly helper: string;
  readonly icon: string;
  readonly iconClass: string;
};

@Component({
  selector: 'hpd-shift-coverage',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="grid gap-4 md:grid-cols-2">
      @for (metric of metrics; track metric.label) {
        <article class="rounded-hpd border border-white/10 bg-white/5 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-hpd-subtle">{{ metric.label }}</p>
              <p class="mt-3 text-3xl font-semibold text-white">{{ metric.value }}</p>
            </div>
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-hpd" [class]="metric.iconClass">
              <mat-icon>{{ metric.icon }}</mat-icon>
            </span>
          </div>
          <p class="mt-3 text-sm text-hpd-on-navy-muted">{{ metric.helper }}</p>
        </article>
      }
    </div>
  `,
})
export class ShiftCoverageComponent {
  readonly metrics: readonly CoverageMetric[] = [
    {
      label: 'Unassigned shifts',
      value: '18',
      helper: 'Open shifts currently waiting for qualified coverage.',
      icon: 'assignment_late',
      iconClass: 'bg-hpd-danger-accent/15 text-hpd-danger',
    },
    {
      label: 'Cancellation rate',
      value: '4.8%',
      helper: 'Filled shifts cancelled after assignment confirmation.',
      icon: 'event_busy',
      iconClass: 'bg-hpd-warning-accent/15 text-hpd-warning-accent',
    },
    {
      label: 'No-show rate',
      value: '2.3%',
      helper: 'Confirmed professionals missing the start of a booked shift.',
      icon: 'person_off',
      iconClass: 'bg-hpd-gold/15 text-hpd-gold',
    },
    {
      label: 'Overtime rate',
      value: '11.6%',
      helper: 'Shifts requiring overtime escalation to maintain coverage.',
      icon: 'schedule',
      iconClass: 'bg-hpd-chart-blue/15 text-hpd-chart-blue',
    },
  ];
}

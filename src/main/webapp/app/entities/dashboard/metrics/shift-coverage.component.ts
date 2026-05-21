import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="grid gap-4 md:grid-cols-2">
      @for (metric of metrics; track metric.label) {
        <article class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{{ metric.label }}</p>
              <p class="mt-3 text-3xl font-semibold text-white">{{ metric.value }}</p>
            </div>
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl" [class]="metric.iconClass">
              <mat-icon>{{ metric.icon }}</mat-icon>
            </span>
          </div>
          <p class="mt-3 text-sm text-slate-300">{{ metric.helper }}</p>
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
      iconClass: 'bg-rose-500/15 text-rose-200',
    },
    {
      label: 'Cancellation rate',
      value: '4.8%',
      helper: 'Filled shifts cancelled after assignment confirmation.',
      icon: 'event_busy',
      iconClass: 'bg-amber-500/15 text-amber-200',
    },
    {
      label: 'No-show rate',
      value: '2.3%',
      helper: 'Confirmed professionals missing the start of a booked shift.',
      icon: 'person_off',
      iconClass: 'bg-fuchsia-500/15 text-fuchsia-200',
    },
    {
      label: 'Overtime rate',
      value: '11.6%',
      helper: 'Shifts requiring overtime escalation to maintain coverage.',
      icon: 'schedule',
      iconClass: 'bg-cyan-500/15 text-cyan-200',
    },
  ];
}

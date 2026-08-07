import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

type FinanceMetric = {
  readonly label: string;
  readonly value: string;
  readonly helper: string;
  readonly icon: string;
};

@Component({
  selector: 'hpd-finance-pulse',
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
            <span class="inline-flex h-11 w-11 items-center justify-center rounded-hpd bg-hpd-success-accent/15 text-hpd-success-accent">
              <mat-icon>{{ metric.icon }}</mat-icon>
            </span>
          </div>
          <p class="mt-3 text-sm text-hpd-on-navy-muted">{{ metric.helper }}</p>
        </article>
      }
    </div>
  `,
})
export class FinancePulseComponent {
  readonly metrics: readonly FinanceMetric[] = [
    {
      label: 'Monthly recurring revenue',
      value: '$482k',
      helper: 'Recurring monthly platform revenue across active subscriptions.',
      icon: 'payments',
    },
    {
      label: 'Profit margin',
      value: '28%',
      helper: 'Margin after operational fulfilment and platform support costs.',
      icon: 'savings',
    },
    {
      label: 'Customer acquisition cost',
      value: '$114',
      helper: 'Blended acquisition spend per newly activated customer.',
      icon: 'campaign',
    },
    {
      label: 'Average revenue per user',
      value: '$58',
      helper: 'Monetization level across active operator-managed accounts.',
      icon: 'stacked_line_chart',
    },
  ];
}

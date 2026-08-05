import { Component } from '@angular/core';

type ShiftMetric = {
  readonly label: string;
  readonly value: string;
  readonly progress: number;
  readonly helper: string;
};

@Component({
  selector: 'hpd-shift-performance',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Shift requests</p>
          <p class="mt-3 text-3xl font-semibold text-white">436</p>
          <p class="mt-2 text-sm text-slate-300">Requests created by operators this week.</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Avg. time to fill</p>
          <p class="mt-3 text-3xl font-semibold text-white">42m</p>
          <p class="mt-2 text-sm text-slate-300">Median time from posting to confirmed assignment.</p>
        </div>
      </div>

      <div class="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        @for (metric of metrics; track metric.label) {
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-white">{{ metric.label }}</p>
                <p class="text-xs text-slate-400">{{ metric.helper }}</p>
              </div>
              <span class="text-sm font-semibold text-white">{{ metric.value }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-slate-800">
              <div class="h-full rounded-full bg-emerald-400 transition-all" [style.width.%]="metric.progress"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class ShiftPerformanceComponent {
  readonly metrics: readonly ShiftMetric[] = [
    {
      label: 'Shift fill rate',
      value: '92%',
      progress: 92,
      helper: 'Filled positions against all posted operational shifts.',
    },
    {
      label: 'Operator engagement',
      value: '84%',
      progress: 84,
      helper: 'Weekly operators actively managing shifts and responding to alerts.',
    },
    {
      label: 'Training completion',
      value: '88%',
      progress: 88,
      helper: 'Operators and professionals current on workflow onboarding tasks.',
    },
  ];
}

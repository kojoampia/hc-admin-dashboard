import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type CustomerSignal = {
  readonly label: string;
  readonly score: string;
  readonly trend: string;
  readonly progress: number;
};

@Component({
  selector: 'hpd-customer-signals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      @for (signal of signals; track signal.label) {
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="text-sm font-medium text-white">{{ signal.label }}</p>
              <p class="text-xs text-slate-400">{{ signal.trend }}</p>
            </div>
            <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">{{ signal.score }}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-800">
            <div class="h-full rounded-full bg-fuchsia-400 transition-all" [style.width.%]="signal.progress"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CustomerSignalsComponent {
  readonly signals: readonly CustomerSignal[] = [
    {
      label: 'Operator satisfaction',
      score: '4.6 / 5',
      trend: 'Feedback score from operational users in the last 30 days.',
      progress: 92,
    },
    {
      label: 'User retention rate',
      score: '89%',
      trend: 'Percentage of active users returning week over week.',
      progress: 89,
    },
    {
      label: 'Support requests',
      score: '36',
      trend: 'Open support tickets tied to onboarding or workflow blockers.',
      progress: 36,
    },
    {
      label: 'Onboarding completion',
      score: '81%',
      trend: 'Users completing initial platform onboarding and training.',
      progress: 81,
    },
  ];
}

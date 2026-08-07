import { Component } from '@angular/core';

type RevenueChannel = {
  readonly label: string;
  readonly contribution: string;
  readonly growth: string;
  readonly progress: number;
};

@Component({
  selector: 'hpd-revenue-breakdown',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-4">
      <div class="rounded-hpd border border-white/10 bg-white/5 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-hpd-subtle">Revenue growth rate</p>
        <div class="mt-3 flex items-end justify-between gap-3">
          <p class="text-3xl font-semibold text-white">17.4%</p>
          <span class="rounded-full bg-hpd-danger-accent/15 px-3 py-1 text-xs font-medium text-hpd-danger">ARR +9.2%</span>
        </div>
        <p class="mt-2 text-sm text-hpd-on-navy-muted">Growth is being driven by enterprise renewals and improved shift fill conversion.</p>
      </div>

      <div class="space-y-4 rounded-hpd border border-white/10 bg-white/5 p-4">
        @for (channel of channels; track channel.label) {
          <div class="space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p class="text-sm font-medium text-white">{{ channel.label }}</p>
                <p class="text-xs text-hpd-subtle">{{ channel.growth }}</p>
              </div>
              <span class="text-sm font-semibold text-white">{{ channel.contribution }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-hpd-primary">
              <div class="h-full rounded-full bg-hpd-danger-accent transition-all" [style.width.%]="channel.progress"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class RevenueBreakdownComponent {
  readonly channels: readonly RevenueChannel[] = [
    {
      label: 'Enterprise subscriptions',
      contribution: '44%',
      growth: 'Largest contribution, up 6% month over month.',
      progress: 44,
    },
    {
      label: 'Marketplace staffing',
      contribution: '31%',
      growth: 'Higher conversion from faster assignment workflows.',
      progress: 31,
    },
    {
      label: 'Vendor services',
      contribution: '15%',
      growth: 'Stable with stronger onboarding completion in new regions.',
      progress: 15,
    },
    {
      label: 'Training and support',
      contribution: '10%',
      growth: 'Increasing uptake from operator enablement programs.',
      progress: 10,
    },
  ];
}

import { Component, computed, inject } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { DashboardStateService } from '../dashboard-state';

@Component({
  selector: 'hpd-live-activity-feed',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3 rounded-hpd border border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p class="text-sm font-semibold text-white">Real-time operations stream</p>
          <p class="text-xs text-hpd-subtle">Newest audit and operator actions from the live event feed.</p>
        </div>
        <span
          class="inline-flex items-center gap-2 rounded-full bg-hpd-success-accent/15 px-3 py-1 text-xs font-medium text-hpd-success-accent"
        >
          <span class="h-2 w-2 rounded-full bg-hpd-success-accent"></span>
          Live
        </span>
      </div>

      <div class="space-y-3">
        @for (event of latestEvents(); track event.id) {
          <article class="flex items-start gap-3 rounded-hpd border border-white/10 bg-white/5 p-4">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-hpd" [class]="event.colorClass">
              <mat-icon>{{ event.icon }}</mat-icon>
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-medium text-white">{{ event.type }}</p>
                <span class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-hpd-on-navy-muted">{{
                  event.timestamp
                }}</span>
              </div>
              <p class="mt-2 text-sm text-hpd-on-navy-muted">{{ event.message }}</p>
            </div>
          </article>
        }
      </div>
    </div>
  `,
})
export class LiveActivityFeedComponent {
  readonly state = inject(DashboardStateService);
  readonly latestEvents = computed(() => this.state.operationLogs().slice(0, 6));
}

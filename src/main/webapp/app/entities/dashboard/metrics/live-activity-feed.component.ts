import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { DashboardStateService } from '../dashboard-state';

@Component({
  selector: 'hpd-live-activity-feed',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p class="text-sm font-semibold text-white">Real-time operations stream</p>
          <p class="text-xs text-slate-400">Newest audit and operator actions from the live event feed.</p>
        </div>
        <span class="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
          <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
          Live
        </span>
      </div>

      <div class="space-y-3">
        @for (event of latestEvents(); track event.id) {
          <article class="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl" [class]="event.colorClass">
              <mat-icon>{{ event.icon }}</mat-icon>
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-medium text-white">{{ event.type }}</p>
                <span class="rounded-full bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-slate-300">{{
                  event.timestamp
                }}</span>
              </div>
              <p class="mt-2 text-sm text-slate-300">{{ event.message }}</p>
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

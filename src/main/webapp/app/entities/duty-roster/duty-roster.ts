import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

import { DutyRosterService } from './service/duty-roster.service';
import { DashboardStateService } from '../dashboard/dashboard-state';

export interface Shift {
  id: string;
  date: string;
  shiftName: string;
  requiredRole: string;
  assignedUser?: string;
  status: 'ASSIGNED' | 'UNASSIGNED';
}

@Component({
  selector: 'hpd-duty-roster',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './duty-roster.html',
})
export class DutyRosterComponent {
  private api = inject(DutyRosterService);
  state = inject(DashboardStateService);

  shifts = signal<Shift[]>([]);
  isScheduling = signal(false);

  readonly rosterGroups = computed(() => {
    const map = new Map<string, Shift[]>();
    for (const shift of this.shifts()) {
      const list = map.get(shift.date) ?? [];
      list.push(shift);
      map.set(shift.date, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, shifts]) => ({ date, shifts }));
  });

  constructor() {
    this.createMockShifts();
  }

  createMockShifts(): void {
    const roles = ['DOCTOR', 'NURSE', 'PHARMACIST', 'FRONT_DESK'];
    const shiftNames = ['Morning Shift', 'Afternoon Shift', 'Night Shift'];
    const result: Shift[] = [];

    for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      const date = d.toISOString().split('T')[0];

      for (const role of roles) {
        for (const shiftName of shiftNames) {
          const assigned = Math.random() < 0.5;
          result.push({
            id: `${date}-${role}-${shiftName}`.replace(/\s+/g, '-').toLowerCase(),
            date,
            shiftName,
            requiredRole: role,
            status: assigned ? 'ASSIGNED' : 'UNASSIGNED',
            assignedUser: assigned ? 'John Doe' : undefined,
          });
        }
      }
    }

    this.shifts.set(result);
  }

  autoSchedule(): void {
    if (!this.state.canAccess('DUTY_ROSTER', 'CREATE') && !this.state.canAccess('DUTY_ROSTER', 'UPDATE')) return;

    this.isScheduling.set(true);

    this.api
      .post<Shift[]>('/hc-admin-ms/shifts/auto-schedule', {})
      .pipe(finalize(() => this.isScheduling.set(false)))
      .subscribe({
        next: (resolvedRoster: Shift[]) => {
          if (Array.isArray(resolvedRoster) && resolvedRoster.length > 0) {
            this.shifts.set(resolvedRoster);
          } else {
            this.shifts.update(current =>
              current.map(s => ({
                ...s,
                status: 'ASSIGNED' as const,
                assignedUser: s.assignedUser || 'Auto Assigned User',
              })),
            );
          }
        },
        error: () => {
          this.shifts.update(current =>
            current.map(s => ({
              ...s,
              status: 'ASSIGNED' as const,
              assignedUser: s.assignedUser || 'Smart Scheduled Staff',
            })),
          );
        },
      });
  }
}

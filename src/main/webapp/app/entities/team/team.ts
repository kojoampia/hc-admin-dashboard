import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { TeamService } from 'app/entities/team/service/team.service';
import { TeamDialogComponent, TeamDialogData } from 'app/entities/team/team-dialog';
import { DashboardStateService } from 'app/entities/dashboard/dashboard-state';

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Pharmacist' | 'Caregiver' | 'Paramedic' | 'Front Desk';
  contact: string;
  teamId: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  message: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'hpd-team',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTableModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="space-y-6">
      <!-- ── Header ────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-xl font-semibold text-slate-800">Team Management</h2>
          <p class="text-slate-500 text-xs mt-1">Manage healthcare teams, members, and responsibilities.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="toggleAuditTrail()"
            mat-icon-button
            class="!text-slate-400 hover:!text-indigo-600 !border !border-slate-200 !rounded-xl"
            title="Toggle Audit Trail"
          >
            <mat-icon>history</mat-icon>
          </button>
          @if (state.canAccess('TEAMS', 'CREATE')) {
            <button (click)="openAddModal()" mat-flat-button class="!bg-indigo-600 !text-white !rounded-xl !px-5 !py-5">
              <mat-icon iconPositionEnd>group_add</mat-icon>
              Add Team
            </button>
          }
        </div>
      </div>

      <!-- ── Main Grid: Table + Audit Sidebar ─────────────────────────── -->
      <div class="grid gap-6" [class]="isAuditTrailOpen() ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'">
        <!-- Teams Table -->
        <div
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6"
          [class]="isAuditTrailOpen() ? 'lg:col-span-2' : ''"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-slate-700">All Teams</h3>
            <span class="text-xs text-slate-400">{{ teams().length }} teams</span>
          </div>

          <table mat-table [dataSource]="teams()" class="w-full">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold">Name</th>
              <td mat-cell *matCellDef="let team" class="!py-4 !text-sm !font-semibold !text-slate-800">
                <div class="flex items-center gap-3">
                  <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                    <mat-icon class="!text-base">groups</mat-icon>
                  </span>
                  {{ team.name }}
                </div>
              </td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold">
                Description
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4 !text-sm !text-slate-500 max-w-[200px]">
                <span class="line-clamp-2">{{ team.description }}</span>
              </td>
            </ng-container>

            <!-- Members Column -->
            <ng-container matColumnDef="members">
              <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold">
                Members
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4">
                <div class="flex flex-wrap gap-1">
                  @for (name of teamMembersMap()[team.id] || []; track name; let i = $index) {
                    @if (i < 3) {
                      <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium">{{ name }}</span>
                    }
                  }
                  @if ((teamMembersMap()[team.id] || []).length > 3) {
                    <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold">
                      +{{ (teamMembersMap()[team.id] || []).length - 3 }}
                    </span>
                  }
                  @if ((teamMembersMap()[team.id] || []).length === 0) {
                    <span class="text-[11px] text-slate-400 italic">No members</span>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Updated Column -->
            <ng-container matColumnDef="updatedAt">
              <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold">
                Last Updated
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4 !text-xs !text-slate-400">{{ team.updatedAt }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold text-right"
              >
                Actions
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    mat-icon-button
                    (click)="openManageMembersModal(team)"
                    title="Manage Members"
                    class="!text-slate-400 hover:!text-indigo-600"
                  >
                    <mat-icon class="!text-lg">manage_accounts</mat-icon>
                  </button>
                  @if (state.canAccess('TEAMS', 'UPDATE')) {
                    <button mat-icon-button (click)="openEditModal(team)" title="Edit" class="!text-slate-400 hover:!text-amber-600">
                      <mat-icon class="!text-lg">edit</mat-icon>
                    </button>
                  }
                  @if (state.canAccess('TEAMS', 'DELETE')) {
                    <button mat-icon-button (click)="deleteTeam(team)" title="Delete" class="!text-slate-400 hover:!text-rose-500">
                      <mat-icon class="!text-lg">delete_outline</mat-icon>
                    </button>
                  }
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns" class="!h-10"></tr>
            <tr mat-row *matRowDef="let row; columns: columns" class="hover:bg-slate-50 transition-colors border-b border-slate-50"></tr>
          </table>

          @if (teams().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 text-slate-400">
              <mat-icon class="!text-5xl mb-3 opacity-30">group_off</mat-icon>
              <p class="text-sm font-medium">No teams registered</p>
              <p class="text-xs mt-1 opacity-70">Add a new team using the button above.</p>
            </div>
          }
        </div>

        <!-- ── Audit Trail Sidebar ──────────────────────────────────────── -->
        @if (isAuditTrailOpen()) {
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-1">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="text-sm font-semibold text-slate-700">Audit Trail</h3>
                <p class="text-[11px] text-slate-400 mt-0.5">Recent changes to teams</p>
              </div>
              <button mat-icon-button (click)="toggleAuditTrail()" class="!text-slate-400 hover:!text-slate-700 !-mr-2">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="relative pl-4">
              <!-- Vertical line -->
              <div class="absolute left-5 top-0 bottom-0 w-px bg-slate-100"></div>

              <div class="space-y-5">
                @for (event of auditEvents(); track event.id) {
                  <div class="flex gap-3 items-start">
                    <span class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 {{ event.colorClass }}">
                      <mat-icon class="!text-sm">{{ event.icon }}</mat-icon>
                    </span>
                    <div>
                      <p class="text-xs font-medium text-slate-700 leading-snug">{{ event.message }}</p>
                      <p class="text-[10px] text-slate-400 mt-0.5">{{ event.timestamp }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class TeamComponent {
  api = inject(TeamService);
  dialog = inject(MatDialog);
  state = inject(DashboardStateService);

  columns = ['name', 'description', 'members', 'updatedAt', 'actions'];

  teams = signal<Team[]>([
    {
      id: '1',
      name: 'Cardiology Unit',
      description: 'Specialises in heart disease diagnosis and treatment.',
      members: ['m1', 'm2', 'm3'],
      updatedAt: '2 hours ago',
    },
    {
      id: '2',
      name: 'Pediatrics',
      description: 'Focused on medical care for infants, children, and adolescents.',
      members: ['m4', 'm5'],
      updatedAt: '1 day ago',
    },
    {
      id: '3',
      name: 'Oncology',
      description: 'Cancer prevention, diagnosis, and treatment team.',
      members: ['m2', 'm5'],
      updatedAt: '3 days ago',
    },
    {
      id: '4',
      name: 'Emergency Response',
      description: 'First-response team handling critical emergency cases.',
      members: ['m1', 'm3', 'm4'],
      updatedAt: '5 days ago',
    },
  ]);

  members = signal<Member[]>([
    { id: 'm1', name: 'Dr. Alice Mensah', role: 'Doctor', contact: 'alice@hc.org', teamId: '1', updatedAt: '2 hours ago' },
    { id: 'm2', name: 'Nurse Kwame Boateng', role: 'Nurse', contact: 'kwame@hc.org', teamId: '1', updatedAt: '1 day ago' },
    { id: 'm3', name: 'Dr. Robert Asante', role: 'Doctor', contact: 'robert@hc.org', teamId: '1', updatedAt: '3 days ago' },
    { id: 'm4', name: 'Ama Ofori', role: 'Caregiver', contact: 'ama@hc.org', teamId: '2', updatedAt: '1 day ago' },
    { id: 'm5', name: 'Kofi Darko', role: 'Pharmacist', contact: 'kofi@hc.org', teamId: '2', updatedAt: '5 days ago' },
  ]);

  isAuditTrailOpen = signal(true);

  auditEvents = signal<AuditEvent[]>([
    {
      id: '1',
      type: 'UPDATE',
      message: 'Updated Team "Cardiology" description',
      timestamp: '10 mins ago',
      icon: 'edit_document',
      colorClass: 'bg-amber-100 text-amber-600',
    },
    {
      id: '2',
      type: 'CREATE',
      message: 'Added new Team "Pediatrics"',
      timestamp: '2 hours ago',
      icon: 'post_add',
      colorClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: '3',
      type: 'DELETE',
      message: 'Removed Team "Oncology"',
      timestamp: '1 day ago',
      icon: 'delete',
      colorClass: 'bg-rose-100 text-rose-600',
    },
  ]);

  readonly teamMembersMap = computed<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const team of this.teams()) {
      map[team.id] = this.members()
        .filter(m => team.members.includes(m.id))
        .map(m => m.name);
    }
    return map;
  });

  loadData(): void {
    // In production: call this.api.query() and populate signals
    // Dummy data is pre-loaded in signal initialisers above
  }

  toggleAuditTrail(): void {
    this.isAuditTrailOpen.update(v => !v);
  }

  logEvent(type: 'CREATE' | 'UPDATE' | 'DELETE', message: string): void {
    // Keyed by the union rather than `string`, so every key is present by construction and the
    // lookups below are definite instead of `string | undefined`.
    const iconMap: Record<AuditEvent['type'], string> = { CREATE: 'post_add', UPDATE: 'edit_document', DELETE: 'delete' };
    const colorMap: Record<AuditEvent['type'], string> = {
      CREATE: 'bg-emerald-100 text-emerald-600',
      UPDATE: 'bg-amber-100 text-amber-600',
      DELETE: 'bg-rose-100 text-rose-600',
    };
    const event: AuditEvent = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: 'just now',
      icon: iconMap[type],
      colorClass: colorMap[type],
    };
    this.auditEvents.update(list => [event, ...list]);
  }

  openAddModal(): void {
    if (!this.state.canAccess('TEAMS', 'CREATE')) {
      return;
    }

    const dialogRef = this.dialog.open(TeamDialogComponent, { width: '560px', data: null });
    dialogRef.afterClosed().subscribe((result: TeamDialogData | undefined) => {
      if (result) {
        const newTeam: Team = {
          id: Date.now().toString(),
          name: result.name,
          description: result.description,
          members: [],
          updatedAt: 'just now',
        };
        this.teams.update(list => [newTeam, ...list]);
        this.logEvent('CREATE', `Added new Team "${result.name}"`);
      }
    });
  }

  openEditModal(team: Team): void {
    if (!this.state.canAccess('TEAMS', 'UPDATE')) {
      return;
    }

    const dialogRef = this.dialog.open(TeamDialogComponent, {
      width: '560px',
      data: { name: team.name, description: team.description } satisfies TeamDialogData,
    });
    dialogRef.afterClosed().subscribe((result: TeamDialogData | undefined) => {
      if (result) {
        this.teams.update(list =>
          list.map(t => (t.id === team.id ? { ...t, name: result.name, description: result.description, updatedAt: 'just now' } : t)),
        );
        this.logEvent('UPDATE', `Updated Team "${result.name}" details`);
      }
    });
  }

  deleteTeam(team: Team): void {
    if (!this.state.canAccess('TEAMS', 'DELETE')) {
      return;
    }
    if (!confirm(`Delete team "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    this.teams.update(list => list.filter(t => t.id !== team.id));
    this.logEvent('DELETE', `Removed Team "${team.name}"`);
  }

  openManageMembersModal(team: Team): void {
    this.logManageMembers(team);
  }

  logManageMembers(team: Team): void {
    this.logEvent('UPDATE', `Managed members for Team "${team.name}"`);
  }
}

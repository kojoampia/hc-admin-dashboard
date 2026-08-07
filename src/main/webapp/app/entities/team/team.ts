import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { TeamService } from 'app/entities/team/service/team.service';
import { TeamDialogComponent, TeamDialogData } from 'app/entities/team/team-dialog';
import { DashboardStateService } from 'app/entities/dashboard/dashboard-state';
import { PersonService } from 'app/entities/person/service/person.service';
import { AuditLogService } from 'app/entities/audit-log/service/audit-log.service';
import { ITeam } from 'app/entities/team/team.model';
import { IAuditLog } from 'app/entities/audit-log/audit-log.model';

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  updatedAt: string;
}

/*
 * There was a `Member` interface here — id, name, role, contact — backed by five invented staff
 * ("Dr. Alice Mensah", "alice@hc.org"). The api has no Member entity at all: ITeam.members is a
 * free-text field of person ids. Names are resolved from PersonService below; role and contact had
 * nowhere to come from and are gone rather than faked.
 */

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
  imports: [MatTabsModule, MatTableModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="space-y-6">
      <!-- ── Header ────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-xl font-semibold text-hpd-primary-dark">Team Management</h2>
          <p class="text-hpd-muted text-xs mt-1">Manage healthcare teams, members, and responsibilities.</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="toggleAuditTrail()"
            mat-icon-button
            class="!text-hpd-subtle hover:!text-hpd-primary !border !border-hpd-border !rounded-xl"
            title="Toggle Audit Trail"
          >
            <mat-icon>history</mat-icon>
          </button>
          @if (state.canAccess('TEAMS', 'CREATE')) {
            <button (click)="openAddModal()" mat-flat-button class="!bg-hpd-primary !text-white !rounded-xl !px-5 !py-5">
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
          class="bg-white rounded-hpd border border-hpd-border shadow-hpd-sm overflow-hidden p-6"
          [class]="isAuditTrailOpen() ? 'lg:col-span-2' : ''"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-semibold text-hpd-muted">All Teams</h3>
            <span class="text-xs text-hpd-subtle">{{ teams().length }} teams</span>
          </div>

          <table mat-table [dataSource]="teams()" class="w-full">
            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-hpd-subtle !font-semibold">
                Name
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4 !text-sm !font-semibold !text-hpd-primary-dark">
                <div class="flex items-center gap-3">
                  <span class="flex items-center justify-center w-8 h-8 rounded-xl bg-hpd-primary/15 text-hpd-primary shrink-0">
                    <mat-icon class="!text-base">groups</mat-icon>
                  </span>
                  {{ team.name }}
                </div>
              </td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-hpd-subtle !font-semibold">
                Description
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4 !text-sm !text-hpd-muted max-w-[200px]">
                <span class="line-clamp-2">{{ team.description }}</span>
              </td>
            </ng-container>

            <!-- Members Column -->
            <ng-container matColumnDef="members">
              <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-hpd-subtle !font-semibold">
                Members
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4">
                <div class="flex flex-wrap gap-1">
                  @for (name of teamMembersMap()[team.id] || []; track name; let i = $index) {
                    @if (i < 3) {
                      <span class="px-2 py-0.5 bg-hpd-surface text-hpd-muted rounded-full text-[10px] font-medium">{{ name }}</span>
                    }
                  }
                  @if ((teamMembersMap()[team.id] || []).length > 3) {
                    <span class="px-2 py-0.5 bg-hpd-primary/10 text-hpd-primary rounded-full text-[10px] font-bold">
                      +{{ (teamMembersMap()[team.id] || []).length - 3 }}
                    </span>
                  }
                  @if ((teamMembersMap()[team.id] || []).length === 0) {
                    <span class="text-[11px] text-hpd-subtle italic">No members</span>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Updated Column -->
            <ng-container matColumnDef="updatedAt">
              <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-hpd-subtle !font-semibold">
                Last Updated
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4 !text-xs !text-hpd-subtle">{{ team.updatedAt }}</td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th
                mat-header-cell
                *matHeaderCellDef
                class="!text-[10px] !uppercase !tracking-wider !text-hpd-subtle !font-semibold text-right"
              >
                Actions
              </th>
              <td mat-cell *matCellDef="let team" class="!py-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button
                    mat-icon-button
                    (click)="openManageMembersModal(team)"
                    title="Manage Members"
                    class="!text-hpd-subtle hover:!text-hpd-primary"
                  >
                    <mat-icon class="!text-lg">manage_accounts</mat-icon>
                  </button>
                  @if (state.canAccess('TEAMS', 'UPDATE')) {
                    <button mat-icon-button (click)="openEditModal(team)" title="Edit" class="!text-hpd-subtle hover:!text-hpd-warning">
                      <mat-icon class="!text-lg">edit</mat-icon>
                    </button>
                  }
                  @if (state.canAccess('TEAMS', 'DELETE')) {
                    <button mat-icon-button (click)="deleteTeam(team)" title="Delete" class="!text-hpd-subtle hover:!text-hpd-danger">
                      <mat-icon class="!text-lg">delete_outline</mat-icon>
                    </button>
                  }
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns" class="!h-10"></tr>
            <tr mat-row *matRowDef="let row; columns: columns" class="hover:bg-hpd-cream transition-colors border-b border-hpd-border"></tr>
          </table>

          @if (teams().length === 0) {
            <div class="flex flex-col items-center justify-center py-16 text-hpd-subtle">
              <mat-icon class="!text-5xl mb-3 opacity-30">group_off</mat-icon>
              <p class="text-sm font-medium">No teams registered</p>
              <p class="text-xs mt-1 opacity-70">Add a new team using the button above.</p>
            </div>
          }
        </div>

        <!-- ── Audit Trail Sidebar ──────────────────────────────────────── -->
        @if (isAuditTrailOpen()) {
          <div class="bg-white rounded-hpd border border-hpd-border shadow-hpd-sm p-6 lg:col-span-1">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="text-sm font-semibold text-hpd-muted">Audit Trail</h3>
                <p class="text-[11px] text-hpd-subtle mt-0.5">Recent changes to teams</p>
              </div>
              <button mat-icon-button (click)="toggleAuditTrail()" class="!text-hpd-subtle hover:!text-hpd-muted !-mr-2">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <div class="relative pl-4">
              <!-- Vertical line -->
              <div class="absolute left-5 top-0 bottom-0 w-px bg-hpd-surface"></div>

              <div class="space-y-5">
                @for (event of auditEvents(); track event.id) {
                  <div class="flex gap-3 items-start">
                    <span class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 {{ event.colorClass }}">
                      <mat-icon class="!text-sm">{{ event.icon }}</mat-icon>
                    </span>
                    <div>
                      <p class="text-xs font-medium text-hpd-muted leading-snug">{{ event.message }}</p>
                      <p class="text-[10px] text-hpd-subtle mt-0.5">{{ event.timestamp }}</p>
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

  readonly teams = signal<Team[]>([]);
  readonly isLoading = signal(true);
  readonly loadFailed = signal(false);

  isAuditTrailOpen = signal(true);

  readonly auditEvents = signal<AuditEvent[]>([]);

  readonly teamMembersMap = computed<Record<string, string[]>>(() => {
    const byTeam: Record<string, string[]> = {};
    const names = this.memberNames();
    for (const team of this.teams()) {
      // An unresolved id is shown as the id: a silently shorter list would read as a team that has
      // fewer members than it does.
      byTeam[team.id] = team.members.map(id => names.get(id) ?? id);
    }
    return byTeam;
  });

  /** Person id -> display name, for resolving ITeam.members. */
  private readonly memberNames = signal<Map<string, string>>(new Map());

  private readonly personService = inject(PersonService);
  private readonly auditLogService = inject(AuditLogService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.loadFailed.set(false);

    forkJoin({
      teams: this.api.query().pipe(catchError(() => of(null))),
      people: this.personService.query().pipe(catchError(() => of(null))),
      audits: this.auditLogService.query({ sort: ['createdDate,desc'], size: 20 }).pipe(catchError(() => of(null))),
    })
      .pipe(
        map(({ teams, people, audits }) => ({
          teams: teams?.body ?? null,
          names: new Map(
            (people?.body ?? []).map(person => [person.id, [person.firstName, person.lastName].filter(Boolean).join(' ').trim()]),
          ),
          audits: (audits?.body ?? []).map(entry => this.toAuditEvent(entry)),
        })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ teams, names, audits }) => {
        // Only the teams call failing is a failure — names and the audit feed are decoration.
        this.loadFailed.set(teams === null);
        this.memberNames.set(names);
        this.teams.set((teams ?? []).map(team => this.toRow(team)));
        this.auditEvents.set(audits);
        this.isLoading.set(false);
      });
  }

  toggleAuditTrail(): void {
    this.isAuditTrailOpen.update(v => !v);
  }

  /*
   * There was a logEvent() here that prepended a client-invented entry to the audit trail on every
   * mutation. That is the same class of problem as the seeded data it sat beside: the api now
   * records a real AuditLog row for every save and delete (AuditLogCallback), so a locally
   * fabricated line would sit next to server-recorded ones looking identical and being neither
   * durable nor true. Mutations reload the feed instead.
   */

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
        this.loadData();
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
        this.loadData();
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
    this.loadData();
  }

  openManageMembersModal(team: Team): void {
    this.logManageMembers(team);
  }

  logManageMembers(team: Team): void {
    this.loadData();
  }

  private toRow(team: ITeam): Team {
    return {
      id: team.id,
      name: team.name ?? '',
      description: team.description ?? '',
      // `members` is a free-text field on the api — comma or space separated ids in practice.
      members: (team.members ?? '')
        .split(/[,\s]+/)
        .map(id => id.trim())
        .filter(Boolean),
      updatedAt: team.modifiedDate ? dayjs(team.modifiedDate).fromNow() : '',
    };
  }

  private toAuditEvent(entry: IAuditLog): AuditEvent {
    const action = (entry.actionType ?? '').toUpperCase();
    const type: AuditEvent['type'] = action === 'DELETE' ? 'DELETE' : action === 'SAVE' || action === 'CREATE' ? 'CREATE' : 'UPDATE';
    const iconMap: Record<AuditEvent['type'], string> = { CREATE: 'post_add', UPDATE: 'edit_document', DELETE: 'delete' };
    const colorMap: Record<AuditEvent['type'], string> = {
      CREATE: 'bg-hpd-success-tint text-hpd-success',
      UPDATE: 'bg-hpd-warning-tint text-hpd-warning',
      DELETE: 'bg-hpd-danger-tint text-hpd-danger',
    };
    return {
      id: entry.id,
      type,
      message: entry.metadata ?? 'System event recorded.',
      timestamp: entry.createdDate ? entry.createdDate.fromNow() : '',
      icon: iconMap[type],
      colorClass: colorMap[type],
    };
  }
}

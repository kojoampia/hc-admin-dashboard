import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { DashboardStateService, UserRole } from 'app/entities/dashboard/dashboard-state';
import { ProfileDialogComponent, ProfileData } from 'app/entities/profile/profile-dialog';
import { ProfileService } from 'app/entities/profile/service/profile.service';

@Component({
  selector: 'hpd-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTableModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="space-y-6">
      <!-- ── Header ──────────────────────────────────────────────────────── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-xl font-semibold text-slate-800">User Profiles</h2>
          <p class="text-slate-500 text-xs mt-1">Manage patient, vendor, and user records.</p>
        </div>
        @if (state.canAccess('PROFILES', 'CREATE')) {
          <button (click)="openAddModal()" mat-flat-button class="!bg-indigo-600 !text-white !rounded-xl !px-5 !py-5">
            <mat-icon iconPositionEnd>add</mat-icon>
            Add Profile
          </button>
        }
      </div>

      <!-- ── Profile Type Tabs ────────────────────────────────────────────── -->
      <div class="flex gap-2 flex-wrap">
        @for (type of profileTypes; track type) {
          <button
            (click)="selectedType.set(type)"
            class="px-4 py-2 rounded-xl text-xs font-bold border transition-all uppercase tracking-wider"
            [ngClass]="
              selectedType() === type
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            "
          >
            {{ type }}s
          </button>
        }
      </div>

      <!-- ── Data Table ──────────────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <table mat-table [dataSource]="filteredProfiles()" class="w-full">
          <!-- Name Column -->
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold">Name</th>
            <td mat-cell *matCellDef="let profile" class="!py-4 !text-sm !font-medium !text-slate-700">
              <div class="flex items-center gap-3">
                <span
                  class="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm shrink-0"
                >
                  {{ profile.name.charAt(0) }}
                </span>
                {{ profile.name }}
              </div>
            </td>
          </ng-container>

          <!-- Roles Column -->
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold">Roles</th>
            <td mat-cell *matCellDef="let profile" class="!py-4">
              <div class="flex flex-wrap gap-1">
                @for (role of profile.roles; track role) {
                  <span
                    class="px-2 py-0.5 rounded-full font-bold uppercase text-[9px]"
                    [ngClass]="{
                      'bg-indigo-50 text-indigo-600': role === 'PATIENT',
                      'bg-emerald-50 text-emerald-600': role === 'USER' || role === 'EDITOR',
                      'bg-amber-50 text-amber-600': role === 'VENDOR',
                      'bg-rose-50 text-rose-600': role === 'ADMIN',
                      'bg-blue-50 text-blue-600': role === 'PROFESSIONAL'
                    }"
                    >{{ role }}</span
                  >
                }
              </div>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold">Status</th>
            <td mat-cell *matCellDef="let profile" class="!py-4">
              <span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold uppercase text-[9px]">
                {{ profile.status }}
              </span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold text-right">
              Actions
            </th>
            <td mat-cell *matCellDef="let profile" class="!py-4 text-right">
              @if (state.canAccess('PROFILES', 'UPDATE') && canEditProfile(profile)) {
                <button mat-icon-button (click)="openEditModal(profile)" class="text-slate-400 hover:text-indigo-600 transition-colors">
                  <mat-icon class="!text-lg">edit</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!h-10"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            class="hover:bg-slate-50 transition-colors border-b border-slate-50"
          ></tr>
        </table>

        @if (filteredProfiles().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-slate-400">
            <mat-icon class="!text-5xl mb-3 opacity-30">person_off</mat-icon>
            <p class="text-sm font-medium">No {{ selectedType() }} profiles</p>
            <p class="text-xs mt-1 opacity-70">Add a new profile using the button above.</p>
          </div>
        }
      </div>
    </div>
  `,
})
export class ProfileComponent {
  api = inject(ProfileService);
  state = inject(DashboardStateService);
  private readonly dialog = inject(MatDialog);

  displayedColumns = ['name', 'type', 'status', 'actions'];
  readonly profileTypes: UserRole[] = ['USER', 'ADMIN', 'PATIENT', 'PROFESSIONAL', 'VENDOR'];
  selectedType = signal<UserRole>('USER');

  profiles = signal<ProfileData[]>([
    { name: 'Alice Johnson', roles: ['PATIENT'], status: 'ACTIVE' },
    { name: 'MediCorp Systems', roles: ['VENDOR'], status: 'VERIFIED' },
    { name: 'Bob Smith', roles: ['PATIENT'], status: 'INACTIVE' },
    { name: 'Health-Wise Labs', roles: ['VENDOR'], status: 'VERIFIED' },
    { name: 'Jojo Addison', roles: ['USER', 'EDITOR'], status: 'ACTIVE' },
    { name: 'John Doe', roles: ['ADMIN'], status: 'ACTIVE' },
    { name: 'Jane Smith', roles: ['PROFESSIONAL'], status: 'INACTIVE' },
  ]);

  readonly filteredProfiles = computed(() => {
    const type = this.selectedType();
    return this.profiles().filter(p => p.roles.includes(type));
  });

  constructor() {
    if (!this.state.canAccess('PROFILES', 'UPDATE')) {
      this.displayedColumns = ['name', 'type', 'status'];
    }
  }

  canEditProfile(profile: ProfileData): boolean {
    return profile.roles.every((role: UserRole) => this.state.canAssignRole(role));
  }

  openAddModal(): void {
    if (!this.state.canAccess('PROFILES', 'CREATE')) return;

    const dialogRef = this.dialog.open(ProfileDialogComponent, { width: '600px', data: null });
    dialogRef.afterClosed().subscribe((result: ProfileData) => {
      if (result) {
        if (result.roles.length > 0) {
          this.selectedType.set(result.roles[0]);
        }
        this.profiles.update(list => [result, ...list]);
      }
    });
  }

  openEditModal(profile: ProfileData): void {
    if (!this.state.canAccess('PROFILES', 'UPDATE') || !this.canEditProfile(profile)) return;

    const dialogRef = this.dialog.open(ProfileDialogComponent, { width: '600px', data: profile });
    dialogRef.afterClosed().subscribe((result: ProfileData) => {
      if (result) {
        this.profiles.update(list => list.map(p => (p === profile ? result : p)));
        if (result.roles.length > 0 && !result.roles.includes(this.selectedType())) {
          this.selectedType.set(result.roles[0]);
        }
      }
    });
  }
}

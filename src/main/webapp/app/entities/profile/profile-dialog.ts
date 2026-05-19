import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { UserRole } from 'app/entities/dashboard/dashboard-state';

export interface ProfileData {
  name: string;
  roles: UserRole[];
  status: string;
}

const ALL_ROLES: UserRole[] = ['USER', 'ADMIN', 'PATIENT', 'PROFESSIONAL', 'VENDOR', 'EDITOR'];

@Component({
  selector: 'hpd-profile-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-slate-800">{{ data ? 'Edit Profile' : 'Add Profile' }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">{{ data ? 'Update the profile details.' : 'Register a new user profile.' }}</p>
        </div>
        <button mat-icon-button class="text-slate-400 hover:text-slate-700" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label for="pf-name" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name</label>
          <input
            id="pf-name"
            type="text"
            class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800"
            placeholder="e.g. Alice Johnson"
            [ngModel]="form().name"
            (ngModelChange)="patch('name', $event)"
          />
        </div>

        <!-- Roles -->
        <div>
          <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Roles</label>
          <div class="flex flex-wrap gap-2">
            @for (role of allRoles; track role) {
              <button
                type="button"
                class="px-3 py-1 rounded-full text-xs font-bold border transition-all uppercase tracking-wider"
                [ngClass]="
                  form().roles.includes(role)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                "
                (click)="toggleRole(role)"
              >
                {{ role }}
              </button>
            }
          </div>
        </div>

        <!-- Status -->
        <div>
          <label for="pf-status" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Status</label>
          <select
            id="pf-status"
            class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800 bg-white"
            [ngModel]="form().status"
            (ngModelChange)="patch('status', $event)"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="VERIFIED">VERIFIED</option>
          </select>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
        <button
          class="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          (click)="close()"
        >
          Cancel
        </button>
        <button
          class="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          [disabled]="!form().name.trim() || form().roles.length === 0"
          (click)="save()"
        >
          {{ data ? 'Save Changes' : 'Add Profile' }}
        </button>
      </div>
    </div>
  `,
})
export class ProfileDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ProfileDialogComponent>);
  data: ProfileData | null = inject(MAT_DIALOG_DATA, { optional: true });

  readonly allRoles: UserRole[] = ALL_ROLES;

  form = signal<ProfileData>({
    name: this.data?.name ?? '',
    roles: this.data?.roles ?? [],
    status: this.data?.status ?? 'ACTIVE',
  });

  patch<K extends keyof ProfileData>(key: K, value: ProfileData[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  toggleRole(role: UserRole): void {
    this.form.update(f => {
      const roles = f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role];
      return { ...f, roles };
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close({ ...this.form() });
  }
}

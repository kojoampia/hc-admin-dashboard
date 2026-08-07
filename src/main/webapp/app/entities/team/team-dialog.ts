import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface TeamDialogData {
  name: string;
  description: string;
}

@Component({
  selector: 'hpd-team-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-hpd-primary-dark">{{ data ? 'Edit Team' : 'Add Team' }}</h2>
          <p class="text-xs text-hpd-subtle mt-0.5">{{ data ? 'Update team details.' : 'Register a new healthcare team.' }}</p>
        </div>
        <button mat-icon-button class="text-hpd-subtle hover:text-hpd-muted" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label for="team-name" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Team Name</label>
          <input
            id="team-name"
            type="text"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark"
            placeholder="e.g. Cardiology Unit"
            [ngModel]="form().name"
            (ngModelChange)="patch('name', $event)"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="team-desc" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Description</label>
          <textarea
            id="team-desc"
            rows="3"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark resize-none"
            placeholder="Brief description of the team's responsibilities..."
            [ngModel]="form().description"
            (ngModelChange)="patch('description', $event)"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-hpd-border">
        <button
          class="px-4 py-2 text-sm font-semibold text-hpd-muted bg-white border border-hpd-border rounded-xl hover:bg-hpd-cream transition-colors"
          (click)="close()"
        >
          Cancel
        </button>
        <button
          class="px-5 py-2 text-sm font-semibold text-white bg-hpd-primary rounded-xl hover:bg-hpd-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          [disabled]="!form().name.trim()"
          (click)="save()"
        >
          {{ data ? 'Save Changes' : 'Add Team' }}
        </button>
      </div>
    </div>
  `,
})
export class TeamDialogComponent {
  data: TeamDialogData | null = inject(MAT_DIALOG_DATA, { optional: true });

  form = signal<TeamDialogData>({
    name: this.data?.name ?? '',
    description: this.data?.description ?? '',
  });

  private readonly dialogRef = inject(MatDialogRef<TeamDialogComponent>);

  patch<K extends keyof TeamDialogData>(key: K, value: TeamDialogData[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close({ ...this.form() });
  }
}

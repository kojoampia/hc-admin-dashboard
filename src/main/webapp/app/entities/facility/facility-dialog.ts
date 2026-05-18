import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Facility } from './facility';

type FacilityType = 'Hospital' | 'Clinic' | 'Laboratory' | 'Pharmacy';

@Component({
  selector: 'hpd-facility-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-slate-800">{{ data ? 'Edit Facility' : 'Add Facility' }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">{{ data ? 'Update the facility details.' : 'Register a new healthcare facility.' }}</p>
        </div>
        <button mat-icon-button class="text-slate-400 hover:text-slate-700" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label for="fc-name" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Facility Name</label>
          <input
            id="fc-name"
            type="text"
            class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800"
            placeholder="e.g. City Hospital"
            [ngModel]="form().name"
            (ngModelChange)="patch('name', $event)"
          />
        </div>

        <!-- Location -->
        <div>
          <label for="fc-location" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Location</label>
          <input
            id="fc-location"
            type="text"
            class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800"
            placeholder="123 Main St, City"
            [ngModel]="form().location"
            (ngModelChange)="patch('location', $event)"
          />
        </div>

        <!-- Type & Capacity row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="fc-type" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Type</label>
            <select
              id="fc-type"
              class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800 bg-white"
              [ngModel]="form().type"
              (ngModelChange)="patch('type', $event)"
            >
              @for (t of facilityTypes; track t) {
                <option [value]="t">{{ t }}</option>
              }
            </select>
          </div>
          <div>
            <label for="fc-capacity" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Capacity</label>
            <input
              id="fc-capacity"
              type="number"
              min="1"
              class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800"
              placeholder="0"
              [ngModel]="form().capacity"
              (ngModelChange)="patch('capacity', +$event)"
            />
          </div>
        </div>

        <!-- Contact -->
        <div>
          <label for="fc-contact" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Contact</label>
          <input
            id="fc-contact"
            type="text"
            class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800"
            placeholder="(555) 000-0000"
            [ngModel]="form().contact"
            (ngModelChange)="patch('contact', $event)"
          />
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
          [disabled]="!form().name.trim() || !form().location.trim()"
          (click)="save()"
        >
          {{ data ? 'Save Changes' : 'Add Facility' }}
        </button>
      </div>
    </div>
  `,
})
export class FacilityDialogComponent {
  private dialogRef = inject(MatDialogRef<FacilityDialogComponent>);
  data: Facility | null = inject(MAT_DIALOG_DATA, { optional: true });

  readonly facilityTypes: FacilityType[] = ['Hospital', 'Clinic', 'Laboratory', 'Pharmacy'];

  form = signal<Facility>({
    id: this.data?.id ?? '',
    name: this.data?.name ?? '',
    location: this.data?.location ?? '',
    type: this.data?.type ?? 'Hospital',
    capacity: this.data?.capacity ?? 0,
    contact: this.data?.contact ?? '',
    updatedAt: this.data?.updatedAt ?? new Date().toISOString(),
  });

  patch<K extends keyof Facility>(key: K, value: Facility[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  save(): void {
    this.dialogRef.close(this.form());
  }

  close(): void {
    this.dialogRef.close();
  }
}

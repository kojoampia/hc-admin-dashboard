import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IFacility } from './facility.model';
import { FacilityType } from 'app/entities/enumerations/facility-type.model';

@Component({
  selector: 'hpd-facility-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-hpd-primary-dark">{{ data ? 'Edit Facility' : 'Add Facility' }}</h2>
          <p class="text-xs text-hpd-subtle mt-0.5">{{ data ? 'Update the facility details.' : 'Register a new healthcare facility.' }}</p>
        </div>
        <button mat-icon-button class="text-hpd-subtle hover:text-hpd-muted" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label for="fc-name" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Facility Name</label>
          <input
            id="fc-name"
            type="text"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark"
            placeholder="e.g. City Hospital"
            [ngModel]="form().name"
            (ngModelChange)="patch('name', $event)"
          />
        </div>

        <!-- Address ID -->
        <div>
          <label for="fc-address" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Address ID</label>
          <input
            id="fc-address"
            type="text"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark"
            placeholder="Address identifier"
            [ngModel]="form().addressId"
            (ngModelChange)="patch('addressId', $event)"
          />
        </div>

        <!-- Type -->
        <div>
          <label for="fc-type" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Type</label>
          <select
            id="fc-type"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark bg-white"
            [ngModel]="form().type"
            (ngModelChange)="patch('type', $event)"
          >
            @for (t of facilityTypes; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>

        <!-- Contact ID -->
        <div>
          <label for="fc-contact" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Contact ID</label>
          <input
            id="fc-contact"
            type="text"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark"
            placeholder="Contact identifier"
            [ngModel]="form().contactId"
            (ngModelChange)="patch('contactId', $event)"
          />
        </div>

        <!-- Description -->
        <div>
          <label for="fc-description" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Description</label>
          <textarea
            id="fc-description"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark"
            rows="3"
            placeholder="Facility description..."
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
          [disabled]="!form().name?.trim() || !form().addressId?.trim()"
          (click)="save()"
        >
          {{ data ? 'Save Changes' : 'Add Facility' }}
        </button>
      </div>
    </div>
  `,
})
export class FacilityDialogComponent {
  data: IFacility | null = inject(MAT_DIALOG_DATA, { optional: true });

  readonly facilityTypes = Object.values(FacilityType);

  form = signal<IFacility>({
    id: this.data?.id ?? '',
    name: this.data?.name ?? '',
    description: this.data?.description ?? '',
    type: this.data?.type ?? FacilityType.HOSPITAL,
    addressId: this.data?.addressId ?? '',
    contactId: this.data?.contactId ?? '',
  });

  private dialogRef = inject(MatDialogRef<FacilityDialogComponent>);

  patch<K extends keyof IFacility>(key: K, value: IFacility[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  save(): void {
    this.dialogRef.close(this.form());
  }

  close(): void {
    this.dialogRef.close();
  }
}

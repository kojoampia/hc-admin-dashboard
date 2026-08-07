import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IPricingPlan } from './pricing-plan.model';
import { BillingType } from 'app/entities/enumerations/billing-type.model';

@Component({
  selector: 'hpd-price-plan-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-hpd-primary-dark">{{ data ? 'Edit Plan' : 'Add New Plan' }}</h2>
          <p class="text-xs text-hpd-subtle mt-0.5">
            {{ data ? 'Update the pricing plan details.' : 'Configure a new subscription tier.' }}
          </p>
        </div>
        <button mat-icon-button class="text-hpd-subtle hover:text-hpd-muted" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Name -->
        <div>
          <label for="pp-name" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Plan Name</label>
          <input
            id="pp-name"
            type="text"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark"
            placeholder="e.g. BASIC, PREMIUM…"
            [ngModel]="form().name"
            (ngModelChange)="patch('name', $event)"
          />
        </div>

        <!-- Price -->
        <div>
          <label for="pp-price" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Price</label>
          <input
            id="pp-price"
            type="number"
            min="0"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark"
            placeholder="0"
            [ngModel]="form().price"
            (ngModelChange)="patch('price', +$event)"
          />
        </div>

        <!-- Billing Cycle -->
        <div>
          <label for="pp-cycle" class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Billing Cycle</label>
          <select
            id="pp-cycle"
            class="w-full text-sm border border-hpd-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-primary-dark bg-white"
            [ngModel]="form().billingCycle"
            (ngModelChange)="patch('billingCycle', $event)"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="ANNUALLY">Annually</option>
          </select>
        </div>

        <!-- Features -->
        <div>
          <label class="text-xs font-semibold text-hpd-muted uppercase tracking-wider block mb-1.5">Features</label>
          <div class="space-y-2 max-h-44 overflow-y-auto pr-1">
            @for (feature of features(); track $index) {
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  class="flex-1 text-sm border border-hpd-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-hpd-primary/40 text-hpd-muted"
                  [value]="feature"
                  (input)="updateFeature($index, $any($event.target).value)"
                />
                <button mat-icon-button class="text-hpd-danger hover:text-hpd-danger shrink-0" (click)="removeFeature($index)">
                  <mat-icon class="text-base">remove_circle_outline</mat-icon>
                </button>
              </div>
            }
          </div>
          <button
            class="mt-2 flex items-center gap-1 text-xs text-hpd-primary font-semibold hover:text-hpd-primary transition-colors"
            (click)="addFeature()"
          >
            <mat-icon class="text-sm">add_circle_outline</mat-icon>
            Add Feature
          </button>
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
          [disabled]="!form().name?.trim()"
          (click)="save()"
        >
          {{ data ? 'Save Changes' : 'Create Plan' }}
        </button>
      </div>
    </div>
  `,
})
export class PricePlanDialogComponent {
  data: IPricingPlan | null = inject(MAT_DIALOG_DATA, { optional: true });

  features = signal<string[]>(this.data?.features ? this.data.features.split(',') : []);

  form = signal<IPricingPlan>({
    id: this.data?.id ?? '',
    name: this.data?.name ?? '',
    price: this.data?.price ?? 0,
    billingCycle: this.data?.billingCycle ?? BillingType.MONTHLY,
    features: this.data?.features ?? '',
  });

  private dialogRef = inject(MatDialogRef<PricePlanDialogComponent>);

  patch<K extends keyof IPricingPlan>(key: K, value: IPricingPlan[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  addFeature(): void {
    this.features.update(fs => [...fs, '']);
  }

  removeFeature(index: number): void {
    this.features.update(fs => fs.filter((_, i) => i !== index));
  }

  updateFeature(index: number, value: string): void {
    this.features.update(fs => {
      const copy = [...fs];
      copy[index] = value;
      return copy;
    });
  }

  save(): void {
    const result = { ...this.form(), features: this.features().join(',') };
    this.dialogRef.close(result);
  }

  close(): void {
    this.dialogRef.close();
  }
}

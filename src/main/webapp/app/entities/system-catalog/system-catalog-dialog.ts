import { Component, inject, signal } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CatalogItem, CatalogType } from './system-catalog';

@Component({
  selector: 'hpd-system-catalog-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <div class="p-6 w-full">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-slate-800">{{ data ? 'Edit Content' : 'Add Content' }}</h2>
          <p class="text-xs text-slate-400 mt-0.5">{{ data ? 'Update the catalog entry.' : 'Create a new public-facing content item.' }}</p>
        </div>
        <button mat-icon-button class="text-slate-400 hover:text-slate-700" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Type -->
        <div>
          <label for="sc-type" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Content Type</label>
          <select
            id="sc-type"
            class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800 bg-white"
            [ngModel]="form().type"
            (ngModelChange)="patch('type', $event)"
          >
            @for (t of catalogTypes; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>

        <!-- Title -->
        <div>
          <label for="sc-title" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Title</label>
          <input
            id="sc-title"
            type="text"
            class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800"
            placeholder="Enter a descriptive title…"
            [ngModel]="form().title"
            (ngModelChange)="patch('title', $event)"
          />
        </div>

        <!-- Content -->
        <div>
          <label for="sc-content" class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Content</label>
          <textarea
            id="sc-content"
            rows="6"
            class="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800 resize-none"
            placeholder="Enter the full content body…"
            [ngModel]="form().content"
            (ngModelChange)="patch('content', $event)"
          ></textarea>
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
          [disabled]="!form().title.trim() || !form().content.trim()"
          (click)="save()"
        >
          {{ data ? 'Save Changes' : 'Add Content' }}
        </button>
      </div>
    </div>
  `,
})
export class SystemCatalogDialogComponent {
  data: CatalogItem | null = inject(MAT_DIALOG_DATA, { optional: true });

  readonly catalogTypes: CatalogType[] = ['ABOUT', 'TERMS', 'PRIVACY', 'PRODUCTS', 'FAQ'];

  form = signal<CatalogItem>({
    id: this.data?.id ?? '',
    type: this.data?.type ?? 'ABOUT',
    title: this.data?.title ?? '',
    content: this.data?.content ?? '',
    updatedAt: this.data?.updatedAt ?? new Date().toISOString(),
  });

  private dialogRef = inject(MatDialogRef<SystemCatalogDialogComponent>);

  patch<K extends keyof CatalogItem>(key: K, value: CatalogItem[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  save(): void {
    this.dialogRef.close(this.form());
  }

  close(): void {
    this.dialogRef.close();
  }
}

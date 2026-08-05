import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { SystemCatalogService } from './service/system-catalog.service';
import { SystemCatalogDialogComponent } from './system-catalog-dialog';
import { DashboardStateService } from '../dashboard/dashboard-state';
import { AuditLogService } from 'app/entities/audit-log/service/audit-log.service';

export type CatalogType = 'ABOUT' | 'TERMS' | 'PRIVACY' | 'PRODUCTS' | 'FAQ';

export interface CatalogItem {
  id: string;
  type: CatalogType;
  title: string;
  content: string;
  updatedAt: string;
}

export interface CatalogAuditEvent {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  message: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'hpd-system-catalog',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTableModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './system-catalog.html',
  styles: [
    `
      :host ::ng-deep .mat-mdc-tab-header {
        padding: 0 1.5rem;
        border-bottom: 1px solid #f4f4f5;
      }
      :host ::ng-deep .mat-mdc-tab-labels {
        gap: 1.5rem;
      }
    `,
  ],
})
export class SystemCatalogComponent {
  api = inject(SystemCatalogService);
  dialog = inject(MatDialog);
  state = inject(DashboardStateService);

  readonly tabTypes: CatalogType[] = ['ABOUT', 'TERMS', 'PRIVACY', 'PRODUCTS', 'FAQ'];
  activeTab = signal<CatalogType>('ABOUT');
  catalogData = signal<CatalogItem[]>([]);
  columns = ['title', 'updatedAt', 'actions'];
  isAuditTrailOpen = signal(true);

  readonly auditEvents = signal<CatalogAuditEvent[]>([]);

  readonly filteredData = computed(() => this.catalogData().filter(item => item.type === this.activeTab()));

  private readonly auditLogService = inject(AuditLogService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.loadData();
    this.loadAuditTrail();
    if (!this.state.canAccess('CATALOG', 'UPDATE') && !this.state.canAccess('CATALOG', 'DELETE')) {
      this.columns = ['title', 'updatedAt'];
    }
  }

  loadData(): void {
    this.api.get<CatalogItem[]>('/catalog').subscribe(data => this.catalogData.set(data));
  }

  toggleAuditTrail(): void {
    this.isAuditTrailOpen.update(v => !v);
  }

  openAddModal(): void {
    if (!this.state.canAccess('CATALOG', 'CREATE')) {
      return;
    }

    const dialogRef = this.dialog.open(SystemCatalogDialogComponent, {
      width: '600px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result: CatalogItem | undefined) => {
      if (result) {
        this.api.post('/system-catalog', result).subscribe(() => {
          this.loadData();
          this.loadAuditTrail();
        });
      }
    });
  }

  openEditModal(item: CatalogItem): void {
    if (!this.state.canAccess('CATALOG', 'UPDATE')) {
      return;
    }

    const dialogRef = this.dialog.open(SystemCatalogDialogComponent, {
      width: '600px',
      data: item,
    });

    dialogRef.afterClosed().subscribe((result: CatalogItem | undefined) => {
      if (result) {
        this.api.put(`/system-catalog/${item.id}`, result).subscribe(() => {
          this.loadData();
          this.loadAuditTrail();
        });
      }
    });
  }

  deleteItem(item: CatalogItem): void {
    if (!this.state.canAccess('CATALOG', 'DELETE')) {
      return;
    }
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    this.api.delete(item.id).subscribe(() => {
      this.loadData();
      this.loadAuditTrail();
    });
  }

  /*
   * There was a logEvent() here that prepended a client-invented entry to this trail, alongside a
   * seeded set of three fabricated ones. The api records a real AuditLog row for every save and
   * delete now (AuditLogCallback), so an invented line would sit next to server-recorded ones
   * looking identical while being neither durable nor true. The feed is loaded and reloaded from
   * the api instead.
   */
  private loadAuditTrail(): void {
    this.auditLogService
      .query({ sort: ['createdDate,desc'], size: 20 })
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(response => {
        this.auditEvents.set(
          (response?.body ?? []).map(entry => {
            const action = (entry.actionType ?? '').toUpperCase();
            const type: CatalogAuditEvent['type'] =
              action === 'DELETE' ? 'DELETE' : action === 'SAVE' || action === 'CREATE' ? 'CREATE' : 'UPDATE';
            const iconMap: Record<CatalogAuditEvent['type'], string> = {
              CREATE: 'post_add',
              UPDATE: 'edit_document',
              DELETE: 'delete',
            };
            const colorMap: Record<CatalogAuditEvent['type'], string> = {
              CREATE: 'bg-emerald-100 text-emerald-600',
              UPDATE: 'bg-amber-100 text-amber-600',
              DELETE: 'bg-rose-100 text-rose-600',
            };
            return {
              id: entry.id,
              type,
              message: entry.metadata ?? 'System event recorded.',
              timestamp: entry.createdDate ? entry.createdDate.fromNow() : '',
              icon: iconMap[type],
              colorClass: colorMap[type],
            };
          }),
        );
      });
  }
}

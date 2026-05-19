import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { SystemCatalogService } from './service/system-catalog.service';
import { SystemCatalogDialogComponent } from './system-catalog-dialog';
import { DashboardStateService } from '../dashboard/dashboard-state';

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

  auditEvents = signal<CatalogAuditEvent[]>([
    {
      id: '1',
      type: 'UPDATE',
      message: 'Updated Terms of Service section 4.1',
      timestamp: '10 mins ago',
      icon: 'edit_document',
      colorClass: 'bg-amber-100 text-amber-600',
    },
    {
      id: '2',
      type: 'CREATE',
      message: 'Added new Product "Health Monitor"',
      timestamp: '2 hours ago',
      icon: 'post_add',
      colorClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: '3',
      type: 'DELETE',
      message: 'Removed deprecated FAQ entry',
      timestamp: '1 day ago',
      icon: 'delete',
      colorClass: 'bg-rose-100 text-rose-600',
    },
  ]);

  readonly filteredData = computed(() => this.catalogData().filter(item => item.type === this.activeTab()));

  constructor() {
    this.loadData();
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

  logEvent(type: 'CREATE' | 'UPDATE' | 'DELETE', message: string): void {
    const iconMap: Record<'CREATE' | 'UPDATE' | 'DELETE', string> = {
      CREATE: 'post_add',
      UPDATE: 'edit_document',
      DELETE: 'delete',
    };
    const colorMap: Record<'CREATE' | 'UPDATE' | 'DELETE', string> = {
      CREATE: 'bg-emerald-100 text-emerald-600',
      UPDATE: 'bg-amber-100 text-amber-600',
      DELETE: 'bg-rose-100 text-rose-600',
    };
    const newEvent: CatalogAuditEvent = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: 'Just now',
      icon: iconMap[type],
      colorClass: colorMap[type],
    };
    this.auditEvents.update(events => [newEvent, ...events].slice(0, 20));
  }

  openAddModal(): void {
    if (!this.state.canAccess('CATALOG', 'CREATE')) return;

    const dialogRef = this.dialog.open(SystemCatalogDialogComponent, {
      width: '600px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result: CatalogItem | undefined) => {
      if (result) {
        this.api.post('/system-catalog', result).subscribe(() => {
          this.loadData();
          this.logEvent('CREATE', `Added new ${result.type} content: "${result.title}"`);
        });
      }
    });
  }

  openEditModal(item: CatalogItem): void {
    if (!this.state.canAccess('CATALOG', 'UPDATE')) return;

    const dialogRef = this.dialog.open(SystemCatalogDialogComponent, {
      width: '600px',
      data: item,
    });

    dialogRef.afterClosed().subscribe((result: CatalogItem | undefined) => {
      if (result) {
        this.api.put(`/system-catalog/${item.id}`, result).subscribe(() => {
          this.loadData();
          this.logEvent('UPDATE', `Updated ${result.type} content: "${result.title}"`);
        });
      }
    });
  }

  deleteItem(item: CatalogItem): void {
    if (!this.state.canAccess('CATALOG', 'DELETE')) return;
    if (!confirm('Are you sure you want to delete this content?')) return;

    this.api.delete(item.id).subscribe(() => {
      this.loadData();
      this.logEvent('DELETE', `Deleted ${item.type} content: "${item.title}"`);
    });
  }
}

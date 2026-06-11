import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { FacilityService } from './service/facility.service';
import { FacilityDialogComponent } from './facility-dialog';
import { DashboardStateService } from '../dashboard/dashboard-state';
import { IFacility } from './facility.model';
import { ProfessionalService } from '../professional/service/professional.service';
import { IProfessional } from '../professional/professional.model';
import { AuditLogService } from '../audit-log/service/audit-log.service';
import { IAuditLog } from '../audit-log/audit-log.model';

export type FacilityType = 'Hospital' | 'Clinic' | 'Laboratory' | 'Pharmacy';

@Component({
  selector: 'hpd-facility',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTableModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './facility.html',
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
export class FacilityComponent implements OnInit {
  api = inject(FacilityService);
  professionalService = inject(ProfessionalService);
  auditLogService = inject(AuditLogService);
  dialog = inject(MatDialog);
  state = inject(DashboardStateService);

  readonly tabTypes: FacilityType[] = ['Hospital', 'Clinic', 'Laboratory', 'Pharmacy'];
  activeTab = signal<FacilityType>('Hospital');
  isAuditTrailOpen = signal(false);

  facilities = signal<IFacility[]>([]);
  personnel = signal<IProfessional[]>([]);
  auditEvents = signal<IAuditLog[]>([]);

  readonly filteredFacilities = computed(() => this.facilities().filter(f => f.type === this.activeTab()));

  personnelByFacility(facilityId: string): IProfessional[] {
    return this.personnel().filter(p => p.facility?.id === facilityId);
  }

  ngOnInit(): void {
    this.loadFacilities();
    this.loadPersonnel();
    this.loadAuditEvents();
  }

  loadFacilities(): void {
    this.api.query().subscribe(res => {
      if (res.body) {
        this.facilities.set(res.body);
      }
    });
  }

  loadPersonnel(): void {
    this.professionalService.query().subscribe(res => {
      if (res.body) {
        this.personnel.set(res.body);
      }
    });
  }

  loadAuditEvents(): void {
    this.auditLogService.query({ sort: ['createdDate,desc'], size: 20 }).subscribe(res => {
      if (res.body) {
        this.auditEvents.set(res.body);
      }
    });
  }

  toggleAuditTrail(): void {
    this.isAuditTrailOpen.update(v => !v);
  }

  openAddModal(): void {
    if (!this.state.canAccess('FACILITIES', 'CREATE')) return;

    const dialogRef = this.dialog.open(FacilityDialogComponent, {
      width: '600px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result: IFacility | undefined) => {
      if (result) {
        this.api.create(result).subscribe(() => {
          this.loadFacilities();
          this.loadAuditEvents();
        });
      }
    });
  }

  openEditModal(facility: IFacility): void {
    if (!this.state.canAccess('FACILITIES', 'UPDATE')) return;

    const dialogRef = this.dialog.open(FacilityDialogComponent, {
      width: '600px',
      data: facility,
    });

    dialogRef.afterClosed().subscribe((result: IFacility | undefined) => {
      if (result) {
        this.api.update(result).subscribe(() => {
          this.loadFacilities();
          this.loadAuditEvents();
        });
      }
    });
  }

  deleteFacility(facility: IFacility): void {
    if (!this.state.canAccess('FACILITIES', 'DELETE')) return;
    if (!facility.id) return;
    if (!confirm('Are you sure you want to delete this facility?')) return;

    this.api.delete(facility.id).subscribe(() => {
      this.loadFacilities();
      this.loadAuditEvents();
    });
  }

  // Map IAuditLog properties for use in template if necessary
  getAuditIcon(log: IAuditLog): string {
    const type = log.actionType;
    if (type === 'CREATE') return 'post_add';
    if (type === 'UPDATE') return 'edit_document';
    if (type === 'DELETE') return 'delete';
    return 'receipt_long';
  }

  getAuditColor(log: IAuditLog): string {
    const type = log.actionType;
    if (type === 'CREATE') return 'bg-emerald-100 text-emerald-600';
    if (type === 'UPDATE') return 'bg-amber-100 text-amber-600';
    if (type === 'DELETE') return 'bg-rose-100 text-rose-600';
    return 'bg-indigo-100 text-indigo-600';
  }
}

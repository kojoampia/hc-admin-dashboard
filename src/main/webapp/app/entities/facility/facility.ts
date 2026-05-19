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

export type FacilityType = 'Hospital' | 'Clinic' | 'Laboratory' | 'Pharmacy';

export interface Facility {
  id: string;
  name: string;
  location: string;
  type: FacilityType;
  capacity: number;
  contact: string;
  updatedAt: string;
}

export interface Personnel {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Pharmacist' | 'Front Desk';
  contact: string;
  facilityId: string;
  updatedAt: string;
}

export interface AuditEvent {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  message: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}

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
  dialog = inject(MatDialog);
  state = inject(DashboardStateService);

  readonly tabTypes: FacilityType[] = ['Hospital', 'Clinic', 'Laboratory', 'Pharmacy'];
  activeTab = signal<FacilityType>('Hospital');
  isAuditTrailOpen = signal(false);

  facilities = signal<Facility[]>([
    {
      id: '1',
      name: 'City Hospital',
      location: '123 Main St, Anytown',
      type: 'Hospital',
      capacity: 250,
      contact: '(555) 123-4567',
      updatedAt: '10 mins ago',
    },
    {
      id: '2',
      name: 'Downtown Clinic',
      location: '456 Elm St, Anytown',
      type: 'Clinic',
      capacity: 50,
      contact: '(555) 987-6543',
      updatedAt: '2 hours ago',
    },
    {
      id: '3',
      name: 'Health Lab',
      location: '789 Oak St, Anytown',
      type: 'Laboratory',
      capacity: 100,
      contact: '(555) 555-1212',
      updatedAt: '1 day ago',
    },
  ]);

  personnel = signal<Personnel[]>([
    { id: '1', name: 'Dr. Alice Smith', role: 'Doctor', contact: '(555) 111-2222', facilityId: '1', updatedAt: '5 mins ago' },
    { id: '2', name: 'Nurse Lisa Johnson', role: 'Nurse', contact: '(555) 333-4444', facilityId: '2', updatedAt: '10 mins ago' },
    { id: '3', name: 'Pharmacist Bob Brown', role: 'Pharmacist', contact: '(555) 666-7777', facilityId: '3', updatedAt: '20 mins ago' },
  ]);

  auditEvents = signal<AuditEvent[]>([
    {
      id: '1',
      type: 'UPDATE',
      message: 'Updated facility "City Hospital" capacity from 200 to 250',
      timestamp: '10 mins ago',
      icon: 'edit_document',
      colorClass: 'bg-amber-100 text-amber-600',
    },
    {
      id: '2',
      type: 'CREATE',
      message: 'Added new facility "Health Lab"',
      timestamp: '2 hours ago',
      icon: 'post_add',
      colorClass: 'bg-emerald-100 text-emerald-600',
    },
    {
      id: '3',
      type: 'DELETE',
      message: 'Removed personnel "Nurse Lisa Johnson" from "Downtown Clinic"',
      timestamp: '1 day ago',
      icon: 'delete',
      colorClass: 'bg-rose-100 text-rose-600',
    },
    {
      id: '4',
      type: 'UPDATE',
      message: 'Updated contact info for "Dr. Alice Smith"',
      timestamp: 'Just now',
      icon: 'edit_document',
      colorClass: 'bg-amber-100 text-amber-600',
    },
  ]);

  readonly filteredFacilities = computed(() => this.facilities().filter(f => f.type === this.activeTab()));

  personnelByFacility(facilityId: string): Personnel[] {
    return this.personnel().filter(p => p.facilityId === facilityId);
  }

  ngOnInit(): void {
    this.loadFacilities();
    this.loadPersonnel();
  }

  loadFacilities(): void {
    this.api.get<Facility[]>('/facilities').subscribe(data => this.facilities.set(data));
  }

  loadPersonnel(): void {
    this.api.get<Personnel[]>('/personnel').subscribe(data => this.personnel.set(data));
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
    const newEvent: AuditEvent = {
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
    if (!this.state.canAccess('FACILITIES', 'CREATE')) return;

    const dialogRef = this.dialog.open(FacilityDialogComponent, {
      width: '600px',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result: Facility | undefined) => {
      if (result) {
        this.api.post('/facilities', result).subscribe(() => {
          this.loadFacilities();
          this.logEvent('CREATE', `Added new facility "${result.name}"`);
        });
      }
    });
  }

  openEditModal(facility: Facility): void {
    if (!this.state.canAccess('FACILITIES', 'UPDATE')) return;

    const dialogRef = this.dialog.open(FacilityDialogComponent, {
      width: '600px',
      data: facility,
    });

    dialogRef.afterClosed().subscribe((result: Facility | undefined) => {
      if (result) {
        this.api.put(`/facilities/${facility.id}`, result).subscribe(() => {
          this.loadFacilities();
          this.logEvent('UPDATE', `Updated facility "${result.name}"`);
        });
      }
    });
  }

  deleteFacility(facility: Facility): void {
    if (!this.state.canAccess('FACILITIES', 'DELETE')) return;
    if (!confirm('Are you sure you want to delete this facility?')) return;

    this.api.delete(facility.id).subscribe(() => {
      this.loadFacilities();
      this.logEvent('DELETE', `Deleted facility "${facility.name}"`);
    });
  }
}

import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { DashboardStateService, UserRole } from 'app/entities/dashboard/dashboard-state';
import { ProfileDialogComponent, ProfileData } from 'app/entities/profile/profile-dialog';
import { ProfileService } from 'app/entities/profile/service/profile.service';

@Component({
  selector: 'hpd-profile',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTableModule, MatButtonModule, MatDialogModule],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss',
})
export class ProfileComponent {
  readonly profileTypes: UserRole[] = ['PATIENT', 'PROFESSIONAL', 'VENDOR', 'USER', 'ADMIN'];
  api = inject(ProfileService);
  state = inject(DashboardStateService);
  readonly filteredProfiles = computed(() => {
    const type = this.selectedType();
    return this.profiles().filter(p => p.roles.includes(type));
  });

  displayedColumns = ['name', 'type', 'status', 'actions'];
  selectedType = signal<UserRole>('USER');

  profiles = signal<ProfileData[]>([
    { name: 'Alice Johnson', roles: ['PATIENT'], status: 'ACTIVE' },
    { name: 'MediCorp Systems', roles: ['VENDOR'], status: 'VERIFIED' },
    { name: 'Bob Smith', roles: ['PATIENT'], status: 'INACTIVE' },
    { name: 'Health-Wise Labs', roles: ['VENDOR'], status: 'VERIFIED' },
    { name: 'Jojo Addison', roles: ['USER', 'EDITOR'], status: 'ACTIVE' },
    { name: 'John Doe', roles: ['ADMIN'], status: 'ACTIVE' },
    { name: 'Jane Smith', roles: ['PROFESSIONAL'], status: 'INACTIVE' },
  ]);

  private readonly dialog = inject(MatDialog);

  constructor() {
    if (!this.state.canAccess('PROFILES', 'UPDATE')) {
      this.displayedColumns = ['name', 'type', 'status'];
    }
  }

  canEditProfile(profile: ProfileData): boolean {
    return profile.roles.every((role: UserRole) => this.state.canAssignRole(role));
  }

  openAddModal(): void {
    if (!this.state.canAccess('PROFILES', 'CREATE')) {
      return;
    }
    const dialogRef = this.dialog.open(ProfileDialogComponent, { width: '600px', data: null });
    dialogRef.afterClosed().subscribe((result: ProfileData | undefined) => {
      // Dismissing the dialog (ESC or backdrop) emits undefined — without this guard that was
      // pushed into the list and then dereferenced.
      if (!result) {
        return;
      }
      if (result.roles.length > 0) {
        this.selectedType.set(result.roles[0]!);
      }
      this.profiles.update(list => [result, ...list]);
    });
  }

  openEditModal(profile: ProfileData): void {
    if (!this.state.canAccess('PROFILES', 'UPDATE') || !this.canEditProfile(profile)) {
      return;
    }
    const dialogRef = this.dialog.open(ProfileDialogComponent, { width: '600px', data: profile });
    dialogRef.afterClosed().subscribe((result: ProfileData | undefined) => {
      // Dismissing the dialog emits undefined — without this guard the edited profile was
      // replaced by it.
      if (!result) {
        return;
      }
      this.profiles.update(list => list.map(p => (p === profile ? result : p)));
      if (result.roles.length > 0 && !result.roles.includes(this.selectedType())) {
        this.selectedType.set(result.roles[0]!);
      }
    });
  }
}

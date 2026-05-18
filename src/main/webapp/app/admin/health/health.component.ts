import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { HealthService } from './health.service';
import { Health, HealthDetails, HealthKey, HealthStatus } from './health.model';
import HealthModalComponent from './modal/health-modal.component';

@Component({
  selector: 'hpd-health',
  templateUrl: './health.component.html',
  imports: [SharedModule, MatDialogModule],
})
export default class HealthComponent implements OnInit {
  health?: Health;

  constructor(
    private dialog: MatDialog,
    private healthService: HealthService,
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  getBadgeClass(statusState: HealthStatus): string {
    if (statusState === 'UP') {
      return 'bg-success';
    }
    return 'bg-danger';
  }

  badgeClasses(statusState: HealthStatus): string {
    return statusState === 'UP' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700';
  }

  refresh(): void {
    this.healthService.checkHealth().subscribe({
      next: health => (this.health = health),
      error: (error: HttpErrorResponse) => {
        if (error.status === 503) {
          this.health = error.error;
        }
      },
    });
  }

  showHealth(health: { key: string; value: HealthDetails }): void {
    const dialogRef = this.dialog.open(HealthModalComponent, { width: '48rem', maxWidth: '95vw' });
    dialogRef.componentInstance.health = health as { key: HealthKey; value: HealthDetails };
  }
}

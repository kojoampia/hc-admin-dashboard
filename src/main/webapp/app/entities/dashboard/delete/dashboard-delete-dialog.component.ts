import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IDashboard } from '../dashboard.model';
import { DashboardService } from '../service/dashboard.service';

@Component({
  templateUrl: './dashboard-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class DashboardDeleteDialogComponent {
  dashboard?: IDashboard;

  protected dashboardService = inject(DashboardService);
  protected dialogRef = inject(MatDialogRef<DashboardDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.dashboardService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

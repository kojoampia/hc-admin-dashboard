import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAuditLog } from '../audit-log.model';
import { AuditLogService } from '../service/audit-log.service';

@Component({
  templateUrl: './audit-log-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AuditLogDeleteDialogComponent {
  auditLog?: IAuditLog;

  protected auditLogService = inject(AuditLogService);
  protected dialogRef = inject(MatDialogRef<AuditLogDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.auditLogService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

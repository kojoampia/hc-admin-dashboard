import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { INotification } from '../notification.model';
import { NotificationService } from '../service/notification.service';

@Component({
  templateUrl: './notification-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class NotificationDeleteDialogComponent {
  notification?: INotification;

  protected notificationService = inject(NotificationService);
  protected dialogRef = inject(MatDialogRef<NotificationDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.notificationService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

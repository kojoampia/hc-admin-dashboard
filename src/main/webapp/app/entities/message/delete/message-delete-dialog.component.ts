import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IMessage } from '../message.model';
import { MessageService } from '../service/message.service';

@Component({
  templateUrl: './message-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class MessageDeleteDialogComponent {
  message?: IMessage;

  protected messageService = inject(MessageService);
  protected dialogRef = inject(MatDialogRef<MessageDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.messageService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

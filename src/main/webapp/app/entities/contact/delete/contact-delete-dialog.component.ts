import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IContact } from '../contact.model';
import { ContactService } from '../service/contact.service';

@Component({
  templateUrl: './contact-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ContactDeleteDialogComponent {
  contact?: IContact;

  protected contactService = inject(ContactService);
  protected dialogRef = inject(MatDialogRef<ContactDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.contactService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

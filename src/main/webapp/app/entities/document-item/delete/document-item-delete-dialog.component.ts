import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IDocumentItem } from '../document-item.model';
import { DocumentItemService } from '../service/document-item.service';

@Component({
  templateUrl: './document-item-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class DocumentItemDeleteDialogComponent {
  documentItem?: IDocumentItem;

  protected documentItemService = inject(DocumentItemService);
  protected dialogRef = inject(MatDialogRef<DocumentItemDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.documentItemService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.documentItemService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

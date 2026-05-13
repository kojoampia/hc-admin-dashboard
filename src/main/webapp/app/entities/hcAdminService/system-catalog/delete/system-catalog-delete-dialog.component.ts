import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISystemCatalog } from '../system-catalog.model';
import { SystemCatalogService } from '../service/system-catalog.service';

@Component({
  templateUrl: './system-catalog-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SystemCatalogDeleteDialogComponent {
  systemCatalog?: ISystemCatalog;

  protected systemCatalogService = inject(SystemCatalogService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.systemCatalogService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

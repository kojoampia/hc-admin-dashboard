import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFacilityCatalog } from '../facility-catalog.model';
import { FacilityCatalogService } from '../service/facility-catalog.service';

@Component({
  templateUrl: './facility-catalog-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FacilityCatalogDeleteDialogComponent {
  facilityCatalog?: IFacilityCatalog;

  protected facilityCatalogService = inject(FacilityCatalogService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.facilityCatalogService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFacility } from '../facility.model';
import { FacilityService } from '../service/facility.service';

@Component({
  templateUrl: './facility-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FacilityDeleteDialogComponent {
  facility?: IFacility;

  protected facilityService = inject(FacilityService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.facilityService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

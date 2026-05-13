import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IHCService } from '../hc-service.model';
import { HCServiceService } from '../service/hc-service.service';

@Component({
  templateUrl: './hc-service-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class HCServiceDeleteDialogComponent {
  hCService?: IHCService;

  protected hCServiceService = inject(HCServiceService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.hCServiceService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

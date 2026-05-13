import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IHProfessional } from '../h-professional.model';
import { HProfessionalService } from '../service/h-professional.service';

@Component({
  templateUrl: './h-professional-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class HProfessionalDeleteDialogComponent {
  hProfessional?: IHProfessional;

  protected hProfessionalService = inject(HProfessionalService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.hProfessionalService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

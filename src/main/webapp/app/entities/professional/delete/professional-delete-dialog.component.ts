import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IProfessional } from '../professional.model';
import { ProfessionalService } from '../service/professional.service';

@Component({
  templateUrl: './professional-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class ProfessionalDeleteDialogComponent {
  professional?: IProfessional;

  protected professionalService = inject(ProfessionalService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.professionalService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

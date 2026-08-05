import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

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
  protected dialogRef = inject(MatDialogRef<ProfessionalDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.professionalService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

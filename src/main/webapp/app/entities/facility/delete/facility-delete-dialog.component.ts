import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

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
  protected dialogRef = inject(MatDialogRef<FacilityDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.facilityService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

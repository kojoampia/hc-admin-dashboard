import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

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
  protected dialogRef = inject(MatDialogRef<FacilityCatalogDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.facilityCatalogService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

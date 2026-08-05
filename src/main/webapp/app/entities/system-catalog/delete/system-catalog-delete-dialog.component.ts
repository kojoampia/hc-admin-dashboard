import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

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
  protected dialogRef = inject(MatDialogRef<SystemCatalogDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.systemCatalogService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

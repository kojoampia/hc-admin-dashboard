import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IOrganisation } from '../organisation.model';
import { OrganisationService } from '../service/organisation.service';

@Component({
  templateUrl: './organisation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class OrganisationDeleteDialogComponent {
  organisation?: IOrganisation;

  protected organisationService = inject(OrganisationService);
  protected dialogRef = inject(MatDialogRef<OrganisationDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.organisationService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFeature } from '../feature.model';
import { FeatureService } from '../service/feature.service';

@Component({
  templateUrl: './feature-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FeatureDeleteDialogComponent {
  feature?: IFeature;

  protected featureService = inject(FeatureService);
  protected dialogRef = inject(MatDialogRef<FeatureDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.featureService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

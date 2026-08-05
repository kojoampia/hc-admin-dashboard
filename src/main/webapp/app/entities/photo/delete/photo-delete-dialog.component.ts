import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPhoto } from '../photo.model';
import { PhotoService } from '../service/photo.service';

@Component({
  templateUrl: './photo-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PhotoDeleteDialogComponent {
  photo?: IPhoto;

  protected photoService = inject(PhotoService);
  protected dialogRef = inject(MatDialogRef<PhotoDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.photoService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

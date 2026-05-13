import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.photoService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

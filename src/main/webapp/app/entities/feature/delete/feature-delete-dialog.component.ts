import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

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
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.featureService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

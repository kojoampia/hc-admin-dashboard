import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IHCSubscription } from '../hc-subscription.model';
import { HCSubscriptionService } from '../service/hc-subscription.service';

@Component({
  templateUrl: './hc-subscription-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class HCSubscriptionDeleteDialogComponent {
  hCSubscription?: IHCSubscription;

  protected hCSubscriptionService = inject(HCSubscriptionService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.hCSubscriptionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

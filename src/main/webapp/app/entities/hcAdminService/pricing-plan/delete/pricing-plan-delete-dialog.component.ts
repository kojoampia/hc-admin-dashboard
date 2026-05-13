import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPricingPlan } from '../pricing-plan.model';
import { PricingPlanService } from '../service/pricing-plan.service';

@Component({
  templateUrl: './pricing-plan-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PricingPlanDeleteDialogComponent {
  pricingPlan?: IPricingPlan;

  protected pricingPlanService = inject(PricingPlanService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: string): void {
    this.pricingPlanService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}

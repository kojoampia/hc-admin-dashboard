import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

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
  protected dialogRef = inject(MatDialogRef<PricingPlanDeleteDialogComponent>);

  cancel(): void {
    // close() with no result: the caller filters on ITEM_DELETED_EVENT, so an
    // argument-less close reads as a cancel exactly as NgbActiveModal.dismiss() did.
    this.dialogRef.close();
  }

  confirmDelete(id: string): void {
    this.pricingPlanService.delete(id).subscribe(() => {
      this.dialogRef.close(ITEM_DELETED_EVENT);
    });
  }
}

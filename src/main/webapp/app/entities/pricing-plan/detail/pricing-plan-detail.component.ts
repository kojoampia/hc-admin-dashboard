import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IPricingPlan } from '../pricing-plan.model';

@Component({
  selector: 'hpd-pricing-plan-detail',
  templateUrl: './pricing-plan-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class PricingPlanDetailComponent {
  pricingPlan = input<IPricingPlan | null>(null);

  previousState(): void {
    window.history.back();
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BillingType } from 'app/entities/enumerations/billing-type.model';
import { IPricingPlan } from '../pricing-plan.model';
import { PricingPlanService } from '../service/pricing-plan.service';
import { PricingPlanFormGroup, PricingPlanFormService } from './pricing-plan-form.service';

@Component({
  selector: 'hpd-pricing-plan-update',
  templateUrl: './pricing-plan-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PricingPlanUpdateComponent implements OnInit {
  isSaving = false;
  pricingPlan: IPricingPlan | null = null;
  billingTypeValues = Object.keys(BillingType);

  protected pricingPlanService = inject(PricingPlanService);
  protected pricingPlanFormService = inject(PricingPlanFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PricingPlanFormGroup = this.pricingPlanFormService.createPricingPlanFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pricingPlan }) => {
      this.pricingPlan = pricingPlan;
      if (pricingPlan) {
        this.updateForm(pricingPlan);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const pricingPlan = this.pricingPlanFormService.getPricingPlan(this.editForm);
    if (pricingPlan.id !== null) {
      this.subscribeToSaveResponse(this.pricingPlanService.update(pricingPlan));
    } else {
      this.subscribeToSaveResponse(this.pricingPlanService.create(pricingPlan));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPricingPlan>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(pricingPlan: IPricingPlan): void {
    this.pricingPlan = pricingPlan;
    this.pricingPlanFormService.resetForm(this.editForm, pricingPlan);
  }
}

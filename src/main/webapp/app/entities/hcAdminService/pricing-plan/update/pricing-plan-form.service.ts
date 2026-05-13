import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPricingPlan, NewPricingPlan } from '../pricing-plan.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPricingPlan for edit and NewPricingPlanFormGroupInput for create.
 */
type PricingPlanFormGroupInput = IPricingPlan | PartialWithRequiredKeyOf<NewPricingPlan>;

type PricingPlanFormDefaults = Pick<NewPricingPlan, 'id' | 'active'>;

type PricingPlanFormGroupContent = {
  id: FormControl<IPricingPlan['id'] | NewPricingPlan['id']>;
  name: FormControl<IPricingPlan['name']>;
  description: FormControl<IPricingPlan['description']>;
  price: FormControl<IPricingPlan['price']>;
  features: FormControl<IPricingPlan['features']>;
  billingCycle: FormControl<IPricingPlan['billingCycle']>;
  active: FormControl<IPricingPlan['active']>;
};

export type PricingPlanFormGroup = FormGroup<PricingPlanFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PricingPlanFormService {
  createPricingPlanFormGroup(pricingPlan: PricingPlanFormGroupInput = { id: null }): PricingPlanFormGroup {
    const pricingPlanRawValue = {
      ...this.getFormDefaults(),
      ...pricingPlan,
    };
    return new FormGroup<PricingPlanFormGroupContent>({
      id: new FormControl(
        { value: pricingPlanRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(pricingPlanRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(pricingPlanRawValue.description, {
        validators: [Validators.required],
      }),
      price: new FormControl(pricingPlanRawValue.price, {
        validators: [Validators.required],
      }),
      features: new FormControl(pricingPlanRawValue.features, {
        validators: [Validators.required],
      }),
      billingCycle: new FormControl(pricingPlanRawValue.billingCycle, {
        validators: [Validators.required],
      }),
      active: new FormControl(pricingPlanRawValue.active, {
        validators: [Validators.required],
      }),
    });
  }

  getPricingPlan(form: PricingPlanFormGroup): IPricingPlan | NewPricingPlan {
    return form.getRawValue() as IPricingPlan | NewPricingPlan;
  }

  resetForm(form: PricingPlanFormGroup, pricingPlan: PricingPlanFormGroupInput): void {
    const pricingPlanRawValue = { ...this.getFormDefaults(), ...pricingPlan };
    form.reset(
      {
        ...pricingPlanRawValue,
        id: { value: pricingPlanRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PricingPlanFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}

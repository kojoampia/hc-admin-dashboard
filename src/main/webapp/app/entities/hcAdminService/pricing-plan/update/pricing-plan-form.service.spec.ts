import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../pricing-plan.test-samples';

import { PricingPlanFormService } from './pricing-plan-form.service';

describe('PricingPlan Form Service', () => {
  let service: PricingPlanFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PricingPlanFormService);
  });

  describe('Service methods', () => {
    describe('createPricingPlanFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPricingPlanFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            price: expect.any(Object),
            features: expect.any(Object),
            billingCycle: expect.any(Object),
            active: expect.any(Object),
          }),
        );
      });

      it('passing IPricingPlan should create a new form with FormGroup', () => {
        const formGroup = service.createPricingPlanFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            price: expect.any(Object),
            features: expect.any(Object),
            billingCycle: expect.any(Object),
            active: expect.any(Object),
          }),
        );
      });
    });

    describe('getPricingPlan', () => {
      it('should return NewPricingPlan for default PricingPlan initial value', () => {
        const formGroup = service.createPricingPlanFormGroup(sampleWithNewData);

        const pricingPlan = service.getPricingPlan(formGroup) as any;

        expect(pricingPlan).toMatchObject(sampleWithNewData);
      });

      it('should return NewPricingPlan for empty PricingPlan initial value', () => {
        const formGroup = service.createPricingPlanFormGroup();

        const pricingPlan = service.getPricingPlan(formGroup) as any;

        expect(pricingPlan).toMatchObject({});
      });

      it('should return IPricingPlan', () => {
        const formGroup = service.createPricingPlanFormGroup(sampleWithRequiredData);

        const pricingPlan = service.getPricingPlan(formGroup) as any;

        expect(pricingPlan).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPricingPlan should not enable id FormControl', () => {
        const formGroup = service.createPricingPlanFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPricingPlan should disable id FormControl', () => {
        const formGroup = service.createPricingPlanFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

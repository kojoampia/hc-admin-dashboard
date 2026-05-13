import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../hc-subscription.test-samples';

import { HCSubscriptionFormService } from './hc-subscription-form.service';

describe('HCSubscription Form Service', () => {
  let service: HCSubscriptionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HCSubscriptionFormService);
  });

  describe('Service methods', () => {
    describe('createHCSubscriptionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createHCSubscriptionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            serviceId: expect.any(Object),
            patientId: expect.any(Object),
            isActive: expect.any(Object),
            createdDate: expect.any(Object),
            modifiedDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedBy: expect.any(Object),
          }),
        );
      });

      it('passing IHCSubscription should create a new form with FormGroup', () => {
        const formGroup = service.createHCSubscriptionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            serviceId: expect.any(Object),
            patientId: expect.any(Object),
            isActive: expect.any(Object),
            createdDate: expect.any(Object),
            modifiedDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getHCSubscription', () => {
      it('should return NewHCSubscription for default HCSubscription initial value', () => {
        const formGroup = service.createHCSubscriptionFormGroup(sampleWithNewData);

        const hCSubscription = service.getHCSubscription(formGroup) as any;

        expect(hCSubscription).toMatchObject(sampleWithNewData);
      });

      it('should return NewHCSubscription for empty HCSubscription initial value', () => {
        const formGroup = service.createHCSubscriptionFormGroup();

        const hCSubscription = service.getHCSubscription(formGroup) as any;

        expect(hCSubscription).toMatchObject({});
      });

      it('should return IHCSubscription', () => {
        const formGroup = service.createHCSubscriptionFormGroup(sampleWithRequiredData);

        const hCSubscription = service.getHCSubscription(formGroup) as any;

        expect(hCSubscription).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IHCSubscription should not enable id FormControl', () => {
        const formGroup = service.createHCSubscriptionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewHCSubscription should disable id FormControl', () => {
        const formGroup = service.createHCSubscriptionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

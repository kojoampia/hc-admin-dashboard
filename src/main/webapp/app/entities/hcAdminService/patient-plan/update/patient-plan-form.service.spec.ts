import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../patient-plan.test-samples';

import { PatientPlanFormService } from './patient-plan-form.service';

describe('PatientPlan Form Service', () => {
  let service: PatientPlanFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientPlanFormService);
  });

  describe('Service methods', () => {
    describe('createPatientPlanFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPatientPlanFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            planId: expect.any(Object),
            patientId: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            createdDate: expect.any(Object),
            createdBy: expect.any(Object),
          }),
        );
      });

      it('passing IPatientPlan should create a new form with FormGroup', () => {
        const formGroup = service.createPatientPlanFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            planId: expect.any(Object),
            patientId: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            createdDate: expect.any(Object),
            createdBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getPatientPlan', () => {
      it('should return NewPatientPlan for default PatientPlan initial value', () => {
        const formGroup = service.createPatientPlanFormGroup(sampleWithNewData);

        const patientPlan = service.getPatientPlan(formGroup) as any;

        expect(patientPlan).toMatchObject(sampleWithNewData);
      });

      it('should return NewPatientPlan for empty PatientPlan initial value', () => {
        const formGroup = service.createPatientPlanFormGroup();

        const patientPlan = service.getPatientPlan(formGroup) as any;

        expect(patientPlan).toMatchObject({});
      });

      it('should return IPatientPlan', () => {
        const formGroup = service.createPatientPlanFormGroup(sampleWithRequiredData);

        const patientPlan = service.getPatientPlan(formGroup) as any;

        expect(patientPlan).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPatientPlan should not enable id FormControl', () => {
        const formGroup = service.createPatientPlanFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPatientPlan should disable id FormControl', () => {
        const formGroup = service.createPatientPlanFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

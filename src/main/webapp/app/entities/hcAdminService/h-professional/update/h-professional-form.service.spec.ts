import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../h-professional.test-samples';

import { HProfessionalFormService } from './h-professional-form.service';

describe('HProfessional Form Service', () => {
  let service: HProfessionalFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HProfessionalFormService);
  });

  describe('Service methods', () => {
    describe('createHProfessionalFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createHProfessionalFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            organisation: expect.any(Object),
            roster: expect.any(Object),
            createdDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedDate: expect.any(Object),
            modifiedBy: expect.any(Object),
            profile: expect.any(Object),
          }),
        );
      });

      it('passing IHProfessional should create a new form with FormGroup', () => {
        const formGroup = service.createHProfessionalFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            organisation: expect.any(Object),
            roster: expect.any(Object),
            createdDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedDate: expect.any(Object),
            modifiedBy: expect.any(Object),
            profile: expect.any(Object),
          }),
        );
      });
    });

    describe('getHProfessional', () => {
      it('should return NewHProfessional for default HProfessional initial value', () => {
        const formGroup = service.createHProfessionalFormGroup(sampleWithNewData);

        const hProfessional = service.getHProfessional(formGroup) as any;

        expect(hProfessional).toMatchObject(sampleWithNewData);
      });

      it('should return NewHProfessional for empty HProfessional initial value', () => {
        const formGroup = service.createHProfessionalFormGroup();

        const hProfessional = service.getHProfessional(formGroup) as any;

        expect(hProfessional).toMatchObject({});
      });

      it('should return IHProfessional', () => {
        const formGroup = service.createHProfessionalFormGroup(sampleWithRequiredData);

        const hProfessional = service.getHProfessional(formGroup) as any;

        expect(hProfessional).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IHProfessional should not enable id FormControl', () => {
        const formGroup = service.createHProfessionalFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewHProfessional should disable id FormControl', () => {
        const formGroup = service.createHProfessionalFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

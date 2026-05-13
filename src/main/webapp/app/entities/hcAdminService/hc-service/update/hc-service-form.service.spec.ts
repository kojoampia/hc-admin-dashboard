import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../hc-service.test-samples';

import { HCServiceFormService } from './hc-service-form.service';

describe('HCService Form Service', () => {
  let service: HCServiceFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HCServiceFormService);
  });

  describe('Service methods', () => {
    describe('createHCServiceFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createHCServiceFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            serviceItems: expect.any(Object),
            amount: expect.any(Object),
            createdDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedDate: expect.any(Object),
            modifiedBy: expect.any(Object),
          }),
        );
      });

      it('passing IHCService should create a new form with FormGroup', () => {
        const formGroup = service.createHCServiceFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            serviceItems: expect.any(Object),
            amount: expect.any(Object),
            createdDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedDate: expect.any(Object),
            modifiedBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getHCService', () => {
      it('should return NewHCService for default HCService initial value', () => {
        const formGroup = service.createHCServiceFormGroup(sampleWithNewData);

        const hCService = service.getHCService(formGroup) as any;

        expect(hCService).toMatchObject(sampleWithNewData);
      });

      it('should return NewHCService for empty HCService initial value', () => {
        const formGroup = service.createHCServiceFormGroup();

        const hCService = service.getHCService(formGroup) as any;

        expect(hCService).toMatchObject({});
      });

      it('should return IHCService', () => {
        const formGroup = service.createHCServiceFormGroup(sampleWithRequiredData);

        const hCService = service.getHCService(formGroup) as any;

        expect(hCService).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IHCService should not enable id FormControl', () => {
        const formGroup = service.createHCServiceFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewHCService should disable id FormControl', () => {
        const formGroup = service.createHCServiceFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

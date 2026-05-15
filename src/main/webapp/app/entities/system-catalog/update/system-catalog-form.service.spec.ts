import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../system-catalog.test-samples';

import { SystemCatalogFormService } from './system-catalog-form.service';

describe('SystemCatalog Form Service', () => {
  let service: SystemCatalogFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemCatalogFormService);
  });

  describe('Service methods', () => {
    describe('createSystemCatalogFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSystemCatalogFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            type: expect.any(Object),
            content: expect.any(Object),
            createdDate: expect.any(Object),
            modifiedDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedBy: expect.any(Object),
          }),
        );
      });

      it('passing ISystemCatalog should create a new form with FormGroup', () => {
        const formGroup = service.createSystemCatalogFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            type: expect.any(Object),
            content: expect.any(Object),
            createdDate: expect.any(Object),
            modifiedDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getSystemCatalog', () => {
      it('should return NewSystemCatalog for default SystemCatalog initial value', () => {
        const formGroup = service.createSystemCatalogFormGroup(sampleWithNewData);

        const systemCatalog = service.getSystemCatalog(formGroup) as any;

        expect(systemCatalog).toMatchObject(sampleWithNewData);
      });

      it('should return NewSystemCatalog for empty SystemCatalog initial value', () => {
        const formGroup = service.createSystemCatalogFormGroup();

        const systemCatalog = service.getSystemCatalog(formGroup) as any;

        expect(systemCatalog).toMatchObject({});
      });

      it('should return ISystemCatalog', () => {
        const formGroup = service.createSystemCatalogFormGroup(sampleWithRequiredData);

        const systemCatalog = service.getSystemCatalog(formGroup) as any;

        expect(systemCatalog).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISystemCatalog should not enable id FormControl', () => {
        const formGroup = service.createSystemCatalogFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSystemCatalog should disable id FormControl', () => {
        const formGroup = service.createSystemCatalogFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

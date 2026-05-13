import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../facility-catalog.test-samples';

import { FacilityCatalogFormService } from './facility-catalog-form.service';

describe('FacilityCatalog Form Service', () => {
  let service: FacilityCatalogFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacilityCatalogFormService);
  });

  describe('Service methods', () => {
    describe('createFacilityCatalogFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFacilityCatalogFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            facilities: expect.any(Object),
          }),
        );
      });

      it('passing IFacilityCatalog should create a new form with FormGroup', () => {
        const formGroup = service.createFacilityCatalogFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            facilities: expect.any(Object),
          }),
        );
      });
    });

    describe('getFacilityCatalog', () => {
      it('should return NewFacilityCatalog for default FacilityCatalog initial value', () => {
        const formGroup = service.createFacilityCatalogFormGroup(sampleWithNewData);

        const facilityCatalog = service.getFacilityCatalog(formGroup) as any;

        expect(facilityCatalog).toMatchObject(sampleWithNewData);
      });

      it('should return NewFacilityCatalog for empty FacilityCatalog initial value', () => {
        const formGroup = service.createFacilityCatalogFormGroup();

        const facilityCatalog = service.getFacilityCatalog(formGroup) as any;

        expect(facilityCatalog).toMatchObject({});
      });

      it('should return IFacilityCatalog', () => {
        const formGroup = service.createFacilityCatalogFormGroup(sampleWithRequiredData);

        const facilityCatalog = service.getFacilityCatalog(formGroup) as any;

        expect(facilityCatalog).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFacilityCatalog should not enable id FormControl', () => {
        const formGroup = service.createFacilityCatalogFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFacilityCatalog should disable id FormControl', () => {
        const formGroup = service.createFacilityCatalogFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

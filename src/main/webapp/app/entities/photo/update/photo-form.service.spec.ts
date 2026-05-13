import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../photo.test-samples';

import { PhotoFormService } from './photo-form.service';

describe('Photo Form Service', () => {
  let service: PhotoFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhotoFormService);
  });

  describe('Service methods', () => {
    describe('createPhotoFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPhotoFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            description: expect.any(Object),
            altText: expect.any(Object),
            url: expect.any(Object),
            profileId: expect.any(Object),
            photoType: expect.any(Object),
            data: expect.any(Object),
            photoMetadata: expect.any(Object),
            createdBy: expect.any(Object),
            createdDate: expect.any(Object),
            modifiedBy: expect.any(Object),
            modifiedDate: expect.any(Object),
          }),
        );
      });

      it('passing IPhoto should create a new form with FormGroup', () => {
        const formGroup = service.createPhotoFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            description: expect.any(Object),
            altText: expect.any(Object),
            url: expect.any(Object),
            profileId: expect.any(Object),
            photoType: expect.any(Object),
            data: expect.any(Object),
            photoMetadata: expect.any(Object),
            createdBy: expect.any(Object),
            createdDate: expect.any(Object),
            modifiedBy: expect.any(Object),
            modifiedDate: expect.any(Object),
          }),
        );
      });
    });

    describe('getPhoto', () => {
      it('should return NewPhoto for default Photo initial value', () => {
        const formGroup = service.createPhotoFormGroup(sampleWithNewData);

        const photo = service.getPhoto(formGroup) as any;

        expect(photo).toMatchObject(sampleWithNewData);
      });

      it('should return NewPhoto for empty Photo initial value', () => {
        const formGroup = service.createPhotoFormGroup();

        const photo = service.getPhoto(formGroup) as any;

        expect(photo).toMatchObject({});
      });

      it('should return IPhoto', () => {
        const formGroup = service.createPhotoFormGroup(sampleWithRequiredData);

        const photo = service.getPhoto(formGroup) as any;

        expect(photo).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPhoto should not enable id FormControl', () => {
        const formGroup = service.createPhotoFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPhoto should disable id FormControl', () => {
        const formGroup = service.createPhotoFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

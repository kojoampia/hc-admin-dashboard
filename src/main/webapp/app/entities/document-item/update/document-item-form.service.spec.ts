import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../document-item.test-samples';

import { DocumentItemFormService } from './document-item-form.service';

describe('DocumentItem Form Service', () => {
  let service: DocumentItemFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentItemFormService);
  });

  describe('Service methods', () => {
    describe('createDocumentItemFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createDocumentItemFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            documentType: expect.any(Object),
            url: expect.any(Object),
            createdDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedDate: expect.any(Object),
            modifiedBy: expect.any(Object),
          }),
        );
      });

      it('passing IDocumentItem should create a new form with FormGroup', () => {
        const formGroup = service.createDocumentItemFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            documentType: expect.any(Object),
            url: expect.any(Object),
            createdDate: expect.any(Object),
            createdBy: expect.any(Object),
            modifiedDate: expect.any(Object),
            modifiedBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getDocumentItem', () => {
      it('should return NewDocumentItem for default DocumentItem initial value', () => {
        const formGroup = service.createDocumentItemFormGroup(sampleWithNewData);

        const documentItem = service.getDocumentItem(formGroup) as any;

        expect(documentItem).toMatchObject(sampleWithNewData);
      });

      it('should return NewDocumentItem for empty DocumentItem initial value', () => {
        const formGroup = service.createDocumentItemFormGroup();

        const documentItem = service.getDocumentItem(formGroup) as any;

        expect(documentItem).toMatchObject({});
      });

      it('should return IDocumentItem', () => {
        const formGroup = service.createDocumentItemFormGroup(sampleWithRequiredData);

        const documentItem = service.getDocumentItem(formGroup) as any;

        expect(documentItem).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IDocumentItem should not enable id FormControl', () => {
        const formGroup = service.createDocumentItemFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewDocumentItem should disable id FormControl', () => {
        const formGroup = service.createDocumentItemFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});

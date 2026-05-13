import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IDocumentItem } from '../document-item.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../document-item.test-samples';

import { DocumentItemService, RestDocumentItem } from './document-item.service';

const requireRestSample: RestDocumentItem = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.toJSON(),
  modifiedDate: sampleWithRequiredData.modifiedDate?.toJSON(),
};

describe('DocumentItem Service', () => {
  let service: DocumentItemService;
  let httpMock: HttpTestingController;
  let expectedResult: IDocumentItem | IDocumentItem[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(DocumentItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find('ABC').subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a DocumentItem', () => {
      const documentItem = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(documentItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a DocumentItem', () => {
      const documentItem = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(documentItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a DocumentItem', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of DocumentItem', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a DocumentItem', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addDocumentItemToCollectionIfMissing', () => {
      it('should add a DocumentItem to an empty array', () => {
        const documentItem: IDocumentItem = sampleWithRequiredData;
        expectedResult = service.addDocumentItemToCollectionIfMissing([], documentItem);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(documentItem);
      });

      it('should not add a DocumentItem to an array that contains it', () => {
        const documentItem: IDocumentItem = sampleWithRequiredData;
        const documentItemCollection: IDocumentItem[] = [
          {
            ...documentItem,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addDocumentItemToCollectionIfMissing(documentItemCollection, documentItem);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a DocumentItem to an array that doesn't contain it", () => {
        const documentItem: IDocumentItem = sampleWithRequiredData;
        const documentItemCollection: IDocumentItem[] = [sampleWithPartialData];
        expectedResult = service.addDocumentItemToCollectionIfMissing(documentItemCollection, documentItem);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(documentItem);
      });

      it('should add only unique DocumentItem to an array', () => {
        const documentItemArray: IDocumentItem[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const documentItemCollection: IDocumentItem[] = [sampleWithRequiredData];
        expectedResult = service.addDocumentItemToCollectionIfMissing(documentItemCollection, ...documentItemArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const documentItem: IDocumentItem = sampleWithRequiredData;
        const documentItem2: IDocumentItem = sampleWithPartialData;
        expectedResult = service.addDocumentItemToCollectionIfMissing([], documentItem, documentItem2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(documentItem);
        expect(expectedResult).toContain(documentItem2);
      });

      it('should accept null and undefined values', () => {
        const documentItem: IDocumentItem = sampleWithRequiredData;
        expectedResult = service.addDocumentItemToCollectionIfMissing([], null, documentItem, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(documentItem);
      });

      it('should return initial array if no DocumentItem is added', () => {
        const documentItemCollection: IDocumentItem[] = [sampleWithRequiredData];
        expectedResult = service.addDocumentItemToCollectionIfMissing(documentItemCollection, undefined, null);
        expect(expectedResult).toEqual(documentItemCollection);
      });
    });

    describe('compareDocumentItem', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareDocumentItem(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' };
        const entity2 = null;

        const compareResult1 = service.compareDocumentItem(entity1, entity2);
        const compareResult2 = service.compareDocumentItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' };
        const entity2 = { id: 'cfa4c7b0-9f84-4331-adc1-0bdbb322db25' };

        const compareResult1 = service.compareDocumentItem(entity1, entity2);
        const compareResult2 = service.compareDocumentItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' };
        const entity2 = { id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' };

        const compareResult1 = service.compareDocumentItem(entity1, entity2);
        const compareResult2 = service.compareDocumentItem(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

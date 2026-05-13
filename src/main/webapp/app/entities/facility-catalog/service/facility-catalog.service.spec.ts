import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFacilityCatalog } from '../facility-catalog.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../facility-catalog.test-samples';

import { FacilityCatalogService } from './facility-catalog.service';

const requireRestSample: IFacilityCatalog = {
  ...sampleWithRequiredData,
};

describe('FacilityCatalog Service', () => {
  let service: FacilityCatalogService;
  let httpMock: HttpTestingController;
  let expectedResult: IFacilityCatalog | IFacilityCatalog[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FacilityCatalogService);
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

    it('should create a FacilityCatalog', () => {
      const facilityCatalog = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(facilityCatalog).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a FacilityCatalog', () => {
      const facilityCatalog = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(facilityCatalog).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a FacilityCatalog', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of FacilityCatalog', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a FacilityCatalog', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addFacilityCatalogToCollectionIfMissing', () => {
      it('should add a FacilityCatalog to an empty array', () => {
        const facilityCatalog: IFacilityCatalog = sampleWithRequiredData;
        expectedResult = service.addFacilityCatalogToCollectionIfMissing([], facilityCatalog);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(facilityCatalog);
      });

      it('should not add a FacilityCatalog to an array that contains it', () => {
        const facilityCatalog: IFacilityCatalog = sampleWithRequiredData;
        const facilityCatalogCollection: IFacilityCatalog[] = [
          {
            ...facilityCatalog,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFacilityCatalogToCollectionIfMissing(facilityCatalogCollection, facilityCatalog);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a FacilityCatalog to an array that doesn't contain it", () => {
        const facilityCatalog: IFacilityCatalog = sampleWithRequiredData;
        const facilityCatalogCollection: IFacilityCatalog[] = [sampleWithPartialData];
        expectedResult = service.addFacilityCatalogToCollectionIfMissing(facilityCatalogCollection, facilityCatalog);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(facilityCatalog);
      });

      it('should add only unique FacilityCatalog to an array', () => {
        const facilityCatalogArray: IFacilityCatalog[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const facilityCatalogCollection: IFacilityCatalog[] = [sampleWithRequiredData];
        expectedResult = service.addFacilityCatalogToCollectionIfMissing(facilityCatalogCollection, ...facilityCatalogArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const facilityCatalog: IFacilityCatalog = sampleWithRequiredData;
        const facilityCatalog2: IFacilityCatalog = sampleWithPartialData;
        expectedResult = service.addFacilityCatalogToCollectionIfMissing([], facilityCatalog, facilityCatalog2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(facilityCatalog);
        expect(expectedResult).toContain(facilityCatalog2);
      });

      it('should accept null and undefined values', () => {
        const facilityCatalog: IFacilityCatalog = sampleWithRequiredData;
        expectedResult = service.addFacilityCatalogToCollectionIfMissing([], null, facilityCatalog, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(facilityCatalog);
      });

      it('should return initial array if no FacilityCatalog is added', () => {
        const facilityCatalogCollection: IFacilityCatalog[] = [sampleWithRequiredData];
        expectedResult = service.addFacilityCatalogToCollectionIfMissing(facilityCatalogCollection, undefined, null);
        expect(expectedResult).toEqual(facilityCatalogCollection);
      });
    });

    describe('compareFacilityCatalog', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFacilityCatalog(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' };
        const entity2 = null;

        const compareResult1 = service.compareFacilityCatalog(entity1, entity2);
        const compareResult2 = service.compareFacilityCatalog(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' };
        const entity2 = { id: '51ed7100-5aa8-4ba8-89c1-e48d4f11dd69' };

        const compareResult1 = service.compareFacilityCatalog(entity1, entity2);
        const compareResult2 = service.compareFacilityCatalog(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' };
        const entity2 = { id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' };

        const compareResult1 = service.compareFacilityCatalog(entity1, entity2);
        const compareResult2 = service.compareFacilityCatalog(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IHProfessional } from '../h-professional.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../h-professional.test-samples';

import { HProfessionalService, RestHProfessional } from './h-professional.service';

const requireRestSample: RestHProfessional = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.format(DATE_FORMAT),
  modifiedDate: sampleWithRequiredData.modifiedDate?.format(DATE_FORMAT),
};

describe('HProfessional Service', () => {
  let service: HProfessionalService;
  let httpMock: HttpTestingController;
  let expectedResult: IHProfessional | IHProfessional[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(HProfessionalService);
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

    it('should create a HProfessional', () => {
      const hProfessional = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(hProfessional).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a HProfessional', () => {
      const hProfessional = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(hProfessional).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a HProfessional', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of HProfessional', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a HProfessional', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addHProfessionalToCollectionIfMissing', () => {
      it('should add a HProfessional to an empty array', () => {
        const hProfessional: IHProfessional = sampleWithRequiredData;
        expectedResult = service.addHProfessionalToCollectionIfMissing([], hProfessional);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(hProfessional);
      });

      it('should not add a HProfessional to an array that contains it', () => {
        const hProfessional: IHProfessional = sampleWithRequiredData;
        const hProfessionalCollection: IHProfessional[] = [
          {
            ...hProfessional,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addHProfessionalToCollectionIfMissing(hProfessionalCollection, hProfessional);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a HProfessional to an array that doesn't contain it", () => {
        const hProfessional: IHProfessional = sampleWithRequiredData;
        const hProfessionalCollection: IHProfessional[] = [sampleWithPartialData];
        expectedResult = service.addHProfessionalToCollectionIfMissing(hProfessionalCollection, hProfessional);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(hProfessional);
      });

      it('should add only unique HProfessional to an array', () => {
        const hProfessionalArray: IHProfessional[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const hProfessionalCollection: IHProfessional[] = [sampleWithRequiredData];
        expectedResult = service.addHProfessionalToCollectionIfMissing(hProfessionalCollection, ...hProfessionalArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const hProfessional: IHProfessional = sampleWithRequiredData;
        const hProfessional2: IHProfessional = sampleWithPartialData;
        expectedResult = service.addHProfessionalToCollectionIfMissing([], hProfessional, hProfessional2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(hProfessional);
        expect(expectedResult).toContain(hProfessional2);
      });

      it('should accept null and undefined values', () => {
        const hProfessional: IHProfessional = sampleWithRequiredData;
        expectedResult = service.addHProfessionalToCollectionIfMissing([], null, hProfessional, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(hProfessional);
      });

      it('should return initial array if no HProfessional is added', () => {
        const hProfessionalCollection: IHProfessional[] = [sampleWithRequiredData];
        expectedResult = service.addHProfessionalToCollectionIfMissing(hProfessionalCollection, undefined, null);
        expect(expectedResult).toEqual(hProfessionalCollection);
      });
    });

    describe('compareHProfessional', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareHProfessional(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' };
        const entity2 = null;

        const compareResult1 = service.compareHProfessional(entity1, entity2);
        const compareResult2 = service.compareHProfessional(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' };
        const entity2 = { id: 'c2783303-605c-45a5-ba64-85afb1420a85' };

        const compareResult1 = service.compareHProfessional(entity1, entity2);
        const compareResult2 = service.compareHProfessional(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' };
        const entity2 = { id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' };

        const compareResult1 = service.compareHProfessional(entity1, entity2);
        const compareResult2 = service.compareHProfessional(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

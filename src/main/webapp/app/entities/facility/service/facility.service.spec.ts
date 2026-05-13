import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IFacility } from '../facility.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../facility.test-samples';

import { FacilityService, RestFacility } from './facility.service';

const requireRestSample: RestFacility = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.toJSON(),
  modifiedDate: sampleWithRequiredData.modifiedDate?.toJSON(),
};

describe('Facility Service', () => {
  let service: FacilityService;
  let httpMock: HttpTestingController;
  let expectedResult: IFacility | IFacility[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(FacilityService);
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

    it('should create a Facility', () => {
      const facility = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(facility).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Facility', () => {
      const facility = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(facility).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Facility', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Facility', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Facility', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addFacilityToCollectionIfMissing', () => {
      it('should add a Facility to an empty array', () => {
        const facility: IFacility = sampleWithRequiredData;
        expectedResult = service.addFacilityToCollectionIfMissing([], facility);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(facility);
      });

      it('should not add a Facility to an array that contains it', () => {
        const facility: IFacility = sampleWithRequiredData;
        const facilityCollection: IFacility[] = [
          {
            ...facility,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addFacilityToCollectionIfMissing(facilityCollection, facility);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Facility to an array that doesn't contain it", () => {
        const facility: IFacility = sampleWithRequiredData;
        const facilityCollection: IFacility[] = [sampleWithPartialData];
        expectedResult = service.addFacilityToCollectionIfMissing(facilityCollection, facility);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(facility);
      });

      it('should add only unique Facility to an array', () => {
        const facilityArray: IFacility[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const facilityCollection: IFacility[] = [sampleWithRequiredData];
        expectedResult = service.addFacilityToCollectionIfMissing(facilityCollection, ...facilityArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const facility: IFacility = sampleWithRequiredData;
        const facility2: IFacility = sampleWithPartialData;
        expectedResult = service.addFacilityToCollectionIfMissing([], facility, facility2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(facility);
        expect(expectedResult).toContain(facility2);
      });

      it('should accept null and undefined values', () => {
        const facility: IFacility = sampleWithRequiredData;
        expectedResult = service.addFacilityToCollectionIfMissing([], null, facility, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(facility);
      });

      it('should return initial array if no Facility is added', () => {
        const facilityCollection: IFacility[] = [sampleWithRequiredData];
        expectedResult = service.addFacilityToCollectionIfMissing(facilityCollection, undefined, null);
        expect(expectedResult).toEqual(facilityCollection);
      });
    });

    describe('compareFacility', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareFacility(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' };
        const entity2 = null;

        const compareResult1 = service.compareFacility(entity1, entity2);
        const compareResult2 = service.compareFacility(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' };
        const entity2 = { id: '1ea245a1-736d-4dca-9fb2-f9f95402f975' };

        const compareResult1 = service.compareFacility(entity1, entity2);
        const compareResult2 = service.compareFacility(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' };
        const entity2 = { id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' };

        const compareResult1 = service.compareFacility(entity1, entity2);
        const compareResult2 = service.compareFacility(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

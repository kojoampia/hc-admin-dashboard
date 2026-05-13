import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IHCService } from '../hc-service.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../hc-service.test-samples';

import { HCServiceService, RestHCService } from './hc-service.service';

const requireRestSample: RestHCService = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.format(DATE_FORMAT),
  modifiedDate: sampleWithRequiredData.modifiedDate?.format(DATE_FORMAT),
};

describe('HCService Service', () => {
  let service: HCServiceService;
  let httpMock: HttpTestingController;
  let expectedResult: IHCService | IHCService[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(HCServiceService);
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

    it('should create a HCService', () => {
      const hCService = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(hCService).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a HCService', () => {
      const hCService = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(hCService).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a HCService', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of HCService', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a HCService', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addHCServiceToCollectionIfMissing', () => {
      it('should add a HCService to an empty array', () => {
        const hCService: IHCService = sampleWithRequiredData;
        expectedResult = service.addHCServiceToCollectionIfMissing([], hCService);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(hCService);
      });

      it('should not add a HCService to an array that contains it', () => {
        const hCService: IHCService = sampleWithRequiredData;
        const hCServiceCollection: IHCService[] = [
          {
            ...hCService,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addHCServiceToCollectionIfMissing(hCServiceCollection, hCService);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a HCService to an array that doesn't contain it", () => {
        const hCService: IHCService = sampleWithRequiredData;
        const hCServiceCollection: IHCService[] = [sampleWithPartialData];
        expectedResult = service.addHCServiceToCollectionIfMissing(hCServiceCollection, hCService);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(hCService);
      });

      it('should add only unique HCService to an array', () => {
        const hCServiceArray: IHCService[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const hCServiceCollection: IHCService[] = [sampleWithRequiredData];
        expectedResult = service.addHCServiceToCollectionIfMissing(hCServiceCollection, ...hCServiceArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const hCService: IHCService = sampleWithRequiredData;
        const hCService2: IHCService = sampleWithPartialData;
        expectedResult = service.addHCServiceToCollectionIfMissing([], hCService, hCService2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(hCService);
        expect(expectedResult).toContain(hCService2);
      });

      it('should accept null and undefined values', () => {
        const hCService: IHCService = sampleWithRequiredData;
        expectedResult = service.addHCServiceToCollectionIfMissing([], null, hCService, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(hCService);
      });

      it('should return initial array if no HCService is added', () => {
        const hCServiceCollection: IHCService[] = [sampleWithRequiredData];
        expectedResult = service.addHCServiceToCollectionIfMissing(hCServiceCollection, undefined, null);
        expect(expectedResult).toEqual(hCServiceCollection);
      });
    });

    describe('compareHCService', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareHCService(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' };
        const entity2 = null;

        const compareResult1 = service.compareHCService(entity1, entity2);
        const compareResult2 = service.compareHCService(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' };
        const entity2 = { id: 'c1dbacd7-43ff-4138-ac50-0e9450f38c7e' };

        const compareResult1 = service.compareHCService(entity1, entity2);
        const compareResult2 = service.compareHCService(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' };
        const entity2 = { id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' };

        const compareResult1 = service.compareHCService(entity1, entity2);
        const compareResult2 = service.compareHCService(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

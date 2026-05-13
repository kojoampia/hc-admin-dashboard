import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IHCSubscription } from '../hc-subscription.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../hc-subscription.test-samples';

import { HCSubscriptionService, RestHCSubscription } from './hc-subscription.service';

const requireRestSample: RestHCSubscription = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.toJSON(),
  modifiedDate: sampleWithRequiredData.modifiedDate?.toJSON(),
};

describe('HCSubscription Service', () => {
  let service: HCSubscriptionService;
  let httpMock: HttpTestingController;
  let expectedResult: IHCSubscription | IHCSubscription[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(HCSubscriptionService);
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

    it('should create a HCSubscription', () => {
      const hCSubscription = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(hCSubscription).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a HCSubscription', () => {
      const hCSubscription = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(hCSubscription).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a HCSubscription', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of HCSubscription', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a HCSubscription', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addHCSubscriptionToCollectionIfMissing', () => {
      it('should add a HCSubscription to an empty array', () => {
        const hCSubscription: IHCSubscription = sampleWithRequiredData;
        expectedResult = service.addHCSubscriptionToCollectionIfMissing([], hCSubscription);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(hCSubscription);
      });

      it('should not add a HCSubscription to an array that contains it', () => {
        const hCSubscription: IHCSubscription = sampleWithRequiredData;
        const hCSubscriptionCollection: IHCSubscription[] = [
          {
            ...hCSubscription,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addHCSubscriptionToCollectionIfMissing(hCSubscriptionCollection, hCSubscription);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a HCSubscription to an array that doesn't contain it", () => {
        const hCSubscription: IHCSubscription = sampleWithRequiredData;
        const hCSubscriptionCollection: IHCSubscription[] = [sampleWithPartialData];
        expectedResult = service.addHCSubscriptionToCollectionIfMissing(hCSubscriptionCollection, hCSubscription);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(hCSubscription);
      });

      it('should add only unique HCSubscription to an array', () => {
        const hCSubscriptionArray: IHCSubscription[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const hCSubscriptionCollection: IHCSubscription[] = [sampleWithRequiredData];
        expectedResult = service.addHCSubscriptionToCollectionIfMissing(hCSubscriptionCollection, ...hCSubscriptionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const hCSubscription: IHCSubscription = sampleWithRequiredData;
        const hCSubscription2: IHCSubscription = sampleWithPartialData;
        expectedResult = service.addHCSubscriptionToCollectionIfMissing([], hCSubscription, hCSubscription2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(hCSubscription);
        expect(expectedResult).toContain(hCSubscription2);
      });

      it('should accept null and undefined values', () => {
        const hCSubscription: IHCSubscription = sampleWithRequiredData;
        expectedResult = service.addHCSubscriptionToCollectionIfMissing([], null, hCSubscription, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(hCSubscription);
      });

      it('should return initial array if no HCSubscription is added', () => {
        const hCSubscriptionCollection: IHCSubscription[] = [sampleWithRequiredData];
        expectedResult = service.addHCSubscriptionToCollectionIfMissing(hCSubscriptionCollection, undefined, null);
        expect(expectedResult).toEqual(hCSubscriptionCollection);
      });
    });

    describe('compareHCSubscription', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareHCSubscription(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' };
        const entity2 = null;

        const compareResult1 = service.compareHCSubscription(entity1, entity2);
        const compareResult2 = service.compareHCSubscription(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' };
        const entity2 = { id: 'c687ede1-eaaa-49d9-b522-f921052a974e' };

        const compareResult1 = service.compareHCSubscription(entity1, entity2);
        const compareResult2 = service.compareHCSubscription(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' };
        const entity2 = { id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' };

        const compareResult1 = service.compareHCSubscription(entity1, entity2);
        const compareResult2 = service.compareHCSubscription(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPricingPlan } from '../pricing-plan.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../pricing-plan.test-samples';

import { PricingPlanService } from './pricing-plan.service';

const requireRestSample: IPricingPlan = {
  ...sampleWithRequiredData,
};

describe('PricingPlan Service', () => {
  let service: PricingPlanService;
  let httpMock: HttpTestingController;
  let expectedResult: IPricingPlan | IPricingPlan[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PricingPlanService);
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

    it('should create a PricingPlan', () => {
      const pricingPlan = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(pricingPlan).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PricingPlan', () => {
      const pricingPlan = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(pricingPlan).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PricingPlan', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PricingPlan', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PricingPlan', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPricingPlanToCollectionIfMissing', () => {
      it('should add a PricingPlan to an empty array', () => {
        const pricingPlan: IPricingPlan = sampleWithRequiredData;
        expectedResult = service.addPricingPlanToCollectionIfMissing([], pricingPlan);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pricingPlan);
      });

      it('should not add a PricingPlan to an array that contains it', () => {
        const pricingPlan: IPricingPlan = sampleWithRequiredData;
        const pricingPlanCollection: IPricingPlan[] = [
          {
            ...pricingPlan,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPricingPlanToCollectionIfMissing(pricingPlanCollection, pricingPlan);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PricingPlan to an array that doesn't contain it", () => {
        const pricingPlan: IPricingPlan = sampleWithRequiredData;
        const pricingPlanCollection: IPricingPlan[] = [sampleWithPartialData];
        expectedResult = service.addPricingPlanToCollectionIfMissing(pricingPlanCollection, pricingPlan);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pricingPlan);
      });

      it('should add only unique PricingPlan to an array', () => {
        const pricingPlanArray: IPricingPlan[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const pricingPlanCollection: IPricingPlan[] = [sampleWithRequiredData];
        expectedResult = service.addPricingPlanToCollectionIfMissing(pricingPlanCollection, ...pricingPlanArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const pricingPlan: IPricingPlan = sampleWithRequiredData;
        const pricingPlan2: IPricingPlan = sampleWithPartialData;
        expectedResult = service.addPricingPlanToCollectionIfMissing([], pricingPlan, pricingPlan2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pricingPlan);
        expect(expectedResult).toContain(pricingPlan2);
      });

      it('should accept null and undefined values', () => {
        const pricingPlan: IPricingPlan = sampleWithRequiredData;
        expectedResult = service.addPricingPlanToCollectionIfMissing([], null, pricingPlan, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pricingPlan);
      });

      it('should return initial array if no PricingPlan is added', () => {
        const pricingPlanCollection: IPricingPlan[] = [sampleWithRequiredData];
        expectedResult = service.addPricingPlanToCollectionIfMissing(pricingPlanCollection, undefined, null);
        expect(expectedResult).toEqual(pricingPlanCollection);
      });
    });

    describe('comparePricingPlan', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePricingPlan(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' };
        const entity2 = null;

        const compareResult1 = service.comparePricingPlan(entity1, entity2);
        const compareResult2 = service.comparePricingPlan(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' };
        const entity2 = { id: 'bd9e2785-bdb7-49d1-9482-60fc506cb606' };

        const compareResult1 = service.comparePricingPlan(entity1, entity2);
        const compareResult2 = service.comparePricingPlan(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' };
        const entity2 = { id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' };

        const compareResult1 = service.comparePricingPlan(entity1, entity2);
        const compareResult2 = service.comparePricingPlan(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

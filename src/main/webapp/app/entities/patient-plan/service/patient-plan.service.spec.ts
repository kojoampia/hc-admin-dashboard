import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IPatientPlan } from '../patient-plan.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../patient-plan.test-samples';

import { PatientPlanService, RestPatientPlan } from './patient-plan.service';

const requireRestSample: RestPatientPlan = {
  ...sampleWithRequiredData,
  startDate: sampleWithRequiredData.startDate?.format(DATE_FORMAT),
  endDate: sampleWithRequiredData.endDate?.format(DATE_FORMAT),
  createdDate: sampleWithRequiredData.createdDate?.toJSON(),
};

describe('PatientPlan Service', () => {
  let service: PatientPlanService;
  let httpMock: HttpTestingController;
  let expectedResult: IPatientPlan | IPatientPlan[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PatientPlanService);
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

    it('should create a PatientPlan', () => {
      const patientPlan = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(patientPlan).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PatientPlan', () => {
      const patientPlan = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(patientPlan).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PatientPlan', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PatientPlan', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PatientPlan', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPatientPlanToCollectionIfMissing', () => {
      it('should add a PatientPlan to an empty array', () => {
        const patientPlan: IPatientPlan = sampleWithRequiredData;
        expectedResult = service.addPatientPlanToCollectionIfMissing([], patientPlan);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(patientPlan);
      });

      it('should not add a PatientPlan to an array that contains it', () => {
        const patientPlan: IPatientPlan = sampleWithRequiredData;
        const patientPlanCollection: IPatientPlan[] = [
          {
            ...patientPlan,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPatientPlanToCollectionIfMissing(patientPlanCollection, patientPlan);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PatientPlan to an array that doesn't contain it", () => {
        const patientPlan: IPatientPlan = sampleWithRequiredData;
        const patientPlanCollection: IPatientPlan[] = [sampleWithPartialData];
        expectedResult = service.addPatientPlanToCollectionIfMissing(patientPlanCollection, patientPlan);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(patientPlan);
      });

      it('should add only unique PatientPlan to an array', () => {
        const patientPlanArray: IPatientPlan[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const patientPlanCollection: IPatientPlan[] = [sampleWithRequiredData];
        expectedResult = service.addPatientPlanToCollectionIfMissing(patientPlanCollection, ...patientPlanArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const patientPlan: IPatientPlan = sampleWithRequiredData;
        const patientPlan2: IPatientPlan = sampleWithPartialData;
        expectedResult = service.addPatientPlanToCollectionIfMissing([], patientPlan, patientPlan2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(patientPlan);
        expect(expectedResult).toContain(patientPlan2);
      });

      it('should accept null and undefined values', () => {
        const patientPlan: IPatientPlan = sampleWithRequiredData;
        expectedResult = service.addPatientPlanToCollectionIfMissing([], null, patientPlan, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(patientPlan);
      });

      it('should return initial array if no PatientPlan is added', () => {
        const patientPlanCollection: IPatientPlan[] = [sampleWithRequiredData];
        expectedResult = service.addPatientPlanToCollectionIfMissing(patientPlanCollection, undefined, null);
        expect(expectedResult).toEqual(patientPlanCollection);
      });
    });

    describe('comparePatientPlan', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePatientPlan(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' };
        const entity2 = null;

        const compareResult1 = service.comparePatientPlan(entity1, entity2);
        const compareResult2 = service.comparePatientPlan(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' };
        const entity2 = { id: 'dfe5423b-0ca9-4e6d-9f61-964e0ec09bfc' };

        const compareResult1 = service.comparePatientPlan(entity1, entity2);
        const compareResult2 = service.comparePatientPlan(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' };
        const entity2 = { id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' };

        const compareResult1 = service.comparePatientPlan(entity1, entity2);
        const compareResult2 = service.comparePatientPlan(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

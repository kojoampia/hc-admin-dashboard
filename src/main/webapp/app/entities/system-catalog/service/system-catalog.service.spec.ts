import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISystemCatalog } from '../system-catalog.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../system-catalog.test-samples';

import { RestSystemCatalog, SystemCatalogService } from './system-catalog.service';

const requireRestSample: RestSystemCatalog = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.toJSON(),
  modifiedDate: sampleWithRequiredData.modifiedDate?.toJSON(),
};

describe('SystemCatalog Service', () => {
  let service: SystemCatalogService;
  let httpMock: HttpTestingController;
  let expectedResult: ISystemCatalog | ISystemCatalog[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SystemCatalogService);
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

    it('should create a SystemCatalog', () => {
      const systemCatalog = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(systemCatalog).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SystemCatalog', () => {
      const systemCatalog = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(systemCatalog).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SystemCatalog', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SystemCatalog', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SystemCatalog', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSystemCatalogToCollectionIfMissing', () => {
      it('should add a SystemCatalog to an empty array', () => {
        const systemCatalog: ISystemCatalog = sampleWithRequiredData;
        expectedResult = service.addSystemCatalogToCollectionIfMissing([], systemCatalog);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(systemCatalog);
      });

      it('should not add a SystemCatalog to an array that contains it', () => {
        const systemCatalog: ISystemCatalog = sampleWithRequiredData;
        const systemCatalogCollection: ISystemCatalog[] = [
          {
            ...systemCatalog,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSystemCatalogToCollectionIfMissing(systemCatalogCollection, systemCatalog);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SystemCatalog to an array that doesn't contain it", () => {
        const systemCatalog: ISystemCatalog = sampleWithRequiredData;
        const systemCatalogCollection: ISystemCatalog[] = [sampleWithPartialData];
        expectedResult = service.addSystemCatalogToCollectionIfMissing(systemCatalogCollection, systemCatalog);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(systemCatalog);
      });

      it('should add only unique SystemCatalog to an array', () => {
        const systemCatalogArray: ISystemCatalog[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const systemCatalogCollection: ISystemCatalog[] = [sampleWithRequiredData];
        expectedResult = service.addSystemCatalogToCollectionIfMissing(systemCatalogCollection, ...systemCatalogArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const systemCatalog: ISystemCatalog = sampleWithRequiredData;
        const systemCatalog2: ISystemCatalog = sampleWithPartialData;
        expectedResult = service.addSystemCatalogToCollectionIfMissing([], systemCatalog, systemCatalog2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(systemCatalog);
        expect(expectedResult).toContain(systemCatalog2);
      });

      it('should accept null and undefined values', () => {
        const systemCatalog: ISystemCatalog = sampleWithRequiredData;
        expectedResult = service.addSystemCatalogToCollectionIfMissing([], null, systemCatalog, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(systemCatalog);
      });

      it('should return initial array if no SystemCatalog is added', () => {
        const systemCatalogCollection: ISystemCatalog[] = [sampleWithRequiredData];
        expectedResult = service.addSystemCatalogToCollectionIfMissing(systemCatalogCollection, undefined, null);
        expect(expectedResult).toEqual(systemCatalogCollection);
      });
    });

    describe('compareSystemCatalog', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSystemCatalog(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' };
        const entity2 = null;

        const compareResult1 = service.compareSystemCatalog(entity1, entity2);
        const compareResult2 = service.compareSystemCatalog(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' };
        const entity2 = { id: '4f0ce901-1217-4434-9c06-c1476cf6c879' };

        const compareResult1 = service.compareSystemCatalog(entity1, entity2);
        const compareResult2 = service.compareSystemCatalog(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' };
        const entity2 = { id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' };

        const compareResult1 = service.compareSystemCatalog(entity1, entity2);
        const compareResult2 = service.compareSystemCatalog(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

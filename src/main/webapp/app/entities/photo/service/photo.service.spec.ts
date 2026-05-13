import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPhoto } from '../photo.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../photo.test-samples';

import { PhotoService, RestPhoto } from './photo.service';

const requireRestSample: RestPhoto = {
  ...sampleWithRequiredData,
  createdDate: sampleWithRequiredData.createdDate?.toJSON(),
  modifiedDate: sampleWithRequiredData.modifiedDate?.toJSON(),
};

describe('Photo Service', () => {
  let service: PhotoService;
  let httpMock: HttpTestingController;
  let expectedResult: IPhoto | IPhoto[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PhotoService);
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

    it('should create a Photo', () => {
      const photo = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(photo).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Photo', () => {
      const photo = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(photo).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Photo', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Photo', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Photo', () => {
      const expected = true;

      service.delete('ABC').subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPhotoToCollectionIfMissing', () => {
      it('should add a Photo to an empty array', () => {
        const photo: IPhoto = sampleWithRequiredData;
        expectedResult = service.addPhotoToCollectionIfMissing([], photo);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(photo);
      });

      it('should not add a Photo to an array that contains it', () => {
        const photo: IPhoto = sampleWithRequiredData;
        const photoCollection: IPhoto[] = [
          {
            ...photo,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPhotoToCollectionIfMissing(photoCollection, photo);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Photo to an array that doesn't contain it", () => {
        const photo: IPhoto = sampleWithRequiredData;
        const photoCollection: IPhoto[] = [sampleWithPartialData];
        expectedResult = service.addPhotoToCollectionIfMissing(photoCollection, photo);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(photo);
      });

      it('should add only unique Photo to an array', () => {
        const photoArray: IPhoto[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const photoCollection: IPhoto[] = [sampleWithRequiredData];
        expectedResult = service.addPhotoToCollectionIfMissing(photoCollection, ...photoArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const photo: IPhoto = sampleWithRequiredData;
        const photo2: IPhoto = sampleWithPartialData;
        expectedResult = service.addPhotoToCollectionIfMissing([], photo, photo2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(photo);
        expect(expectedResult).toContain(photo2);
      });

      it('should accept null and undefined values', () => {
        const photo: IPhoto = sampleWithRequiredData;
        expectedResult = service.addPhotoToCollectionIfMissing([], null, photo, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(photo);
      });

      it('should return initial array if no Photo is added', () => {
        const photoCollection: IPhoto[] = [sampleWithRequiredData];
        expectedResult = service.addPhotoToCollectionIfMissing(photoCollection, undefined, null);
        expect(expectedResult).toEqual(photoCollection);
      });
    });

    describe('comparePhoto', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePhoto(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: '98245f00-1396-47a3-8ffb-40eeceec323c' };
        const entity2 = null;

        const compareResult1 = service.comparePhoto(entity1, entity2);
        const compareResult2 = service.comparePhoto(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: '98245f00-1396-47a3-8ffb-40eeceec323c' };
        const entity2 = { id: 'f819c1e3-3bc5-4547-9ab3-b04db73c8353' };

        const compareResult1 = service.comparePhoto(entity1, entity2);
        const compareResult2 = service.comparePhoto(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: '98245f00-1396-47a3-8ffb-40eeceec323c' };
        const entity2 = { id: '98245f00-1396-47a3-8ffb-40eeceec323c' };

        const compareResult1 = service.comparePhoto(entity1, entity2);
        const compareResult2 = service.comparePhoto(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});

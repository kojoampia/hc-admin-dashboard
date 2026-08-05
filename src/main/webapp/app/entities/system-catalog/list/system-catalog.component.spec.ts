import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpHeaders, HttpResponse, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { sampleWithRequiredData } from '../system-catalog.test-samples';
import { SystemCatalogService } from '../service/system-catalog.service';

import { SystemCatalogComponent } from './system-catalog.component';
import SpyInstance = jest.SpyInstance;

describe('SystemCatalog Management Component', () => {
  let comp: SystemCatalogComponent;
  let fixture: ComponentFixture<SystemCatalogComponent>;
  let service: SystemCatalogService;
  let routerNavigateSpy: SpyInstance<Promise<boolean>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SystemCatalogComponent],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              defaultSort: 'id,asc',
            }),
            queryParamMap: of(
              jest.requireActual('@angular/router').convertToParamMap({
                page: '1',
                size: '1',
                sort: 'id,desc',
              }),
            ),
            snapshot: {
              queryParams: {},
              queryParamMap: jest.requireActual('@angular/router').convertToParamMap({
                page: '1',
                size: '1',
                sort: 'id,desc',
              }),
            },
          },
        },
      ],
    })
      .overrideTemplate(SystemCatalogComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SystemCatalogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(SystemCatalogService);
    routerNavigateSpy = jest.spyOn(comp.router, 'navigate');

    jest
      .spyOn(service, 'query')
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' }],
            headers: new HttpHeaders({
              link: '<http://localhost/api/foo?page=1&size=20>; rel="next"',
            }),
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: '4f0ce901-1217-4434-9c06-c1476cf6c879' }],
            headers: new HttpHeaders({
              link: '<http://localhost/api/foo?page=0&size=20>; rel="prev",<http://localhost/api/foo?page=2&size=20>; rel="next"',
            }),
          }),
        ),
      );
  });

  it('should call load all on init', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenCalled();
    expect(comp.systemCatalogs()[0]).toEqual(expect.objectContaining({ id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' }));
  });

  describe('trackId', () => {
    it('should forward to systemCatalogService', () => {
      const entity = { id: '86ac903e-8c2c-43de-abec-c0affc2b2de8' };
      jest.spyOn(service, 'getSystemCatalogIdentifier');
      const id = comp.trackId(entity);
      expect(service.getSystemCatalogIdentifier).toHaveBeenCalledWith(entity);
      expect(id).toBe(entity.id);
    });
  });

  it('should calculate the sort attribute for a non-id attribute', () => {
    // WHEN
    comp.navigateToWithComponentValues({ predicate: 'non-existing-column', order: 'asc' });

    // THEN
    expect(routerNavigateSpy).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        queryParams: expect.objectContaining({
          sort: ['non-existing-column,asc'],
        }),
      }),
    );
  });

  it('should calculate the sort attribute for an id', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    expect(service.query).toHaveBeenLastCalledWith(expect.objectContaining({ sort: ['id,desc'] }));
  });

  it('should infinite scroll', () => {
    // GIVEN
    comp.loadNextPage();
    comp.loadNextPage();
    comp.loadNextPage();

    // THEN
    expect(service.query).toHaveBeenCalledTimes(3);
    expect(service.query).toHaveBeenNthCalledWith(2, expect.objectContaining({ page: '1' }));
    expect(service.query).toHaveBeenLastCalledWith(expect.objectContaining({ page: '2' }));
  });

  describe('delete', () => {
    let dialog: MatDialog;
    let deleteModalMock: any;

    beforeEach(() => {
      // afterClosed() is a method on MatDialogRef, not a property as NgbModalRef.closed was.
      const closed = new Subject();
      deleteModalMock = { componentInstance: {}, afterClosed: () => closed, closed };
      dialog = (comp as any).dialog;
      jest.spyOn(dialog, 'open').mockReturnValue(deleteModalMock);
    });

    it('on confirm should call load', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(comp, 'load');

        // WHEN
        comp.delete(sampleWithRequiredData);
        deleteModalMock.closed.next('deleted');
        tick();

        // THEN
        expect(dialog.open).toHaveBeenCalled();
        expect(comp.load).toHaveBeenCalled();
      }),
    ));

    it('on dismiss should call load', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(comp, 'load');

        // WHEN
        comp.delete(sampleWithRequiredData);
        deleteModalMock.closed.next();
        tick();

        // THEN
        expect(dialog.open).toHaveBeenCalled();
        expect(comp.load).not.toHaveBeenCalled();
      }),
    ));
  });
});

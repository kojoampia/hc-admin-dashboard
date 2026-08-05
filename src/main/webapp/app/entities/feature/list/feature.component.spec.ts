import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpHeaders, HttpResponse, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { Subject, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { sampleWithRequiredData } from '../feature.test-samples';
import { FeatureService } from '../service/feature.service';

import { FeatureComponent } from './feature.component';
import SpyInstance = jest.SpyInstance;

describe('Feature Management Component', () => {
  let comp: FeatureComponent;
  let fixture: ComponentFixture<FeatureComponent>;
  let service: FeatureService;
  let routerNavigateSpy: SpyInstance<Promise<boolean>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FeatureComponent],
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
      .overrideTemplate(FeatureComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FeatureComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(FeatureService);
    routerNavigateSpy = jest.spyOn(comp.router, 'navigate');

    jest
      .spyOn(service, 'query')
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: 'c9f6aa8f-47ba-4778-a4a6-6c9fc1697cb7' }],
            headers: new HttpHeaders({
              link: '<http://localhost/api/foo?page=1&size=20>; rel="next"',
            }),
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: 'ba4d0840-41cd-4efd-ad24-9c999bab9ebb' }],
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
    expect(comp.features()[0]).toEqual(expect.objectContaining({ id: 'c9f6aa8f-47ba-4778-a4a6-6c9fc1697cb7' }));
  });

  describe('trackId', () => {
    it('should forward to featureService', () => {
      const entity = { id: 'c9f6aa8f-47ba-4778-a4a6-6c9fc1697cb7' };
      jest.spyOn(service, 'getFeatureIdentifier');
      const id = comp.trackId(entity);
      expect(service.getFeatureIdentifier).toHaveBeenCalledWith(entity);
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


  it('should request a page and a size, not the whole collection', () => {
    // WHEN
    comp.ngOnInit();

    // THEN
    // The endpoint is paginated now. If these ever stop being sent the server falls back to its
    // default page — which looks like a working screen showing only the first 20 rows.
    expect(service.query).toHaveBeenLastCalledWith(expect.objectContaining({ page: 0, size: ITEMS_PER_PAGE }));
  });

  it('should reflect the total count from the response header', () => {
    // GIVEN a response carrying X-Total-Count, which the shared mock above does not set
    // mockReset first: beforeEach queues two mockReturnValueOnce values, and the queue takes
    // precedence over mockReturnValue, so without this the assertion reads the shared mock instead.
    const query = jest.spyOn(service, 'query');
    query.mockReset();
    query.mockReturnValue(of(new HttpResponse({ body: [], headers: new HttpHeaders({ 'X-Total-Count': '123' }) })));

    // WHEN
    comp.ngOnInit();

    // THEN
    // Drives hpd-item-count and the pager's collectionSize. Left unread, both render as if the
    // collection were empty while the table shows rows.
    expect(comp.totalItems).toBe(123);
  });

  it('should load a page', () => {
    // WHEN
    comp.navigateToPage(1);

    // THEN
    expect(routerNavigateSpy).toHaveBeenCalled();
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

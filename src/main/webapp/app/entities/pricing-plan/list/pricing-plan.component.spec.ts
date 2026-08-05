import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpHeaders, HttpResponse, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ITEMS_PER_PAGE } from 'app/config/pagination.constants';
import { Subject, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { sampleWithRequiredData } from '../pricing-plan.test-samples';
import { PricingPlanService } from '../service/pricing-plan.service';

import { PricingPlanComponent } from './pricing-plan.component';
import SpyInstance = jest.SpyInstance;

describe('PricingPlan Management Component', () => {
  let comp: PricingPlanComponent;
  let fixture: ComponentFixture<PricingPlanComponent>;
  let service: PricingPlanService;
  let routerNavigateSpy: SpyInstance<Promise<boolean>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PricingPlanComponent],
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
      .overrideTemplate(PricingPlanComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PricingPlanComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(PricingPlanService);
    routerNavigateSpy = jest.spyOn(comp.router, 'navigate');

    jest
      .spyOn(service, 'query')
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' }],
            headers: new HttpHeaders({
              link: '<http://localhost/api/foo?page=1&size=20>; rel="next"',
            }),
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: 'bd9e2785-bdb7-49d1-9482-60fc506cb606' }],
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
    expect(comp.pricingPlans()[0]).toEqual(expect.objectContaining({ id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' }));
  });

  describe('trackId', () => {
    it('should forward to pricingPlanService', () => {
      const entity = { id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' };
      jest.spyOn(service, 'getPricingPlanIdentifier');
      const id = comp.trackId(entity);
      expect(service.getPricingPlanIdentifier).toHaveBeenCalledWith(entity);
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

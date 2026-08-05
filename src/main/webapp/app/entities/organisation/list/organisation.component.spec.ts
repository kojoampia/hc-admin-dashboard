import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpHeaders, HttpResponse, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Subject, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { sampleWithRequiredData } from '../organisation.test-samples';
import { OrganisationService } from '../service/organisation.service';

import { OrganisationComponent } from './organisation.component';
import SpyInstance = jest.SpyInstance;

describe('Organisation Management Component', () => {
  let comp: OrganisationComponent;
  let fixture: ComponentFixture<OrganisationComponent>;
  let service: OrganisationService;
  let routerNavigateSpy: SpyInstance<Promise<boolean>>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OrganisationComponent],
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
      .overrideTemplate(OrganisationComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(OrganisationComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(OrganisationService);
    routerNavigateSpy = jest.spyOn(comp.router, 'navigate');

    jest
      .spyOn(service, 'query')
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: '03a17a60-2a77-4a3e-80ff-b20de2261aa4' }],
            headers: new HttpHeaders({
              link: '<http://localhost/api/foo?page=1&size=20>; rel="next"',
            }),
          }),
        ),
      )
      .mockReturnValueOnce(
        of(
          new HttpResponse({
            body: [{ id: '1d06732c-bb67-4c26-ab50-d652c9e1f885' }],
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
    expect(comp.organisations()[0]).toEqual(expect.objectContaining({ id: '03a17a60-2a77-4a3e-80ff-b20de2261aa4' }));
  });

  describe('trackId', () => {
    it('should forward to organisationService', () => {
      const entity = { id: '03a17a60-2a77-4a3e-80ff-b20de2261aa4' };
      jest.spyOn(service, 'getOrganisationIdentifier');
      const id = comp.trackId(entity);
      expect(service.getOrganisationIdentifier).toHaveBeenCalledWith(entity);
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

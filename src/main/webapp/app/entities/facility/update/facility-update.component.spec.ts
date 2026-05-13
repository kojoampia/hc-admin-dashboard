import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { FacilityService } from '../service/facility.service';
import { IFacility } from '../facility.model';
import { FacilityFormService } from './facility-form.service';

import { FacilityUpdateComponent } from './facility-update.component';

describe('Facility Management Update Component', () => {
  let comp: FacilityUpdateComponent;
  let fixture: ComponentFixture<FacilityUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let facilityFormService: FacilityFormService;
  let facilityService: FacilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FacilityUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(FacilityUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FacilityUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    facilityFormService = TestBed.inject(FacilityFormService);
    facilityService = TestBed.inject(FacilityService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const facility: IFacility = { id: '1ea245a1-736d-4dca-9fb2-f9f95402f975' };

      activatedRoute.data = of({ facility });
      comp.ngOnInit();

      expect(comp.facility).toEqual(facility);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFacility>>();
      const facility = { id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' };
      jest.spyOn(facilityFormService, 'getFacility').mockReturnValue(facility);
      jest.spyOn(facilityService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ facility });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: facility }));
      saveSubject.complete();

      // THEN
      expect(facilityFormService.getFacility).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(facilityService.update).toHaveBeenCalledWith(expect.objectContaining(facility));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFacility>>();
      const facility = { id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' };
      jest.spyOn(facilityFormService, 'getFacility').mockReturnValue({ id: null });
      jest.spyOn(facilityService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ facility: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: facility }));
      saveSubject.complete();

      // THEN
      expect(facilityFormService.getFacility).toHaveBeenCalled();
      expect(facilityService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFacility>>();
      const facility = { id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' };
      jest.spyOn(facilityService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ facility });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(facilityService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});

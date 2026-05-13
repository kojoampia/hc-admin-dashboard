import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { FacilityCatalogService } from '../service/facility-catalog.service';
import { IFacilityCatalog } from '../facility-catalog.model';
import { FacilityCatalogFormService } from './facility-catalog-form.service';

import { FacilityCatalogUpdateComponent } from './facility-catalog-update.component';

describe('FacilityCatalog Management Update Component', () => {
  let comp: FacilityCatalogUpdateComponent;
  let fixture: ComponentFixture<FacilityCatalogUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let facilityCatalogFormService: FacilityCatalogFormService;
  let facilityCatalogService: FacilityCatalogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FacilityCatalogUpdateComponent],
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
      .overrideTemplate(FacilityCatalogUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(FacilityCatalogUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    facilityCatalogFormService = TestBed.inject(FacilityCatalogFormService);
    facilityCatalogService = TestBed.inject(FacilityCatalogService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const facilityCatalog: IFacilityCatalog = { id: '51ed7100-5aa8-4ba8-89c1-e48d4f11dd69' };

      activatedRoute.data = of({ facilityCatalog });
      comp.ngOnInit();

      expect(comp.facilityCatalog).toEqual(facilityCatalog);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFacilityCatalog>>();
      const facilityCatalog = { id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' };
      jest.spyOn(facilityCatalogFormService, 'getFacilityCatalog').mockReturnValue(facilityCatalog);
      jest.spyOn(facilityCatalogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ facilityCatalog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: facilityCatalog }));
      saveSubject.complete();

      // THEN
      expect(facilityCatalogFormService.getFacilityCatalog).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(facilityCatalogService.update).toHaveBeenCalledWith(expect.objectContaining(facilityCatalog));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFacilityCatalog>>();
      const facilityCatalog = { id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' };
      jest.spyOn(facilityCatalogFormService, 'getFacilityCatalog').mockReturnValue({ id: null });
      jest.spyOn(facilityCatalogService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ facilityCatalog: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: facilityCatalog }));
      saveSubject.complete();

      // THEN
      expect(facilityCatalogFormService.getFacilityCatalog).toHaveBeenCalled();
      expect(facilityCatalogService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IFacilityCatalog>>();
      const facilityCatalog = { id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' };
      jest.spyOn(facilityCatalogService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ facilityCatalog });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(facilityCatalogService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { HProfessionalService } from '../service/h-professional.service';
import { IHProfessional } from '../h-professional.model';
import { HProfessionalFormService } from './h-professional-form.service';

import { HProfessionalUpdateComponent } from './h-professional-update.component';

describe('HProfessional Management Update Component', () => {
  let comp: HProfessionalUpdateComponent;
  let fixture: ComponentFixture<HProfessionalUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let hProfessionalFormService: HProfessionalFormService;
  let hProfessionalService: HProfessionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HProfessionalUpdateComponent],
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
      .overrideTemplate(HProfessionalUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(HProfessionalUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    hProfessionalFormService = TestBed.inject(HProfessionalFormService);
    hProfessionalService = TestBed.inject(HProfessionalService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const hProfessional: IHProfessional = { id: 'c2783303-605c-45a5-ba64-85afb1420a85' };

      activatedRoute.data = of({ hProfessional });
      comp.ngOnInit();

      expect(comp.hProfessional).toEqual(hProfessional);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHProfessional>>();
      const hProfessional = { id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' };
      jest.spyOn(hProfessionalFormService, 'getHProfessional').mockReturnValue(hProfessional);
      jest.spyOn(hProfessionalService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hProfessional });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: hProfessional }));
      saveSubject.complete();

      // THEN
      expect(hProfessionalFormService.getHProfessional).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(hProfessionalService.update).toHaveBeenCalledWith(expect.objectContaining(hProfessional));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHProfessional>>();
      const hProfessional = { id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' };
      jest.spyOn(hProfessionalFormService, 'getHProfessional').mockReturnValue({ id: null });
      jest.spyOn(hProfessionalService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hProfessional: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: hProfessional }));
      saveSubject.complete();

      // THEN
      expect(hProfessionalFormService.getHProfessional).toHaveBeenCalled();
      expect(hProfessionalService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IHProfessional>>();
      const hProfessional = { id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' };
      jest.spyOn(hProfessionalService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ hProfessional });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(hProfessionalService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});

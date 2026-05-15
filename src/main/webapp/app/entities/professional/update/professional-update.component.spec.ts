import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ProfessionalService } from '../service/professional.service';
import { IProfessional } from '../professional.model';
import { ProfessionalFormService } from './professional-form.service';

import { ProfessionalUpdateComponent } from './professional-update.component';

describe('Professional Management Update Component', () => {
  let comp: ProfessionalUpdateComponent;
  let fixture: ComponentFixture<ProfessionalUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let professionalFormService: ProfessionalFormService;
  let professionalService: ProfessionalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProfessionalUpdateComponent],
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
      .overrideTemplate(ProfessionalUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(ProfessionalUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    professionalFormService = TestBed.inject(ProfessionalFormService);
    professionalService = TestBed.inject(ProfessionalService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const professional: IProfessional = { id: '0e955bb7-9639-4125-b816-aa9d995e679e' };

      activatedRoute.data = of({ professional });
      comp.ngOnInit();

      expect(comp.professional).toEqual(professional);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProfessional>>();
      const professional = { id: '2c613901-f64b-4441-b80a-f5fb03b8e466' };
      jest.spyOn(professionalFormService, 'getProfessional').mockReturnValue(professional);
      jest.spyOn(professionalService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ professional });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: professional }));
      saveSubject.complete();

      // THEN
      expect(professionalFormService.getProfessional).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(professionalService.update).toHaveBeenCalledWith(expect.objectContaining(professional));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProfessional>>();
      const professional = { id: '2c613901-f64b-4441-b80a-f5fb03b8e466' };
      jest.spyOn(professionalFormService, 'getProfessional').mockReturnValue({ id: null });
      jest.spyOn(professionalService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ professional: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: professional }));
      saveSubject.complete();

      // THEN
      expect(professionalFormService.getProfessional).toHaveBeenCalled();
      expect(professionalService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProfessional>>();
      const professional = { id: '2c613901-f64b-4441-b80a-f5fb03b8e466' };
      jest.spyOn(professionalService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ professional });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(professionalService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { PatientPlanService } from '../service/patient-plan.service';
import { IPatientPlan } from '../patient-plan.model';
import { PatientPlanFormService } from './patient-plan-form.service';

import { PatientPlanUpdateComponent } from './patient-plan-update.component';

describe('PatientPlan Management Update Component', () => {
  let comp: PatientPlanUpdateComponent;
  let fixture: ComponentFixture<PatientPlanUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let patientPlanFormService: PatientPlanFormService;
  let patientPlanService: PatientPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PatientPlanUpdateComponent],
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
      .overrideTemplate(PatientPlanUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PatientPlanUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    patientPlanFormService = TestBed.inject(PatientPlanFormService);
    patientPlanService = TestBed.inject(PatientPlanService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const patientPlan: IPatientPlan = { id: 'dfe5423b-0ca9-4e6d-9f61-964e0ec09bfc' };

      activatedRoute.data = of({ patientPlan });
      comp.ngOnInit();

      expect(comp.patientPlan).toEqual(patientPlan);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPatientPlan>>();
      const patientPlan = { id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' };
      jest.spyOn(patientPlanFormService, 'getPatientPlan').mockReturnValue(patientPlan);
      jest.spyOn(patientPlanService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ patientPlan });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: patientPlan }));
      saveSubject.complete();

      // THEN
      expect(patientPlanFormService.getPatientPlan).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(patientPlanService.update).toHaveBeenCalledWith(expect.objectContaining(patientPlan));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPatientPlan>>();
      const patientPlan = { id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' };
      jest.spyOn(patientPlanFormService, 'getPatientPlan').mockReturnValue({ id: null });
      jest.spyOn(patientPlanService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ patientPlan: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: patientPlan }));
      saveSubject.complete();

      // THEN
      expect(patientPlanFormService.getPatientPlan).toHaveBeenCalled();
      expect(patientPlanService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPatientPlan>>();
      const patientPlan = { id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' };
      jest.spyOn(patientPlanService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ patientPlan });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(patientPlanService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});

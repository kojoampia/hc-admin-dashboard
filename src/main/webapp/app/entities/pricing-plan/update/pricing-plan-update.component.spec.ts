import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { PricingPlanService } from '../service/pricing-plan.service';
import { IPricingPlan } from '../pricing-plan.model';
import { PricingPlanFormService } from './pricing-plan-form.service';

import { PricingPlanUpdateComponent } from './pricing-plan-update.component';

describe('PricingPlan Management Update Component', () => {
  let comp: PricingPlanUpdateComponent;
  let fixture: ComponentFixture<PricingPlanUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let pricingPlanFormService: PricingPlanFormService;
  let pricingPlanService: PricingPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PricingPlanUpdateComponent],
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
      .overrideTemplate(PricingPlanUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PricingPlanUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    pricingPlanFormService = TestBed.inject(PricingPlanFormService);
    pricingPlanService = TestBed.inject(PricingPlanService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const pricingPlan: IPricingPlan = { id: 'bd9e2785-bdb7-49d1-9482-60fc506cb606' };

      activatedRoute.data = of({ pricingPlan });
      comp.ngOnInit();

      expect(comp.pricingPlan).toEqual(pricingPlan);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPricingPlan>>();
      const pricingPlan = { id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' };
      jest.spyOn(pricingPlanFormService, 'getPricingPlan').mockReturnValue(pricingPlan);
      jest.spyOn(pricingPlanService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pricingPlan });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pricingPlan }));
      saveSubject.complete();

      // THEN
      expect(pricingPlanFormService.getPricingPlan).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(pricingPlanService.update).toHaveBeenCalledWith(expect.objectContaining(pricingPlan));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPricingPlan>>();
      const pricingPlan = { id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' };
      jest.spyOn(pricingPlanFormService, 'getPricingPlan').mockReturnValue({ id: null });
      jest.spyOn(pricingPlanService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pricingPlan: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pricingPlan }));
      saveSubject.complete();

      // THEN
      expect(pricingPlanFormService.getPricingPlan).toHaveBeenCalled();
      expect(pricingPlanService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPricingPlan>>();
      const pricingPlan = { id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' };
      jest.spyOn(pricingPlanService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pricingPlan });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(pricingPlanService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});

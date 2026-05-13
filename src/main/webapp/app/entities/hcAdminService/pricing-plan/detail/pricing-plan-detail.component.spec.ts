import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PricingPlanDetailComponent } from './pricing-plan-detail.component';

describe('PricingPlan Management Detail Component', () => {
  let comp: PricingPlanDetailComponent;
  let fixture: ComponentFixture<PricingPlanDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingPlanDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./pricing-plan-detail.component').then(m => m.PricingPlanDetailComponent),
              resolve: { pricingPlan: () => of({ id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PricingPlanDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingPlanDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load pricingPlan on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PricingPlanDetailComponent);

      // THEN
      expect(instance.pricingPlan()).toEqual(expect.objectContaining({ id: '968b4e5c-cd9b-49a7-aaaa-9939a8db89e5' }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});

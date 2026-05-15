import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PatientPlanDetailComponent } from './patient-plan-detail.component';

describe('PatientPlan Management Detail Component', () => {
  let comp: PatientPlanDetailComponent;
  let fixture: ComponentFixture<PatientPlanDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPlanDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./patient-plan-detail.component').then(m => m.PatientPlanDetailComponent),
              resolve: { patientPlan: () => of({ id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PatientPlanDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPlanDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load patientPlan on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PatientPlanDetailComponent);

      // THEN
      expect(instance.patientPlan()).toEqual(expect.objectContaining({ id: 'd1beaacd-3871-4a3f-9779-f30bdf0a0a0d' }));
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

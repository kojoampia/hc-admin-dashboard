import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { FacilityDetailComponent } from './facility-detail.component';

describe('Facility Management Detail Component', () => {
  let comp: FacilityDetailComponent;
  let fixture: ComponentFixture<FacilityDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./facility-detail.component').then(m => m.FacilityDetailComponent),
              resolve: { facility: () => of({ id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(FacilityDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilityDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load facility on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', FacilityDetailComponent);

      // THEN
      expect(instance.facility()).toEqual(expect.objectContaining({ id: '23553dcf-372e-4ca9-b2ae-9b06856508c2' }));
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

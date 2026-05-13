import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { HCSubscriptionDetailComponent } from './hc-subscription-detail.component';

describe('HCSubscription Management Detail Component', () => {
  let comp: HCSubscriptionDetailComponent;
  let fixture: ComponentFixture<HCSubscriptionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HCSubscriptionDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./hc-subscription-detail.component').then(m => m.HCSubscriptionDetailComponent),
              resolve: { hCSubscription: () => of({ id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(HCSubscriptionDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HCSubscriptionDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load hCSubscription on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', HCSubscriptionDetailComponent);

      // THEN
      expect(instance.hCSubscription()).toEqual(expect.objectContaining({ id: '894d4b92-76f6-42c0-992a-9a68a729bbc3' }));
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

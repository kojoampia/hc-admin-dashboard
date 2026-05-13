import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { HCServiceDetailComponent } from './hc-service-detail.component';

describe('HCService Management Detail Component', () => {
  let comp: HCServiceDetailComponent;
  let fixture: ComponentFixture<HCServiceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HCServiceDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./hc-service-detail.component').then(m => m.HCServiceDetailComponent),
              resolve: { hCService: () => of({ id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(HCServiceDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HCServiceDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load hCService on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', HCServiceDetailComponent);

      // THEN
      expect(instance.hCService()).toEqual(expect.objectContaining({ id: '96b24cc9-2102-4e6a-a290-95b0a57bae7e' }));
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

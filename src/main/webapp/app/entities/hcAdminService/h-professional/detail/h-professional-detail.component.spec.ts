import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { HProfessionalDetailComponent } from './h-professional-detail.component';

describe('HProfessional Management Detail Component', () => {
  let comp: HProfessionalDetailComponent;
  let fixture: ComponentFixture<HProfessionalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HProfessionalDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./h-professional-detail.component').then(m => m.HProfessionalDetailComponent),
              resolve: { hProfessional: () => of({ id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(HProfessionalDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HProfessionalDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load hProfessional on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', HProfessionalDetailComponent);

      // THEN
      expect(instance.hProfessional()).toEqual(expect.objectContaining({ id: '2046943b-f21b-4427-aa40-d2fd2fe4d6a0' }));
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

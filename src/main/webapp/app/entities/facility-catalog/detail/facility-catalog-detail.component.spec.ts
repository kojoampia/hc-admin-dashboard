import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { FacilityCatalogDetailComponent } from './facility-catalog-detail.component';

describe('FacilityCatalog Management Detail Component', () => {
  let comp: FacilityCatalogDetailComponent;
  let fixture: ComponentFixture<FacilityCatalogDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacilityCatalogDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./facility-catalog-detail.component').then(m => m.FacilityCatalogDetailComponent),
              resolve: { facilityCatalog: () => of({ id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(FacilityCatalogDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacilityCatalogDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load facilityCatalog on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', FacilityCatalogDetailComponent);

      // THEN
      expect(instance.facilityCatalog()).toEqual(expect.objectContaining({ id: '1221baaf-a4eb-4d7a-a79f-169820e16ff6' }));
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

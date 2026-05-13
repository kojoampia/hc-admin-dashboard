import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { OrganisationDetailComponent } from './organisation-detail.component';

describe('Organisation Management Detail Component', () => {
  let comp: OrganisationDetailComponent;
  let fixture: ComponentFixture<OrganisationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganisationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./organisation-detail.component').then(m => m.OrganisationDetailComponent),
              resolve: { organisation: () => of({ id: '03a17a60-2a77-4a3e-80ff-b20de2261aa4' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(OrganisationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganisationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load organisation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', OrganisationDetailComponent);

      // THEN
      expect(instance.organisation()).toEqual(expect.objectContaining({ id: '03a17a60-2a77-4a3e-80ff-b20de2261aa4' }));
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

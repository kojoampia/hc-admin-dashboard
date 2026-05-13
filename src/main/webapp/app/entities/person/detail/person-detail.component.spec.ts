import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PersonDetailComponent } from './person-detail.component';

describe('Person Management Detail Component', () => {
  let comp: PersonDetailComponent;
  let fixture: ComponentFixture<PersonDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./person-detail.component').then(m => m.PersonDetailComponent),
              resolve: { person: () => of({ id: '331478ee-6394-49f2-a81d-500d0ff56d2e' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PersonDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load person on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PersonDetailComponent);

      // THEN
      expect(instance.person()).toEqual(expect.objectContaining({ id: '331478ee-6394-49f2-a81d-500d0ff56d2e' }));
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

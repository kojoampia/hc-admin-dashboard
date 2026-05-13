import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { ContactDetailComponent } from './contact-detail.component';

describe('Contact Management Detail Component', () => {
  let comp: ContactDetailComponent;
  let fixture: ComponentFixture<ContactDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./contact-detail.component').then(m => m.ContactDetailComponent),
              resolve: { contact: () => of({ id: '7c40bcce-e148-4825-ba15-5d2a47d54fc5' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(ContactDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load contact on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', ContactDetailComponent);

      // THEN
      expect(instance.contact()).toEqual(expect.objectContaining({ id: '7c40bcce-e148-4825-ba15-5d2a47d54fc5' }));
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

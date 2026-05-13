import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { AddressDetailComponent } from './address-detail.component';

describe('Address Management Detail Component', () => {
  let comp: AddressDetailComponent;
  let fixture: ComponentFixture<AddressDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./address-detail.component').then(m => m.AddressDetailComponent),
              resolve: { address: () => of({ id: '1976e7b1-8233-4a09-bdb3-fbe559c0d8c2' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(AddressDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load address on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', AddressDetailComponent);

      // THEN
      expect(instance.address()).toEqual(expect.objectContaining({ id: '1976e7b1-8233-4a09-bdb3-fbe559c0d8c2' }));
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

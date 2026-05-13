import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { ProfileDetailComponent } from './profile-detail.component';

describe('Profile Management Detail Component', () => {
  let comp: ProfileDetailComponent;
  let fixture: ComponentFixture<ProfileDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./profile-detail.component').then(m => m.ProfileDetailComponent),
              resolve: { profile: () => of({ id: 'f60e8f71-7b26-4f3d-8111-2c32dce7269d' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(ProfileDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load profile on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', ProfileDetailComponent);

      // THEN
      expect(instance.profile()).toEqual(expect.objectContaining({ id: 'f60e8f71-7b26-4f3d-8111-2c32dce7269d' }));
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { DutyRosterDetailComponent } from './duty-roster-detail.component';

describe('DutyRoster Management Detail Component', () => {
  let comp: DutyRosterDetailComponent;
  let fixture: ComponentFixture<DutyRosterDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DutyRosterDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./duty-roster-detail.component').then(m => m.DutyRosterDetailComponent),
              resolve: { dutyRoster: () => of({ id: '401a8b55-3dcb-46fc-bb91-cbfc48b18166' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(DutyRosterDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DutyRosterDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load dutyRoster on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', DutyRosterDetailComponent);

      // THEN
      expect(instance.dutyRoster()).toEqual(expect.objectContaining({ id: '401a8b55-3dcb-46fc-bb91-cbfc48b18166' }));
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

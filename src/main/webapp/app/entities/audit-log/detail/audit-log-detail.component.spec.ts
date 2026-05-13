import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuditLogDetailComponent } from './audit-log-detail.component';

describe('AuditLog Management Detail Component', () => {
  let comp: AuditLogDetailComponent;
  let fixture: ComponentFixture<AuditLogDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./audit-log-detail.component').then(m => m.AuditLogDetailComponent),
              resolve: { auditLog: () => of({ id: 'ccc9ca42-f95c-4b2b-a00d-7c54df66be4c' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(AuditLogDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditLogDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load auditLog on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', AuditLogDetailComponent);

      // THEN
      expect(instance.auditLog()).toEqual(expect.objectContaining({ id: 'ccc9ca42-f95c-4b2b-a00d-7c54df66be4c' }));
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

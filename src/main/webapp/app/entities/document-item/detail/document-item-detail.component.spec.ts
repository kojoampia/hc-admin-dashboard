import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { DocumentItemDetailComponent } from './document-item-detail.component';

describe('DocumentItem Management Detail Component', () => {
  let comp: DocumentItemDetailComponent;
  let fixture: ComponentFixture<DocumentItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentItemDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./document-item-detail.component').then(m => m.DocumentItemDetailComponent),
              resolve: { documentItem: () => of({ id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(DocumentItemDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load documentItem on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', DocumentItemDetailComponent);

      // THEN
      expect(instance.documentItem()).toEqual(expect.objectContaining({ id: 'c9e66bb6-6638-42c5-a4fc-dc0f4f51794f' }));
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

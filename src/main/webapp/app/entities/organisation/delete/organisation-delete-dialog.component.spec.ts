import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

import { OrganisationService } from '../service/organisation.service';

import { OrganisationDeleteDialogComponent } from './organisation-delete-dialog.component';

describe('Organisation Management Delete Component', () => {
  let comp: OrganisationDeleteDialogComponent;
  let fixture: ComponentFixture<OrganisationDeleteDialogComponent>;
  let service: OrganisationService;
  let dialogRef: { close: jest.Mock };

  beforeEach(() => {
    dialogRef = { close: jest.fn() };
    TestBed.configureTestingModule({
      imports: [OrganisationDeleteDialogComponent],
      providers: [provideHttpClient(), { provide: MatDialogRef, useValue: dialogRef }],
    })
      .overrideTemplate(OrganisationDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(OrganisationDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(OrganisationService);
  });

  describe('confirmDelete', () => {
    it('should call delete service on confirmDelete', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(service, 'delete').mockReturnValue(of(new HttpResponse({ body: {} })));

        // WHEN
        comp.confirmDelete('ABC');
        tick();

        // THEN
        expect(service.delete).toHaveBeenCalledWith('ABC');
        expect(dialogRef.close).toHaveBeenCalledWith('deleted');
      }),
    ));

    it('should not call delete service on clear', () => {
      // GIVEN
      jest.spyOn(service, 'delete');

      // WHEN
      comp.cancel();

      // THEN
      expect(service.delete).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalledWith('deleted');
      expect(dialogRef.close).toHaveBeenCalledWith();
    });
  });
});

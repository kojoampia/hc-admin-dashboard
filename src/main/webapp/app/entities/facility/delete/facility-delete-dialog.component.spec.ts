import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

import { FacilityService } from '../service/facility.service';

import { FacilityDeleteDialogComponent } from './facility-delete-dialog.component';

describe('Facility Management Delete Component', () => {
  let comp: FacilityDeleteDialogComponent;
  let fixture: ComponentFixture<FacilityDeleteDialogComponent>;
  let service: FacilityService;
  let dialogRef: { close: jest.Mock };

  beforeEach(() => {
    dialogRef = { close: jest.fn() };
    TestBed.configureTestingModule({
      imports: [FacilityDeleteDialogComponent],
      providers: [provideHttpClient(), { provide: MatDialogRef, useValue: dialogRef }],
    })
      .overrideTemplate(FacilityDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(FacilityDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(FacilityService);
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

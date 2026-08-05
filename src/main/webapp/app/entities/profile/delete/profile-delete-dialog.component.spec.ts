import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

import { ProfileService } from '../service/profile.service';

import { ProfileDeleteDialogComponent } from './profile-delete-dialog.component';

describe('Profile Management Delete Component', () => {
  let comp: ProfileDeleteDialogComponent;
  let fixture: ComponentFixture<ProfileDeleteDialogComponent>;
  let service: ProfileService;
  let dialogRef: { close: jest.Mock };

  beforeEach(() => {
    dialogRef = { close: jest.fn() };
    TestBed.configureTestingModule({
      imports: [ProfileDeleteDialogComponent],
      providers: [provideHttpClient(), { provide: MatDialogRef, useValue: dialogRef }],
    })
      .overrideTemplate(ProfileDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(ProfileDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(ProfileService);
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

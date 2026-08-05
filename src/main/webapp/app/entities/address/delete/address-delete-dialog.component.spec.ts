import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

import { AddressService } from '../service/address.service';

import { AddressDeleteDialogComponent } from './address-delete-dialog.component';

describe('Address Management Delete Component', () => {
  let comp: AddressDeleteDialogComponent;
  let fixture: ComponentFixture<AddressDeleteDialogComponent>;
  let service: AddressService;
  let dialogRef: { close: jest.Mock };

  beforeEach(() => {
    dialogRef = { close: jest.fn() };
    TestBed.configureTestingModule({
      imports: [AddressDeleteDialogComponent],
      providers: [provideHttpClient(), { provide: MatDialogRef, useValue: dialogRef }],
    })
      .overrideTemplate(AddressDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(AddressDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(AddressService);
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

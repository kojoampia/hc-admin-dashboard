import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogRef } from '@angular/material/dialog';

import HealthModalComponent from './health-modal.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('HealthModalComponent', () => {
  let comp: HealthModalComponent;
  let fixture: ComponentFixture<HealthModalComponent>;
  let mockDialogRef: { close: jest.Mock };

  beforeEach(waitForAsync(() => {
    mockDialogRef = { close: jest.fn() };

    TestBed.configureTestingModule({
      imports: [HealthModalComponent],
      providers: [
        // The component injects MatDialogRef, not NgbActiveModal — it moved to Angular Material
        // and this spec was left behind, so every test here failed on a NullInjectorError.
        { provide: MatDialogRef, useFactory: () => mockDialogRef },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    })
      .overrideTemplate(HealthModalComponent, '')
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthModalComponent);
    comp = fixture.componentInstance;

  });

  describe('readableValue', () => {
    it('should return stringify value', () => {
      // GIVEN
      comp.health = undefined;

      // WHEN
      const result = comp.readableValue({ name: 'jhipster' });

      // THEN
      expect(result).toEqual('{"name":"jhipster"}');
    });

    it('should return string value', () => {
      // GIVEN
      comp.health = undefined;

      // WHEN
      const result = comp.readableValue('jhipster');

      // THEN
      expect(result).toEqual('jhipster');
    });

    it('should return storage space in an human readable unit (GB)', () => {
      // GIVEN
      comp.health = {
        key: 'diskSpace',
        value: {
          status: 'UP',
        },
      };

      // WHEN
      const result = comp.readableValue(1073741825);

      // THEN
      expect(result).toEqual('1.00 GB');
    });

    it('should return storage space in an human readable unit (MB)', () => {
      // GIVEN
      comp.health = {
        key: 'diskSpace',
        value: {
          status: 'UP',
        },
      };

      // WHEN
      const result = comp.readableValue(1073741824);

      // THEN
      expect(result).toEqual('1024.00 MB');
    });

    it('should return string value', () => {
      // GIVEN
      comp.health = {
        key: 'mail',
        value: {
          status: 'UP',
        },
      };

      // WHEN
      const result = comp.readableValue(1234);

      // THEN
      expect(result).toEqual('1234');
    });
  });

  describe('dismiss', () => {
    it('should call dismiss when dismiss modal is called', () => {
      // GIVEN
      comp.dismiss();

      // THEN
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });
});

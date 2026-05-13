import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAddress, NewAddress } from '../address.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAddress for edit and NewAddressFormGroupInput for create.
 */
type AddressFormGroupInput = IAddress | PartialWithRequiredKeyOf<NewAddress>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAddress | NewAddress> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type AddressFormRawValue = FormValueOf<IAddress>;

type NewAddressFormRawValue = FormValueOf<NewAddress>;

type AddressFormDefaults = Pick<NewAddress, 'id' | 'createdDate' | 'modifiedDate'>;

type AddressFormGroupContent = {
  id: FormControl<AddressFormRawValue['id'] | NewAddress['id']>;
  street: FormControl<AddressFormRawValue['street']>;
  district: FormControl<AddressFormRawValue['district']>;
  town: FormControl<AddressFormRawValue['town']>;
  city: FormControl<AddressFormRawValue['city']>;
  region: FormControl<AddressFormRawValue['region']>;
  code: FormControl<AddressFormRawValue['code']>;
  country: FormControl<AddressFormRawValue['country']>;
  createdDate: FormControl<AddressFormRawValue['createdDate']>;
  modifiedDate: FormControl<AddressFormRawValue['modifiedDate']>;
};

export type AddressFormGroup = FormGroup<AddressFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AddressFormService {
  createAddressFormGroup(address: AddressFormGroupInput = { id: null }): AddressFormGroup {
    const addressRawValue = this.convertAddressToAddressRawValue({
      ...this.getFormDefaults(),
      ...address,
    });
    return new FormGroup<AddressFormGroupContent>({
      id: new FormControl(
        { value: addressRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      street: new FormControl(addressRawValue.street, {
        validators: [Validators.required],
      }),
      district: new FormControl(addressRawValue.district, {
        validators: [Validators.required],
      }),
      town: new FormControl(addressRawValue.town),
      city: new FormControl(addressRawValue.city, {
        validators: [Validators.required],
      }),
      region: new FormControl(addressRawValue.region, {
        validators: [Validators.required],
      }),
      code: new FormControl(addressRawValue.code, {
        validators: [Validators.required],
      }),
      country: new FormControl(addressRawValue.country, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(addressRawValue.createdDate, {
        validators: [Validators.required],
      }),
      modifiedDate: new FormControl(addressRawValue.modifiedDate, {
        validators: [Validators.required],
      }),
    });
  }

  getAddress(form: AddressFormGroup): IAddress | NewAddress {
    return this.convertAddressRawValueToAddress(form.getRawValue() as AddressFormRawValue | NewAddressFormRawValue);
  }

  resetForm(form: AddressFormGroup, address: AddressFormGroupInput): void {
    const addressRawValue = this.convertAddressToAddressRawValue({ ...this.getFormDefaults(), ...address });
    form.reset(
      {
        ...addressRawValue,
        id: { value: addressRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): AddressFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertAddressRawValueToAddress(rawAddress: AddressFormRawValue | NewAddressFormRawValue): IAddress | NewAddress {
    return {
      ...rawAddress,
      createdDate: dayjs(rawAddress.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawAddress.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertAddressToAddressRawValue(
    address: IAddress | (Partial<NewAddress> & AddressFormDefaults),
  ): AddressFormRawValue | PartialWithRequiredKeyOf<NewAddressFormRawValue> {
    return {
      ...address,
      createdDate: address.createdDate ? address.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: address.modifiedDate ? address.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IFacility, NewFacility } from '../facility.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFacility for edit and NewFacilityFormGroupInput for create.
 */
type FacilityFormGroupInput = IFacility | PartialWithRequiredKeyOf<NewFacility>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IFacility | NewFacility> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type FacilityFormRawValue = FormValueOf<IFacility>;

type NewFacilityFormRawValue = FormValueOf<NewFacility>;

type FacilityFormDefaults = Pick<NewFacility, 'id' | 'createdDate' | 'modifiedDate'>;

type FacilityFormGroupContent = {
  id: FormControl<FacilityFormRawValue['id'] | NewFacility['id']>;
  name: FormControl<FacilityFormRawValue['name']>;
  description: FormControl<FacilityFormRawValue['description']>;
  type: FormControl<FacilityFormRawValue['type']>;
  addressId: FormControl<FacilityFormRawValue['addressId']>;
  contactId: FormControl<FacilityFormRawValue['contactId']>;
  photos: FormControl<FacilityFormRawValue['photos']>;
  createdBy: FormControl<FacilityFormRawValue['createdBy']>;
  createdDate: FormControl<FacilityFormRawValue['createdDate']>;
  modifiedBy: FormControl<FacilityFormRawValue['modifiedBy']>;
  modifiedDate: FormControl<FacilityFormRawValue['modifiedDate']>;
};

export type FacilityFormGroup = FormGroup<FacilityFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FacilityFormService {
  createFacilityFormGroup(facility: FacilityFormGroupInput = { id: null }): FacilityFormGroup {
    const facilityRawValue = this.convertFacilityToFacilityRawValue({
      ...this.getFormDefaults(),
      ...facility,
    });
    return new FormGroup<FacilityFormGroupContent>({
      id: new FormControl(
        { value: facilityRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(facilityRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(facilityRawValue.description, {
        validators: [Validators.required],
      }),
      type: new FormControl(facilityRawValue.type, {
        validators: [Validators.required],
      }),
      addressId: new FormControl(facilityRawValue.addressId, {
        validators: [Validators.required],
      }),
      contactId: new FormControl(facilityRawValue.contactId, {
        validators: [Validators.required],
      }),
      photos: new FormControl(facilityRawValue.photos),
      createdBy: new FormControl(facilityRawValue.createdBy),
      createdDate: new FormControl(facilityRawValue.createdDate, {
        validators: [Validators.required],
      }),
      modifiedBy: new FormControl(facilityRawValue.modifiedBy, {
        validators: [Validators.required],
      }),
      modifiedDate: new FormControl(facilityRawValue.modifiedDate, {
        validators: [Validators.required],
      }),
    });
  }

  getFacility(form: FacilityFormGroup): IFacility | NewFacility {
    return this.convertFacilityRawValueToFacility(form.getRawValue() as FacilityFormRawValue | NewFacilityFormRawValue);
  }

  resetForm(form: FacilityFormGroup, facility: FacilityFormGroupInput): void {
    const facilityRawValue = this.convertFacilityToFacilityRawValue({ ...this.getFormDefaults(), ...facility });
    form.reset(
      {
        ...facilityRawValue,
        id: { value: facilityRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): FacilityFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertFacilityRawValueToFacility(rawFacility: FacilityFormRawValue | NewFacilityFormRawValue): IFacility | NewFacility {
    return {
      ...rawFacility,
      createdDate: dayjs(rawFacility.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawFacility.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertFacilityToFacilityRawValue(
    facility: IFacility | (Partial<NewFacility> & FacilityFormDefaults),
  ): FacilityFormRawValue | PartialWithRequiredKeyOf<NewFacilityFormRawValue> {
    return {
      ...facility,
      createdDate: facility.createdDate ? facility.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: facility.modifiedDate ? facility.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

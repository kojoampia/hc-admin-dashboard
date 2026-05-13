import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IHCSubscription, NewHCSubscription } from '../hc-subscription.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IHCSubscription for edit and NewHCSubscriptionFormGroupInput for create.
 */
type HCSubscriptionFormGroupInput = IHCSubscription | PartialWithRequiredKeyOf<NewHCSubscription>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IHCSubscription | NewHCSubscription> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type HCSubscriptionFormRawValue = FormValueOf<IHCSubscription>;

type NewHCSubscriptionFormRawValue = FormValueOf<NewHCSubscription>;

type HCSubscriptionFormDefaults = Pick<NewHCSubscription, 'id' | 'isActive' | 'createdDate' | 'modifiedDate'>;

type HCSubscriptionFormGroupContent = {
  id: FormControl<HCSubscriptionFormRawValue['id'] | NewHCSubscription['id']>;
  serviceId: FormControl<HCSubscriptionFormRawValue['serviceId']>;
  patientId: FormControl<HCSubscriptionFormRawValue['patientId']>;
  isActive: FormControl<HCSubscriptionFormRawValue['isActive']>;
  createdDate: FormControl<HCSubscriptionFormRawValue['createdDate']>;
  modifiedDate: FormControl<HCSubscriptionFormRawValue['modifiedDate']>;
  createdBy: FormControl<HCSubscriptionFormRawValue['createdBy']>;
  modifiedBy: FormControl<HCSubscriptionFormRawValue['modifiedBy']>;
};

export type HCSubscriptionFormGroup = FormGroup<HCSubscriptionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class HCSubscriptionFormService {
  createHCSubscriptionFormGroup(hCSubscription: HCSubscriptionFormGroupInput = { id: null }): HCSubscriptionFormGroup {
    const hCSubscriptionRawValue = this.convertHCSubscriptionToHCSubscriptionRawValue({
      ...this.getFormDefaults(),
      ...hCSubscription,
    });
    return new FormGroup<HCSubscriptionFormGroupContent>({
      id: new FormControl(
        { value: hCSubscriptionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      serviceId: new FormControl(hCSubscriptionRawValue.serviceId),
      patientId: new FormControl(hCSubscriptionRawValue.patientId),
      isActive: new FormControl(hCSubscriptionRawValue.isActive),
      createdDate: new FormControl(hCSubscriptionRawValue.createdDate),
      modifiedDate: new FormControl(hCSubscriptionRawValue.modifiedDate),
      createdBy: new FormControl(hCSubscriptionRawValue.createdBy),
      modifiedBy: new FormControl(hCSubscriptionRawValue.modifiedBy),
    });
  }

  getHCSubscription(form: HCSubscriptionFormGroup): IHCSubscription | NewHCSubscription {
    return this.convertHCSubscriptionRawValueToHCSubscription(
      form.getRawValue() as HCSubscriptionFormRawValue | NewHCSubscriptionFormRawValue,
    );
  }

  resetForm(form: HCSubscriptionFormGroup, hCSubscription: HCSubscriptionFormGroupInput): void {
    const hCSubscriptionRawValue = this.convertHCSubscriptionToHCSubscriptionRawValue({ ...this.getFormDefaults(), ...hCSubscription });
    form.reset(
      {
        ...hCSubscriptionRawValue,
        id: { value: hCSubscriptionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): HCSubscriptionFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      isActive: false,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertHCSubscriptionRawValueToHCSubscription(
    rawHCSubscription: HCSubscriptionFormRawValue | NewHCSubscriptionFormRawValue,
  ): IHCSubscription | NewHCSubscription {
    return {
      ...rawHCSubscription,
      createdDate: dayjs(rawHCSubscription.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawHCSubscription.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertHCSubscriptionToHCSubscriptionRawValue(
    hCSubscription: IHCSubscription | (Partial<NewHCSubscription> & HCSubscriptionFormDefaults),
  ): HCSubscriptionFormRawValue | PartialWithRequiredKeyOf<NewHCSubscriptionFormRawValue> {
    return {
      ...hCSubscription,
      createdDate: hCSubscription.createdDate ? hCSubscription.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: hCSubscription.modifiedDate ? hCSubscription.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ISystemCatalog, NewSystemCatalog } from '../system-catalog.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISystemCatalog for edit and NewSystemCatalogFormGroupInput for create.
 */
type SystemCatalogFormGroupInput = ISystemCatalog | PartialWithRequiredKeyOf<NewSystemCatalog>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ISystemCatalog | NewSystemCatalog> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type SystemCatalogFormRawValue = FormValueOf<ISystemCatalog>;

type NewSystemCatalogFormRawValue = FormValueOf<NewSystemCatalog>;

type SystemCatalogFormDefaults = Pick<NewSystemCatalog, 'id' | 'createdDate' | 'modifiedDate'>;

type SystemCatalogFormGroupContent = {
  id: FormControl<SystemCatalogFormRawValue['id'] | NewSystemCatalog['id']>;
  name: FormControl<SystemCatalogFormRawValue['name']>;
  description: FormControl<SystemCatalogFormRawValue['description']>;
  type: FormControl<SystemCatalogFormRawValue['type']>;
  content: FormControl<SystemCatalogFormRawValue['content']>;
  createdDate: FormControl<SystemCatalogFormRawValue['createdDate']>;
  modifiedDate: FormControl<SystemCatalogFormRawValue['modifiedDate']>;
  createdBy: FormControl<SystemCatalogFormRawValue['createdBy']>;
  modifiedBy: FormControl<SystemCatalogFormRawValue['modifiedBy']>;
};

export type SystemCatalogFormGroup = FormGroup<SystemCatalogFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SystemCatalogFormService {
  createSystemCatalogFormGroup(systemCatalog: SystemCatalogFormGroupInput = { id: null }): SystemCatalogFormGroup {
    const systemCatalogRawValue = this.convertSystemCatalogToSystemCatalogRawValue({
      ...this.getFormDefaults(),
      ...systemCatalog,
    });
    return new FormGroup<SystemCatalogFormGroupContent>({
      id: new FormControl(
        { value: systemCatalogRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(systemCatalogRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(systemCatalogRawValue.description, {
        validators: [Validators.required],
      }),
      type: new FormControl(systemCatalogRawValue.type, {
        validators: [Validators.required],
      }),
      content: new FormControl(systemCatalogRawValue.content, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(systemCatalogRawValue.createdDate, {
        validators: [Validators.required],
      }),
      modifiedDate: new FormControl(systemCatalogRawValue.modifiedDate, {
        validators: [Validators.required],
      }),
      createdBy: new FormControl(systemCatalogRawValue.createdBy, {
        validators: [Validators.required],
      }),
      modifiedBy: new FormControl(systemCatalogRawValue.modifiedBy, {
        validators: [Validators.required],
      }),
    });
  }

  getSystemCatalog(form: SystemCatalogFormGroup): ISystemCatalog | NewSystemCatalog {
    return this.convertSystemCatalogRawValueToSystemCatalog(form.getRawValue() as SystemCatalogFormRawValue | NewSystemCatalogFormRawValue);
  }

  resetForm(form: SystemCatalogFormGroup, systemCatalog: SystemCatalogFormGroupInput): void {
    const systemCatalogRawValue = this.convertSystemCatalogToSystemCatalogRawValue({ ...this.getFormDefaults(), ...systemCatalog });
    form.reset(
      {
        ...systemCatalogRawValue,
        id: { value: systemCatalogRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SystemCatalogFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertSystemCatalogRawValueToSystemCatalog(
    rawSystemCatalog: SystemCatalogFormRawValue | NewSystemCatalogFormRawValue,
  ): ISystemCatalog | NewSystemCatalog {
    return {
      ...rawSystemCatalog,
      createdDate: dayjs(rawSystemCatalog.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawSystemCatalog.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertSystemCatalogToSystemCatalogRawValue(
    systemCatalog: ISystemCatalog | (Partial<NewSystemCatalog> & SystemCatalogFormDefaults),
  ): SystemCatalogFormRawValue | PartialWithRequiredKeyOf<NewSystemCatalogFormRawValue> {
    return {
      ...systemCatalog,
      createdDate: systemCatalog.createdDate ? systemCatalog.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: systemCatalog.modifiedDate ? systemCatalog.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

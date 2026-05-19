import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';
import { IDutyRoster, NewDutyRoster } from '../duty-roster.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDutyRoster for edit and NewDutyRosterFormGroupInput for create.
 */
type DutyRosterFormGroupInput = IDutyRoster | PartialWithRequiredKeyOf<NewDutyRoster>;

type FormValueOf<T extends IDutyRoster | NewDutyRoster> = Omit<T, 'date'> & {
  date?: string | null;
};

type DutyRosterFormRawValue = FormValueOf<IDutyRoster>;

type NewDutyRosterFormRawValue = FormValueOf<NewDutyRoster>;

type DutyRosterFormDefaults = Pick<NewDutyRoster, 'id'>;

type DutyRosterFormGroupContent = {
  id: FormControl<DutyRosterFormRawValue['id'] | NewDutyRoster['id']>;
  date: FormControl<DutyRosterFormRawValue['date']>;
  duty: FormControl<DutyRosterFormRawValue['duty']>;
  professionalId: FormControl<DutyRosterFormRawValue['professionalId']>;
  shift: FormControl<DutyRosterFormRawValue['shift']>;
  name: FormControl<DutyRosterFormRawValue['name']>;
  description: FormControl<DutyRosterFormRawValue['description']>;
  patientId: FormControl<DutyRosterFormRawValue['patientId']>;
};

export type DutyRosterFormGroup = FormGroup<DutyRosterFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DutyRosterFormService {
  createDutyRosterFormGroup(dutyRoster: DutyRosterFormGroupInput = { id: null }): DutyRosterFormGroup {
    const dutyRosterRawValue = this.convertDutyRosterToDutyRosterRawValue({
      ...this.getFormDefaults(),
      ...dutyRoster,
    });
    return new FormGroup<DutyRosterFormGroupContent>({
      id: new FormControl(
        { value: dutyRosterRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      date: new FormControl(dutyRosterRawValue.date, {
        validators: [Validators.required],
      }),
      duty: new FormControl(dutyRosterRawValue.duty, {
        validators: [Validators.required],
      }),
      professionalId: new FormControl(dutyRosterRawValue.professionalId, {
        validators: [Validators.required],
      }),
      shift: new FormControl(dutyRosterRawValue.shift, {
        validators: [Validators.required],
      }),
      name: new FormControl(dutyRosterRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(dutyRosterRawValue.description),
      patientId: new FormControl(dutyRosterRawValue.patientId, {
        validators: [Validators.required],
      }),
    });
  }

  getDutyRoster(form: DutyRosterFormGroup): IDutyRoster | NewDutyRoster {
    return this.convertDutyRosterRawValueToDutyRoster(form.getRawValue() as DutyRosterFormRawValue | NewDutyRosterFormRawValue);
  }

  resetForm(form: DutyRosterFormGroup, dutyRoster: DutyRosterFormGroupInput): void {
    const dutyRosterRawValue = this.convertDutyRosterToDutyRosterRawValue({ ...this.getFormDefaults(), ...dutyRoster });
    form.reset(
      {
        ...dutyRosterRawValue,
        id: { value: dutyRosterRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): DutyRosterFormDefaults {
    return {
      id: null,
    };
  }

  private convertDutyRosterRawValueToDutyRoster(
    rawDutyRoster: DutyRosterFormRawValue | NewDutyRosterFormRawValue,
  ): IDutyRoster | NewDutyRoster {
    return {
      ...rawDutyRoster,
      date: rawDutyRoster.date ? dayjs(rawDutyRoster.date, DATE_FORMAT) : undefined,
    };
  }

  private convertDutyRosterToDutyRosterRawValue(
    dutyRoster: IDutyRoster | (Partial<NewDutyRoster> & DutyRosterFormDefaults),
  ): DutyRosterFormRawValue | PartialWithRequiredKeyOf<NewDutyRosterFormRawValue> {
    return {
      ...dutyRoster,
      date: dutyRoster.date ? dutyRoster.date.format(DATE_FORMAT) : undefined,
    };
  }
}

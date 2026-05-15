import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPatientPlan, NewPatientPlan } from '../patient-plan.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPatientPlan for edit and NewPatientPlanFormGroupInput for create.
 */
type PatientPlanFormGroupInput = IPatientPlan | PartialWithRequiredKeyOf<NewPatientPlan>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPatientPlan | NewPatientPlan> = Omit<T, 'createdDate'> & {
  createdDate?: string | null;
};

type PatientPlanFormRawValue = FormValueOf<IPatientPlan>;

type NewPatientPlanFormRawValue = FormValueOf<NewPatientPlan>;

type PatientPlanFormDefaults = Pick<NewPatientPlan, 'id' | 'createdDate'>;

type PatientPlanFormGroupContent = {
  id: FormControl<PatientPlanFormRawValue['id'] | NewPatientPlan['id']>;
  planId: FormControl<PatientPlanFormRawValue['planId']>;
  patientId: FormControl<PatientPlanFormRawValue['patientId']>;
  startDate: FormControl<PatientPlanFormRawValue['startDate']>;
  endDate: FormControl<PatientPlanFormRawValue['endDate']>;
  createdDate: FormControl<PatientPlanFormRawValue['createdDate']>;
  createdBy: FormControl<PatientPlanFormRawValue['createdBy']>;
};

export type PatientPlanFormGroup = FormGroup<PatientPlanFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PatientPlanFormService {
  createPatientPlanFormGroup(patientPlan: PatientPlanFormGroupInput = { id: null }): PatientPlanFormGroup {
    const patientPlanRawValue = this.convertPatientPlanToPatientPlanRawValue({
      ...this.getFormDefaults(),
      ...patientPlan,
    });
    return new FormGroup<PatientPlanFormGroupContent>({
      id: new FormControl(
        { value: patientPlanRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      planId: new FormControl(patientPlanRawValue.planId, {
        validators: [Validators.required],
      }),
      patientId: new FormControl(patientPlanRawValue.patientId, {
        validators: [Validators.required],
      }),
      startDate: new FormControl(patientPlanRawValue.startDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(patientPlanRawValue.endDate, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(patientPlanRawValue.createdDate, {
        validators: [Validators.required],
      }),
      createdBy: new FormControl(patientPlanRawValue.createdBy, {
        validators: [Validators.required],
      }),
    });
  }

  getPatientPlan(form: PatientPlanFormGroup): IPatientPlan | NewPatientPlan {
    return this.convertPatientPlanRawValueToPatientPlan(form.getRawValue() as PatientPlanFormRawValue | NewPatientPlanFormRawValue);
  }

  resetForm(form: PatientPlanFormGroup, patientPlan: PatientPlanFormGroupInput): void {
    const patientPlanRawValue = this.convertPatientPlanToPatientPlanRawValue({ ...this.getFormDefaults(), ...patientPlan });
    form.reset(
      {
        ...patientPlanRawValue,
        id: { value: patientPlanRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PatientPlanFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
    };
  }

  private convertPatientPlanRawValueToPatientPlan(
    rawPatientPlan: PatientPlanFormRawValue | NewPatientPlanFormRawValue,
  ): IPatientPlan | NewPatientPlan {
    return {
      ...rawPatientPlan,
      createdDate: dayjs(rawPatientPlan.createdDate, DATE_TIME_FORMAT),
    };
  }

  private convertPatientPlanToPatientPlanRawValue(
    patientPlan: IPatientPlan | (Partial<NewPatientPlan> & PatientPlanFormDefaults),
  ): PatientPlanFormRawValue | PartialWithRequiredKeyOf<NewPatientPlanFormRawValue> {
    return {
      ...patientPlan,
      createdDate: patientPlan.createdDate ? patientPlan.createdDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

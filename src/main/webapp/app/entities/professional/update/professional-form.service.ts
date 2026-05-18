import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IProfessional, NewProfessional } from '../professional.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProfessional for edit and NewProfessionalFormGroupInput for create.
 */
type ProfessionalFormGroupInput = IProfessional | PartialWithRequiredKeyOf<NewProfessional>;

type FormValueOf<T extends IProfessional | NewProfessional> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type ProfessionalFormRawValue = FormValueOf<IProfessional>;

type NewProfessionalFormRawValue = FormValueOf<NewProfessional>;

type ProfessionalFormDefaults = Pick<NewProfessional, 'id' | 'createdDate' | 'modifiedDate'>;

type ProfessionalFormGroupContent = {
  id: FormControl<ProfessionalFormRawValue['id'] | NewProfessional['id']>;
  name: FormControl<ProfessionalFormRawValue['name']>;
  organisation: FormControl<ProfessionalFormRawValue['organisation']>;
  roster: FormControl<ProfessionalFormRawValue['roster']>;
  profile: FormControl<ProfessionalFormRawValue['profile']>;
  createdDate: FormControl<ProfessionalFormRawValue['createdDate']>;
  createdBy: FormControl<ProfessionalFormRawValue['createdBy']>;
  modifiedDate: FormControl<ProfessionalFormRawValue['modifiedDate']>;
  modifiedBy: FormControl<ProfessionalFormRawValue['modifiedBy']>;
};

export type ProfessionalFormGroup = FormGroup<ProfessionalFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProfessionalFormService {
  createProfessionalFormGroup(professional: ProfessionalFormGroupInput = { id: null }): ProfessionalFormGroup {
    const professionalRawValue = this.convertProfessionalToProfessionalRawValue({
      ...this.getFormDefaults(),
      ...professional,
    });
    return new FormGroup<ProfessionalFormGroupContent>({
      id: new FormControl(
        { value: professionalRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(professionalRawValue.name),
      organisation: new FormControl(professionalRawValue.organisation),
      roster: new FormControl(professionalRawValue.roster),
      profile: new FormControl(professionalRawValue.profile),
      createdDate: new FormControl(professionalRawValue.createdDate),
      createdBy: new FormControl(professionalRawValue.createdBy),
      modifiedDate: new FormControl(professionalRawValue.modifiedDate),
      modifiedBy: new FormControl(professionalRawValue.modifiedBy),
    });
  }

  getProfessional(form: ProfessionalFormGroup): IProfessional | NewProfessional {
    return this.convertProfessionalRawValueToProfessional(form.getRawValue() as ProfessionalFormRawValue | NewProfessionalFormRawValue);
  }

  resetForm(form: ProfessionalFormGroup, professional: ProfessionalFormGroupInput): void {
    const professionalRawValue = this.convertProfessionalToProfessionalRawValue({ ...this.getFormDefaults(), ...professional });
    form.reset(
      {
        ...professionalRawValue,
        id: { value: professionalRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ProfessionalFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertProfessionalRawValueToProfessional(
    rawProfessional: ProfessionalFormRawValue | NewProfessionalFormRawValue,
  ): IProfessional | NewProfessional {
    return {
      ...rawProfessional,
      createdDate: dayjs(rawProfessional.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawProfessional.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertProfessionalToProfessionalRawValue(
    professional: IProfessional | (Partial<NewProfessional> & ProfessionalFormDefaults),
  ): ProfessionalFormRawValue | PartialWithRequiredKeyOf<NewProfessionalFormRawValue> {
    return {
      ...professional,
      createdDate: professional.createdDate ? professional.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: professional.modifiedDate ? professional.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

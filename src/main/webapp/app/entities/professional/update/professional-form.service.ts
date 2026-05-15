import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

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

type ProfessionalFormDefaults = Pick<NewProfessional, 'id'>;

type ProfessionalFormGroupContent = {
  id: FormControl<IProfessional['id'] | NewProfessional['id']>;
  name: FormControl<IProfessional['name']>;
  organisation: FormControl<IProfessional['organisation']>;
  roster: FormControl<IProfessional['roster']>;
  profile: FormControl<IProfessional['profile']>;
  createdDate: FormControl<IProfessional['createdDate']>;
  createdBy: FormControl<IProfessional['createdBy']>;
  modifiedDate: FormControl<IProfessional['modifiedDate']>;
  modifiedBy: FormControl<IProfessional['modifiedBy']>;
};

export type ProfessionalFormGroup = FormGroup<ProfessionalFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProfessionalFormService {
  createProfessionalFormGroup(professional: ProfessionalFormGroupInput = { id: null }): ProfessionalFormGroup {
    const professionalRawValue = {
      ...this.getFormDefaults(),
      ...professional,
    };
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
    return form.getRawValue() as IProfessional | NewProfessional;
  }

  resetForm(form: ProfessionalFormGroup, professional: ProfessionalFormGroupInput): void {
    const professionalRawValue = { ...this.getFormDefaults(), ...professional };
    form.reset(
      {
        ...professionalRawValue,
        id: { value: professionalRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ProfessionalFormDefaults {
    return {
      id: null,
    };
  }
}

import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IHProfessional, NewHProfessional } from '../h-professional.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IHProfessional for edit and NewHProfessionalFormGroupInput for create.
 */
type HProfessionalFormGroupInput = IHProfessional | PartialWithRequiredKeyOf<NewHProfessional>;

type HProfessionalFormDefaults = Pick<NewHProfessional, 'id'>;

type HProfessionalFormGroupContent = {
  id: FormControl<IHProfessional['id'] | NewHProfessional['id']>;
  name: FormControl<IHProfessional['name']>;
  organisation: FormControl<IHProfessional['organisation']>;
  roster: FormControl<IHProfessional['roster']>;
  createdDate: FormControl<IHProfessional['createdDate']>;
  createdBy: FormControl<IHProfessional['createdBy']>;
  modifiedDate: FormControl<IHProfessional['modifiedDate']>;
  modifiedBy: FormControl<IHProfessional['modifiedBy']>;
  profile: FormControl<IHProfessional['profile']>;
};

export type HProfessionalFormGroup = FormGroup<HProfessionalFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class HProfessionalFormService {
  createHProfessionalFormGroup(hProfessional: HProfessionalFormGroupInput = { id: null }): HProfessionalFormGroup {
    const hProfessionalRawValue = {
      ...this.getFormDefaults(),
      ...hProfessional,
    };
    return new FormGroup<HProfessionalFormGroupContent>({
      id: new FormControl(
        { value: hProfessionalRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(hProfessionalRawValue.name),
      organisation: new FormControl(hProfessionalRawValue.organisation),
      roster: new FormControl(hProfessionalRawValue.roster),
      createdDate: new FormControl(hProfessionalRawValue.createdDate),
      createdBy: new FormControl(hProfessionalRawValue.createdBy),
      modifiedDate: new FormControl(hProfessionalRawValue.modifiedDate),
      modifiedBy: new FormControl(hProfessionalRawValue.modifiedBy),
      profile: new FormControl(hProfessionalRawValue.profile),
    });
  }

  getHProfessional(form: HProfessionalFormGroup): IHProfessional | NewHProfessional {
    return form.getRawValue() as IHProfessional | NewHProfessional;
  }

  resetForm(form: HProfessionalFormGroup, hProfessional: HProfessionalFormGroupInput): void {
    const hProfessionalRawValue = { ...this.getFormDefaults(), ...hProfessional };
    form.reset(
      {
        ...hProfessionalRawValue,
        id: { value: hProfessionalRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): HProfessionalFormDefaults {
    return {
      id: null,
    };
  }
}

import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IOrganisation, NewOrganisation } from '../organisation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IOrganisation for edit and NewOrganisationFormGroupInput for create.
 */
type OrganisationFormGroupInput = IOrganisation | PartialWithRequiredKeyOf<NewOrganisation>;

type OrganisationFormDefaults = Pick<NewOrganisation, 'id'>;

type OrganisationFormGroupContent = {
  id: FormControl<IOrganisation['id'] | NewOrganisation['id']>;
  name: FormControl<IOrganisation['name']>;
  description: FormControl<IOrganisation['description']>;
  profile: FormControl<IOrganisation['profile']>;
  createdDate: FormControl<IOrganisation['createdDate']>;
  createdBy: FormControl<IOrganisation['createdBy']>;
  modifiedDate: FormControl<IOrganisation['modifiedDate']>;
  modifiedBy: FormControl<IOrganisation['modifiedBy']>;
};

export type OrganisationFormGroup = FormGroup<OrganisationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OrganisationFormService {
  createOrganisationFormGroup(organisation: OrganisationFormGroupInput = { id: null }): OrganisationFormGroup {
    const organisationRawValue = {
      ...this.getFormDefaults(),
      ...organisation,
    };
    return new FormGroup<OrganisationFormGroupContent>({
      id: new FormControl(
        { value: organisationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(organisationRawValue.name),
      description: new FormControl(organisationRawValue.description),
      profile: new FormControl(organisationRawValue.profile),
      createdDate: new FormControl(organisationRawValue.createdDate),
      createdBy: new FormControl(organisationRawValue.createdBy),
      modifiedDate: new FormControl(organisationRawValue.modifiedDate),
      modifiedBy: new FormControl(organisationRawValue.modifiedBy),
    });
  }

  getOrganisation(form: OrganisationFormGroup): IOrganisation | NewOrganisation {
    return form.getRawValue() as IOrganisation | NewOrganisation;
  }

  resetForm(form: OrganisationFormGroup, organisation: OrganisationFormGroupInput): void {
    const organisationRawValue = { ...this.getFormDefaults(), ...organisation };
    form.reset(
      {
        ...organisationRawValue,
        id: { value: organisationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): OrganisationFormDefaults {
    return {
      id: null,
    };
  }
}

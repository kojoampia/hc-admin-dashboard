import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
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

type FormValueOf<T extends IOrganisation | NewOrganisation> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type OrganisationFormRawValue = FormValueOf<IOrganisation>;

type NewOrganisationFormRawValue = FormValueOf<NewOrganisation>;

type OrganisationFormDefaults = Pick<NewOrganisation, 'id' | 'createdDate' | 'modifiedDate'>;

type OrganisationFormGroupContent = {
  id: FormControl<OrganisationFormRawValue['id'] | NewOrganisation['id']>;
  name: FormControl<OrganisationFormRawValue['name']>;
  description: FormControl<OrganisationFormRawValue['description']>;
  profile: FormControl<OrganisationFormRawValue['profile']>;
  createdDate: FormControl<OrganisationFormRawValue['createdDate']>;
  createdBy: FormControl<OrganisationFormRawValue['createdBy']>;
  modifiedDate: FormControl<OrganisationFormRawValue['modifiedDate']>;
  modifiedBy: FormControl<OrganisationFormRawValue['modifiedBy']>;
};

export type OrganisationFormGroup = FormGroup<OrganisationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class OrganisationFormService {
  createOrganisationFormGroup(organisation: OrganisationFormGroupInput = { id: null }): OrganisationFormGroup {
    const organisationRawValue = this.convertOrganisationToOrganisationRawValue({
      ...this.getFormDefaults(),
      ...organisation,
    });
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
    return this.convertOrganisationRawValueToOrganisation(form.getRawValue() as OrganisationFormRawValue | NewOrganisationFormRawValue);
  }

  resetForm(form: OrganisationFormGroup, organisation: OrganisationFormGroupInput): void {
    const organisationRawValue = this.convertOrganisationToOrganisationRawValue({ ...this.getFormDefaults(), ...organisation });
    form.reset(
      {
        ...organisationRawValue,
        id: { value: organisationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): OrganisationFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertOrganisationRawValueToOrganisation(
    rawOrganisation: OrganisationFormRawValue | NewOrganisationFormRawValue,
  ): IOrganisation | NewOrganisation {
    return {
      ...rawOrganisation,
      createdDate: dayjs(rawOrganisation.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawOrganisation.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertOrganisationToOrganisationRawValue(
    organisation: IOrganisation | (Partial<NewOrganisation> & OrganisationFormDefaults),
  ): OrganisationFormRawValue | PartialWithRequiredKeyOf<NewOrganisationFormRawValue> {
    return {
      ...organisation,
      createdDate: organisation.createdDate ? organisation.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: organisation.modifiedDate ? organisation.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IProfile, NewProfile } from '../profile.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProfile for edit and NewProfileFormGroupInput for create.
 */
type ProfileFormGroupInput = IProfile | PartialWithRequiredKeyOf<NewProfile>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IProfile | NewProfile> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type ProfileFormRawValue = FormValueOf<IProfile>;

type NewProfileFormRawValue = FormValueOf<NewProfile>;

type ProfileFormDefaults = Pick<NewProfile, 'id' | 'status' | 'createdDate' | 'modifiedDate'>;

type ProfileFormGroupContent = {
  id: FormControl<ProfileFormRawValue['id'] | NewProfile['id']>;
  personId: FormControl<ProfileFormRawValue['personId']>;
  photoId: FormControl<ProfileFormRawValue['photoId']>;
  contactId: FormControl<ProfileFormRawValue['contactId']>;
  addressList: FormControl<ProfileFormRawValue['addressList']>;
  roles: FormControl<ProfileFormRawValue['roles']>;
  status: FormControl<ProfileFormRawValue['status']>;
  organisationId: FormControl<ProfileFormRawValue['organisationId']>;
  teamId: FormControl<ProfileFormRawValue['teamId']>;
  documentItems: FormControl<ProfileFormRawValue['documentItems']>;
  createdBy: FormControl<ProfileFormRawValue['createdBy']>;
  createdDate: FormControl<ProfileFormRawValue['createdDate']>;
  modifiedBy: FormControl<ProfileFormRawValue['modifiedBy']>;
  modifiedDate: FormControl<ProfileFormRawValue['modifiedDate']>;
};

export type ProfileFormGroup = FormGroup<ProfileFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProfileFormService {
  createProfileFormGroup(profile: ProfileFormGroupInput = { id: null }): ProfileFormGroup {
    const profileRawValue = this.convertProfileToProfileRawValue({
      ...this.getFormDefaults(),
      ...profile,
    });
    return new FormGroup<ProfileFormGroupContent>({
      id: new FormControl(
        { value: profileRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      personId: new FormControl(profileRawValue.personId, {
        validators: [Validators.required],
      }),
      photoId: new FormControl(profileRawValue.photoId, {
        validators: [Validators.required],
      }),
      contactId: new FormControl(profileRawValue.contactId, {
        validators: [Validators.required],
      }),
      addressList: new FormControl(profileRawValue.addressList, {
        validators: [Validators.required],
      }),
      roles: new FormControl(profileRawValue.roles),
      status: new FormControl(profileRawValue.status, {
        validators: [Validators.required],
      }),
      organisationId: new FormControl(profileRawValue.organisationId, {
        validators: [Validators.required],
      }),
      teamId: new FormControl(profileRawValue.teamId, {
        validators: [Validators.required],
      }),
      documentItems: new FormControl(profileRawValue.documentItems, {
        validators: [Validators.required],
      }),
      createdBy: new FormControl(profileRawValue.createdBy, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(profileRawValue.createdDate, {
        validators: [Validators.required],
      }),
      modifiedBy: new FormControl(profileRawValue.modifiedBy, {
        validators: [Validators.required],
      }),
      modifiedDate: new FormControl(profileRawValue.modifiedDate, {
        validators: [Validators.required],
      }),
    });
  }

  getProfile(form: ProfileFormGroup): IProfile | NewProfile {
    return this.convertProfileRawValueToProfile(form.getRawValue() as ProfileFormRawValue | NewProfileFormRawValue);
  }

  resetForm(form: ProfileFormGroup, profile: ProfileFormGroupInput): void {
    const profileRawValue = this.convertProfileToProfileRawValue({ ...this.getFormDefaults(), ...profile });
    form.reset(
      {
        ...profileRawValue,
        id: { value: profileRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): ProfileFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      status: false,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertProfileRawValueToProfile(rawProfile: ProfileFormRawValue | NewProfileFormRawValue): IProfile | NewProfile {
    return {
      ...rawProfile,
      createdDate: dayjs(rawProfile.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawProfile.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertProfileToProfileRawValue(
    profile: IProfile | (Partial<NewProfile> & ProfileFormDefaults),
  ): ProfileFormRawValue | PartialWithRequiredKeyOf<NewProfileFormRawValue> {
    return {
      ...profile,
      createdDate: profile.createdDate ? profile.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: profile.modifiedDate ? profile.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

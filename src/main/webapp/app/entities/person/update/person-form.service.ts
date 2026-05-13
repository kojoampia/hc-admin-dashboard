import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPerson, NewPerson } from '../person.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPerson for edit and NewPersonFormGroupInput for create.
 */
type PersonFormGroupInput = IPerson | PartialWithRequiredKeyOf<NewPerson>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPerson | NewPerson> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type PersonFormRawValue = FormValueOf<IPerson>;

type NewPersonFormRawValue = FormValueOf<NewPerson>;

type PersonFormDefaults = Pick<NewPerson, 'id' | 'createdDate' | 'modifiedDate'>;

type PersonFormGroupContent = {
  id: FormControl<PersonFormRawValue['id'] | NewPerson['id']>;
  firstName: FormControl<PersonFormRawValue['firstName']>;
  middleName: FormControl<PersonFormRawValue['middleName']>;
  lastName: FormControl<PersonFormRawValue['lastName']>;
  birthDate: FormControl<PersonFormRawValue['birthDate']>;
  gender: FormControl<PersonFormRawValue['gender']>;
  maritalStatus: FormControl<PersonFormRawValue['maritalStatus']>;
  nationality: FormControl<PersonFormRawValue['nationality']>;
  language: FormControl<PersonFormRawValue['language']>;
  createdDate: FormControl<PersonFormRawValue['createdDate']>;
  modifiedDate: FormControl<PersonFormRawValue['modifiedDate']>;
  createdBy: FormControl<PersonFormRawValue['createdBy']>;
  modifiedBy: FormControl<PersonFormRawValue['modifiedBy']>;
};

export type PersonFormGroup = FormGroup<PersonFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PersonFormService {
  createPersonFormGroup(person: PersonFormGroupInput = { id: null }): PersonFormGroup {
    const personRawValue = this.convertPersonToPersonRawValue({
      ...this.getFormDefaults(),
      ...person,
    });
    return new FormGroup<PersonFormGroupContent>({
      id: new FormControl(
        { value: personRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      firstName: new FormControl(personRawValue.firstName, {
        validators: [Validators.required],
      }),
      middleName: new FormControl(personRawValue.middleName, {
        validators: [Validators.required],
      }),
      lastName: new FormControl(personRawValue.lastName, {
        validators: [Validators.required],
      }),
      birthDate: new FormControl(personRawValue.birthDate, {
        validators: [Validators.required],
      }),
      gender: new FormControl(personRawValue.gender, {
        validators: [Validators.required],
      }),
      maritalStatus: new FormControl(personRawValue.maritalStatus, {
        validators: [Validators.required],
      }),
      nationality: new FormControl(personRawValue.nationality, {
        validators: [Validators.required],
      }),
      language: new FormControl(personRawValue.language, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(personRawValue.createdDate, {
        validators: [Validators.required],
      }),
      modifiedDate: new FormControl(personRawValue.modifiedDate, {
        validators: [Validators.required],
      }),
      createdBy: new FormControl(personRawValue.createdBy, {
        validators: [Validators.required],
      }),
      modifiedBy: new FormControl(personRawValue.modifiedBy, {
        validators: [Validators.required],
      }),
    });
  }

  getPerson(form: PersonFormGroup): IPerson | NewPerson {
    return this.convertPersonRawValueToPerson(form.getRawValue() as PersonFormRawValue | NewPersonFormRawValue);
  }

  resetForm(form: PersonFormGroup, person: PersonFormGroupInput): void {
    const personRawValue = this.convertPersonToPersonRawValue({ ...this.getFormDefaults(), ...person });
    form.reset(
      {
        ...personRawValue,
        id: { value: personRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PersonFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertPersonRawValueToPerson(rawPerson: PersonFormRawValue | NewPersonFormRawValue): IPerson | NewPerson {
    return {
      ...rawPerson,
      createdDate: dayjs(rawPerson.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawPerson.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertPersonToPersonRawValue(
    person: IPerson | (Partial<NewPerson> & PersonFormDefaults),
  ): PersonFormRawValue | PartialWithRequiredKeyOf<NewPersonFormRawValue> {
    return {
      ...person,
      createdDate: person.createdDate ? person.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: person.modifiedDate ? person.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ITeam, NewTeam } from '../team.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITeam for edit and NewTeamFormGroupInput for create.
 */
type TeamFormGroupInput = ITeam | PartialWithRequiredKeyOf<NewTeam>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ITeam | NewTeam> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type TeamFormRawValue = FormValueOf<ITeam>;

type NewTeamFormRawValue = FormValueOf<NewTeam>;

type TeamFormDefaults = Pick<NewTeam, 'id' | 'createdDate' | 'modifiedDate'>;

type TeamFormGroupContent = {
  id: FormControl<TeamFormRawValue['id'] | NewTeam['id']>;
  name: FormControl<TeamFormRawValue['name']>;
  description: FormControl<TeamFormRawValue['description']>;
  members: FormControl<TeamFormRawValue['members']>;
  supervisorId: FormControl<TeamFormRawValue['supervisorId']>;
  organisationId: FormControl<TeamFormRawValue['organisationId']>;
  createdBy: FormControl<TeamFormRawValue['createdBy']>;
  createdDate: FormControl<TeamFormRawValue['createdDate']>;
  modifiedBy: FormControl<TeamFormRawValue['modifiedBy']>;
  modifiedDate: FormControl<TeamFormRawValue['modifiedDate']>;
};

export type TeamFormGroup = FormGroup<TeamFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TeamFormService {
  createTeamFormGroup(team: TeamFormGroupInput = { id: null }): TeamFormGroup {
    const teamRawValue = this.convertTeamToTeamRawValue({
      ...this.getFormDefaults(),
      ...team,
    });
    return new FormGroup<TeamFormGroupContent>({
      id: new FormControl(
        { value: teamRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(teamRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(teamRawValue.description, {
        validators: [Validators.required],
      }),
      members: new FormControl(teamRawValue.members),
      supervisorId: new FormControl(teamRawValue.supervisorId),
      organisationId: new FormControl(teamRawValue.organisationId),
      createdBy: new FormControl(teamRawValue.createdBy, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(teamRawValue.createdDate, {
        validators: [Validators.required],
      }),
      modifiedBy: new FormControl(teamRawValue.modifiedBy, {
        validators: [Validators.required],
      }),
      modifiedDate: new FormControl(teamRawValue.modifiedDate, {
        validators: [Validators.required],
      }),
    });
  }

  getTeam(form: TeamFormGroup): ITeam | NewTeam {
    return this.convertTeamRawValueToTeam(form.getRawValue() as TeamFormRawValue | NewTeamFormRawValue);
  }

  resetForm(form: TeamFormGroup, team: TeamFormGroupInput): void {
    const teamRawValue = this.convertTeamToTeamRawValue({ ...this.getFormDefaults(), ...team });
    form.reset(
      {
        ...teamRawValue,
        id: { value: teamRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TeamFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertTeamRawValueToTeam(rawTeam: TeamFormRawValue | NewTeamFormRawValue): ITeam | NewTeam {
    return {
      ...rawTeam,
      createdDate: dayjs(rawTeam.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawTeam.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertTeamToTeamRawValue(
    team: ITeam | (Partial<NewTeam> & TeamFormDefaults),
  ): TeamFormRawValue | PartialWithRequiredKeyOf<NewTeamFormRawValue> {
    return {
      ...team,
      createdDate: team.createdDate ? team.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: team.modifiedDate ? team.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

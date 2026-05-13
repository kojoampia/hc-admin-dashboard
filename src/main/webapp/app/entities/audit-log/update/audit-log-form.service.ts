import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IAuditLog, NewAuditLog } from '../audit-log.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IAuditLog for edit and NewAuditLogFormGroupInput for create.
 */
type AuditLogFormGroupInput = IAuditLog | PartialWithRequiredKeyOf<NewAuditLog>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IAuditLog | NewAuditLog> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type AuditLogFormRawValue = FormValueOf<IAuditLog>;

type NewAuditLogFormRawValue = FormValueOf<NewAuditLog>;

type AuditLogFormDefaults = Pick<NewAuditLog, 'id' | 'createdDate' | 'modifiedDate'>;

type AuditLogFormGroupContent = {
  id: FormControl<AuditLogFormRawValue['id'] | NewAuditLog['id']>;
  actionType: FormControl<AuditLogFormRawValue['actionType']>;
  userId: FormControl<AuditLogFormRawValue['userId']>;
  metadata: FormControl<AuditLogFormRawValue['metadata']>;
  createdBy: FormControl<AuditLogFormRawValue['createdBy']>;
  createdDate: FormControl<AuditLogFormRawValue['createdDate']>;
  modifiedBy: FormControl<AuditLogFormRawValue['modifiedBy']>;
  modifiedDate: FormControl<AuditLogFormRawValue['modifiedDate']>;
};

export type AuditLogFormGroup = FormGroup<AuditLogFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class AuditLogFormService {
  createAuditLogFormGroup(auditLog: AuditLogFormGroupInput = { id: null }): AuditLogFormGroup {
    const auditLogRawValue = this.convertAuditLogToAuditLogRawValue({
      ...this.getFormDefaults(),
      ...auditLog,
    });
    return new FormGroup<AuditLogFormGroupContent>({
      id: new FormControl(
        { value: auditLogRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      actionType: new FormControl(auditLogRawValue.actionType, {
        validators: [Validators.required],
      }),
      userId: new FormControl(auditLogRawValue.userId, {
        validators: [Validators.required],
      }),
      metadata: new FormControl(auditLogRawValue.metadata),
      createdBy: new FormControl(auditLogRawValue.createdBy),
      createdDate: new FormControl(auditLogRawValue.createdDate),
      modifiedBy: new FormControl(auditLogRawValue.modifiedBy),
      modifiedDate: new FormControl(auditLogRawValue.modifiedDate),
    });
  }

  getAuditLog(form: AuditLogFormGroup): IAuditLog | NewAuditLog {
    return this.convertAuditLogRawValueToAuditLog(form.getRawValue() as AuditLogFormRawValue | NewAuditLogFormRawValue);
  }

  resetForm(form: AuditLogFormGroup, auditLog: AuditLogFormGroupInput): void {
    const auditLogRawValue = this.convertAuditLogToAuditLogRawValue({ ...this.getFormDefaults(), ...auditLog });
    form.reset(
      {
        ...auditLogRawValue,
        id: { value: auditLogRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): AuditLogFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertAuditLogRawValueToAuditLog(rawAuditLog: AuditLogFormRawValue | NewAuditLogFormRawValue): IAuditLog | NewAuditLog {
    return {
      ...rawAuditLog,
      createdDate: dayjs(rawAuditLog.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawAuditLog.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertAuditLogToAuditLogRawValue(
    auditLog: IAuditLog | (Partial<NewAuditLog> & AuditLogFormDefaults),
  ): AuditLogFormRawValue | PartialWithRequiredKeyOf<NewAuditLogFormRawValue> {
    return {
      ...auditLog,
      createdDate: auditLog.createdDate ? auditLog.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: auditLog.modifiedDate ? auditLog.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

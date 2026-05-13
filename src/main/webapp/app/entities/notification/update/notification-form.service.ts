import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { INotification, NewNotification } from '../notification.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts INotification for edit and NewNotificationFormGroupInput for create.
 */
type NotificationFormGroupInput = INotification | PartialWithRequiredKeyOf<NewNotification>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends INotification | NewNotification> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type NotificationFormRawValue = FormValueOf<INotification>;

type NewNotificationFormRawValue = FormValueOf<NewNotification>;

type NotificationFormDefaults = Pick<NewNotification, 'id' | 'createdDate' | 'modifiedDate'>;

type NotificationFormGroupContent = {
  id: FormControl<NotificationFormRawValue['id'] | NewNotification['id']>;
  content: FormControl<NotificationFormRawValue['content']>;
  recipientId: FormControl<NotificationFormRawValue['recipientId']>;
  senderId: FormControl<NotificationFormRawValue['senderId']>;
  messageType: FormControl<NotificationFormRawValue['messageType']>;
  createdDate: FormControl<NotificationFormRawValue['createdDate']>;
  modifiedDate: FormControl<NotificationFormRawValue['modifiedDate']>;
};

export type NotificationFormGroup = FormGroup<NotificationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class NotificationFormService {
  createNotificationFormGroup(notification: NotificationFormGroupInput = { id: null }): NotificationFormGroup {
    const notificationRawValue = this.convertNotificationToNotificationRawValue({
      ...this.getFormDefaults(),
      ...notification,
    });
    return new FormGroup<NotificationFormGroupContent>({
      id: new FormControl(
        { value: notificationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      content: new FormControl(notificationRawValue.content, {
        validators: [Validators.required],
      }),
      recipientId: new FormControl(notificationRawValue.recipientId, {
        validators: [Validators.required],
      }),
      senderId: new FormControl(notificationRawValue.senderId, {
        validators: [Validators.required],
      }),
      messageType: new FormControl(notificationRawValue.messageType, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(notificationRawValue.createdDate),
      modifiedDate: new FormControl(notificationRawValue.modifiedDate),
    });
  }

  getNotification(form: NotificationFormGroup): INotification | NewNotification {
    return this.convertNotificationRawValueToNotification(form.getRawValue() as NotificationFormRawValue | NewNotificationFormRawValue);
  }

  resetForm(form: NotificationFormGroup, notification: NotificationFormGroupInput): void {
    const notificationRawValue = this.convertNotificationToNotificationRawValue({ ...this.getFormDefaults(), ...notification });
    form.reset(
      {
        ...notificationRawValue,
        id: { value: notificationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): NotificationFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertNotificationRawValueToNotification(
    rawNotification: NotificationFormRawValue | NewNotificationFormRawValue,
  ): INotification | NewNotification {
    return {
      ...rawNotification,
      createdDate: dayjs(rawNotification.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawNotification.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertNotificationToNotificationRawValue(
    notification: INotification | (Partial<NewNotification> & NotificationFormDefaults),
  ): NotificationFormRawValue | PartialWithRequiredKeyOf<NewNotificationFormRawValue> {
    return {
      ...notification,
      createdDate: notification.createdDate ? notification.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: notification.modifiedDate ? notification.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

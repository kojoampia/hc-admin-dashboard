import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPhoto, NewPhoto } from '../photo.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPhoto for edit and NewPhotoFormGroupInput for create.
 */
type PhotoFormGroupInput = IPhoto | PartialWithRequiredKeyOf<NewPhoto>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPhoto | NewPhoto> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type PhotoFormRawValue = FormValueOf<IPhoto>;

type NewPhotoFormRawValue = FormValueOf<NewPhoto>;

type PhotoFormDefaults = Pick<NewPhoto, 'id' | 'createdDate' | 'modifiedDate'>;

type PhotoFormGroupContent = {
  id: FormControl<PhotoFormRawValue['id'] | NewPhoto['id']>;
  description: FormControl<PhotoFormRawValue['description']>;
  altText: FormControl<PhotoFormRawValue['altText']>;
  url: FormControl<PhotoFormRawValue['url']>;
  profileId: FormControl<PhotoFormRawValue['profileId']>;
  photoType: FormControl<PhotoFormRawValue['photoType']>;
  data: FormControl<PhotoFormRawValue['data']>;
  dataContentType: FormControl<PhotoFormRawValue['dataContentType']>;
  photoMetadata: FormControl<PhotoFormRawValue['photoMetadata']>;
  createdBy: FormControl<PhotoFormRawValue['createdBy']>;
  createdDate: FormControl<PhotoFormRawValue['createdDate']>;
  modifiedBy: FormControl<PhotoFormRawValue['modifiedBy']>;
  modifiedDate: FormControl<PhotoFormRawValue['modifiedDate']>;
};

export type PhotoFormGroup = FormGroup<PhotoFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PhotoFormService {
  createPhotoFormGroup(photo: PhotoFormGroupInput = { id: null }): PhotoFormGroup {
    const photoRawValue = this.convertPhotoToPhotoRawValue({
      ...this.getFormDefaults(),
      ...photo,
    });
    return new FormGroup<PhotoFormGroupContent>({
      id: new FormControl(
        { value: photoRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      description: new FormControl(photoRawValue.description, {
        validators: [Validators.required],
      }),
      altText: new FormControl(photoRawValue.altText),
      url: new FormControl(photoRawValue.url, {
        validators: [Validators.required],
      }),
      profileId: new FormControl(photoRawValue.profileId, {
        validators: [Validators.required],
      }),
      photoType: new FormControl(photoRawValue.photoType, {
        validators: [Validators.required],
      }),
      data: new FormControl(photoRawValue.data, {
        validators: [Validators.required],
      }),
      dataContentType: new FormControl(photoRawValue.dataContentType),
      photoMetadata: new FormControl(photoRawValue.photoMetadata),
      createdBy: new FormControl(photoRawValue.createdBy),
      createdDate: new FormControl(photoRawValue.createdDate, {
        validators: [Validators.required],
      }),
      modifiedBy: new FormControl(photoRawValue.modifiedBy, {
        validators: [Validators.required],
      }),
      modifiedDate: new FormControl(photoRawValue.modifiedDate, {
        validators: [Validators.required],
      }),
    });
  }

  getPhoto(form: PhotoFormGroup): IPhoto | NewPhoto {
    return this.convertPhotoRawValueToPhoto(form.getRawValue() as PhotoFormRawValue | NewPhotoFormRawValue);
  }

  resetForm(form: PhotoFormGroup, photo: PhotoFormGroupInput): void {
    const photoRawValue = this.convertPhotoToPhotoRawValue({ ...this.getFormDefaults(), ...photo });
    form.reset(
      {
        ...photoRawValue,
        id: { value: photoRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PhotoFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertPhotoRawValueToPhoto(rawPhoto: PhotoFormRawValue | NewPhotoFormRawValue): IPhoto | NewPhoto {
    return {
      ...rawPhoto,
      createdDate: dayjs(rawPhoto.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawPhoto.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertPhotoToPhotoRawValue(
    photo: IPhoto | (Partial<NewPhoto> & PhotoFormDefaults),
  ): PhotoFormRawValue | PartialWithRequiredKeyOf<NewPhotoFormRawValue> {
    return {
      ...photo,
      createdDate: photo.createdDate ? photo.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: photo.modifiedDate ? photo.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

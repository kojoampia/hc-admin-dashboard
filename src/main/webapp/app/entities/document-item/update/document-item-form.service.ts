import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IDocumentItem, NewDocumentItem } from '../document-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDocumentItem for edit and NewDocumentItemFormGroupInput for create.
 */
type DocumentItemFormGroupInput = IDocumentItem | PartialWithRequiredKeyOf<NewDocumentItem>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IDocumentItem | NewDocumentItem> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type DocumentItemFormRawValue = FormValueOf<IDocumentItem>;

type NewDocumentItemFormRawValue = FormValueOf<NewDocumentItem>;

type DocumentItemFormDefaults = Pick<NewDocumentItem, 'id' | 'createdDate' | 'modifiedDate'>;

type DocumentItemFormGroupContent = {
  id: FormControl<DocumentItemFormRawValue['id'] | NewDocumentItem['id']>;
  name: FormControl<DocumentItemFormRawValue['name']>;
  description: FormControl<DocumentItemFormRawValue['description']>;
  documentType: FormControl<DocumentItemFormRawValue['documentType']>;
  url: FormControl<DocumentItemFormRawValue['url']>;
  createdDate: FormControl<DocumentItemFormRawValue['createdDate']>;
  createdBy: FormControl<DocumentItemFormRawValue['createdBy']>;
  modifiedDate: FormControl<DocumentItemFormRawValue['modifiedDate']>;
  modifiedBy: FormControl<DocumentItemFormRawValue['modifiedBy']>;
};

export type DocumentItemFormGroup = FormGroup<DocumentItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DocumentItemFormService {
  createDocumentItemFormGroup(documentItem: DocumentItemFormGroupInput = { id: null }): DocumentItemFormGroup {
    const documentItemRawValue = this.convertDocumentItemToDocumentItemRawValue({
      ...this.getFormDefaults(),
      ...documentItem,
    });
    return new FormGroup<DocumentItemFormGroupContent>({
      id: new FormControl(
        { value: documentItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(documentItemRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(documentItemRawValue.description, {
        validators: [Validators.required],
      }),
      documentType: new FormControl(documentItemRawValue.documentType, {
        validators: [Validators.required],
      }),
      url: new FormControl(documentItemRawValue.url, {
        validators: [Validators.required],
      }),
      createdDate: new FormControl(documentItemRawValue.createdDate, {
        validators: [Validators.required],
      }),
      createdBy: new FormControl(documentItemRawValue.createdBy, {
        validators: [Validators.required],
      }),
      modifiedDate: new FormControl(documentItemRawValue.modifiedDate, {
        validators: [Validators.required],
      }),
      modifiedBy: new FormControl(documentItemRawValue.modifiedBy, {
        validators: [Validators.required],
      }),
    });
  }

  getDocumentItem(form: DocumentItemFormGroup): IDocumentItem | NewDocumentItem {
    return this.convertDocumentItemRawValueToDocumentItem(form.getRawValue() as DocumentItemFormRawValue | NewDocumentItemFormRawValue);
  }

  resetForm(form: DocumentItemFormGroup, documentItem: DocumentItemFormGroupInput): void {
    const documentItemRawValue = this.convertDocumentItemToDocumentItemRawValue({ ...this.getFormDefaults(), ...documentItem });
    form.reset(
      {
        ...documentItemRawValue,
        id: { value: documentItemRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): DocumentItemFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      createdDate: currentTime,
      modifiedDate: currentTime,
    };
  }

  private convertDocumentItemRawValueToDocumentItem(
    rawDocumentItem: DocumentItemFormRawValue | NewDocumentItemFormRawValue,
  ): IDocumentItem | NewDocumentItem {
    return {
      ...rawDocumentItem,
      createdDate: dayjs(rawDocumentItem.createdDate, DATE_TIME_FORMAT),
      modifiedDate: dayjs(rawDocumentItem.modifiedDate, DATE_TIME_FORMAT),
    };
  }

  private convertDocumentItemToDocumentItemRawValue(
    documentItem: IDocumentItem | (Partial<NewDocumentItem> & DocumentItemFormDefaults),
  ): DocumentItemFormRawValue | PartialWithRequiredKeyOf<NewDocumentItemFormRawValue> {
    return {
      ...documentItem,
      createdDate: documentItem.createdDate ? documentItem.createdDate.format(DATE_TIME_FORMAT) : undefined,
      modifiedDate: documentItem.modifiedDate ? documentItem.modifiedDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}

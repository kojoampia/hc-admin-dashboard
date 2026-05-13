import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IFacilityCatalog, NewFacilityCatalog } from '../facility-catalog.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFacilityCatalog for edit and NewFacilityCatalogFormGroupInput for create.
 */
type FacilityCatalogFormGroupInput = IFacilityCatalog | PartialWithRequiredKeyOf<NewFacilityCatalog>;

type FacilityCatalogFormDefaults = Pick<NewFacilityCatalog, 'id'>;

type FacilityCatalogFormGroupContent = {
  id: FormControl<IFacilityCatalog['id'] | NewFacilityCatalog['id']>;
  name: FormControl<IFacilityCatalog['name']>;
  description: FormControl<IFacilityCatalog['description']>;
  facilities: FormControl<IFacilityCatalog['facilities']>;
};

export type FacilityCatalogFormGroup = FormGroup<FacilityCatalogFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FacilityCatalogFormService {
  createFacilityCatalogFormGroup(facilityCatalog: FacilityCatalogFormGroupInput = { id: null }): FacilityCatalogFormGroup {
    const facilityCatalogRawValue = {
      ...this.getFormDefaults(),
      ...facilityCatalog,
    };
    return new FormGroup<FacilityCatalogFormGroupContent>({
      id: new FormControl(
        { value: facilityCatalogRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(facilityCatalogRawValue.name, {
        validators: [Validators.required],
      }),
      description: new FormControl(facilityCatalogRawValue.description, {
        validators: [Validators.required],
      }),
      facilities: new FormControl(facilityCatalogRawValue.facilities, {
        validators: [Validators.required],
      }),
    });
  }

  getFacilityCatalog(form: FacilityCatalogFormGroup): IFacilityCatalog | NewFacilityCatalog {
    return form.getRawValue() as IFacilityCatalog | NewFacilityCatalog;
  }

  resetForm(form: FacilityCatalogFormGroup, facilityCatalog: FacilityCatalogFormGroupInput): void {
    const facilityCatalogRawValue = { ...this.getFormDefaults(), ...facilityCatalog };
    form.reset(
      {
        ...facilityCatalogRawValue,
        id: { value: facilityCatalogRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): FacilityCatalogFormDefaults {
    return {
      id: null,
    };
  }
}

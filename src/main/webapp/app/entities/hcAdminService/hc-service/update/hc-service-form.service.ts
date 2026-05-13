import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IHCService, NewHCService } from '../hc-service.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IHCService for edit and NewHCServiceFormGroupInput for create.
 */
type HCServiceFormGroupInput = IHCService | PartialWithRequiredKeyOf<NewHCService>;

type HCServiceFormDefaults = Pick<NewHCService, 'id'>;

type HCServiceFormGroupContent = {
  id: FormControl<IHCService['id'] | NewHCService['id']>;
  name: FormControl<IHCService['name']>;
  description: FormControl<IHCService['description']>;
  serviceItems: FormControl<IHCService['serviceItems']>;
  amount: FormControl<IHCService['amount']>;
  createdDate: FormControl<IHCService['createdDate']>;
  createdBy: FormControl<IHCService['createdBy']>;
  modifiedDate: FormControl<IHCService['modifiedDate']>;
  modifiedBy: FormControl<IHCService['modifiedBy']>;
};

export type HCServiceFormGroup = FormGroup<HCServiceFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class HCServiceFormService {
  createHCServiceFormGroup(hCService: HCServiceFormGroupInput = { id: null }): HCServiceFormGroup {
    const hCServiceRawValue = {
      ...this.getFormDefaults(),
      ...hCService,
    };
    return new FormGroup<HCServiceFormGroupContent>({
      id: new FormControl(
        { value: hCServiceRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(hCServiceRawValue.name),
      description: new FormControl(hCServiceRawValue.description),
      serviceItems: new FormControl(hCServiceRawValue.serviceItems),
      amount: new FormControl(hCServiceRawValue.amount),
      createdDate: new FormControl(hCServiceRawValue.createdDate),
      createdBy: new FormControl(hCServiceRawValue.createdBy),
      modifiedDate: new FormControl(hCServiceRawValue.modifiedDate),
      modifiedBy: new FormControl(hCServiceRawValue.modifiedBy),
    });
  }

  getHCService(form: HCServiceFormGroup): IHCService | NewHCService {
    return form.getRawValue() as IHCService | NewHCService;
  }

  resetForm(form: HCServiceFormGroup, hCService: HCServiceFormGroupInput): void {
    const hCServiceRawValue = { ...this.getFormDefaults(), ...hCService };
    form.reset(
      {
        ...hCServiceRawValue,
        id: { value: hCServiceRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): HCServiceFormDefaults {
    return {
      id: null,
    };
  }
}

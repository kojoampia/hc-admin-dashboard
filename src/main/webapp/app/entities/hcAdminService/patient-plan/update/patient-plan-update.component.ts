import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPatientPlan } from '../patient-plan.model';
import { PatientPlanService } from '../service/patient-plan.service';
import { PatientPlanFormGroup, PatientPlanFormService } from './patient-plan-form.service';

@Component({
  selector: 'hpd-patient-plan-update',
  templateUrl: './patient-plan-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PatientPlanUpdateComponent implements OnInit {
  isSaving = false;
  patientPlan: IPatientPlan | null = null;

  protected patientPlanService = inject(PatientPlanService);
  protected patientPlanFormService = inject(PatientPlanFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PatientPlanFormGroup = this.patientPlanFormService.createPatientPlanFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ patientPlan }) => {
      this.patientPlan = patientPlan;
      if (patientPlan) {
        this.updateForm(patientPlan);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const patientPlan = this.patientPlanFormService.getPatientPlan(this.editForm);
    if (patientPlan.id !== null) {
      this.subscribeToSaveResponse(this.patientPlanService.update(patientPlan));
    } else {
      this.subscribeToSaveResponse(this.patientPlanService.create(patientPlan));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPatientPlan>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(patientPlan: IPatientPlan): void {
    this.patientPlan = patientPlan;
    this.patientPlanFormService.resetForm(this.editForm, patientPlan);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DutyRole } from 'app/entities/enumerations/duty-role.model';
import { ShiftType } from 'app/entities/enumerations/shift-type.model';
import { IDutyRoster } from '../duty-roster.model';
import { DutyRosterService } from '../service/duty-roster.service';
import { DutyRosterFormGroup, DutyRosterFormService } from './duty-roster-form.service';

@Component({
  selector: 'hpd-duty-roster-update',
  templateUrl: './duty-roster-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class DutyRosterUpdateComponent implements OnInit {
  isSaving = false;
  dutyRoster: IDutyRoster | null = null;
  dutyRoleValues = Object.keys(DutyRole);
  shiftTypeValues = Object.keys(ShiftType);

  protected dutyRosterService = inject(DutyRosterService);
  protected dutyRosterFormService = inject(DutyRosterFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: DutyRosterFormGroup = this.dutyRosterFormService.createDutyRosterFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ dutyRoster }) => {
      this.dutyRoster = dutyRoster;
      if (dutyRoster) {
        this.updateForm(dutyRoster);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const dutyRoster = this.dutyRosterFormService.getDutyRoster(this.editForm);
    if (dutyRoster.id !== null) {
      this.subscribeToSaveResponse(this.dutyRosterService.update(dutyRoster));
    } else {
      this.subscribeToSaveResponse(this.dutyRosterService.create(dutyRoster));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDutyRoster>>): void {
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

  protected updateForm(dutyRoster: IDutyRoster): void {
    this.dutyRoster = dutyRoster;
    this.dutyRosterFormService.resetForm(this.editForm, dutyRoster);
  }
}

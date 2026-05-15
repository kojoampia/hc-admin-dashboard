import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IDashboard } from '../dashboard.model';
import { DashboardService } from '../service/dashboard.service';
import { DashboardFormGroup, DashboardFormService } from './dashboard-form.service';

@Component({
  selector: 'hpd-dashboard-update',
  templateUrl: './dashboard-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class DashboardUpdateComponent implements OnInit {
  isSaving = false;
  dashboard: IDashboard | null = null;

  protected dashboardService = inject(DashboardService);
  protected dashboardFormService = inject(DashboardFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: DashboardFormGroup = this.dashboardFormService.createDashboardFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ dashboard }) => {
      this.dashboard = dashboard;
      if (dashboard) {
        this.updateForm(dashboard);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const dashboard = this.dashboardFormService.getDashboard(this.editForm);
    if (dashboard.id !== null) {
      this.subscribeToSaveResponse(this.dashboardService.update(dashboard));
    } else {
      this.subscribeToSaveResponse(this.dashboardService.create(dashboard));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDashboard>>): void {
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

  protected updateForm(dashboard: IDashboard): void {
    this.dashboard = dashboard;
    this.dashboardFormService.resetForm(this.editForm, dashboard);
  }
}

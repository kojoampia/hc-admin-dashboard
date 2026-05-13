import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IFacilityCatalog } from '../facility-catalog.model';
import { FacilityCatalogService } from '../service/facility-catalog.service';
import { FacilityCatalogFormGroup, FacilityCatalogFormService } from './facility-catalog-form.service';

@Component({
  selector: 'hpd-facility-catalog-update',
  templateUrl: './facility-catalog-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class FacilityCatalogUpdateComponent implements OnInit {
  isSaving = false;
  facilityCatalog: IFacilityCatalog | null = null;

  protected facilityCatalogService = inject(FacilityCatalogService);
  protected facilityCatalogFormService = inject(FacilityCatalogFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: FacilityCatalogFormGroup = this.facilityCatalogFormService.createFacilityCatalogFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ facilityCatalog }) => {
      this.facilityCatalog = facilityCatalog;
      if (facilityCatalog) {
        this.updateForm(facilityCatalog);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const facilityCatalog = this.facilityCatalogFormService.getFacilityCatalog(this.editForm);
    if (facilityCatalog.id !== null) {
      this.subscribeToSaveResponse(this.facilityCatalogService.update(facilityCatalog));
    } else {
      this.subscribeToSaveResponse(this.facilityCatalogService.create(facilityCatalog));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFacilityCatalog>>): void {
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

  protected updateForm(facilityCatalog: IFacilityCatalog): void {
    this.facilityCatalog = facilityCatalog;
    this.facilityCatalogFormService.resetForm(this.editForm, facilityCatalog);
  }
}

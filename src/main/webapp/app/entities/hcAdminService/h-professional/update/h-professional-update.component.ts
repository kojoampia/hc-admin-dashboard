import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IHProfessional } from '../h-professional.model';
import { HProfessionalService } from '../service/h-professional.service';
import { HProfessionalFormGroup, HProfessionalFormService } from './h-professional-form.service';

@Component({
  selector: 'hpd-h-professional-update',
  templateUrl: './h-professional-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class HProfessionalUpdateComponent implements OnInit {
  isSaving = false;
  hProfessional: IHProfessional | null = null;

  protected hProfessionalService = inject(HProfessionalService);
  protected hProfessionalFormService = inject(HProfessionalFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: HProfessionalFormGroup = this.hProfessionalFormService.createHProfessionalFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ hProfessional }) => {
      this.hProfessional = hProfessional;
      if (hProfessional) {
        this.updateForm(hProfessional);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const hProfessional = this.hProfessionalFormService.getHProfessional(this.editForm);
    if (hProfessional.id !== null) {
      this.subscribeToSaveResponse(this.hProfessionalService.update(hProfessional));
    } else {
      this.subscribeToSaveResponse(this.hProfessionalService.create(hProfessional));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IHProfessional>>): void {
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

  protected updateForm(hProfessional: IHProfessional): void {
    this.hProfessional = hProfessional;
    this.hProfessionalFormService.resetForm(this.editForm, hProfessional);
  }
}

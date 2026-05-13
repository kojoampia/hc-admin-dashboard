import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IHCService } from '../hc-service.model';
import { HCServiceService } from '../service/hc-service.service';
import { HCServiceFormGroup, HCServiceFormService } from './hc-service-form.service';

@Component({
  selector: 'hpd-hc-service-update',
  templateUrl: './hc-service-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class HCServiceUpdateComponent implements OnInit {
  isSaving = false;
  hCService: IHCService | null = null;

  protected hCServiceService = inject(HCServiceService);
  protected hCServiceFormService = inject(HCServiceFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: HCServiceFormGroup = this.hCServiceFormService.createHCServiceFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ hCService }) => {
      this.hCService = hCService;
      if (hCService) {
        this.updateForm(hCService);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const hCService = this.hCServiceFormService.getHCService(this.editForm);
    if (hCService.id !== null) {
      this.subscribeToSaveResponse(this.hCServiceService.update(hCService));
    } else {
      this.subscribeToSaveResponse(this.hCServiceService.create(hCService));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IHCService>>): void {
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

  protected updateForm(hCService: IHCService): void {
    this.hCService = hCService;
    this.hCServiceFormService.resetForm(this.editForm, hCService);
  }
}

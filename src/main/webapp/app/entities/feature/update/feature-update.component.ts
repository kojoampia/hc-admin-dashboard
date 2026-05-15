import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FeatureType } from 'app/entities/enumerations/feature-type.model';
import { IFeature } from '../feature.model';
import { FeatureService } from '../service/feature.service';
import { FeatureFormGroup, FeatureFormService } from './feature-form.service';

@Component({
  selector: 'hpd-feature-update',
  templateUrl: './feature-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class FeatureUpdateComponent implements OnInit {
  isSaving = false;
  feature: IFeature | null = null;
  featureTypeValues = Object.keys(FeatureType);

  protected featureService = inject(FeatureService);
  protected featureFormService = inject(FeatureFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: FeatureFormGroup = this.featureFormService.createFeatureFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ feature }) => {
      this.feature = feature;
      if (feature) {
        this.updateForm(feature);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const feature = this.featureFormService.getFeature(this.editForm);
    if (feature.id !== null) {
      this.subscribeToSaveResponse(this.featureService.update(feature));
    } else {
      this.subscribeToSaveResponse(this.featureService.create(feature));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFeature>>): void {
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

  protected updateForm(feature: IFeature): void {
    this.feature = feature;
    this.featureFormService.resetForm(this.editForm, feature);
  }
}

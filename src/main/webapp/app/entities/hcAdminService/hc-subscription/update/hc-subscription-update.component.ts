import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IHCSubscription } from '../hc-subscription.model';
import { HCSubscriptionService } from '../service/hc-subscription.service';
import { HCSubscriptionFormGroup, HCSubscriptionFormService } from './hc-subscription-form.service';

@Component({
  selector: 'hpd-hc-subscription-update',
  templateUrl: './hc-subscription-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class HCSubscriptionUpdateComponent implements OnInit {
  isSaving = false;
  hCSubscription: IHCSubscription | null = null;

  protected hCSubscriptionService = inject(HCSubscriptionService);
  protected hCSubscriptionFormService = inject(HCSubscriptionFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: HCSubscriptionFormGroup = this.hCSubscriptionFormService.createHCSubscriptionFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ hCSubscription }) => {
      this.hCSubscription = hCSubscription;
      if (hCSubscription) {
        this.updateForm(hCSubscription);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const hCSubscription = this.hCSubscriptionFormService.getHCSubscription(this.editForm);
    if (hCSubscription.id !== null) {
      this.subscribeToSaveResponse(this.hCSubscriptionService.update(hCSubscription));
    } else {
      this.subscribeToSaveResponse(this.hCSubscriptionService.create(hCSubscription));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IHCSubscription>>): void {
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

  protected updateForm(hCSubscription: IHCSubscription): void {
    this.hCSubscription = hCSubscription;
    this.hCSubscriptionFormService.resetForm(this.editForm, hCSubscription);
  }
}

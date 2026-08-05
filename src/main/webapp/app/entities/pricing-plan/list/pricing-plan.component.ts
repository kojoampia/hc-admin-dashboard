import { Component, NgZone, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import SharedModule from 'app/shared/shared.module';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { FormsModule } from '@angular/forms';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
import { IPricingPlan } from '../pricing-plan.model';
import { EntityArrayResponseType, PricingPlanService } from '../service/pricing-plan.service';
import { PricingPlanDeleteDialogComponent } from '../delete/pricing-plan-delete-dialog.component';

@Component({
  selector: 'hpd-pricing-plan',
  templateUrl: './pricing-plan.component.html',
  imports: [RouterModule, FormsModule, SharedModule, SortDirective, SortByDirective],
})
export class PricingPlanComponent implements OnInit {
  subscription: Subscription | null = null;
  pricingPlans = signal<IPricingPlan[]>([]);
  isLoading = false;

  sortState = sortStateSignal({});

  public readonly router = inject(Router);
  protected readonly pricingPlanService = inject(PricingPlanService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dialog = inject(MatDialog);
  protected ngZone = inject(NgZone);

  trackId = (item: IPricingPlan): string => this.pricingPlanService.getPricingPlanIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => {
          if (this.pricingPlans().length === 0) {
            this.load();
          } else {
            this.pricingPlans.set(this.refineData(this.pricingPlans()));
          }
        }),
      )
      .subscribe();
  }

  delete(pricingPlan: IPricingPlan): void {
    const dialogRef = this.dialog.open(PricingPlanDeleteDialogComponent, { width: '640px', disableClose: true });
    dialogRef.componentInstance.pricingPlan = pricingPlan;
    // unsubscribe not needed because afterClosed() completes on close
    dialogRef.afterClosed()
      .pipe(
        filter(reason => reason === ITEM_DELETED_EVENT),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(event);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.pricingPlans.set(this.refineData(dataFromBody));
  }

  protected refineData(data: IPricingPlan[]): IPricingPlan[] {
    const { predicate, order } = this.sortState();
    return predicate && order ? data.sort(this.sortService.startSort({ predicate, order })) : data;
  }

  protected fillComponentAttributesFromResponseBody(data: IPricingPlan[] | null): IPricingPlan[] {
    return data ?? [];
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading = true;
    const queryObject: any = {
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    return this.pricingPlanService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected handleNavigation(sortState: SortState): void {
    const queryParamsObj = {
      sort: this.sortService.buildSortParam(sortState),
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }
}

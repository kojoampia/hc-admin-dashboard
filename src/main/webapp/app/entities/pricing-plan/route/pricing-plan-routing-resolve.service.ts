import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPricingPlan } from '../pricing-plan.model';
import { PricingPlanService } from '../service/pricing-plan.service';

const pricingPlanResolve = (route: ActivatedRouteSnapshot): Observable<null | IPricingPlan> => {
  const id = route.params.id;
  if (id) {
    return inject(PricingPlanService)
      .find(id)
      .pipe(
        mergeMap((pricingPlan: HttpResponse<IPricingPlan>) => {
          if (pricingPlan.body) {
            return of(pricingPlan.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default pricingPlanResolve;

import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IHCSubscription } from '../hc-subscription.model';
import { HCSubscriptionService } from '../service/hc-subscription.service';

const hCSubscriptionResolve = (route: ActivatedRouteSnapshot): Observable<null | IHCSubscription> => {
  const id = route.params.id;
  if (id) {
    return inject(HCSubscriptionService)
      .find(id)
      .pipe(
        mergeMap((hCSubscription: HttpResponse<IHCSubscription>) => {
          if (hCSubscription.body) {
            return of(hCSubscription.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default hCSubscriptionResolve;

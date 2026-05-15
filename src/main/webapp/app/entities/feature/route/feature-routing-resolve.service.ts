import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFeature } from '../feature.model';
import { FeatureService } from '../service/feature.service';

const featureResolve = (route: ActivatedRouteSnapshot): Observable<null | IFeature> => {
  const id = route.params.id;
  if (id) {
    return inject(FeatureService)
      .find(id)
      .pipe(
        mergeMap((feature: HttpResponse<IFeature>) => {
          if (feature.body) {
            return of(feature.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default featureResolve;

import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFacility } from '../facility.model';
import { FacilityService } from '../service/facility.service';

const facilityResolve = (route: ActivatedRouteSnapshot): Observable<null | IFacility> => {
  const id = route.params.id;
  if (id) {
    return inject(FacilityService)
      .find(id)
      .pipe(
        mergeMap((facility: HttpResponse<IFacility>) => {
          if (facility.body) {
            return of(facility.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default facilityResolve;

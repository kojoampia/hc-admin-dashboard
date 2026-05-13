import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFacilityCatalog } from '../facility-catalog.model';
import { FacilityCatalogService } from '../service/facility-catalog.service';

const facilityCatalogResolve = (route: ActivatedRouteSnapshot): Observable<null | IFacilityCatalog> => {
  const id = route.params.id;
  if (id) {
    return inject(FacilityCatalogService)
      .find(id)
      .pipe(
        mergeMap((facilityCatalog: HttpResponse<IFacilityCatalog>) => {
          if (facilityCatalog.body) {
            return of(facilityCatalog.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default facilityCatalogResolve;

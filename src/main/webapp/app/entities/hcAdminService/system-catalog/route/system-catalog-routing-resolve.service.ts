import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISystemCatalog } from '../system-catalog.model';
import { SystemCatalogService } from '../service/system-catalog.service';

const systemCatalogResolve = (route: ActivatedRouteSnapshot): Observable<null | ISystemCatalog> => {
  const id = route.params.id;
  if (id) {
    return inject(SystemCatalogService)
      .find(id)
      .pipe(
        mergeMap((systemCatalog: HttpResponse<ISystemCatalog>) => {
          if (systemCatalog.body) {
            return of(systemCatalog.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default systemCatalogResolve;

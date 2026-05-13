import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IHCService } from '../hc-service.model';
import { HCServiceService } from '../service/hc-service.service';

const hCServiceResolve = (route: ActivatedRouteSnapshot): Observable<null | IHCService> => {
  const id = route.params.id;
  if (id) {
    return inject(HCServiceService)
      .find(id)
      .pipe(
        mergeMap((hCService: HttpResponse<IHCService>) => {
          if (hCService.body) {
            return of(hCService.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default hCServiceResolve;

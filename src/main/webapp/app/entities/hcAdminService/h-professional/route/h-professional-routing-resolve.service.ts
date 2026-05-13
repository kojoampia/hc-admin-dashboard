import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IHProfessional } from '../h-professional.model';
import { HProfessionalService } from '../service/h-professional.service';

const hProfessionalResolve = (route: ActivatedRouteSnapshot): Observable<null | IHProfessional> => {
  const id = route.params.id;
  if (id) {
    return inject(HProfessionalService)
      .find(id)
      .pipe(
        mergeMap((hProfessional: HttpResponse<IHProfessional>) => {
          if (hProfessional.body) {
            return of(hProfessional.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default hProfessionalResolve;

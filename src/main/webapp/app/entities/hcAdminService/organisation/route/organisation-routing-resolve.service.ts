import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IOrganisation } from '../organisation.model';
import { OrganisationService } from '../service/organisation.service';

const organisationResolve = (route: ActivatedRouteSnapshot): Observable<null | IOrganisation> => {
  const id = route.params.id;
  if (id) {
    return inject(OrganisationService)
      .find(id)
      .pipe(
        mergeMap((organisation: HttpResponse<IOrganisation>) => {
          if (organisation.body) {
            return of(organisation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default organisationResolve;

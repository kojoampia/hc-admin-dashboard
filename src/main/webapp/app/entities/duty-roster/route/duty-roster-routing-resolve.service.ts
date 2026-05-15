import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IDutyRoster } from '../duty-roster.model';
import { DutyRosterService } from '../service/duty-roster.service';

const dutyRosterResolve = (route: ActivatedRouteSnapshot): Observable<null | IDutyRoster> => {
  const id = route.params.id;
  if (id) {
    return inject(DutyRosterService)
      .find(id)
      .pipe(
        mergeMap((dutyRoster: HttpResponse<IDutyRoster>) => {
          if (dutyRoster.body) {
            return of(dutyRoster.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default dutyRosterResolve;

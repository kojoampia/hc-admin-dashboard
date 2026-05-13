import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPatientPlan } from '../patient-plan.model';
import { PatientPlanService } from '../service/patient-plan.service';

const patientPlanResolve = (route: ActivatedRouteSnapshot): Observable<null | IPatientPlan> => {
  const id = route.params.id;
  if (id) {
    return inject(PatientPlanService)
      .find(id)
      .pipe(
        mergeMap((patientPlan: HttpResponse<IPatientPlan>) => {
          if (patientPlan.body) {
            return of(patientPlan.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default patientPlanResolve;

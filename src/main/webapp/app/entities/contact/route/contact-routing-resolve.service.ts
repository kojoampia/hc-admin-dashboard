import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IContact } from '../contact.model';
import { ContactService } from '../service/contact.service';

const contactResolve = (route: ActivatedRouteSnapshot): Observable<null | IContact> => {
  const id = route.params.id;
  if (id) {
    return inject(ContactService)
      .find(id)
      .pipe(
        mergeMap((contact: HttpResponse<IContact>) => {
          if (contact.body) {
            return of(contact.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default contactResolve;

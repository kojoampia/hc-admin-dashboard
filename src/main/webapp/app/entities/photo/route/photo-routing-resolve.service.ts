import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPhoto } from '../photo.model';
import { PhotoService } from '../service/photo.service';

const photoResolve = (route: ActivatedRouteSnapshot): Observable<null | IPhoto> => {
  const id = route.params.id;
  if (id) {
    return inject(PhotoService)
      .find(id)
      .pipe(
        mergeMap((photo: HttpResponse<IPhoto>) => {
          if (photo.body) {
            return of(photo.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default photoResolve;

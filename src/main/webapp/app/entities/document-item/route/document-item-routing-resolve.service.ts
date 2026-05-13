import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IDocumentItem } from '../document-item.model';
import { DocumentItemService } from '../service/document-item.service';

const documentItemResolve = (route: ActivatedRouteSnapshot): Observable<null | IDocumentItem> => {
  const id = route.params.id;
  if (id) {
    return inject(DocumentItemService)
      .find(id)
      .pipe(
        mergeMap((documentItem: HttpResponse<IDocumentItem>) => {
          if (documentItem.body) {
            return of(documentItem.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default documentItemResolve;

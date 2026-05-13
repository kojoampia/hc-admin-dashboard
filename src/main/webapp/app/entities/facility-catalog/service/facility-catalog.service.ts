import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFacilityCatalog, NewFacilityCatalog } from '../facility-catalog.model';

export type PartialUpdateFacilityCatalog = Partial<IFacilityCatalog> & Pick<IFacilityCatalog, 'id'>;

export type EntityResponseType = HttpResponse<IFacilityCatalog>;
export type EntityArrayResponseType = HttpResponse<IFacilityCatalog[]>;

@Injectable({ providedIn: 'root' })
export class FacilityCatalogService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/facility-catalogs');

  create(facilityCatalog: NewFacilityCatalog): Observable<EntityResponseType> {
    return this.http.post<IFacilityCatalog>(this.resourceUrl, facilityCatalog, { observe: 'response' });
  }

  update(facilityCatalog: IFacilityCatalog): Observable<EntityResponseType> {
    return this.http.put<IFacilityCatalog>(`${this.resourceUrl}/${this.getFacilityCatalogIdentifier(facilityCatalog)}`, facilityCatalog, {
      observe: 'response',
    });
  }

  partialUpdate(facilityCatalog: PartialUpdateFacilityCatalog): Observable<EntityResponseType> {
    return this.http.patch<IFacilityCatalog>(`${this.resourceUrl}/${this.getFacilityCatalogIdentifier(facilityCatalog)}`, facilityCatalog, {
      observe: 'response',
    });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IFacilityCatalog>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IFacilityCatalog[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getFacilityCatalogIdentifier(facilityCatalog: Pick<IFacilityCatalog, 'id'>): string {
    return facilityCatalog.id;
  }

  compareFacilityCatalog(o1: Pick<IFacilityCatalog, 'id'> | null, o2: Pick<IFacilityCatalog, 'id'> | null): boolean {
    return o1 && o2 ? this.getFacilityCatalogIdentifier(o1) === this.getFacilityCatalogIdentifier(o2) : o1 === o2;
  }

  addFacilityCatalogToCollectionIfMissing<Type extends Pick<IFacilityCatalog, 'id'>>(
    facilityCatalogCollection: Type[],
    ...facilityCatalogsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const facilityCatalogs: Type[] = facilityCatalogsToCheck.filter(isPresent);
    if (facilityCatalogs.length > 0) {
      const facilityCatalogCollectionIdentifiers = facilityCatalogCollection.map(facilityCatalogItem =>
        this.getFacilityCatalogIdentifier(facilityCatalogItem),
      );
      const facilityCatalogsToAdd = facilityCatalogs.filter(facilityCatalogItem => {
        const facilityCatalogIdentifier = this.getFacilityCatalogIdentifier(facilityCatalogItem);
        if (facilityCatalogCollectionIdentifiers.includes(facilityCatalogIdentifier)) {
          return false;
        }
        facilityCatalogCollectionIdentifiers.push(facilityCatalogIdentifier);
        return true;
      });
      return [...facilityCatalogsToAdd, ...facilityCatalogCollection];
    }
    return facilityCatalogCollection;
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISystemCatalog, NewSystemCatalog } from '../system-catalog.model';

export type PartialUpdateSystemCatalog = Partial<ISystemCatalog> & Pick<ISystemCatalog, 'id'>;

type RestOf<T extends ISystemCatalog | NewSystemCatalog> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

export type RestSystemCatalog = RestOf<ISystemCatalog>;

export type NewRestSystemCatalog = RestOf<NewSystemCatalog>;

export type PartialUpdateRestSystemCatalog = RestOf<PartialUpdateSystemCatalog>;

export type EntityResponseType = HttpResponse<ISystemCatalog>;
export type EntityArrayResponseType = HttpResponse<ISystemCatalog[]>;

@Injectable({ providedIn: 'root' })
export class SystemCatalogService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/system-catalogs');

  create(systemCatalog: NewSystemCatalog): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(systemCatalog);
    return this.http
      .post<RestSystemCatalog>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(systemCatalog: ISystemCatalog): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(systemCatalog);
    return this.http
      .put<RestSystemCatalog>(`${this.resourceUrl}/${this.getSystemCatalogIdentifier(systemCatalog)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(systemCatalog: PartialUpdateSystemCatalog): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(systemCatalog);
    return this.http
      .patch<RestSystemCatalog>(`${this.resourceUrl}/${this.getSystemCatalogIdentifier(systemCatalog)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestSystemCatalog>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSystemCatalog[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSystemCatalogIdentifier(systemCatalog: Pick<ISystemCatalog, 'id'>): string {
    return systemCatalog.id;
  }

  compareSystemCatalog(o1: Pick<ISystemCatalog, 'id'> | null, o2: Pick<ISystemCatalog, 'id'> | null): boolean {
    return o1 && o2 ? this.getSystemCatalogIdentifier(o1) === this.getSystemCatalogIdentifier(o2) : o1 === o2;
  }

  addSystemCatalogToCollectionIfMissing<Type extends Pick<ISystemCatalog, 'id'>>(
    systemCatalogCollection: Type[],
    ...systemCatalogsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const systemCatalogs: Type[] = systemCatalogsToCheck.filter(isPresent);
    if (systemCatalogs.length > 0) {
      const systemCatalogCollectionIdentifiers = systemCatalogCollection.map(systemCatalogItem =>
        this.getSystemCatalogIdentifier(systemCatalogItem),
      );
      const systemCatalogsToAdd = systemCatalogs.filter(systemCatalogItem => {
        const systemCatalogIdentifier = this.getSystemCatalogIdentifier(systemCatalogItem);
        if (systemCatalogCollectionIdentifiers.includes(systemCatalogIdentifier)) {
          return false;
        }
        systemCatalogCollectionIdentifiers.push(systemCatalogIdentifier);
        return true;
      });
      return [...systemCatalogsToAdd, ...systemCatalogCollection];
    }
    return systemCatalogCollection;
  }

  protected convertDateFromClient<T extends ISystemCatalog | NewSystemCatalog | PartialUpdateSystemCatalog>(systemCatalog: T): RestOf<T> {
    return {
      ...systemCatalog,
      createdDate: systemCatalog.createdDate?.toJSON() ?? null,
      modifiedDate: systemCatalog.modifiedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restSystemCatalog: RestSystemCatalog): ISystemCatalog {
    return {
      ...restSystemCatalog,
      createdDate: restSystemCatalog.createdDate ? dayjs(restSystemCatalog.createdDate) : undefined,
      modifiedDate: restSystemCatalog.modifiedDate ? dayjs(restSystemCatalog.modifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestSystemCatalog>): HttpResponse<ISystemCatalog> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestSystemCatalog[]>): HttpResponse<ISystemCatalog[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IHCService, NewHCService } from '../hc-service.model';

export type PartialUpdateHCService = Partial<IHCService> & Pick<IHCService, 'id'>;

type RestOf<T extends IHCService | NewHCService> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

export type RestHCService = RestOf<IHCService>;

export type NewRestHCService = RestOf<NewHCService>;

export type PartialUpdateRestHCService = RestOf<PartialUpdateHCService>;

export type EntityResponseType = HttpResponse<IHCService>;
export type EntityArrayResponseType = HttpResponse<IHCService[]>;

@Injectable({ providedIn: 'root' })
export class HCServiceService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/hc-services');

  create(hCService: NewHCService): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hCService);
    return this.http
      .post<RestHCService>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(hCService: IHCService): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hCService);
    return this.http
      .put<RestHCService>(`${this.resourceUrl}/${this.getHCServiceIdentifier(hCService)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(hCService: PartialUpdateHCService): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hCService);
    return this.http
      .patch<RestHCService>(`${this.resourceUrl}/${this.getHCServiceIdentifier(hCService)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestHCService>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestHCService[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getHCServiceIdentifier(hCService: Pick<IHCService, 'id'>): string {
    return hCService.id;
  }

  compareHCService(o1: Pick<IHCService, 'id'> | null, o2: Pick<IHCService, 'id'> | null): boolean {
    return o1 && o2 ? this.getHCServiceIdentifier(o1) === this.getHCServiceIdentifier(o2) : o1 === o2;
  }

  addHCServiceToCollectionIfMissing<Type extends Pick<IHCService, 'id'>>(
    hCServiceCollection: Type[],
    ...hCServicesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const hCServices: Type[] = hCServicesToCheck.filter(isPresent);
    if (hCServices.length > 0) {
      const hCServiceCollectionIdentifiers = hCServiceCollection.map(hCServiceItem => this.getHCServiceIdentifier(hCServiceItem));
      const hCServicesToAdd = hCServices.filter(hCServiceItem => {
        const hCServiceIdentifier = this.getHCServiceIdentifier(hCServiceItem);
        if (hCServiceCollectionIdentifiers.includes(hCServiceIdentifier)) {
          return false;
        }
        hCServiceCollectionIdentifiers.push(hCServiceIdentifier);
        return true;
      });
      return [...hCServicesToAdd, ...hCServiceCollection];
    }
    return hCServiceCollection;
  }

  protected convertDateFromClient<T extends IHCService | NewHCService | PartialUpdateHCService>(hCService: T): RestOf<T> {
    return {
      ...hCService,
      createdDate: hCService.createdDate?.format(DATE_FORMAT) ?? null,
      modifiedDate: hCService.modifiedDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restHCService: RestHCService): IHCService {
    return {
      ...restHCService,
      createdDate: restHCService.createdDate ? dayjs(restHCService.createdDate) : undefined,
      modifiedDate: restHCService.modifiedDate ? dayjs(restHCService.modifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestHCService>): HttpResponse<IHCService> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestHCService[]>): HttpResponse<IHCService[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

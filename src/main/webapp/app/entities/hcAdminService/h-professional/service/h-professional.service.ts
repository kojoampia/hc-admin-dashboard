import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IHProfessional, NewHProfessional } from '../h-professional.model';

export type PartialUpdateHProfessional = Partial<IHProfessional> & Pick<IHProfessional, 'id'>;

type RestOf<T extends IHProfessional | NewHProfessional> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

export type RestHProfessional = RestOf<IHProfessional>;

export type NewRestHProfessional = RestOf<NewHProfessional>;

export type PartialUpdateRestHProfessional = RestOf<PartialUpdateHProfessional>;

export type EntityResponseType = HttpResponse<IHProfessional>;
export type EntityArrayResponseType = HttpResponse<IHProfessional[]>;

@Injectable({ providedIn: 'root' })
export class HProfessionalService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/h-professionals');

  create(hProfessional: NewHProfessional): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hProfessional);
    return this.http
      .post<RestHProfessional>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(hProfessional: IHProfessional): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hProfessional);
    return this.http
      .put<RestHProfessional>(`${this.resourceUrl}/${this.getHProfessionalIdentifier(hProfessional)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(hProfessional: PartialUpdateHProfessional): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hProfessional);
    return this.http
      .patch<RestHProfessional>(`${this.resourceUrl}/${this.getHProfessionalIdentifier(hProfessional)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestHProfessional>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestHProfessional[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getHProfessionalIdentifier(hProfessional: Pick<IHProfessional, 'id'>): string {
    return hProfessional.id;
  }

  compareHProfessional(o1: Pick<IHProfessional, 'id'> | null, o2: Pick<IHProfessional, 'id'> | null): boolean {
    return o1 && o2 ? this.getHProfessionalIdentifier(o1) === this.getHProfessionalIdentifier(o2) : o1 === o2;
  }

  addHProfessionalToCollectionIfMissing<Type extends Pick<IHProfessional, 'id'>>(
    hProfessionalCollection: Type[],
    ...hProfessionalsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const hProfessionals: Type[] = hProfessionalsToCheck.filter(isPresent);
    if (hProfessionals.length > 0) {
      const hProfessionalCollectionIdentifiers = hProfessionalCollection.map(hProfessionalItem =>
        this.getHProfessionalIdentifier(hProfessionalItem),
      );
      const hProfessionalsToAdd = hProfessionals.filter(hProfessionalItem => {
        const hProfessionalIdentifier = this.getHProfessionalIdentifier(hProfessionalItem);
        if (hProfessionalCollectionIdentifiers.includes(hProfessionalIdentifier)) {
          return false;
        }
        hProfessionalCollectionIdentifiers.push(hProfessionalIdentifier);
        return true;
      });
      return [...hProfessionalsToAdd, ...hProfessionalCollection];
    }
    return hProfessionalCollection;
  }

  protected convertDateFromClient<T extends IHProfessional | NewHProfessional | PartialUpdateHProfessional>(hProfessional: T): RestOf<T> {
    return {
      ...hProfessional,
      createdDate: hProfessional.createdDate?.format(DATE_FORMAT) ?? null,
      modifiedDate: hProfessional.modifiedDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restHProfessional: RestHProfessional): IHProfessional {
    return {
      ...restHProfessional,
      createdDate: restHProfessional.createdDate ? dayjs(restHProfessional.createdDate) : undefined,
      modifiedDate: restHProfessional.modifiedDate ? dayjs(restHProfessional.modifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestHProfessional>): HttpResponse<IHProfessional> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestHProfessional[]>): HttpResponse<IHProfessional[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

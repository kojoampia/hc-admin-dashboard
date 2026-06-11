import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IOrganisation, NewOrganisation } from '../organisation.model';

export type PartialUpdateOrganisation = Partial<IOrganisation> & Pick<IOrganisation, 'id'>;

type RestOf<T extends IOrganisation | NewOrganisation> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

export type RestOrganisation = RestOf<IOrganisation>;

export type NewRestOrganisation = RestOf<NewOrganisation>;

export type PartialUpdateRestOrganisation = RestOf<PartialUpdateOrganisation>;

export type EntityResponseType = HttpResponse<IOrganisation>;
export type EntityArrayResponseType = HttpResponse<IOrganisation[]>;

@Injectable({ providedIn: 'root' })
export class OrganisationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/organisations', 'hc-admin-ms');

  create(organisation: NewOrganisation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(organisation);
    return this.http
      .post<RestOrganisation>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(organisation: IOrganisation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(organisation);
    return this.http
      .put<RestOrganisation>(`${this.resourceUrl}/${this.getOrganisationIdentifier(organisation)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(organisation: PartialUpdateOrganisation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(organisation);
    return this.http
      .patch<RestOrganisation>(`${this.resourceUrl}/${this.getOrganisationIdentifier(organisation)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestOrganisation>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestOrganisation[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getOrganisationIdentifier(organisation: Pick<IOrganisation, 'id'>): string {
    return organisation.id;
  }

  compareOrganisation(o1: Pick<IOrganisation, 'id'> | null, o2: Pick<IOrganisation, 'id'> | null): boolean {
    return o1 && o2 ? this.getOrganisationIdentifier(o1) === this.getOrganisationIdentifier(o2) : o1 === o2;
  }

  addOrganisationToCollectionIfMissing<Type extends Pick<IOrganisation, 'id'>>(
    organisationCollection: Type[],
    ...organisationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const organisations: Type[] = organisationsToCheck.filter(isPresent);
    if (organisations.length > 0) {
      const organisationCollectionIdentifiers = organisationCollection.map(organisationItem =>
        this.getOrganisationIdentifier(organisationItem),
      );
      const organisationsToAdd = organisations.filter(organisationItem => {
        const organisationIdentifier = this.getOrganisationIdentifier(organisationItem);
        if (organisationCollectionIdentifiers.includes(organisationIdentifier)) {
          return false;
        }
        organisationCollectionIdentifiers.push(organisationIdentifier);
        return true;
      });
      return [...organisationsToAdd, ...organisationCollection];
    }
    return organisationCollection;
  }

  protected convertDateFromClient<T extends IOrganisation | NewOrganisation | PartialUpdateOrganisation>(organisation: T): RestOf<T> {
    return {
      ...organisation,
      createdDate: organisation.createdDate?.format(DATE_FORMAT) ?? null,
      modifiedDate: organisation.modifiedDate?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restOrganisation: RestOrganisation): IOrganisation {
    return {
      ...restOrganisation,
      createdDate: restOrganisation.createdDate ? dayjs(restOrganisation.createdDate) : undefined,
      modifiedDate: restOrganisation.modifiedDate ? dayjs(restOrganisation.modifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestOrganisation>): HttpResponse<IOrganisation> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestOrganisation[]>): HttpResponse<IOrganisation[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

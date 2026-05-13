import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IHCSubscription, NewHCSubscription } from '../hc-subscription.model';

export type PartialUpdateHCSubscription = Partial<IHCSubscription> & Pick<IHCSubscription, 'id'>;

type RestOf<T extends IHCSubscription | NewHCSubscription> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

export type RestHCSubscription = RestOf<IHCSubscription>;

export type NewRestHCSubscription = RestOf<NewHCSubscription>;

export type PartialUpdateRestHCSubscription = RestOf<PartialUpdateHCSubscription>;

export type EntityResponseType = HttpResponse<IHCSubscription>;
export type EntityArrayResponseType = HttpResponse<IHCSubscription[]>;

@Injectable({ providedIn: 'root' })
export class HCSubscriptionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/hc-subscriptions');

  create(hCSubscription: NewHCSubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hCSubscription);
    return this.http
      .post<RestHCSubscription>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(hCSubscription: IHCSubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hCSubscription);
    return this.http
      .put<RestHCSubscription>(`${this.resourceUrl}/${this.getHCSubscriptionIdentifier(hCSubscription)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(hCSubscription: PartialUpdateHCSubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(hCSubscription);
    return this.http
      .patch<RestHCSubscription>(`${this.resourceUrl}/${this.getHCSubscriptionIdentifier(hCSubscription)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestHCSubscription>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestHCSubscription[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getHCSubscriptionIdentifier(hCSubscription: Pick<IHCSubscription, 'id'>): string {
    return hCSubscription.id;
  }

  compareHCSubscription(o1: Pick<IHCSubscription, 'id'> | null, o2: Pick<IHCSubscription, 'id'> | null): boolean {
    return o1 && o2 ? this.getHCSubscriptionIdentifier(o1) === this.getHCSubscriptionIdentifier(o2) : o1 === o2;
  }

  addHCSubscriptionToCollectionIfMissing<Type extends Pick<IHCSubscription, 'id'>>(
    hCSubscriptionCollection: Type[],
    ...hCSubscriptionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const hCSubscriptions: Type[] = hCSubscriptionsToCheck.filter(isPresent);
    if (hCSubscriptions.length > 0) {
      const hCSubscriptionCollectionIdentifiers = hCSubscriptionCollection.map(hCSubscriptionItem =>
        this.getHCSubscriptionIdentifier(hCSubscriptionItem),
      );
      const hCSubscriptionsToAdd = hCSubscriptions.filter(hCSubscriptionItem => {
        const hCSubscriptionIdentifier = this.getHCSubscriptionIdentifier(hCSubscriptionItem);
        if (hCSubscriptionCollectionIdentifiers.includes(hCSubscriptionIdentifier)) {
          return false;
        }
        hCSubscriptionCollectionIdentifiers.push(hCSubscriptionIdentifier);
        return true;
      });
      return [...hCSubscriptionsToAdd, ...hCSubscriptionCollection];
    }
    return hCSubscriptionCollection;
  }

  protected convertDateFromClient<T extends IHCSubscription | NewHCSubscription | PartialUpdateHCSubscription>(
    hCSubscription: T,
  ): RestOf<T> {
    return {
      ...hCSubscription,
      createdDate: hCSubscription.createdDate?.toJSON() ?? null,
      modifiedDate: hCSubscription.modifiedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restHCSubscription: RestHCSubscription): IHCSubscription {
    return {
      ...restHCSubscription,
      createdDate: restHCSubscription.createdDate ? dayjs(restHCSubscription.createdDate) : undefined,
      modifiedDate: restHCSubscription.modifiedDate ? dayjs(restHCSubscription.modifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestHCSubscription>): HttpResponse<IHCSubscription> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestHCSubscription[]>): HttpResponse<IHCSubscription[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

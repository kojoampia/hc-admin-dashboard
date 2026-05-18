import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDutyRoster, NewDutyRoster } from '../duty-roster.model';

export type PartialUpdateDutyRoster = Partial<IDutyRoster> & Pick<IDutyRoster, 'id'>;

type RestOf<T extends IDutyRoster | NewDutyRoster> = Omit<T, 'date'> & {
  date?: string | null;
};

export type RestDutyRoster = RestOf<IDutyRoster>;

export type NewRestDutyRoster = RestOf<NewDutyRoster>;

export type PartialUpdateRestDutyRoster = RestOf<PartialUpdateDutyRoster>;

export type EntityResponseType = HttpResponse<IDutyRoster>;
export type EntityArrayResponseType = HttpResponse<IDutyRoster[]>;

@Injectable({ providedIn: 'root' })
export class DutyRosterService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/duty-rosters');

  create(dutyRoster: NewDutyRoster): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(dutyRoster);
    return this.http
      .post<RestDutyRoster>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(dutyRoster: IDutyRoster): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(dutyRoster);
    return this.http
      .put<RestDutyRoster>(`${this.resourceUrl}/${this.getDutyRosterIdentifier(dutyRoster)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(dutyRoster: PartialUpdateDutyRoster): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(dutyRoster);
    return this.http
      .patch<RestDutyRoster>(`${this.resourceUrl}/${this.getDutyRosterIdentifier(dutyRoster)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestDutyRoster>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestDutyRoster[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(url, body);
  }

  getDutyRosterIdentifier(dutyRoster: Pick<IDutyRoster, 'id'>): string {
    return dutyRoster.id;
  }

  compareDutyRoster(o1: Pick<IDutyRoster, 'id'> | null, o2: Pick<IDutyRoster, 'id'> | null): boolean {
    return o1 && o2 ? this.getDutyRosterIdentifier(o1) === this.getDutyRosterIdentifier(o2) : o1 === o2;
  }

  addDutyRosterToCollectionIfMissing<Type extends Pick<IDutyRoster, 'id'>>(
    dutyRosterCollection: Type[],
    ...dutyRostersToCheck: (Type | null | undefined)[]
  ): Type[] {
    const dutyRosters: Type[] = dutyRostersToCheck.filter(isPresent);
    if (dutyRosters.length > 0) {
      const dutyRosterCollectionIdentifiers = dutyRosterCollection.map(dutyRosterItem => this.getDutyRosterIdentifier(dutyRosterItem));
      const dutyRostersToAdd = dutyRosters.filter(dutyRosterItem => {
        const dutyRosterIdentifier = this.getDutyRosterIdentifier(dutyRosterItem);
        if (dutyRosterCollectionIdentifiers.includes(dutyRosterIdentifier)) {
          return false;
        }
        dutyRosterCollectionIdentifiers.push(dutyRosterIdentifier);
        return true;
      });
      return [...dutyRostersToAdd, ...dutyRosterCollection];
    }
    return dutyRosterCollection;
  }

  protected convertDateFromClient<T extends IDutyRoster | NewDutyRoster | PartialUpdateDutyRoster>(dutyRoster: T): RestOf<T> {
    return {
      ...dutyRoster,
      date: dutyRoster.date?.format(DATE_FORMAT) ?? null,
    };
  }

  protected convertDateFromServer(restDutyRoster: RestDutyRoster): IDutyRoster {
    return {
      ...restDutyRoster,
      date: restDutyRoster.date ? dayjs(restDutyRoster.date) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestDutyRoster>): HttpResponse<IDutyRoster> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestDutyRoster[]>): HttpResponse<IDutyRoster[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

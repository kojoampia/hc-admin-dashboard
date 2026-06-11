import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPatientPlan, NewPatientPlan } from '../patient-plan.model';

export type PartialUpdatePatientPlan = Partial<IPatientPlan> & Pick<IPatientPlan, 'id'>;

type RestOf<T extends IPatientPlan | NewPatientPlan> = Omit<T, 'startDate' | 'endDate' | 'createdDate'> & {
  startDate?: string | null;
  endDate?: string | null;
  createdDate?: string | null;
};

export type RestPatientPlan = RestOf<IPatientPlan>;

export type NewRestPatientPlan = RestOf<NewPatientPlan>;

export type PartialUpdateRestPatientPlan = RestOf<PartialUpdatePatientPlan>;

export type EntityResponseType = HttpResponse<IPatientPlan>;
export type EntityArrayResponseType = HttpResponse<IPatientPlan[]>;

@Injectable({ providedIn: 'root' })
export class PatientPlanService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/patient-plans', 'hc-admin-ms');

  create(patientPlan: NewPatientPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(patientPlan);
    return this.http
      .post<RestPatientPlan>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(patientPlan: IPatientPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(patientPlan);
    return this.http
      .put<RestPatientPlan>(`${this.resourceUrl}/${this.getPatientPlanIdentifier(patientPlan)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(patientPlan: PartialUpdatePatientPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(patientPlan);
    return this.http
      .patch<RestPatientPlan>(`${this.resourceUrl}/${this.getPatientPlanIdentifier(patientPlan)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestPatientPlan>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestPatientPlan[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPatientPlanIdentifier(patientPlan: Pick<IPatientPlan, 'id'>): string {
    return patientPlan.id;
  }

  comparePatientPlan(o1: Pick<IPatientPlan, 'id'> | null, o2: Pick<IPatientPlan, 'id'> | null): boolean {
    return o1 && o2 ? this.getPatientPlanIdentifier(o1) === this.getPatientPlanIdentifier(o2) : o1 === o2;
  }

  addPatientPlanToCollectionIfMissing<Type extends Pick<IPatientPlan, 'id'>>(
    patientPlanCollection: Type[],
    ...patientPlansToCheck: (Type | null | undefined)[]
  ): Type[] {
    const patientPlans: Type[] = patientPlansToCheck.filter(isPresent);
    if (patientPlans.length > 0) {
      const patientPlanCollectionIdentifiers = patientPlanCollection.map(patientPlanItem => this.getPatientPlanIdentifier(patientPlanItem));
      const patientPlansToAdd = patientPlans.filter(patientPlanItem => {
        const patientPlanIdentifier = this.getPatientPlanIdentifier(patientPlanItem);
        if (patientPlanCollectionIdentifiers.includes(patientPlanIdentifier)) {
          return false;
        }
        patientPlanCollectionIdentifiers.push(patientPlanIdentifier);
        return true;
      });
      return [...patientPlansToAdd, ...patientPlanCollection];
    }
    return patientPlanCollection;
  }

  protected convertDateFromClient<T extends IPatientPlan | NewPatientPlan | PartialUpdatePatientPlan>(patientPlan: T): RestOf<T> {
    return {
      ...patientPlan,
      startDate: patientPlan.startDate?.format(DATE_FORMAT) ?? null,
      endDate: patientPlan.endDate?.format(DATE_FORMAT) ?? null,
      createdDate: patientPlan.createdDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restPatientPlan: RestPatientPlan): IPatientPlan {
    return {
      ...restPatientPlan,
      startDate: restPatientPlan.startDate ? dayjs(restPatientPlan.startDate) : undefined,
      endDate: restPatientPlan.endDate ? dayjs(restPatientPlan.endDate) : undefined,
      createdDate: restPatientPlan.createdDate ? dayjs(restPatientPlan.createdDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestPatientPlan>): HttpResponse<IPatientPlan> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestPatientPlan[]>): HttpResponse<IPatientPlan[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

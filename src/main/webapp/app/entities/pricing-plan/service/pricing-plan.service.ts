import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPricingPlan, NewPricingPlan } from '../pricing-plan.model';

export type PartialUpdatePricingPlan = Partial<IPricingPlan> & Pick<IPricingPlan, 'id'>;

export type EntityResponseType = HttpResponse<IPricingPlan>;
export type EntityArrayResponseType = HttpResponse<IPricingPlan[]>;

@Injectable({ providedIn: 'root' })
export class PricingPlanService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/pricing-plans');

  create(pricingPlan: NewPricingPlan): Observable<EntityResponseType> {
    return this.http.post<IPricingPlan>(this.resourceUrl, pricingPlan, { observe: 'response' });
  }

  update(pricingPlan: IPricingPlan): Observable<EntityResponseType> {
    return this.http.put<IPricingPlan>(`${this.resourceUrl}/${this.getPricingPlanIdentifier(pricingPlan)}`, pricingPlan, {
      observe: 'response',
    });
  }

  partialUpdate(pricingPlan: PartialUpdatePricingPlan): Observable<EntityResponseType> {
    return this.http.patch<IPricingPlan>(`${this.resourceUrl}/${this.getPricingPlanIdentifier(pricingPlan)}`, pricingPlan, {
      observe: 'response',
    });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IPricingPlan>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPricingPlan[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPricingPlanIdentifier(pricingPlan: Pick<IPricingPlan, 'id'>): string {
    return pricingPlan.id;
  }

  comparePricingPlan(o1: Pick<IPricingPlan, 'id'> | null, o2: Pick<IPricingPlan, 'id'> | null): boolean {
    return o1 && o2 ? this.getPricingPlanIdentifier(o1) === this.getPricingPlanIdentifier(o2) : o1 === o2;
  }

  addPricingPlanToCollectionIfMissing<Type extends Pick<IPricingPlan, 'id'>>(
    pricingPlanCollection: Type[],
    ...pricingPlansToCheck: (Type | null | undefined)[]
  ): Type[] {
    const pricingPlans: Type[] = pricingPlansToCheck.filter(isPresent);
    if (pricingPlans.length > 0) {
      const pricingPlanCollectionIdentifiers = pricingPlanCollection.map(pricingPlanItem => this.getPricingPlanIdentifier(pricingPlanItem));
      const pricingPlansToAdd = pricingPlans.filter(pricingPlanItem => {
        const pricingPlanIdentifier = this.getPricingPlanIdentifier(pricingPlanItem);
        if (pricingPlanCollectionIdentifiers.includes(pricingPlanIdentifier)) {
          return false;
        }
        pricingPlanCollectionIdentifiers.push(pricingPlanIdentifier);
        return true;
      });
      return [...pricingPlansToAdd, ...pricingPlanCollection];
    }
    return pricingPlanCollection;
  }
}

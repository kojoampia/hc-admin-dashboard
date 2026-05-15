import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFeature, NewFeature } from '../feature.model';

export type PartialUpdateFeature = Partial<IFeature> & Pick<IFeature, 'id'>;

export type EntityResponseType = HttpResponse<IFeature>;
export type EntityArrayResponseType = HttpResponse<IFeature[]>;

@Injectable({ providedIn: 'root' })
export class FeatureService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/features');

  create(feature: NewFeature): Observable<EntityResponseType> {
    return this.http.post<IFeature>(this.resourceUrl, feature, { observe: 'response' });
  }

  update(feature: IFeature): Observable<EntityResponseType> {
    return this.http.put<IFeature>(`${this.resourceUrl}/${this.getFeatureIdentifier(feature)}`, feature, { observe: 'response' });
  }

  partialUpdate(feature: PartialUpdateFeature): Observable<EntityResponseType> {
    return this.http.patch<IFeature>(`${this.resourceUrl}/${this.getFeatureIdentifier(feature)}`, feature, { observe: 'response' });
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http.get<IFeature>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IFeature[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getFeatureIdentifier(feature: Pick<IFeature, 'id'>): string {
    return feature.id;
  }

  compareFeature(o1: Pick<IFeature, 'id'> | null, o2: Pick<IFeature, 'id'> | null): boolean {
    return o1 && o2 ? this.getFeatureIdentifier(o1) === this.getFeatureIdentifier(o2) : o1 === o2;
  }

  addFeatureToCollectionIfMissing<Type extends Pick<IFeature, 'id'>>(
    featureCollection: Type[],
    ...featuresToCheck: (Type | null | undefined)[]
  ): Type[] {
    const features: Type[] = featuresToCheck.filter(isPresent);
    if (features.length > 0) {
      const featureCollectionIdentifiers = featureCollection.map(featureItem => this.getFeatureIdentifier(featureItem));
      const featuresToAdd = features.filter(featureItem => {
        const featureIdentifier = this.getFeatureIdentifier(featureItem);
        if (featureCollectionIdentifiers.includes(featureIdentifier)) {
          return false;
        }
        featureCollectionIdentifiers.push(featureIdentifier);
        return true;
      });
      return [...featuresToAdd, ...featureCollection];
    }
    return featureCollection;
  }
}

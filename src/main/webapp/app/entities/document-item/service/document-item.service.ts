import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IDocumentItem, NewDocumentItem } from '../document-item.model';

export type PartialUpdateDocumentItem = Partial<IDocumentItem> & Pick<IDocumentItem, 'id'>;

type RestOf<T extends IDocumentItem | NewDocumentItem> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

export type RestDocumentItem = RestOf<IDocumentItem>;

export type NewRestDocumentItem = RestOf<NewDocumentItem>;

export type PartialUpdateRestDocumentItem = RestOf<PartialUpdateDocumentItem>;

export type EntityResponseType = HttpResponse<IDocumentItem>;
export type EntityArrayResponseType = HttpResponse<IDocumentItem[]>;

@Injectable({ providedIn: 'root' })
export class DocumentItemService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/document-items', 'hcadminservice');

  create(documentItem: NewDocumentItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(documentItem);
    return this.http
      .post<RestDocumentItem>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(documentItem: IDocumentItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(documentItem);
    return this.http
      .put<RestDocumentItem>(`${this.resourceUrl}/${this.getDocumentItemIdentifier(documentItem)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(documentItem: PartialUpdateDocumentItem): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(documentItem);
    return this.http
      .patch<RestDocumentItem>(`${this.resourceUrl}/${this.getDocumentItemIdentifier(documentItem)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: string): Observable<EntityResponseType> {
    return this.http
      .get<RestDocumentItem>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestDocumentItem[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: string): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getDocumentItemIdentifier(documentItem: Pick<IDocumentItem, 'id'>): string {
    return documentItem.id;
  }

  compareDocumentItem(o1: Pick<IDocumentItem, 'id'> | null, o2: Pick<IDocumentItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getDocumentItemIdentifier(o1) === this.getDocumentItemIdentifier(o2) : o1 === o2;
  }

  addDocumentItemToCollectionIfMissing<Type extends Pick<IDocumentItem, 'id'>>(
    documentItemCollection: Type[],
    ...documentItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const documentItems: Type[] = documentItemsToCheck.filter(isPresent);
    if (documentItems.length > 0) {
      const documentItemCollectionIdentifiers = documentItemCollection.map(documentItemItem =>
        this.getDocumentItemIdentifier(documentItemItem),
      );
      const documentItemsToAdd = documentItems.filter(documentItemItem => {
        const documentItemIdentifier = this.getDocumentItemIdentifier(documentItemItem);
        if (documentItemCollectionIdentifiers.includes(documentItemIdentifier)) {
          return false;
        }
        documentItemCollectionIdentifiers.push(documentItemIdentifier);
        return true;
      });
      return [...documentItemsToAdd, ...documentItemCollection];
    }
    return documentItemCollection;
  }

  protected convertDateFromClient<T extends IDocumentItem | NewDocumentItem | PartialUpdateDocumentItem>(documentItem: T): RestOf<T> {
    return {
      ...documentItem,
      createdDate: documentItem.createdDate?.toJSON() ?? null,
      modifiedDate: documentItem.modifiedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restDocumentItem: RestDocumentItem): IDocumentItem {
    return {
      ...restDocumentItem,
      createdDate: restDocumentItem.createdDate ? dayjs(restDocumentItem.createdDate) : undefined,
      modifiedDate: restDocumentItem.modifiedDate ? dayjs(restDocumentItem.modifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestDocumentItem>): HttpResponse<IDocumentItem> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestDocumentItem[]>): HttpResponse<IDocumentItem[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

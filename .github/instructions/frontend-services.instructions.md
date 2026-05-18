---
applyTo: "src/main/webapp/app/**/service/*.ts"
---

# Angular Service Conventions

## URL Construction

Always derive resource URLs through `ApplicationConfigService.getEndpointFor`:

```typescript
protected resourceUrl = this.applicationConfigService.getEndpointFor('api/entities', 'microservicename');
protected resourceSearchUrl = this.applicationConfigService.getEndpointFor('api/_search/entities', 'microservicename');
```

Never hardcode service paths. The second argument is the lowercase microservice registry name (e.g., `'generalservice'`, `'adminservice'`).

## Response Type Aliases

Declare file-scoped type aliases immediately after imports, before the `@Injectable`:

```typescript
export type EntityResponseType = HttpResponse<IMyEntity>;
export type EntityArrayResponseType = HttpResponse<IMyEntity[]>;
```

These aliases must be exported so components and specs can reference them.

## CRUD Method Signatures

All methods return `Observable`s — never `Promise`s.

| Method         | Return type                  | HTTP verb |
|----------------|------------------------------|-----------|
| `create`       | `Observable<EntityResponseType>` | POST |
| `update`       | `Observable<EntityResponseType>` | PUT with id segment |
| `partialUpdate`| `Observable<EntityResponseType>` | PATCH with id segment |
| `find`         | `Observable<EntityResponseType>` | GET with id segment |
| `query`        | `Observable<EntityArrayResponseType>` | GET with params |
| `delete`       | `Observable<HttpResponse<{}>>` | DELETE with id segment |
| `search`       | `Observable<EntityArrayResponseType>` | GET search URL with params |

ID segment pattern: `` `${this.resourceUrl}/${getEntityIdentifier(entity) as string}` ``

## Query Parameters

Use `createRequestOption(req)` from `app/core/request/request-util` to build `HttpParams`:

```typescript
query(req?: any): Observable<EntityArrayResponseType> {
  const options = createRequestOption(req);
  return this.http.get<IMyEntity[]>(this.resourceUrl, { params: options, observe: 'response' });
}
```

## Date Handling

Entities with `dayjs.Dayjs` date fields require bidirectional conversion:

**Client → server** (`convertDateFromClient`): serialize valid dayjs values with `DATE_FORMAT`:
```typescript
protected convertDateFromClient(entity: IMyEntity): IMyEntity {
  return Object.assign({}, entity, {
    someDate: entity.someDate?.isValid() ? entity.someDate.format(DATE_FORMAT) : undefined,
  });
}
```

**Server → client** (`convertDateFromServer`): deserialize ISO strings back to dayjs:
```typescript
protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
  if (res.body) {
    res.body.someDate = res.body.someDate ? dayjs(res.body.someDate) : undefined;
  }
  return res;
}
```

Apply `convertDateFromClient` in `create`, `update`, `partialUpdate` before the HTTP call, and pipe `convertDateFromServer` on the response. Services for entities without date fields omit these helpers entirely — do not add them unnecessarily.

Import: `import dayjs from 'dayjs/esm';` and `import { DATE_FORMAT } from 'app/config/input.constants';`

## Collection Deduplication Helper

Every entity service exposes an `addXToCollectionIfMissing` method used by update-form resolvers:

```typescript
addMyEntityToCollectionIfMissing(
  collection: IMyEntity[],
  ...itemsToCheck: (IMyEntity | null | undefined)[]
): IMyEntity[] {
  const items: IMyEntity[] = itemsToCheck.filter(isPresent);
  if (items.length > 0) {
    const collectionIdentifiers = collection.map(item => getMyEntityIdentifier(item)!);
    const itemsToAdd = items.filter(item => {
      const id = getMyEntityIdentifier(item);
      if (id == null || collectionIdentifiers.includes(id)) return false;
      collectionIdentifiers.push(id);
      return true;
    });
    return [...itemsToAdd, ...collection];
  }
  return collection;
}
```

Import `isPresent` from `app/core/util/operators`.

## Injectable Decorator

Always use `@Injectable({ providedIn: 'root' })`.

## Imports Order

1. Angular core (`@angular/core`, `@angular/common/http`)
2. RxJS (`rxjs`, `rxjs/operators`)
3. Third-party (`dayjs/esm`)
4. App core utilities (`app/core/...`, `app/config/...`)
5. Local entity model (`../entity.model`)

---
applyTo: "src/main/webapp/app/**/*.spec.ts"
---

# Angular Test Conventions

## Module Setup

Every spec uses `TestBed.configureTestingModule`. Import `HttpClientTestingModule` instead of `HttpClientModule` in all specs — never inject a real `HttpClient`.

**Service spec:**
```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
  });
  service = TestBed.inject(MyEntityService);
  httpMock = TestBed.inject(HttpTestingController);
});
```

**Component spec:**
```typescript
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [RouterTestingModule.withRoutes([{ path: 'my-entity', component: MyEntityComponent }]), HttpClientTestingModule],
    declarations: [MyEntityComponent],
    providers: [
      { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
    ],
  })
    .overrideTemplate(MyEntityComponent, '')
    .compileComponents();

  fixture = TestBed.createComponent(MyEntityComponent);
  comp = fixture.componentInstance;
  service = TestBed.inject(MyEntityService);
});
```

Always call `.overrideTemplate(Component, '')` on list/detail components to avoid resolving template dependencies. Do not use `overrideTemplate` for components under active template development.

## HttpTestingController

After each `service.find/create/update/query` call in a service spec, intercept and flush:

```typescript
it('should find an element', () => {
  service.find('ABC').subscribe(resp => (expectedResult = resp.body));

  const req = httpMock.expectOne({ method: 'GET' });
  req.flush(returnedFromService);
  expect(expectedResult).toMatchObject(elemDefault);
});

afterEach(() => {
  httpMock.verify();  // add this to afterEach when testing multiple requests
});
```

Use `httpMock.expectOne({ method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'GET' })` to match by verb.

## Date Values in Service Specs

Declare a shared `currentDate` and `elemDefault` in `beforeEach`:

```typescript
let currentDate: dayjs.Dayjs;

beforeEach(() => {
  currentDate = dayjs();
  elemDefault = {
    id: 'AAAAAAA',
    someDate: currentDate,
  };
});
```

When building `returnedFromService`, serialize dates with `DATE_FORMAT`:
```typescript
const returnedFromService = Object.assign(
  { someDate: currentDate.format(DATE_FORMAT) },
  elemDefault
);
```

When building the `expected` comparison object, keep dates as `dayjs`:
```typescript
const expected = Object.assign({ someDate: currentDate }, returnedFromService);
expect(expectedResult).toMatchObject(expected);
```

## Mocking Services in Component Specs

Use `jest.spyOn` — never use a hand-rolled stub class for services the component calls:

```typescript
jest.spyOn(service, 'query').mockReturnValue(
  of(new HttpResponse({ body: [{ id: 'ABC' }], headers: new HttpHeaders() }))
);
```

For router navigation:
```typescript
jest.spyOn(mockRouter, 'navigate').mockImplementation(() => Promise.resolve(true));
```

## Routing Resolve Specs

Inject `Router`, `ActivatedRoute`, the resolve service, and the entity service. Mock router navigation and test three cases:

1. **Entity found** — `service.find = jest.fn(id => of(new HttpResponse({ body: { id } })))`, params `{ id: 'ABC' }` → resolves with entity.
2. **New entity** — params `{}` → resolves with `new MyEntity()`.
3. **Not found (404)** — `mockReturnValue(of(new HttpResponse({ body: null })))` → router navigates to `['404']`.

Pattern for providing `ActivatedRoute` with snapshot params:
```typescript
providers: [
  {
    provide: ActivatedRoute,
    useValue: { snapshot: { paramMap: convertToParamMap({}) } },
  },
],
```

## File Structure

| File                                  | What to test                             |
|---------------------------------------|------------------------------------------|
| `service/entity.service.spec.ts`      | All CRUD methods, date conversions, `addToCollectionIfMissing` |
| `list/entity.component.spec.ts`       | `ngOnInit` loads, pagination, delete modal |
| `detail/entity-detail.component.spec.ts` | Component creation, data binding      |
| `route/entity-routing-resolve.service.spec.ts` | Three resolve cases             |

## Assertion Style

Prefer `toMatchObject` over `toEqual` when comparing partial shapes. Use `expect.objectContaining({ id: 'ABC' })` for array item assertions.

## Imports Checklist

```typescript
import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';      // component specs only
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing'; // component/resolve specs
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router'; // resolve specs
import { of } from 'rxjs';
import dayjs from 'dayjs/esm';
import { DATE_FORMAT } from 'app/config/input.constants';       // service specs with dates
```

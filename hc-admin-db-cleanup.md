# Agent Prompt: Frontend Dashboard Cleanup (`hc-admin-db`)

## Objective

Your task is to refactor the `hc-admin-db` Angular application by removing all hardcoded mock data and replacing it with dynamic data fetching from the backend services via `HttpClient`. This will enforce a strict separation of concerns and prepare the application for integration with a live backend.

## Instructions

1.  **Analyze the Codebase:**
    *   Thoroughly scan the `src/app/` directory of the `hc-admin-db` repository.
    *   Identify all Angular services (`.service.ts`), components (`.component.ts`), and state management stores (e.g., NgRx, RxJS BehaviorSubjects) that contain hardcoded data.
    *   Look for patterns like:
        *   `const MOCK_DATA = [...]`
        *   `of([...])` from `rxjs` to simulate API calls.
        *   `new BehaviorSubject([...])` initialized with static arrays or objects.
        *   Properties on components initialized with literal arrays or objects (e.g., `public users: User[] = [...]`).

2.  **Remove Hardcoded Data:**
    *   Once identified, remove all static mock data arrays and objects.

3.  **Implement `HttpClient` Services:**
    *   For each feature area that had mock data, ensure there is a corresponding Angular service that uses the `HttpClient` to fetch data from the backend.
    *   Define strictly typed TypeScript interfaces for all data models (e.g., `User`, `Facility`, `Audit`).
    *   **Gateway API Calls:** For authentication and user management, target the gateway's API endpoints.
        *   `POST /api/authenticate` for login.
        *   `GET /api/account` for the current user's data.
        *   `GET /api/users` for a list of all users (for admin roles).
    *   **Microservice API Calls:** For domain-specific data, target the `hc-admin-ms` service through the gateway. The URL pattern is `/services/hcadminservice/api/...`.
        *   Example for fetching "facilities": `GET /services/hcadminservice/api/facilities`
        *   Example for fetching a single "audit": `GET /services/hcadminservice/api/audits/{id}`

4.  **Update Components:**
    *   Refactor the components that previously used mock data to now inject the relevant services and call the new data-fetching methods.
    *   Use the `async` pipe in templates where appropriate to handle `Observable` streams.

## Example: Refactoring a `UserService`

**Before (with mock data):**

```typescript
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from './user.model';

const MOCK_USERS: User[] = [
  { id: '1', login: 'admin', ... },
  { id: '2', login: 'user', ... }
];

@Injectable({ providedIn: 'root' })
export class UserService {
  getUsers(): Observable<User[]> {
    return of(MOCK_USERS);
  }
}
```

**After (with `HttpClient`):**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
```

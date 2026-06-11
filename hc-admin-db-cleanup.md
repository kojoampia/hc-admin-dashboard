# Agent Prompt: Frontend Dashboard Cleanup (`hc-admin-db`)

Act as a senior Angular developer tasked with cleaning up the `hc-admin-db` frontend dashboard application. The goal is to remove all hardcoded mock data and replace it with dynamic data fetching from the backend services using `HttpClient`. This will ensure that the application is ready for integration with live backend APIs and follows best practices for data management in Angular applications.

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
    *   **Microservice API Calls:** For domain-specific data, target the `hc-admin-ms` service through the gateway. The URL pattern is `/services/hc-admin-ms/api/...`.
        *   Example for fetching "facilities": `GET /services/hc-admin-ms/api/facilities`
        *   Example for fetching a single "audit": `GET /services/hc-admin-ms/api/audits/{id}`

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
## Code Quality and Best Practices

*   Leverage on Angular 19+ features such as signals and standalone components to enhance the application's performance and maintainability.
*   Ensure that all services and components are properly typed with TypeScript interfaces.
*   Use Angular's dependency injection to manage service instances.
*   Follow Angular style guidelines for file organization, naming conventions, and coding standards.
*   Ensure that all API calls handle errors gracefully, using Angular's `catchError` operator to manage error states in the UI.
*   Write unit tests for the new services and components to ensure that they function correctly with the new data-fetching logic.
*   Ensure JHipster's code generation patterns are followed, especially for service and component structure, to maintain consistency across the codebase.
*   Ensure that the application is modular, with clear separation of concerns between different feature areas (e.g., user management, facility management, audit logs).
*   Ensure that all components are standalone and reusable, following Angular's best practices for component design.
*   Prefer using @for @if instead of *ngIf and *ngFor in templates for better readability and maintainability.
*   Ensure that all API endpoints are correctly targeted, especially when fetching data from the gateway and microservices, to maintain a clear separation between frontend and backend concerns.
*   Ensure that the application is ready for integration with live backend APIs, with all hardcoded data removed and replaced with dynamic data fetching logic.
*   Do not implement any new features or make any changes to the UI/UX design. Focus solely on refactoring the existing code to remove hardcoded data and implement dynamic data fetching.
*   Do not modify any backend code or API endpoints. The focus is strictly on the frontend Angular application and its integration with the existing backend services.
*   Do not add any new dependencies or libraries to the project. Use only the existing Angular 19+ features to implement the required changes.
*   Do not delete any models or services that are currently in use, even if they contain mock data. Instead, refactor them to fetch data from the backend while keeping their existing structure and functionality intact.
*   
## Testing and Validation
*   After refactoring, thoroughly test the application to ensure that all data is being fetched correctly from the backend services.
*   Validate that the UI components are displaying the fetched data as expected and that there are no errors in the console related to data fetching or API calls.
*   Ensure that all user interactions that trigger data fetching (e.g., clicking a "Load Users" button) are working correctly and that the application responds appropriately to both successful and failed API calls.
*   Use Angular's development tools and browser developer tools to monitor network requests and ensure that the correct API endpoints are being called with the expected parameters.
*   If any issues arise during testing, debug the application to identify and resolve the root cause, ensuring that the final implementation is robust and reliable.

## Conclusion

By following these instructions, you will successfully clean up the `hc-admin-db` frontend dashboard application, removing all hardcoded mock data and replacing it with dynamic data fetching from the backend services. This will prepare the application for integration with live backend APIs and ensure that it follows best practices for data management in Angular applications.

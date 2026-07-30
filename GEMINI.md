# Health Connect Admin Dashboard (`hc-admin-dashboard`)

This project is a dedicated administrative interface for the Health Connect platform. It is a frontend-only Angular application designed to manage entities, monitor system health, and provide real-time dashboards for administrators.

## Project Architecture & Core Technologies

- **Framework:** Angular 19.2.21 (Standalone Components, Lazy Loading).
- **Generation:** JHipster 8.11.0 (configured with `skipServer: true`). There is no `pom.xml`; the inherited `backend:*` / `java:*` scripts and the `mvnw` wrapper have been removed, since they could never run here.
- **UI & Styling:**
  - **Bootstrap 5 & ng-bootstrap:** Primary UI framework.
  - **Tailwind CSS:** Integrated for utility-first styling (configured in `tailwind.config.js`).
  - **ngx-charts:** Used for data visualization in the dashboard.
  - **Angular Material 19 + CDK:** Used by the `layouts/main` shell (toolbar, sidenav).
  - **FontAwesome:** installed but **unused** — no `@fortawesome` or `fa-icon` references remain in `src/main/webapp/app`. Prefer Material icons; the packages are removal candidates.
- **State & Storage:** `ngx-webstorage` for persisting local and session-based state (e.g., dashboard layout preferences).
- **Communication:**
  - **REST:** Standard HTTP client for API interactions.
  - **WebSockets:** SockJS and `webstomp-client` for real-time audit logs and notifications.
- **I18n:** Comprehensive translation support for English (en), French (fr), and German (de) via `@ngx-translate`.

## Directory Structure & Conventions

- **Source Root:** `src/main/webapp`
- **Component Prefix:** `hpd` (e.g., `<hpd-navbar>`).
- **Key Modules:**
  - `app/core/`: Singleton services (auth, interceptors, routing guards) and global configurations.
  - `app/shared/`: Reusable components, directives, pipes, and shared modules.
  - `app/entities/`: Feature-specific logic for domain entities (generated from JDL).
  - `app/admin/`: Administrative tools like user management, health monitoring, and metrics.
  - `app/layouts/`: Core layout components (navbar, footer, main container).
  - `app/widgets/`: Reusable chart and display widgets shared across dashboards.
- **Configuration:**
  - `angular.json`: Uses `@angular-builders/custom-webpack` for the build and `@angular-builders/jest:run` for `ng test`.
  - `webpack/proxy.conf.js`: Proxies API calls to `http://localhost:5504` — the `hc-admin-gateway` dev port, **not** the mock server. Repoint it to 5508 if you want `npm run mock:api` instead.
  - `webpack/environment.js`: Per-environment API URLs and WebSocket toggles (`DEV_SERVER_API_URL`, `TEST_SERVER_API_URL`, `PROD_SERVER_API_URL`). WebSockets are disabled in dev by default.

## Development Workflow

### Setup & Execution

- **Install Dependencies:** `npm install`
- **Start Development Server:** `npm start` (accessible at `http://localhost:4200`).
- **Backend:** either run `hc-admin-gateway` (5504) + `hc-admin-service` (5507), or run `npm run mock:api` (json-server on 5508) and repoint the proxy.

### Quality Control

- **Linting:** `npm run lint` (ESLint with Angular-specific rules).
- **Formatting:** `npm run prettier:format` (Prettier).
- **Unit Testing:** `npm test` or `npm run jest` (Jest via `@angular-builders/jest`; `npm test` runs lint first via the `pretest` hook).
- **E2E Testing:** not available — the `src/test/javascript/cypress` folder is left over from JHipster generation, but Cypress is not an installed dependency and no `e2e` script exists.

### Building

- **Production Build:** `npm run webapp:prod` (outputs to `target/classes/static/`).
- **Bundle Analysis:** `target/stats.html` is generated after a production build.

## Key Features & Paths

- **Admin Dashboard:** Available at `/admin/dashboard` (Requires `ROLE_ADMIN`). Features customizable widgets for system health, alerts, and user activity.
- **Real-time Notifications:** Integrated via WebSockets for live system updates.
- **Entity Management:** Standardized CRUD interfaces for platform entities (Professionals, Facilities, Teams, etc.).

## Guidelines for Contributions

- **Naming:** Follow standard Angular naming conventions. Ensure all component selectors use the `hpd` prefix.
- **Lifecycle Methods:** Ensure that if a component implements a lifecycle interface (e.g., `OnInit`), the method is actually present, and vice versa.
- **Mocking:** When adding new features that require backend interaction, update `db.json` and `routes.json` to ensure the mock server supports the new endpoints.
- **Tailwind:** Use Tailwind for layout and spacing tweaks where Bootstrap classes are insufficient or too rigid.

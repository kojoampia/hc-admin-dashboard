# Health Connect Admin Dashboard (`hc-admin-dashboard`)

This project is a dedicated administrative interface for the Health Connect platform. It is a frontend-only Angular application designed to manage entities, monitor system health, and provide real-time dashboards for administrators.

## Project Architecture & Core Technologies

- **Framework:** Angular 21 (Standalone Components, Lazy Loading).
- **Generation:** JHipster 8.11.0 (configured with `skipServer: true`). There is no `pom.xml`; the inherited `backend:*` / `java:*` scripts and the `mvnw` wrapper have been removed, since they could never run here.
- **UI & Styling — the BridgeCare design system**, shared with `hc-professional/web`:
  - **Angular Material 21 (M3):** primary UI framework, themed by `content/scss/material-theme.scss`
    via `mat.theme()` on the brand seeds (navy `#0D3058`, gold `#C59437`).
  - **Tailwind CSS 3.4:** utility styling. `tailwind.config.js` exposes the brand tokens as
    `hpd-*` utilities (`bg-hpd-primary`, `text-hpd-muted`, `rounded-hpd`, `shadow-hpd`, …), every
    value read through a `var()` from `content/scss/global.scss`, which owns the palette.
  - **Inter** via `@fontsource/inter`, self-hosted — the production CSP blocks Google Fonts.
  - **ngx-charts:** data visualization in the dashboard.
  - **Bootstrap, ng-bootstrap and FontAwesome are gone.** Use Material icons and the `hpd-*`
    utilities; do not reintroduce a second UI framework.
- **State & Storage:** `ngx-webstorage` for persisting local and session-based state (e.g., dashboard layout preferences).
- **Communication:**
  - **REST:** Standard HTTP client for API interactions.
  - **SSE:** `AuditStreamService` for the real-time audit log. There is no WebSocket client;
    SockJS and `webstomp-client` were removed, and no backend ever served `/websocket`.
- **I18n:** Comprehensive translation support for English (en), French (fr), and German (de) via `@ngx-translate`.

## Directory Structure & Conventions

- **Source Root:** `src/main/webapp`
- **Component Prefix:** `hpd` (e.g., `<hpd-sidebar>`).
- **Key Modules:**
  - `app/core/`: Singleton services (auth, interceptors, routing guards) and global configurations.
  - `app/shared/`: Reusable components, directives, pipes, and shared modules.
  - `app/entities/`: Feature-specific logic for domain entities (generated from JDL).
  - `app/admin/`: Administrative tools like user management, health monitoring, and metrics.
  - `app/layouts/`: the BridgeCare shell — `main/` (topbar + `sidebar/` + `shell-navigation.ts`,
    the single source of truth for navigation), `footer/`, `error/`, `profiles/`.
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
- **Styling:** reach for the `hpd-*` brand utilities and the `.hpd-btn*` / `.hpd-input` /
  `.hpd-label` component classes in `global.scss` before writing ad-hoc colours. Never hardcode a
  hex in a template, and never put white text on gold (2.74:1, fails AA).

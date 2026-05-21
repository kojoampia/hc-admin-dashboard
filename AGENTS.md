# Project Overview

This is `hc-admin-dashboard` — the Health Connect Admin frontend. It is an Angular 19 SPA generated with **JHipster 8.11.0** (`skipServer: true`). There is no Java backend in this project; the frontend proxies API calls to the `hc-admin-ms` microservice and `hc-admin-gw` gateway.

- JHipster prefix: `hpd` (component selectors `hpd-*`, directive selectors `hpdCamelCase`)
- Backend port (proxy target): `5054`
- Development server: `http://localhost:4200`
- Mock API (json-server): `http://localhost:5508`

## Code Quality and Style

- Follow Angular style guide and JHipster conventions already established in the project.
- Use consistent naming: component selectors prefixed `hpd-` (kebab-case), directive selectors prefixed `hpd` (camelCase) per `.eslintrc.json`.
- Format with Prettier: `npm run prettier:format`; check with `npm run prettier:check`.
- Lint with ESLint: `npm run lint`; auto-fix with `npm run lint:fix`.
- Use 2-space indentation for TypeScript, HTML, JSON, YAML, and CSS/SCSS files (see `.editorconfig`).
- Write unit tests with Jest via `@angular-builders/jest`; E2E tests with Cypress.
- Use RxJS `Observable` patterns and takeUntil-based cleanup already established in existing services and components.
- Prefer `ngx-webstorage` for browser storage over direct `localStorage`/`sessionStorage` access.
- Sanitize all user-supplied content rendered via `[innerHTML]` to prevent XSS.
- Do not store sensitive data (tokens, PII) in non-secure browser storage.

## Architecture and Design

- **Frontend only** — no Spring Boot, no JPA, no Liquibase, no Java source in this project.
- Source root is `src/main/webapp`; all Angular source lives under `src/main/webapp/app`.
- Folder responsibilities:
  - `core/` — authentication (`AccountService`, `UserRouteAccessService`), interceptors, `ApplicationConfigService`, low-level utilities.
  - `shared/` — reusable pipes, directives, `SharedModule`, alert/filter/sort/pagination helpers.
  - `entities/` — one sub-folder per domain entity; each contains model, service, list/detail/update/delete components, and route config.
  - `layouts/` — shell components (navbar, footer, error pages).
  - `widgets/` — reusable chart and display widgets (badgebox, chatbot, faq, file-viewer, filter, heatmap, histogram, info-box, info-box-sm, linechart, page-display, piechart, pnv, slides, tilebox, treemap).
  - `pages/` — reserved for standalone page components outside the entity CRUD pattern.
- Use Angular standalone components; the legacy `SharedModule` exists for backward compatibility but new components should be standalone.
- Build API URLs through `ApplicationConfigService.getEndpointFor(api, microservice?)` instead of hardcoding paths.
- Route-level lazy loading is configured in `app.routes.ts` and `entity.routes.ts`; keep new routes consistent with this pattern.
- Real-time updates connect via SockJS + webstomp-client to the gateway WebSocket endpoint.
- Use `dayjs` for all date parsing and formatting.
- Use `ngx-charts` + D3 for dashboard charts and visualisations.

## Implemented Entities

The following domain entities are scaffolded and routed under `/entities`:

`Organisation`, `Dashboard`, `Feature`, `Message`, `DutyRoster`, `SystemCatalog`, `PricingPlan`, `PatientPlan`, `Professional`, `Address`, `Person`, `Contact`, `Photo`, `DocumentItem`, `Team`, `Profile`, `Facility`, `FacilityCatalog`, `Notification`, `AuditLog`

## Security Considerations

- Authentication state is managed by `AccountService`; route guards use `UserRouteAccessService` with `Authority` constants.
- Bearer JWT tokens are attached to outgoing API requests by the auth interceptor in `core/interceptor`.
- Admin-only routes are gated by `Authority.ADMIN`; do not remove or weaken route guards.
- Sanitize dynamic HTML output; never bypass Angular's DomSanitizer without explicit justification.
- Do not log or expose tokens, passwords, or PII in console output.
- Keep dependencies up to date; run `npm audit` regularly and address high/critical findings.
- HTTPS is enforced in production via the Nginx configuration and the gateway; the dev server uses plain HTTP on `localhost` only.
- Comply with GDPR/HIPAA by avoiding unnecessary persistence of personal or health-related data in the browser.

## Performance Optimization

- Use lazy-loaded routes (already in place) to keep initial bundle size small.
- Apply pagination (`ngx-infinite-scroll` or page-based) for entity list views that return large datasets.
- Use `OnPush` change detection on list components that receive data via `Input` or `Observable` streams.
- Prefer `trackBy` functions on `*ngFor` to reduce DOM re-renders.
- Defer heavy chart/widget rendering until the component is visible (use `@defer` blocks in Angular 19 templates where appropriate).
- Avoid blocking the main thread with synchronous heavy computation; offload to Web Workers when necessary.

## Technology Stack

- **Angular 19.2.21** with standalone components and lazy-loaded routes
- **Bootstrap 5.3.2** + **ng-bootstrap 18** for UI components and modals
- **TailwindCSS 3.4** for layout and spacing utilities
- **Font Awesome 6.5** (`@fortawesome/angular-fontawesome`) for icons
- **RxJS 7.8** for reactive state and async data flows
- **@ngx-translate** (en, fr, de) for internationalisation
- **ngx-charts** + **D3.js** for data visualisation widgets
- **SockJS** + **webstomp-client** for WebSocket connectivity
- **ngx-webstorage** for browser storage abstraction
- **dayjs** for date/time handling
- **ngx-infinite-scroll** for infinite-scroll pagination
- **Jest 30** + `@angular-builders/jest` for unit testing
- **Cypress** for E2E testing
- **ESLint** + **Prettier** for linting and formatting
- **Husky** + **lint-staged** for pre-commit quality gates
- **json-server** for local mock API development (`npm run mock:api`)
- **Nginx** for serving the SPA in production (see `nginx.conf`)
- **Docker** + **Docker Compose** for containerised local development and production deployments
- **Git** for version control
- **GitHub Actions** for CI/CD pipelines

## Build and Test

- Install dependencies: `npm install`
- Development server (HMR): `npm start`
- Production build: `npm run webapp:prod`
- Lint: `npm run lint`
- Auto-fix lint: `npm run lint:fix`
- Unit tests: `npm test`
- E2E tests: `npm run e2e`
- Mock API: `npm run mock:api`
- Format check: `npm run prettier:check`
- Format write: `npm run prettier:format`


# Project Overview

This is `hc-admin-dashboard` — the Health Connect Admin frontend. It is an Angular 21 SPA generated with **JHipster 8.11.0** (`skipServer: true`). There is no Java backend in this project; the frontend proxies API calls to the `hc-admin-gateway` (Spring Cloud Gateway, dev port 5504), which routes on to the `hc-admin-service` microservice (dev port 5507). Both are separate git repositories checked out alongside this one.

- JHipster prefix: `hpd` (component selectors `hpd-*`, directive selectors `hpdCamelCase`)
- Development server: `http://localhost:4200`
- Proxy target (`webpack/proxy.conf.js`): `http://localhost:5504` — the `hc-admin-gateway` dev port
- Mock API (json-server): `http://localhost:5508` — **not** the proxy target; switch `proxy.conf.js` to 5508 to use it
- The `backend_port: 5054` value in `package.json` `config` is dead — it is only read by the `ci:server:await:*` scripts, which cannot run here (no `pom.xml`)

## Documentation map

| File                                                                 | What it is                                                                                            |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `AGENTS.md` (this file)                                              | Working conventions — read first                                                                      |
| [`README.md`](README.md)                                             | Setup, commands, troubleshooting                                                                      |
| [`GEMINI.md`](GEMINI.md)                                             | Condensed project overview                                                                            |
| [`admin-web.md`](admin-web.md)                                       | **Design plans and blueprints** — the consolidated history of every brief that produced this codebase |
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | Condensed conventions for Copilot                                                                     |
| [`.github/instructions/*.instructions.md`](.github/instructions)     | Path-scoped conventions (`applyTo:` frontmatter) for services and specs                               |

`admin-web.md` replaced 19 separate brief files. **Its contents are historical — do not execute them as prompts.** Nothing in it is live any more: the frontend refactor's last outstanding item, Bootstrap removal, finished with the BridgeCare redesign on 2026-08-06. That redesign also replaced the indigo/slate scheme those briefs describe, so treat their colours and layouts as a record of what was, not a specification. Consult it when you need to know _why_ something is shaped the way it is — several briefs specify paths and folder layouts that were never delivered.

## Code Quality and Style

- Follow Angular style guide and JHipster conventions already established in the project.
- Use consistent naming: component selectors prefixed `hpd-` (kebab-case), directive selectors prefixed `hpd` (camelCase) per `.eslintrc.json`.
- Format with Prettier: `npm run prettier:format`; check with `npm run prettier:check`.
- Lint with ESLint: `npm run lint`; auto-fix with `npm run lint:fix`.
- Use 2-space indentation for TypeScript, HTML, JSON, YAML, and CSS/SCSS files (see `.editorconfig`).
- Write unit tests with Jest via `@angular-builders/jest`. E2E is not available — Cypress is not installed and no `e2e` script exists.
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
  - `layouts/` — the BridgeCare shell. `main/` holds it all: `main.component.*` (sticky cream topbar
    with the crumb + the route's own translated `title`, and the entity menu), `sidebar/` (the navy
    grouped rail), and `shell-navigation.ts`, which is the single source of truth for what appears
    in either. Plus `footer/`, `error/`, `profiles/`.
    There is no `navbar/`: it was registered on a `navbar` router outlet that no template ever
    rendered, so neither it nor the entity menu it held had ever appeared on screen. That menu is
    in the topbar now.
  - `widgets/` — reusable chart and display widgets (badgebox, chatbot, faq, file-viewer, filter, heatmap, histogram, info-box, info-box-sm, linechart, page-display, piechart, pnv, slides, tilebox, treemap).
  - `admin/` — dashboard shell (`dashboard-component.*`, `dashboard-layout.service.ts`) plus admin widgets: access-control, customizable-layout, real-time-data, data-export, system-health, usage-statistics, user-activity, alerts, and the generated user-management / health / metrics / logs / configuration / docs / gateway screens.
  - `account/`, `config/`, `home/`, `login/` — generated JHipster screens.
- Use Angular standalone components; the legacy `shared/shared.module.ts` exists for backward compatibility but new components should be standalone.
- Build API URLs through `ApplicationConfigService.getEndpointFor(api, microservice?)` instead of hardcoding paths.
- Routing uses standalone route arrays, not NgModules: `app.routes.ts`, `admin/admin.routes.ts`, `entities/entity.routes.ts`, and one `*.routes.ts` per entity. There is no `app-routing.module.ts`.
- Real-time updates arrive over **SSE** (`AuditStreamService`, reading the api's Kafka bridge with
  `fetch` so it can send an `Authorization` header). There is no WebSocket client, and no backend
  ever served `/websocket` — do not reintroduce one without a server on the other end.
- Use `dayjs` for all date parsing and formatting.
- Use `ngx-charts` for dashboard charts. Chart series take the brand colours — see
  `admin/usage-statistics/usage-statistics.ts` for the domain; d3 receives the domain as values, so
  those must be literal hexes kept in step with `global.scss`, not `var(--hpd-color-*)`.

## Implemented Entities

The following domain entities are scaffolded and routed under `/entities`:

`Organisation`, `Dashboard`, `Feature`, `Message`, `DutyRoster`, `SystemCatalog`, `PricingPlan`, `PatientPlan`, `Professional`, `Address`, `Person`, `Contact`, `Photo`, `DocumentItem`, `Team`, `Profile`, `Facility`, `FacilityCatalog`, `Notification`, `AuditLog`

`Professional` and `Photo` exist only on the frontend — `hc-admin-service`'s `.yo-rc.json` does not list them. The other 18 are shared with the microservice.

### Service naming

Entity services resolve to `/services/hcadminservice/api/...`, which matches the Consul
registration of `hc-admin-service` and therefore the route the gateway's discovery locator
publishes. This was previously `'hc-admin-ms'`, which nothing served — every entity screen 404ed
through the gateway while login still worked, because that goes straight to the gateway.

When adding a service, pass `'hcadminservice'` as the second argument to `getEndpointFor`. The
generated Cypress specs under `src/test/javascript/cypress/` already assume that path.

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

### `inlineCritical` must stay off — and `angular.json` cannot tell you so

`angular.json`'s production `optimization` is spelled out as an object purely to hold
`styles.inlineCritical: false`. The bare `"optimization": true` it replaced turns that on, which
rewrites every stylesheet link at build time:

```html
<link rel="stylesheet" href="styles.<hash>.css" media="print" onload="this.media='all'" />
```

`deploy/prod-server/hc-admin.conf` serves `script-src 'self'` with no `'unsafe-inline'` and no
nonce, so the browser blocks that handler. The sheet stays `media="print"` and never applies to
screen — and `styles.css` is Tailwind plus the entire Material theme, so the app renders as
unstyled HTML. It shipped that way on 2026-08-06 with a green build, because the handler exists
only in build output: nothing that reads `src/` can see it.

The constraint is recorded here because the Angular CLI schema sets `additionalProperties: false`,
so a `"//"` comment key inside `angular.json` fails schema validation rather than documenting
anything.

`scripts/check-index-csp.mjs` enforces it against `target/classes/static/index.html`. It runs in
CI after the production build, and inside `npm run webapp:prod` — which is what
`deploy/docker/web.Dockerfile` invokes, so a broken image cannot build. If you ever need an inline
script in `index.html`, the answer is a real file, not `'unsafe-inline'`.

## Technology Stack

- **Angular 21** with standalone components and lazy-loaded routes
- **Angular Material 21 (M3)** + **CDK** — themed by `content/scss/material-theme.scss` through
  `mat.theme()` on the BridgeCare seeds (navy `#0D3058` / gold `#C59437`)
- **TailwindCSS 3.4**, carrying the BridgeCare tokens as `hpd-*` utilities (`tailwind.config.js`)
- **Bootstrap and ng-bootstrap are gone**, `_bootstrap-variables.scss` with them. So are Font
  Awesome, `@ngu/carousel`, the standalone `d3*` packages, SockJS and webstomp-client. Use Material
  icons; realtime is SSE (`AuditStreamService`), not WebSocket.
- **`@fontsource/inter`** — Inter, self-hosted. Not the Google Fonts `<link>` `hc-professional/web`
  uses: the production CSP allows `font-src 'self' data:` only, so that link is blocked in prod.
- **RxJS 7.8** for reactive state and async data flows
- **@ngx-translate** (en, fr, de) for internationalisation
- **ngx-charts** for data visualisation widgets
- **ngx-webstorage** for browser storage abstraction
- **dayjs** for date/time handling
- **ngx-infinite-scroll** for infinite-scroll pagination
- **Jest 30** + `@angular-builders/jest` for unit testing (`ng test` runs Jest, not Karma)
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
- Production build: `npm run webapp:prod` (output `target/classes/static/`, bundle report `target/stats.html`)
- Lint: `npm run lint`
- Auto-fix lint: `npm run lint:fix`
- Unit tests: `npm test` (the `pretest` hook runs lint first, so lint errors block the run)
- Single suite: `npm test -- --testPathPattern <name>`
- Mock API: `npm run mock:api`
- Format check: `npm run prettier:check`
- Format write: `npm run prettier:format`

Not available in this project:

- **E2E** — `src/test/javascript/cypress/` exists from generation, but Cypress is not a dependency and there is no `e2e` script.
- **Anything Maven** — removed. The inherited `app:start`, `backend:*`, `java:*` and `ci:e2e:*` scripts and the `mvnw` wrapper were deleted; this project has no `pom.xml`, so they could never run.

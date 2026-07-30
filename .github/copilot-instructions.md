# Project Guidelines

## Code Style

- This project is an Angular dashboard generated with JHipster.
- Follow `.editorconfig` indentation rules:
  - 2 spaces for `ts/js/json/yml/html/css/scss` files.
  - 4 spaces for Markdown files.
- Follow ESLint selector conventions from `.eslintrc.json`:
  - Component selector prefix: `hpd` with kebab-case.
  - Directive selector prefix: `hpd` with camelCase.
- Use Prettier for formatting:
  - `npm run prettier:check`
  - `npm run prettier:format`

## Architecture

- Frontend source root is `src/main/webapp` (configured in `angular.json`).
- Keep responsibilities separated by existing folders under `src/main/webapp/app`:
  - `core`: authentication, interceptors, app config, low-level utilities.
  - `shared`: reusable UI helpers, pipes, shared module pieces.
  - `entities`: entity modules/services/models and CRUD UI.
  - `layouts`: shell/layout components.
- Keep route-level boundaries in the standalone route arrays: `app.routes.ts`, `admin/admin.routes.ts`, `entities/entity.routes.ts`, and one `*.routes.ts` per entity. There is no `app-routing.module.ts` — this project uses standalone components with `loadComponent`/`loadChildren`, not NgModules.
- Build API URLs through `ApplicationConfigService.getEndpointFor(...)` instead of hardcoding service paths.

## Build And Test

- Install dependencies: `npm install`
- Development server: `npm start`
- Production web build: `npm run webapp:prod`
- Lint: `npm run lint`
- Auto-fix lint issues: `npm run lint:fix`
- Unit tests: `npm test` (runs Jest through `@angular-builders/jest`; `pretest` runs lint first)
- Single suite: `npm test -- --testPathPattern <name>`
- E2E: not runnable — `src/test/javascript/cypress/` exists but Cypress is not installed and no `e2e` script is defined
- Maven scripts and the `mvnw` wrapper have been removed — this project has no `pom.xml`. Every script left in `package.json` works.

## Conventions

- Prefer existing npm scripts in `package.json` over ad-hoc commands.
- Use Inject and Signal patterns for services and auth state management.
- Keep entity patterns consistent (model interface + class + identifier helper and typed service CRUD methods).

## Environment Prerequisites

- Local API traffic is proxied by `webpack/proxy.conf.js` to `http://localhost:5504` (the `hc-admin-gateway` dev port); verify backend targets before debugging API issues.
- `npm run mock:api` starts json-server on port 5508, which does **not** match the proxy target — repoint `proxy.conf.js` to 5508 to use the mock.
- Known issue: entity services call `/services/hcadminservice/...`, but the microservice registers in Consul as `hcadminservice` and the gateway's static dev route is `/services/admin-service/**`. Entity endpoints 404 through the real gateway until these are reconciled.

## Key References

- `AGENTS.md` for agents key instructions and memory
- `README.md` for developer workflows and testing setup.
- `package.json` for canonical scripts.
- `angular.json` for build/source-root configuration (source root `src/main/webapp`, test builder `@angular-builders/jest:run`).
- `src/main/webapp/app/app.routes.ts` for top-level route boundaries.

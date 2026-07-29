# hc-admin-dashboard — Design Plans & Blueprints

Consolidated record of the design briefs that produced this frontend. It replaces 19 separate files — `dashboard-redesign.md`, `hc-admin-db-cleanup.md`, `summary.md`, and the 16 briefs under `.github/` — which were merged here and deleted.

**Almost all of these are historical plans, not specifications to execute.** Where a brief was implemented and the delivered code diverges, the code is the authority and the divergence is recorded. The one exception is the [frontend refactor](#7-frontend-refactor-still-open), which is still an open goal.

Live docs that stay separate and are still current: [`README.md`](README.md) for setup and commands, [`AGENTS.md`](AGENTS.md) / [`GEMINI.md`](GEMINI.md) / [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for working conventions, and [`.github/instructions/*.instructions.md`](.github/instructions) for the path-scoped service and test conventions (those use `applyTo:` frontmatter and must stay where they are to keep working).

---

## Contents

1. [Shared conventions across all component briefs](#1-shared-conventions-across-all-component-briefs)
2. [Application shell](#2-application-shell) — main layout, toolbar, sidebar
3. [Entity component briefs](#3-entity-component-briefs) — catalog, facilities, messages, pricing, profiles, teams, duty roster, dashboard
4. [Admin dashboard](#4-admin-dashboard) — 10-iteration widget plan and the redesign that followed
5. [Operator dashboard redesign](#5-operator-dashboard-redesign)
6. [Mock API setup](#6-mock-api-setup)
7. [Frontend refactor (still open)](#7-frontend-refactor-still-open)
8. [Mock-data cleanup](#8-mock-data-cleanup)
9. [Delivery record](#9-delivery-record)

---

## 1. Shared conventions across all component briefs

Every entity brief repeated the same preamble. Stated once here:

- **Angular 19+** — standalone components, Signals for state, new control flow (`@if`, `@for`, `@switch`). No `*ngIf`, no `*ngFor`, no `Observable` for local UI state.
- **Tailwind CSS** for all styling and layout. Angular Material for components (`MatTabsModule`, `MatTableModule`, `MatIconModule`, `MatButtonModule`, `MatDialogModule`, `MatMenuModule`, `MatTooltipModule`).
- **Selector prefix `hpd-`**, `standalone: true`.
- **Dummy data** in the component to demonstrate layout, with the intent of swapping to a real service later.
- Common imports: `Component`, `inject`, `signal`, `computed` from `@angular/core`; `CommonModule` from `@angular/common`.

### ⚠ Two path conventions in the briefs were wrong

1. Every brief wrote `/src/webapp/app/...`. The real source root is **`src/main/webapp/app/`**.
2. Briefs import from `'../../services/<name>-service'` and `'../../components/dialogs/<name>-dialog'`. **Neither `app/services/` nor `app/components/dialogs/` exists.** Services live at `app/entities/<entity>/service/`, and dialogs shipped inside the entity folder (e.g. `entities/system-catalog/system-catalog-dialog.ts`, `entities/pricing-plan/price-plan-dialog.ts`).

### ⚠ Delivered structure differs from "a single standalone file"

The briefs each asked for one self-contained file. In delivery, every entity except `duty-roster` has the **full generated JHipster CRUD structure** — `list/`, `detail/`, `update/`, `delete/`, `route/`, `service/`, `*.model.ts`, `*.routes.ts`, `*.test-samples.ts` — sitting alongside the standalone component from the brief. Both exist; they are not alternatives.

### ⚠ Routes differ from the briefs

Briefs specify routes like `/catalog`, `/facilities`, `/messages`. Actual routing is through `entities/entity.routes.ts` under an `/entities` prefix, using the entity's kebab-case name (`/entities/system-catalog`, `/entities/facility`, `/entities/message`, …).

---

## 2. Application shell

### Main layout — implemented

Delivered at `src/main/webapp/app/layouts/main/`: `main.component.{ts,html,scss,spec.ts}` plus child components `admin-menu`, `chat-menu`, `language-menu`, `setting-menu`, `sidebar`, and **`toolbar`** (an extra beyond the five the brief listed).

The brief called for a responsive Angular Material shell — `mat-toolbar` over `mat-sidenav-container` — with:

- `BreakpointObserver` from Angular CDK converted to a Signal via `toSignal` for `isHandset`
- `toggleSidenav()` driving the `#mainSidenav` reference
- `hasAnyAuthority(role)` gating the admin menu: `@if (hasAnyAuthority('ROLE_ADMIN')) { <hpd-admin-menu /> }`
- sidenav `[mode]="isHandset() ? 'over' : 'side'"` and `[opened]="!isHandset()"`
- a version string rendered in the toolbar

Angular Material 19 and CDK are installed and used here — this is the main place Material appears in the app.

### Sidebar — implemented

Delivered at `layouts/main/sidebar/sidebar.component.{ts,html,scss,spec.ts}`. Briefed as a polished, accessible sidebar for the "HealthConnect" medical dashboard, covering: a collapsible container, a header/logo area acting as the collapse trigger, role-filtered navigation links, and a user profile widget at the foot. Angular 19 standalone + Signals + Tailwind throughout.

---

## 3. Entity component briefs

Eight briefs, one per screen. All were implemented. Shared conventions are in [section 1](#1-shared-conventions-across-all-component-briefs); only the distinctive parts are recorded below.

| Brief      | Component                | Selector             | Briefed route  | Delivered at                                |
| ---------- | ------------------------ | -------------------- | -------------- | ------------------------------------------- |
| catalog    | `SystemCatalogComponent` | `hpd-system-catalog` | `/catalog`     | `entities/system-catalog/system-catalog.ts` |
| facilities | `FacilityComponent`      | `hpd-facility`       | `/facilities`  | `entities/facility/facility.ts`             |
| message    | `MessageComponent`       | `hpd-messages`       | `/messages`    | `entities/message/message.ts`               |
| priceplan  | `PricingPlanComponent`   | `hpd-pricing-plan`   | `/price-plans` | `entities/pricing-plan/pricing-plan.ts`     |
| profile    | `ProfileComponent`       | `hpd-profile`        | `/profiles`    | `entities/profile/profile.ts`               |
| teams      | `TeamComponent`          | `hpd-team`           | `/teams`       | `entities/team/team.ts`                     |
| dutyroster | `DutyRosterComponent`    | `hpd-duty-roster`    | `/duty-roster` | `entities/duty-roster/duty-roster.ts`       |
| dashboard  | `DashboardComponent`     | `hpd-dashboard`      | —              | `entities/dashboard/dashboard-component.ts` |

### Content management (catalog)

A CMS for public-facing content — About Us, Terms of Service, Privacy Policy, Products, FAQs. Header "Content Management" / "Manage public facing content and policies." Layout `grid grid-cols-1 lg:grid-cols-3 gap-6`; left pane (`lg:col-span-2`) holds a `mat-tab-group` over `tabTypes` with a Material table bound to `filteredData()`; right pane holds an audit trail. Create is gated by `state.canAccess('SYSTEM_CATALOG', 'CREATE')`.

```typescript
export type CatalogType = 'ABOUT' | 'TERMS' | 'PRIVACY' | 'PRODUCTS' | 'FAQ';

export interface CatalogItem {
  id: string;
  type: CatalogType;
  title: string;
  content: string;
  updatedAt: string;
}
```

### Facilities

Manage facilities plus associated personnel. Table columns: Name, Location, Type, Capacity, Contact, Updated At, Actions. Below the table, a panel lists personnel for the selected facility. A slide-in audit-trail sidebar toggles via `toggleAuditTrail()` and renders `auditEvents` with icons, timestamps, and colour-coded badges. Guarded by `state.canAccess('FACILITY', 'CREATE')`.

```typescript
export interface Facility {
  id: string;
  name: string;
  location: string;
  type: 'Hospital' | 'Clinic' | 'Laboratory' | 'Pharmacy';
  capacity: number;
  contact: string;
  updatedAt: string;
}
```

### Communication centre (messages)

A two-panel inbox: message list collapses from `w-full` to `w-[30%]` when a message is selected. Full-height flex layout `h-[calc(100vh-8rem)]`. Header carries a search input bound to `searchQuery.set(...)` and a pill-style category filter (All, Urgent, Inquiry, System). Rows show a read/unread icon (`mail_outline` vs `mark_email_unread`), sender, date, category badge via `getCategoryClasses(...)`, and bold text when unread. Includes a template-based reply system.

```typescript
export type MessageCategory = 'Urgent' | 'Inquiry' | 'System' | 'Other';

export interface Message {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  category: MessageCategory;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}
```

### Subscription plans (pricing)

Card grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`, one card per plan, `hover:scale-[1.01]`. The `MELON` tier is styled as a dark feature card (`bg-slate-900 text-white border-slate-800`) against white for the rest. Header "Subscription Plans" / "Configure service tiers and feature accessibility." Guarded by `state.canAccess('PRICE_PLANS', 'CREATE')`.

### User profiles

Header "User Profiles" / "Manage patient, vendor, and user records." A pill row of profile-type tabs built from `@for (type of profileTypes; track type)`, active tab styled `bg-indigo-600 text-white border-indigo-600`. Guarded by `state.canAccess('PROFILES', 'CREATE')`.

### Teams

Header "Team Management" with an add button. Table columns: name, description, members (rendered as member names), last updated, and actions (edit, delete, manage members). Toggleable audit-trail sidebar rendering recent events as a timeline.

### Duty roster

Header "Duty Roster" / "Manage staff shifts and auto-assignment schedules." An Auto-Schedule button calls `autoSchedule()`, disables on `isScheduling()`, and swaps its label for a `mat-spinner` while running. Body groups shifts by day: `@for (day of rosterGroups(); track day.date)`, date header formatted `EEEE, MMM d`, then a `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` of shift cards. Gated by `state.canAccess('DUTY_ROSTER', 'CREATE' | 'UPDATE')`.

> **⚠ Duty roster is the odd one out.** `entities/duty-roster/` contains only `duty-roster.ts`, `duty-roster.html`, and `duty-roster.spec.ts` — no model, service, routes, or CRUD subfolders — and it has **no entry in `entities/entity.routes.ts`**, so the component is currently unreachable through `/entities` navigation. `DutyRoster` is listed as an entity in `.yo-rc.json`, so the scaffolding was either never generated or later removed.

#### Patient-centric refactor

A follow-up brief refactored the roster to a patient-centric view, where each shift is an entry in a patient's daily service plan, enforcing geographic, team, and date-range availability constraints. The backend half is in `hc-admin-service`'s `admin-api.md`. Two notes carried over from that side:

- There is **no `Shift` or `PatientProfile` document**. A shift _is_ a `DutyRoster` record, carrying `patientId` and `geographicSpaceId` directly.
- `Unavailability` shipped as `UnavailabilityPeriod`.
- The API is at `/api/duty-rosters` (`POST /auto-schedule`, `GET /patient/{patientId}`), not the `/api/v1/roster` the brief proposed.

---

## 4. Admin dashboard

### Core administration dashboard

The umbrella brief: a web interface for administrators to manage duty rosters, system catalogs, pricing plans, and user profiles, backed by `hc-admin-service`. Briefed sections — Dashboard Home (analytics overview: system health, user activity, recent notifications), Messages, Duty Rosters (with drag-and-drop scheduling and real-time updates), System Catalogs, Pricing Plans, User Profiles, Notifications.

Two corrections to that brief:

- API calls must use **`hcadminservice`**, not `hc-admin-ms` — see the "Known issue" in [`README.md`](README.md).
- Authentication is `jwt` in `.yo-rc.json`, issued by `hc-admin-gateway`, not a full OAuth2/SSO provider flow.

### Widget plan — iterations 1–10, completed

| Iteration | Deliverable                                                                           | Shipped at                                                       |
| --------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1         | Main dashboard component + user activity widget                                       | `admin/user-activity/`                                           |
| 2         | System health widget; sidebar "System Admin" link to `/admin/dashboard`, `ADMIN`-only | `admin/system-health/`                                           |
| 3         | Usage statistics widget                                                               | `admin/usage-statistics/`                                        |
| 4         | Alerts widget with thresholds                                                         | `admin/alerts/`                                                  |
| 5         | Data export component                                                                 | `admin/data-export/`                                             |
| 6         | Access control component                                                              | `admin/access-control/`                                          |
| 7         | Customizable layout component                                                         | `admin/customizable-layout/`                                     |
| 8         | Real-time data component                                                              | `admin/real-time-data/`                                          |
| 9         | Integration and end-to-end testing                                                    | partial — Jest coverage added, no E2E (Cypress is not installed) |
| 10        | Final documentation                                                                   | `README.md` admin dashboard section                              |

Alpha was pegged to iteration 5, beta to 8, final to 10. The dashboard is served at `/admin/dashboard` for `ROLE_ADMIN`. Layout preferences persist through `ngx-webstorage` via `admin/dashboard-layout.service.ts`, so widget visibility and ordering survive refreshes. Export actions produce frontend-generated JSON and CSV snapshots from the existing admin users, health, and metrics endpoints.

### Redesign — completed

A follow-up UI/UX brief reworked the shell without changing widget data sources:

- top navigation + sidebar + vertically stacked content, **maximum one widget per row**
- widgets grouped into functional sections: User management, Operations, Analytics, Admin tools
- per-widget window modifiers — minimize, maximize/restore, close
- quick-access widget actions in the top bar so hidden widgets can be reopened and focused
- every widget closable and reopenable, including the layout widget itself
- fully responsive across mobile, tablet, desktop

Delivered as **flat files** in `src/main/webapp/app/admin/` — `dashboard-component.{ts,html,scss,spec.ts}` and `dashboard-layout.service.{ts,spec.ts}` — not in a `dashboard/` subfolder as the brief's closing line implied.

---

## 5. Operator dashboard redesign

A separate brief for the **operator** dashboard, distinct from the admin one above. Goals: simplified navigation, cleaner typography and colour, quick-access widgets for frequently used features, full responsiveness, and removal of non-operational features to keep the interface focused on operations.

Relevant code: the entity dashboard at `entities/dashboard/` (`dashboard-component.{ts,html,scss}`, `dashboard-state.ts`) and the reusable widgets in `app/widgets/`. `ROLE_OPERATOR` is a real authority — it exists on the gateway as `AuthoritiesConstants.OPERATOR` and is seeded as the `operator` account — so the operator-only scoping this brief describes is backed by real access control.

Widgets in `app/widgets/` may be reused when adding dashboard metrics, but should not be modified in place, since other dashboards depend on them.

---

## 6. Mock API setup

Already set up: `json-server` is installed, `db.json` and `routes.json` exist in the project root, and `mock:api` is defined as `json-server --watch db.json --routes routes.json --port 5508`.

**The proxy does not point at the mock by default.** `webpack/proxy.conf.js` targets `http://localhost:5504` — the `hc-admin-gateway` dev port — so `npm start` talks to the real gateway. To use the mock instead, change `target` to `http://localhost:5508`:

```javascript
function setupProxy({ tls }) {
  const serverResources = ['/api', '/services', '/management', '/v3/api-docs', '/h2-console', '/auth', '/health', '/websocket'];
  return [
    {
      context: serverResources,
      target: `http://localhost:5508`, // mock server; 5504 for the real gateway
      secure: false,
      changeOrigin: false,
    },
  ];
}
```

Then run `npm run mock:api` in one terminal and `npm start` (port 4200) in another. When adding endpoints, update `db.json` and `routes.json` so the mock path keeps working.

---

## 7. Frontend refactor (still open)

**This is the one brief that is not finished.** Target: modernise to Angular 19, adopt Angular Material M3 and TailwindCSS, and entirely remove FontAwesome and Bootstrap.

| Goal                   | Status                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Angular 17 → 19        | **Done** — Angular 19.2.21, standalone components, `@if`/`@for`                                                                            |
| Adopt Angular Material | **Partial** — Material 19 + CDK installed, used by `layouts/main`, not across entity screens                                               |
| Adopt TailwindCSS      | **Partial** — Tailwind 3.4 configured, used alongside Bootstrap                                                                            |
| Remove FontAwesome     | **Effectively done** — zero `@fortawesome` / `fa-icon` references in `src/main/webapp/app`; npm packages remain and are removal candidates |
| Remove Bootstrap       | **Not done** — `bootstrap/scss/bootstrap` is still imported by `content/scss/vendor.scss`, and ng-bootstrap is used in ~39 files           |

The "no NgModules" rule is already satisfied — there are no `@NgModule` declarations left to migrate.

### Scope boundaries

**You may:** rename symbols across `.ts`/`.html`/`.scss`; restructure component logic; update imports; fix ESLint and selector-prefix violations; match Prettier settings (printWidth 140, singleQuote, 2-space indent); update `*.spec.ts` to match; add or update lazy-loaded routes in the standalone route arrays.

**You must not:** modify Java, XML, YAML, or `pom.xml`; change `webpack/proxy.conf.js` or backend config; delete files without confirming nothing imports them; change the API URL pattern (always `ApplicationConfigService.getEndpointFor(...)`); introduce blocking patterns in services that return `Observable`.

**Preserve:** all JHipster translation directives (`jhiTranslate`, `[translate]`, `[translateValues]`) — never hardcode previously internationalised text — and core structural directives like `*jhiHasAnyAuthority`.

### Iconography migration

Strip FontAwesome (`fa`, `fas`, `fab` classes, `<fa-icon>` components) and replace contextually with `<mat-icon>` using the most semantically accurate Material Symbol.

---

## 8. Mock-data cleanup

Brief: remove hardcoded mock data from the frontend and replace it with `HttpClient` fetching, enforcing separation of concerns.

Patterns to hunt for: `const MOCK_DATA = [...]`, `of([...])` simulating API calls, `new BehaviorSubject([...])` seeded with static arrays, and component properties initialised with literal arrays.

**Status:** entity services now fetch through `HttpClient` + `ApplicationConfigService.getEndpointFor(...)` as intended. But mock data has _not_ been fully eliminated, and should not be — `db.json` and `routes.json` deliberately back the `npm run mock:api` workflow described in [section 6](#6-mock-api-setup). The entity component briefs in [section 3](#3-entity-component-briefs) also each specify dummy data for layout demonstration.

Two corrections to the original text: the source directory is `src/main/webapp/app/`, not `src/app/`; and the repository is `hc-admin-dashboard` — `hc-admin-db` is an older name that survives only in these briefs.

---

## 9. Delivery record

Captured from the working summary at the time the dashboard work completed.

**Iterations 6–10**, built on the iteration-5 data-export work:

1. Access Control widget at `app/admin/access-control/`
2. Customizable Layout widget plus shared `DashboardLayoutService` persisting widget visibility and ordering
3. Real-time Data widget at `app/admin/real-time-data/`, reusing the dashboard audit/event state
4. `app/admin/dashboard-component.{ts,html}` extended to render widgets from persisted layout state
5. `ngx-webstorage` services wired up in `app/app.config.ts`
6. `app/entities/dashboard/dashboard-state.ts` updated so multiple widgets can share the live audit trail connection
7. Jest coverage for the new widgets and layout state
8. `README.md` updated with dashboard usage, widgets, layout persistence, and export behaviour

**Redesign**, applied afterwards — see [section 4](#4-admin-dashboard). Files touched: `app/admin/dashboard-component.{ts,html,scss,spec.ts}` and `app/admin/dashboard-layout.service.{ts,spec.ts}`.

# CatalogComponent Master Prompt

You are an expert Angular developer tasked with creating a standalone `SystemCatalogComponent`.
Create a single standalone file at `/src/webapp/app/entities/system-catalog/system-catalog.ts`.
Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management.
For all styling and layouts, strictly use Tailwind CSS utility classes.

This component will serve as a content management interface for a healthcare management system, allowing administrators to manage public-facing content such as "About Us", "Terms of Service", "Privacy Policy", "Products", and "FAQs". The design should be clean, modern, and responsive, utilizing CSS grid for layout and Tailwind for styling. The component should also include interactive elements such as modals for adding/editing content and an audit trail sidebar to track changes.

The route /catalog should render this component from the sidebar links, so ensure it is self-contained and uses system-catalog-service, system-catalog-model, and system-catalog-dialog.
Use dummy data for all content items and audit events to demonstrate the layout and functionality from system-catalog-service.

## General Component Config
- **File**: `/src/webapp/app/entities/system-catalog/system-catalog.ts`
- **Imports**: 
  - `Component`, `inject`, `signal`, `computed` from `'@angular/core'`
  - `CommonModule` from `'@angular/common'`
  - `MatTabsModule` from `'@angular/material/tabs'`
  - `MatTableModule` from `'@angular/material/table'`
  - `MatIconModule` from `'@angular/material/icon'`
  - `MatButtonModule` from `'@angular/material/button'`
  - `MatDialogModule`, `MatDialog` from `'@angular/material/dialog'`
  - `SystemCatalogService` from `'../../services/system-catalog-service'`
  - `SystemCatalogDialogComponent` from `'../../components/dialogs/system-catalog-dialog'`
  - `DashboardStateService` from `'../../services/dashboard-state'`
- **Selector**: `hpd-system-catalog`
- **Standalone**: `true`

## Interfaces and Data Types
At the top of the file, define interfaces and types:
```typescript
export type CatalogType = 'ABOUT' | 'TERMS' | 'PRIVACY' | 'PRODUCTS' | 'FAQ';

export interface CatalogItem {
  id: string;
  type: CatalogType;
  title: string;
  content: string;
  updatedAt: string;
}

export interface CatalogAuditEvent {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  message: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}
```

## Component Class Definition
The component class `SystemCatalogComponent` must implement the following properties and methods:

### 1. Injected Services
- `api = inject(SystemCatalogService)`
- `dialog = inject(MatDialog)`
- `state = inject(DashboardStateService)`

### 2. State & Properties
- `tabTypes`: `CatalogType[] = ['ABOUT', 'TERMS', 'PRIVACY', 'PRODUCTS', 'FAQ']`
- `activeTab`: `signal<CatalogType>('ABOUT')`
- `catalogData`: `signal<CatalogItem[]>([])`
- `columns`: `['title', 'updatedAt', 'actions']`
- `isAuditTrailOpen`: `signal(true)`
- `auditEvents`: `signal<CatalogAuditEvent[]>` initialized with 3 default items:
  1. id: '1', type: 'UPDATE', message: 'Updated Terms of Service section 4.1', timestamp: '10 mins ago', icon: 'edit_document', colorClass: 'bg-amber-100 text-amber-600'
  2. id: '2', type: 'CREATE', message: 'Added new Product "Health Monitor"', timestamp: '2 hours ago', icon: 'post_add', colorClass: 'bg-emerald-100 text-emerald-600'
  3. id: '3', type: 'DELETE', message: 'Removed deprecated FAQ entry', timestamp: '1 day ago', icon: 'delete', colorClass: 'bg-rose-100 text-rose-600'

### 3. Computed Properties
- `filteredData`: returns `this.catalogData().filter(item => item.type === this.activeTab())`

### 4. Constructor
- Call `this.loadData()`.
- Add conditional: `if (!this.state.canAccess('CATALOG', 'UPDATE') && !this.state.canAccess('CATALOG', 'DELETE')) { this.columns = ['title', 'updatedAt']; }`

### 5. Methods
- `loadData()`: Calls `this.api.get<CatalogItem[]>('/catalog').subscribe(data => this.catalogData.set(data))`
- `toggleAuditTrail()`: Toggles the `isAuditTrailOpen` signal.
- `logEvent(type: 'CREATE' | 'UPDATE' | 'DELETE', message: string)`:
  - sets `icon` directly map to values: `CREATE` -> `'post_add'`, `UPDATE` -> `'edit_document'`, `DELETE` -> `'delete'`.
  - sets `colorClass` to map to values: `CREATE` -> `'bg-emerald-100 text-emerald-600'`, `UPDATE` -> `'bg-amber-100 text-amber-600'`, `DELETE` -> `'bg-rose-100 text-rose-600'`.
  - prepends new event built with `crypto.randomUUID()` and timestamp `'Just now'` onto `auditEvents`. Keeps max length 20 utilizing `events.slice(0, 20)`.
- `openAddModal()`:
  - Guarded: `if (!this.state.canAccess('SYSTEM_CATALOG', 'CREATE')) return;`
  - Opens `SystemCatalogDialogComponent` with width `600px`, passing `data: null`.
  - On subscribe: if result exists, calls `api.post('/system-catalog', result)` and upon success calls `loadData()` and logs a 'CREATE' event with message \`Added new ${result.type} content: "${result.title}"\`.
- `openEditModal(item: SystemCatalogItem)`:
  - Guarded by 'UPDATE' permission. Passes `item` to the dialog data.
  - Subscribes with `api.put(\`/system-catalog/${item.id}\`, result)` and logs 'UPDATE' event with \`Updated ${result.type} content: "${result.title}"\`.
- `deleteItem(item: SystemCatalogItem)`:
  - Guarded by 'DELETE' permission. Wraps inside `confirm('Are you sure you want to delete this content?')`.
  - Calls `api.delete(\`/system-catalog/${item.id}\`)` and logs 'DELETE' event with \`Deleted ${item.type} content: "${item.title}"\`.

## Template Structure
Ensure the layout is wrapped in `<div class="space-y-6">`.

### 1. Header Area
- Contains an items-center justify-between flex row.
- Left side: Title "Content Management" (`text-xl font-semibold text-slate-800`), with subtext "Manage public facing content and policies." (`text-slate-500 text-xs mt-1`).
- Right side: Add Content button `(@if (state.canAccess('SYSTEM_CATALOG', 'CREATE')))` structured as `<button (click)="openAddModal()" mat-flat-button class="!bg-indigo-600 !text-white !rounded-xl !px-5 !py-5"><mat-icon iconPositionEnd>add</mat-icon>Add Content</button>`.

### 2. Main Content Grid
Flex grid layout: `<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">`.

#### Left Pane: Records (lg:col-span-2)
- Wrapper: `bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full`.
- **Top Bar**: "Records" (`text-xs font-bold uppercase tracking-widest text-slate-500`) inside a `border-b` flex header.
- **Tabs (`mat-tab-group`)**: `(selectedTabChange)="activeTab.set(tabTypes[$event.index])" class="catalog-tabs"`. Loops over `tabTypes` using `@for`. Set label via `[label]="tab"`.
- **Table container** inside each tab wrapper `div.p-4`.
  - Render an Angular Material table bound to `[dataSource]="filteredData()"` taking `.w-full`.
  - Column 1 (`title`): display `item.title`.
  - Column 2 (`updatedAt`): display `item.updatedAt | date:'mediumDate'`.
  - Column 3 (`actions`): Guard internal buttons `openEditModal` (`text-slate-400 hover:text-indigo-600`) and `deleteItem` (`text-slate-400 hover:text-rose-600`) based on correct permission evaluation inside `@if` blocks.
  - Show empty state element when `filteredData().length === 0` utilizing an open folder material icon.

#### Right Pane: Audit Trail (lg:col-span-1)
- Wrapper: `<section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300 h-full max-h-[800px]">`
- **Header toggle area**: Clickable `(click)="toggleAuditTrail()"` inside `p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 cursor-pointer`.
  - Contains history icon inside a round colored background `bg-indigo-50 text-indigo-600`.
  - Labels: "Audit Trail" with a subtext "Content changes".
  - A right-justified tag for "20 Latest" (`bg-indigo-50 text-indigo-600 rounded-full`) and an expand icon utilizing rotation logic `[class.rotate-180]="isAuditTrailOpen()"`.
- **Event List**: Wrapper conditionally displays via `@if (isAuditTrailOpen())`.
  - Loops over `auditEvents()` via `@for`. Empty state conditionally rendered.
  - Event list item styled via `group flex items-center gap-4 p-4 hover:bg-slate-50/80`.
  - Renders icon element utilizing `[class]="event.colorClass"`.
  - Displays `event.message`, `event.type`, and `event.timestamp`.

## Styles
Add this CSS block precisely to overrule mat-tab sizes:
```css
:host ::ng-deep .mat-mdc-tab-header {
  padding: 0 1.5rem;
  border-bottom: 1px solid #f4f4f5;
}
:host ::ng-deep .mat-mdc-tab-labels {
  gap: 1.5rem;
}
```

Ensure the output is 100% compliant with standard formatting, spacing, styling, and animations used above.
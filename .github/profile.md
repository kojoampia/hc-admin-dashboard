# ProfileComponent Master Prompt

You are an expert Angular developer tasked with a standalone `ProfileComponent`.
Create a single standalone file at `/src/webapp/app/entities/profile/profile.ts`.
Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management.
For all styling and layouts, strictly use Tailwind CSS utility classes.

This component will serve as a management interface for healthcare profiles within a healthcare management system. It should allow administrators to view, add, edit, and delete profile records, as well as manage associated roles and permissions. The design should be clean, modern, and responsive, utilizing CSS grid for layout and Tailwind for styling. The component should also include interactive elements such as modals for adding/editing profiles and an audit trail sidebar to track changes.

The route /profiles should render this component from the sidebar links, so ensure it is self-contained and uses profiles-service, profiles-model, and profiles-dialog.
Do not create existing services, models, or dialogs. Inspect the subfolder structure and create new ones as needed.
Adhere strictly to the existing JHipster architecture and coding conventions, ensuring the component is fully functional and visually consistent with the rest of the application.
Use dummy data for all profile records and audit events to demonstrate the layout and functionality.

## General Component Config
- **File**: `/src/webapp/app/entities/profile/profile.ts`
- **Imports**:
  - `Component`, `signal`, `computed`, `inject` from `'@angular/core'`
  - `CommonModule` from `'@angular/common'`
  - `MatIconModule` from `'@angular/material/icon'`
  - `MatTableModule` from `'@angular/material/table'`
  - `MatButtonModule` from `'@angular/material/button'`
  - `MatDialogModule`, `MatDialog` from `'@angular/material/dialog'`
  - `DashboardStateService`, `UserRole` from `'app/entities/dashboard/dashboard-state'`
  - `ProfileDialogComponent`, `ProfileData` from `'app/entities/profile/profile-dialog'`
  - `ProfileService` from `'app/entities/profile/profile-service'`
- **Selector**: `hpd-profile`
- **Standalone**: `true`

## Component Class Definition
The component class `ProfileComponent` must implement the following properties and methods:

### 1. Injected Services
- `api = inject(ProfileService)`
- `state = inject(DashboardStateService)`
- `private dialog = inject(MatDialog)`

### 2. State & Properties
- `displayedColumns`: initialized to `['name', 'type', 'status', 'actions']`
- `profileTypes`: typed as `UserRole[]` and initialized to `['USER', 'ADMIN', 'PATIENT', 'PROFESSIONAL', 'VENDOR']`
- `selectedType`: `signal<UserRole>('USER')`
- `profiles`: typed as `{ name: string, roles: UserRole[], status: string }[]` initialized with mock data:
  1. `name: 'Alice Johnson', roles: ['PATIENT'], status: 'ACTIVE'`
  2. `name: 'MediCorp Systems', roles: ['VENDOR'], status: 'VERIFIED'`
  3. `name: 'Bob Smith', roles: ['PATIENT'], status: 'INACTIVE'`
  4. `name: 'Health-Wise Labs', roles: ['VENDOR'], status: 'VERIFIED'`
  5. `name: 'Jojo Addison', roles: ['USER', 'EDITOR'], status: 'ACTIVE'`
  6. `name: 'John Doe', roles: ['ADMIN'], status: 'ACTIVE'`
  7. `name: 'Jane Smith', roles: ['PROFESSIONAL'], status: 'INACTIVE'`

### 3. Computed Properties
- `filteredProfiles`: `computed(() => { const type = this.selectedType(); return this.profiles.filter(p => p.roles.includes(type)); })`

### 4. Constructor
- Check user permissions: `if (!this.state.canAccess('PROFILES', 'UPDATE')) { this.displayedColumns = ['name', 'type', 'status']; }`

### 5. Methods
- `canEditProfile(profile: any): boolean`:
  - Returns `profile.roles.every((role: UserRole) => this.state.canAssignRole(role))` (Current user can edit if they can assign ALL of the profile's current roles).
- `openAddModal()`:
  - Guarded: `if (!this.state.canAccess('PROFILES', 'CREATE')) return;`
  - Opens `ProfileDialogComponent` via `dialog.open()` passing `width: '600px'` and `data: null`.
  - Subscribes to `afterClosed()`. If `result: ProfileData` exists:
    - If `result.roles` is non-empty, sets `selectedType` to `result.roles[0]`.
    - Unshifts the new profile into `this.profiles`: `this.profiles = [result, ...this.profiles];`.
- `openEditModal(profile: ProfileData)`:
  - Guarded: `if (!this.state.canAccess('PROFILES', 'UPDATE') || !this.canEditProfile(profile)) return;`
  - Opens `ProfileDialogComponent` passing `width: '600px'` and `data: profile`.
  - Subscribes to `afterClosed()`. If `result: ProfileData` exists:
    - Updates `this.profiles` at the specific index immutably.
    - If `result.roles` is non-empty and does not include `this.selectedType()`, sets `selectedType` to `result.roles[0]`.

## Template Structure
Ensure the layout is wrapped in `<div class="space-y-6">`.

### 1. Header Area
- Contains an items-center justify-between flex row.
- Left side: Title "User Profiles" (`text-xl font-semibold text-slate-800`), with subtext "Manage patient, vendor, and user records." (`text-slate-500 text-xs mt-1`).
- Right side: Guarded by `@if (state.canAccess('PROFILES', 'CREATE'))`. Button with `(click)="openAddModal()"` styled `mat-flat-button` with `!bg-indigo-600 !text-white !rounded-xl !px-5 !py-5`. Inner content `<mat-icon iconPositionEnd>add</mat-icon> Add Profile`.

### 2. Profile Categories List (Tabs)
- `<div class="flex gap-2">`
- Inner loop via `@for (type of profileTypes; track type)` creating buttons.
- Button attributes:
  - `(click)="selectedType.set(type)"`
  - Static styling: `px-4 py-2 rounded-xl text-xs font-bold border transition-all uppercase tracking-wider`.
  - Dynamic styling via `[ngClass]`:
    - active if `selectedType() === type`: `'bg-indigo-600 text-white border-indigo-600 shadow-sm'`
    - inactive: `'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'`
- Inner text: `{{type}}s`

### 3. Main Data Table
- Wrapper: `<div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">`
- Render Angular Material table `<table mat-table [dataSource]="filteredProfiles()" class="w-full">`.

#### Column: Name
- Header: Name. Style `!text-[10px] !uppercase !tracking-wider !text-slate-400 !font-semibold`
- Cell displays `profile.name` with class `!py-4 !text-sm !font-medium !text-slate-700`.

#### Column: Roles
- `<ng-container matColumnDef="type">`
- Header: Roles. Styled same as above.
- Cell: Uses `<div class="flex flex-wrap gap-1">` looping over `profile.roles` via `@for`. Render role inside pill tags using `px-2 py-0.5 rounded-full font-bold uppercase text-[9px]`.
- Map roles dynamically via `ngClass`:
  - `PATIENT` -> `'bg-indigo-50 text-indigo-600'`
  - `PROFESSIONAL` -> `'bg-blue-50 text-blue-600'`
  - `VENDOR` -> `'bg-amber-50 text-amber-600'`
  - `USER` or `EDITOR` -> `'bg-emerald-50 text-emerald-600'`
  - `ADMIN` -> `'bg-rose-50 text-rose-600'`

#### Column: Status
- Header: Status. Styled same as above.
- Cell: Renders `<span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-bold uppercase text-[9px]">{{profile.status}}</span>`.

#### Column: Actions
- Header: Actions. Styled same as above plus `text-right`.
- Cell: Right-aligned (`!py-4 text-right`).
- Guarded: `@if (state.canAccess('PROFILES', 'UPDATE') && canEditProfile(profile))`
- Button: `mat-icon-button (click)="openEditModal(profile)"` with `text-slate-400 hover:text-indigo-600 transition-colors`. Internal icon is `<mat-icon class="!text-lg">edit</mat-icon>`.

#### Rows
- `mat-header-row` rendering `displayedColumns` with `!h-10`.
- `mat-row` rendering columns with hover classes `hover:bg-slate-50 transition-colors border-b border-slate-50`.

Ensure the output is 100% compliant with standard formatting, spacing, styling, and animations used above.
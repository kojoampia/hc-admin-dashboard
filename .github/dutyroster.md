# DutyRosterComponent Master Prompt

You are an expert Angular developer tasked with creating a standalone `DutyRosterComponent`.
Create a single standalone file at `/src/webapp/app/entities/duty-roster/duty-roster.ts`.
Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management.
For all styling and layouts, strictly use Tailwind CSS utility classes.

This component will serve as a staff scheduling interface within a healthcare management system, allowing administrators to view and manage duty rosters for various roles such as doctors, nurses, pharmacists, and front desk staff. The design should be clean, modern, and responsive, utilizing CSS grid for layout and Tailwind for styling. The component should also include an auto-scheduling feature that assigns staff to shifts based on predefined rules and availability. The route /duty-roster should render this component from the sidebar links, so ensure it is self-contained and does not rely on external services or state. Use dummy data for all shifts to demonstrate the layout and functionality.

The route /duty-roster should render this component from the sidebar links, so ensure it is self-contained and does not rely on external services or state. Use dummy data for all shifts to demonstrate the layout and functionality.

## General Component Config

- **File**: `/src/webapp/app/entities/duty-roster/duty-roster.ts`
- **Imports**:
  - `Component`, `inject`, `signal`, `computed` from `'@angular/core'`
  - `CommonModule` from `'@angular/common'`
  - `MatIconModule` from `'@angular/material/icon'`
  - `MatButtonModule` from `'@angular/material/button'`
  - `MatProgressSpinnerModule` from `'@angular/material/progress-spinner'`
  - `DutyRosterService` from `'../../services/duty-roster'`
  - `DashboardStateService` from `'../../services/dashboard-state'`
  - `finalize` from `'rxjs'`
- **Selector**: `hpd-duty-roster`
- **Standalone**: `true`

## Interfaces and Data Types

At the top of the file, define interfaces and types:

```typescript
export interface Shift {
  id: string;
  date: string;
  shiftName: string;
  requiredRole: string;
  assignedUser?: string;
  status: 'ASSIGNED' | 'UNASSIGNED';
}
```

## Component Class Definition

The component class `DutyRosterComponent` must implement the following properties and methods:

### 1. Injected Services

- `private api = inject(DutyRosterService)`
- `state = inject(DashboardStateService)`

### 2. State & Properties

- `shifts`: `signal<Shift[]>([])`
- `isScheduling`: `signal(false)`

### 3. Computed Properties

- `rosterGroups`: `computed(() => { ... })`
  - Groups the `shifts()` array by `date`.
  - Returns an array in the shape `{ date: string, shifts: Shift[] }[]` sorted alphabetically by date.

### 4. Constructor

- Call `this.createMockShifts()`.

### 5. Methods

- `createMockShifts()`:
  - Generates 4 days of mock data starting from today.
  - Roles: `'DOCTOR', 'NURSE', 'PHARMACIST', 'FRONT_DESK'`
  - Shifts: `'Morning Shift', 'Afternoon Shift', 'Night Shift'`
  - Set `status` randomly to `'ASSIGNED' | 'UNASSIGNED'` (using 50% chance).
  - Set `assignedUser` to `'John Doe'` if assigned.
  - Updates `shifts` signal with the generated mock array.
- `autoSchedule()`:
  - Guarded: `if (!this.state.canAccess('DUTY_ROSTER', 'CREATE') && !this.state.canAccess('DUTY_ROSTER', 'UPDATE')) return;`
  - Sets `isScheduling` to true.
  - Calls `this.api.post<Shift[]>('/hc-admin-ms/shifts/auto-schedule', {})`
  - Uses `pipe(finalize(() => this.isScheduling.set(false)))`.
  - In `subscribe({ next: (resolvedRoster) => { ... }, error: () => { ... } })`:
    - On success: If a valid non-empty array is returned, `this.shifts.set(resolvedRoster)`. Else, simulate success by mapping all elements into status 'ASSIGNED' with `assignedUser: s.assignedUser || 'Auto Assigned User'`.
    - On error: Add a fallback that maps all elements into status 'ASSIGNED', using 'Smart Scheduled Staff' as the default `assignedUser`.

## Template Structure

Ensure the layout is wrapped in `<div class="space-y-8">`.

### 1. Header Area

- Contains an items-center justify-between flex row.
- Left side: Title "Duty Roster" (`text-xl font-semibold text-slate-800`), with subtext "Manage staff shifts and auto-assignment schedules." (`text-slate-500 text-xs mt-1`).
- Right side: Auto Schedule wrapper `div.flex.gap-4`.
  - Conditionally rendered via `@if (state.canAccess('DUTY_ROSTER', 'CREATE') || state.canAccess('DUTY_ROSTER', 'UPDATE'))`.
  - `<button>` with `(click)="autoSchedule()"` and `[disabled]="isScheduling()"`.
  - Button styling: `mat-flat-button class="!bg-indigo-600 !text-white !rounded-xl !px-5 h-10 shadow-md !text-[10px] !font-bold !uppercase !tracking-tighter"`.
  - Button content: Conditionally display a `<mat-spinner diameter="16" class="mr-2 inline-block"></mat-spinner> Scheduling...` if `isScheduling()` is true, otherwise "Auto-Schedule".

### 2. Main Content

- Wrapper: `<div class="space-y-12">`
- Inner loop: `@for (day of rosterGroups(); track day.date)` wrapped in `<div class="space-y-4">`.
- Display date header: `<p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{day.date | date:'EEEE, MMM d'}}</p>`
- Shifts grid: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">`.
- Loop over shifts: `@for (shift of day.shifts; track shift.id)`.
  - Wrap each shift in a container: `p-4 rounded-xl border flex flex-col justify-between group transition-all cursor-pointer`.
  - Apply `ngClass` conditioning on `shift.status`:
    - `'ASSIGNED'`: `'bg-emerald-50 border-emerald-100'`
    - `'UNASSIGNED'`: `'bg-rose-50/30 border-rose-300 border-dashed'`
  - **Shift HeaderRow**:
    - Title (`shift.shiftName`) gets `text-[10px] font-bold leading-none` and color based on assignment (emerald vs rose).
    - Badge: Conditional.
      - If ASSIGNED: `<span class="px-2 py-0.5 bg-white/50 text-emerald-600 rounded-full font-bold uppercase text-[8px]">Assigned</span>`
      - Else: `<span class="px-2 py-0.5 bg-rose-100 text-rose-500 rounded-full font-bold uppercase text-[8px]">Vacant</span>`
  - **Main Info**: `shift.requiredRole` in `<h4 class="text-xs font-bold text-slate-800">`.
  - **Assignee Info**: `div.mt-3.text-[9px]`.
    - Gets color `text-emerald-600` or `text-rose-400` conditionally.
    - If `shift.assignedUser` exists, display `"User • Verified"`. Else display `"Needs Staff Assignment"`.

Ensure the output is 100% compliant with standard formatting, spacing, styling, and animations used above.
DO NOT create ApiService. Use DutyRosterService in duty-roster/service as the API for the injected API service.
The actual implementation of the service is not required for this prompt.
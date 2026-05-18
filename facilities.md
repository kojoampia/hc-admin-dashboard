# Facility Component Master Prompt

You are an expert Angular developer tasked with creating a standalone `FacilityComponent`.
Create a single standalone file at `/src/webapp/app/entities/facility/facility.ts`.
Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management.
For all styling and layouts, strictly use Tailwind CSS utility classes.

This component will serve as a management interface for healthcare facilities within a healthcare management system. It should allow administrators to view, add, edit, and delete facility records, as well as manage associated personnel and resources. The design should be clean, modern, and responsive, utilizing CSS grid for layout and Tailwind for styling. The component should also include interactive elements such as modals for adding/editing facilities and an audit trail sidebar to track changes.

The route /facilities should render this component from the sidebar links, so ensure it is self-contained and uses facility-service, facility-model, and facility-dialog.
Use dummy data for all facilities, personnel, and audit events to demonstrate the layout and functionality from facility-service.

## General Component Config
- **File**: `/src/webapp/app/entities/facility/facility.ts`
- **Imports**: 
  - `Component`, `inject`, `signal`, `computed` from `'@angular/core'`
  - `CommonModule` from `'@angular/common'`
  - `MatTabsModule` from `'@angular/material/tabs'`
  - `MatTableModule` from `'@angular/material/table'`
  - `MatIconModule` from `'@angular/material/icon'`
  - `MatButtonModule` from `'@angular/material/button'`
  - `MatDialogModule`, `MatDialog` from `'@angular/material/dialog'`
  - `FacilityService` from `'../../services/facility-service'`
  - `FacilityDialogComponent` from `'../../components/dialogs/facility-dialog'`
  - `DashboardStateService` from `'../../services/dashboard-state'`
- **Selector**: `hpd-facility`
- **Standalone**: `true`

## Interfaces and Data Types
At the top of the file, define interfaces and types:
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

export interface Personnel {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Pharmacist' | 'Front Desk';
    contact: string;
    facilityId: string;
    updatedAt: string;
}

export interface AuditEvent {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  message: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}
```

## Component Class Definition
The component class `FacilityComponent` must implement the following properties and methods:

### 1. Injected Services
- `api = inject(FacilityService)`
- `dialog = inject(MatDialog)`
- `state = inject(DashboardStateService)`

### 2. State & Properties
- `tabTypes`: `FacilityType[] = ['Hospital', 'Clinic', 'Laboratory', 'Pharmacy']`
- `activeTab`: `signal<FacilityType>('Hospital')`
- `facilities`: `signal<Facility[]>` initialized with 3 default items:
  1. id: '1', name: 'City Hospital', location: '123 Main St, Anytown', type: 'Hospital', capacity: 250, contact: '(555) 123-4567', updatedAt: '10 mins ago'
  2. id: '2', name: 'Downtown Clinic', location: '456 Elm St, Anytown', type: 'Clinic', capacity: 50, contact: '(555) 987-6543', updatedAt: '2 hours ago'
  3. id: '3', name: 'Health Lab', location: '789 Oak St, Anytown', type: 'Laboratory', capacity: 100, contact: '(555) 555-1212', updatedAt: '1 day ago'
- `personnel`: `signal<Personnel[]>` initialized with 3 default items:
  1. id: '1', name: 'Dr. Alice Smith', role: 'Doctor', contact: '(555) 111-2222', facilityId: '1', updatedAt: '5 mins ago'
  2. id: '2', name: 'Nurse Lisa Johnson', role: 'Nurse', contact: '(555) 333-4444', facilityId: '2', updatedAt: '10 mins ago'
  3. id: '3', name: 'Pharmacist Bob Brown', role: 'Pharmacist', contact: '(555) 666-7777', facilityId: '3', updatedAt: '20 mins ago'
- `auditEvents`: `signal<AuditEvent[]>` initialized with 3 default items:
  1. id: '1', type: 'UPDATE', message: 'Updated facility "City Hospital" capacity from 200 to 250', timestamp: '10 mins ago', icon: 'edit_document', colorClass: 'bg-amber-100 text-amber-600'
  2. id: '2', type: 'CREATE', message: 'Added new facility "Health Lab"', timestamp: '2 hours ago', icon: 'post_add', colorClass: 'bg-emerald-100 text-emerald-600'
  3. id: '3', type: 'DELETE', message: 'Removed personnel "Nurse Lisa Johnson" from "Downtown Clinic"', timestamp: '1 day ago', icon: 'delete', colorClass: 'bg-rose-100 text-rose-600'
  4. id: '4', type: 'UPDATE', message: 'Updated contact info for "Dr. Alice Smith"', timestamp: 'Just now', icon: 'edit_document', colorClass: 'bg-amber-100 text-amber-600'

### 3. Computed Properties
- `filteredFacilities`: returns `this.facilities().filter(facility => facility.type === this.activeTab())`
- `personnelByFacility(facilityId: string)`: returns `this.personnel().filter(person => person.facilityId === facilityId)`

### 4. Methods
- `logEvent(type: 'CREATE' | 'UPDATE' | 'DELETE', message: string)`:
  - sets `icon` to map to values: `CREATE` -> `'post_add'`, `UPDATE` -> `'edit_document'`, `DELETE` -> `'delete'`.
  - sets `colorClass` to map to values: `CREATE` -> `'bg-emerald-100 text-emerald-600'`, `UPDATE` -> `'bg-amber-100 text-amber-600'`, `DELETE` -> `'bg-rose-100 text-rose-600'`.
  - prepends new event built with `crypto.randomUUID()` and timestamp `'Just now'` onto `auditEvents`. Keeps max length 20 utilizing `events.slice(0, 20)`.
- `openAddModal()`:
  - Guarded: `if (!this.state.canAccess('FACILITY', 'CREATE')) return;`
  - Opens `FacilityDialogComponent` with width `600px`, passing `data: null`.
  - On subscribe: if result exists, calls `api.post('/facilities', result)` and upon success calls `loadFacilities()` and logs a 'CREATE' event with message \`Added new facility "${result.name}"\`.
  - `openEditModal(facility: Facility)`:
  - Guarded by 'UPDATE' permission. Passes `facility` to the dialog data.
  - Subscribes with `api.put(\`/facilities/${facility.id}\`, result)` and logs 'UPDATE' event with \`Updated facility "${result.name}"\`.
- `deleteFacility(facility: Facility)`:
  - Guarded by 'DELETE' permission. Wraps inside `confirm('Are you sure you want to delete this facility?')`.
  - Calls `api.delete(\`/facilities/${facility.id}\`)` and logs 'DELETE' event with \`Deleted facility "${facility.name}"\`.
- `loadFacilities()`: Calls `this.api.get<Facility[]>('/facilities').subscribe(data => this.facilities.set(data))`
- `loadPersonnel()`: Calls `this.api.get<Personnel[]>('/personnel').subscribe(data => this.personnel.set(data))`
- `toggleAuditTrail()`: Toggles the `isAuditTrailOpen` signal.
- `ngOnInit()`: Calls `loadFacilities()` and `loadPersonnel()` to initialize data when the component loads.

## Template Structure
Ensure the layout is wrapped in `<div class="space-y-6">`.

### 1. Header Area
- Contains an items-center justify-between flex row.
- Left side: Title "Facilities" (`text-xl font-semibold text-slate-800`), with subtext "Manage healthcare facilities and personnel." (`text-slate-500 text-xs mt-1`).
- Right side: Add Facility button `(@if (state.canAccess('FACILITY', 'CREATE')))` structured as `<button (click)="openAddModal()" mat-flat-button class="!bg-indigo-600 !text-white !rounded-xl !px-5 !py-5"><mat-icon iconPositionEnd>add</mat-icon>Add Facility</button>`.
- Include a toggle button for the audit trail sidebar: `<button (click)="toggleAuditTrail()" mat-icon-button><mat-icon>history</mat-icon></button>`.
- The audit trail sidebar should slide in from the right when `isAuditTrailOpen` is true, displaying the list of `auditEvents` with their respective icons, messages, timestamps, and color-coded badges.

### 2. Main Content Grid
Flex grid layout: `<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">`.

#### Left Pane: Facilities (lg:col-span-2)
- Display a table of `filteredFacilities` with columns for Name, Location, Type, Capacity, Contact, Updated At, and Actions (Edit/Delete).
- Each row should have Edit and Delete buttons that trigger `openEditModal(facility)` and `deleteFacility(facility)` respectively.
- Below the table, include a section that lists associated personnel for the selected facility, showing their name, role, contact info, and last updated time.

#### Right Pane: Personnel (lg:col-span-1)
- Display a list of all personnel grouped by their associated facility. Each entry should show the person's name, role, contact info, and the facility they belong to. Include Edit and Delete buttons for each personnel entry as well.

## Styles
- Use Tailwind CSS utility classes for all styling.
- Ensure the layout is responsive and looks good on both desktop and mobile devices.
- Implement smooth animations for the audit trail sidebar and any modals that open for adding/editing facilities or personnel.
- Use color-coded badges for different types of audit events (CREATE, UPDATE, DELETE) to enhance visual distinction.
- Ensure that the tables and lists are well-spaced and easy to read, with appropriate use of borders, background colors, and typography to create a clean and modern interface.

Ensure the output is 100% compliant with standard formatting, spacing, styling, and animations used above.
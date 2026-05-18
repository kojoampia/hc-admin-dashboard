# Teams Component Master Prompt
You are an expert Angular developer tasked with creating a standalone `TeamComponent`.
Create a single standalone file at `/src/webapp/app/entities/team/team.ts`.
Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management.
For all styling and layouts, strictly use Tailwind CSS utility classes.

This component will serve as a management interface for healthcare teams within a healthcare management system. It should allow administrators to view, add, edit, and delete team records, as well as manage associated personnel and resources. The design should be clean, modern, and responsive, utilizing CSS grid for layout and Tailwind for styling. The component should also include interactive elements such as modals for adding/editing teams and an audit trail sidebar to track changes.

The route /teams should render this component from the sidebar links, so ensure it is self-contained and uses team-service, team-model, and team-dialog.
Do not create existing services, models, or dialogs. Inspect the subfolder structure and create new ones as needed.
Adhere strictly to the existing JHipster architecture and coding conventions, ensuring the component is fully functional and visually consistent with the rest of the application.
Use dummy data for all team records and audit events to demonstrate the layout and functionality.

## General Component Config
- **File**: `/src/webapp/app/entities/team/team.ts`
- **Imports**: 
  - `Component`, `inject`, `signal`, `computed` from `'@angular/core'`
  - `CommonModule` from `'@angular/common'`
  - `MatTabsModule` from `'@angular/material/tabs'`
  - `MatTableModule` from `'@angular/material/table'`
  - `MatIconModule` from `'@angular/material/icon'`
  - `MatButtonModule` from `'@angular/material/button'`
  - `MatDialogModule`, `MatDialog` from `'@angular/material/dialog'`
  - `TeamService` from `'app/entities/team/team-service'`
  - `TeamDialogComponent` from `'app/entities/team/team-dialog'`
  - `DashboardStateService` from `'app/entities/dashboard/dashboard-state'`
- **Selector**: `hpd-team`
- **Standalone**: `true`

## Interfaces and Data Types
At the top of the file, define interfaces and types:
```typescript
export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[];
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  role: 'Doctor' | 'Nurse' | 'Pharmacist' | 'Caregiver' | 'Paramedic' | 'Front Desk';
  contact: string;
  teamId: string;
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
The component class `TeamComponent` must implement the following properties and methods:

### 1. Injected Services
- `api = inject(TeamService)`
- `dialog = inject(MatDialog)`
- `state = inject(DashboardStateService)`

### 2. State & Properties
- `teams`: `signal<Team[]>([])`
- `members`: `signal<Member[]>([])`
- `columns`: `['name', 'description', 'members', 'updatedAt', 'actions']`
- `isAuditTrailOpen`: `signal(true)`
- `auditEvents`: `signal<AuditEvent[]>` initialized with 3 default items:
  1. id: '1', type: 'UPDATE', message: 'Updated Team "Cardiology" description', timestamp: '10 mins ago', icon: 'edit_document', colorClass: 'bg-amber-100 text-amber-600'
  2. id: '2', type: 'CREATE', message: 'Added new Team "Pediatrics"', timestamp: '2 hours ago', icon: 'post_add', colorClass: 'bg-emerald-100 text-emerald-600'
  3. id: '3', type: 'DELETE', message: 'Removed Team "Oncology"', timestamp: '1 day ago', icon: 'delete', colorClass: 'bg-rose-100 text-rose-600'

### 3. Computed Properties
- `teamMembersMap`: returns a mapping of teamId to member names for easy lookup in the template.

### 4. Methods
- `loadData()`: Loads teams and members from the API and populates the respective signals.
- `toggleAuditTrail()`: Toggles `isAuditTrailOpen`.
- `logEvent(type: 'CREATE' | 'UPDATE' | 'DELETE', message: string)`: Logs an audit event with the given type and message, assigning appropriate icon and colorClass based on the type.
- `openAddModal()`: Opens `TeamDialogComponent` for adding a new team. On success, reloads data and logs a 'CREATE' event.
- `openEditModal(team: Team)`: Opens `Team template should include:DialogComponent` for editing the given team. On success, reloads data and logs an 'UPDATE' event.
- `deleteTeam(team: Team)`: Deletes the given team after confirmation. On success, reloads data and logs a 'DELETE' event.
- `openManageMembersModal(team: Team)`: Opens a modal to manage members of the given team (this can be a future enhancement, so just log an event for now).
- `logManageMembers(team: Team)`: Logs an 'UPDATE' event with message \`Managed members for Team "${team.name}"\`.

## Template Structure
Ensure the layout is wrapped in `<div class="space-y-6">`.  
The template should include:
1. A header with the title "Team Management" and a button to add a new team.
2. A table listing all teams with columns for name, description, members (displaying member names), last updated, and actions (edit, delete, manage members).
3. An audit trail sidebar that can be toggled open or closed, displaying recent audit events in a timeline format.
4. Use CSS grid and Tailwind utility classes to create a responsive and visually appealing layout.

## Styles
Use Tailwind CSS utility classes for all styling. Ensure the component is responsive and looks good on both desktop and mobile devices. Use appropriate spacing, colors, and typography to create a clean and modern design.

Ensure the output is 100% compliant with standard formatting, spacing, styling, and animations used above.

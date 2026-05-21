# DashboardComponent Master Prompt

You are an expert Angular developer tasked with creating a standalone `DashboardComponent`.
Create a single standalone file at `/src/app/entities/dashboard/dashboard-component.ts`.
Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management.
For all styling and layouts, strictly use Tailwind CSS utility classes.

This component will serve as a central dashboard for a healthcare management system, displaying key metrics, charts, and an activity timeline. The design should be clean, modern, and responsive, utilizing CSS grid for layout and Tailwind for styling. The component should also include interactive elements such as collapsible sections and hover effects to enhance user experience.

The dashboard will be used in the HomeComponent of the application, so ensure it is self-contained and does not rely on external services or state. Use dummy data for all metrics, charts, and activity events to demonstrate the layout and functionality.

## General Component Config
- **File**: `/src/webapp/app/entities/dashboard/dashboard-component.ts`
- **Imports**: `Component`, `signal` from `'@angular/core'`; `CommonModule` from `'@angular/common'`; `MatIconModule` from `'@angular/material/icon'`; `MatButtonModule` from `'@angular/material/button'`.
- **Selector**: `hpd-dashboard`
- **Standalone**: `true`

## Interfaces and Data Types
At the top of the file, define an `ActivityEvent` interface:
```typescript
interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: string;
  colorClass: string;
}
```

## Component Class Definition
The component class `DashboardComponent` must implement the following properties and methods:

### 1. State
- `isAuditTrailOpen`: A signal initialized to `false`.
- `toggleAuditTrail()`: Toggles `isAuditTrailOpen`.

### 2. Properties
- `weeklyStats`: An array defining a 7-day bar chart:
  - `[{ day: 'Mon', value: 142, percentage: 45 }, { day: 'Tue', value: 215, percentage: 68 }, { day: 'Wed', value: 189, percentage: 60 }, { day: 'Thu', value: 314, percentage: 100 }, { day: 'Fri', value: 285, percentage: 90 }, { day: 'Sat', value: 92, percentage: 29 }, { day: 'Sun', value: 45, percentage: 14 }]`
- `healthMetrics`: An array defining system usages:
  - `[{ name: 'CPU Usage', value: 24, colorClass: 'bg-emerald-500' }, { name: 'Memory Allocation', value: 68, colorClass: 'bg-amber-500' }, { name: 'Storage Capacity', value: 85, colorClass: 'bg-rose-500' }, { name: 'Network Traffic', value: 42, colorClass: 'bg-indigo-500' }]`
- `auditEvents`: An array of `ActivityEvent` representing the history timeline. Generate exactly 50 dummy events using `Array.from({ length: 50 }).map((_, i) => ({ ... }))`:
  - `id`: \`evt-\${i}\`
  - `type`: Select randomly from `['Audit Log', 'Security', 'Role Change', 'Vendor Mgt', 'Patient Mgt', 'Professional', 'Message', 'Permission', 'System Configuration']`.
  - `message`: Select randomly from fitting system messages (e.g., `'User login detected from new IP address.'`, `'Shift successfully reassigned to active personnel.'`, etc.).
  - `timestamp`: Generate a string like \`\${Math.floor(Math.random() * 60)} minutes ago\`.
  - `icon`: Select randomly from material icons (e.g., `'security'`, `'manage_accounts'`, `'storefront'`, `'chat'`, etc.).
  - `colorClass`: Select randomly from Tailwind classes representing different badge colors (e.g., `'bg-indigo-100 text-indigo-600'`, `'bg-rose-100 text-rose-600'`, `'bg-emerald-100 text-emerald-600'`, etc., using amber, blue, purple, slate).

## Template Structure
The layout consists of a main wrapper (`<div class="space-y-6">`) and relies heavily on CSS grid. Check spacing deeply; rely on `gap-4` or `gap-6` as required.

### 1. Header
- Contains a flex container (`flex items-center justify-between`).
- Displays an `h2` heading "Command Center" (`text-xl font-semibold text-slate-800`).

### 2. Top Statistic Cards
A `<section>` using a 4-column responsive grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`).
Each of the four cards should be styled with `bg-white p-4 rounded-2xl border border-slate-200 shadow-sm`.
Inside each card, provide an uppercase subheading for the title (`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1`) and a flex container for the main value (left) and the change indicator badge (right).
1. Title: "Patient Profiles" | Value: `1,284` (`text-slate-900`) | Badge: `+4% ↑` (`text-emerald-500`).
1. Title: "Professional Profiles" | Value: `1,284` (`text-slate-900`) | Badge: `+4% ↑` (`text-emerald-500`).
2. Title: "Vendor Profiles" | Value: `42` (`text-slate-900`) | Badge: `-0%` (`text-slate-400`).
3. Title: "Active Shifts" | Value: `88` (`text-emerald-600`) | Badge: `Today`.
4. Title: "Unassigned" | Value: `07` (`text-rose-500`) | Badge: `Critical` (add `animate-pulse` here).

### 3. Middle Grid: Charts
A `<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">` with two cards:

#### Card A: "Weekly Output" (takes `lg:col-span-2`)
- Wrap in `bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[350px]`.
- **Top Header**: `p-6 border-b border-slate-100 flex justify-between bg-slate-50/50`. Include the title ("Weekly Output"), subtitle ("Total activities completed over the last 7 days"), and a badge on the right reading "This Week".
- **Chart Area**:
  - `p-4 sm:p-6 flex-1 flex items-end justify-between gap-1 sm:gap-2 relative pt-12`.
  - **Background Lines**: An absolute div spanning `inset-x-6 inset-y-6 mt-12 mb-6 pointer-events-none` utilizing flex column to spread out 5 horizontal grid lines (`border-t border-slate-100`).
  - **Bars**: Use an `@for` loop over `weeklyStats`. 
  - Wrap each bar in a relative flex column container that takes full height (`justify-end group z-10 w-full sm:max-w-[48px]`).
  - The bar itself has an outer container (`w-full bg-slate-50 rounded-t-md relative group-hover:bg-slate-100`) and the active inner fill element (`w-full bg-indigo-500 rounded-t-md group-hover:bg-indigo-600 transition-all duration-500`) which gets its height via `[style.height.%]="stat.percentage"`.
  - Include an absolutely positioned hovering tooltip above the bar representing the value (`absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white rounded px-2 py-1 z-20`) showing "{{stat.value}} events".
  - Include the day text below the container (`mt-3 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider`).

#### Card B: "System Health" (takes 1 col)
- Styled as a matching `min-h-[350px]` card.
- **Top Header**: Same styles but shows "System Health" with an emerald check-circle material icon string on the right.
- **Content Area**: `p-6 flex-1 flex flex-col justify-between gap-6 relative`.
- Iterate through `healthMetrics` using `@for`.
  - For each, provide the name, an aligned percentage string, and a small progress track (`h-2.5 bg-slate-50 rounded-full border border-slate-100`) containing the filled progress using the metric array data (`[class]="metric.colorClass"` with inline width `[style.width.%]="metric.value"`).
- **Footer Section (`mt-auto pt-4 border-t border-slate-100`)**: A status indicator grouping that says "Server Status // All systems operational". Along the right side, implement an indicator: a circle wrapper `w-10 h-10 rounded-full bg-emerald-50 border-emerald-100` wrapping a pulsating `w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]`.

### 4. Bottom Section: Audit Trail
- Put this below the charts grid inside `<section class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300">`.
- **Header toggle area**: Make it clickable `(click)="toggleAuditTrail()"` inside `p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 cursor-pointer`.
  - Left side contains an indicator block (`w-10 h-10 rounded-full bg-indigo-50 text-indigo-600`) with a `receipt_long` icon, alongside the text "Audit Trail" and subtext "System events and user activity".
  - Right side contains a badge "50 Latest Events" (`bg-indigo-50 text-indigo-600`) and an expandable chevron (`expand_more`) that uses `[class.rotate-180]="isAuditTrailOpen()"`.
- **Collapsible Body**: Use `@if (isAuditTrailOpen())` to enclose the content block below.
  - Wrap everything in a container: `p-0 overflow-y-auto max-h-[600px] animate-in slide-in-from-top-4 fade-in duration-300`.
  - Loop over `auditEvents` via `@for (event of auditEvents; track event.id)` inside a `divide-y divide-slate-100` container.
  - Event row `flex items-center gap-4 p-4 hover:bg-slate-50/80 transition-colors group`.
  - On the left place the event icon in a round, colored wrapper bound to `event.colorClass`.
  - On the right is a flex-1 container carrying the message (using `truncate group-hover:text-indigo-600`) positioned opposite the timestamp (`bg-slate-100 text-slate-400 font-medium px-2 rounded-md`). Below it lies the event type text (`text-xs font-medium text-slate-500 uppercase tracking-widest`).

Ensure the output is 100% compliant with standard formatting, spacing, styling, and animations used above.

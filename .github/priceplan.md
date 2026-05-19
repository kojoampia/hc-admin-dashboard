# PricingPlanComponent Master Prompt

You are an expert Angular developer tasked with creating a standalone `PricingPlanComponent`.
Create a single standalone file at `/src/webapp/app/entities/price-plan/pricing-plan.ts`.
Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management.
For all styling and layouts, strictly use Tailwind CSS utility classes.

This component will serve as the subscription plan management interface for a healthcare management system, allowing administrators to configure service tiers and feature accessibility. The design should be clean, modern, and responsive, utilizing CSS grid for layout and Tailwind for styling. The component should also include interactive elements such as modals for adding/editing plans.

The route /price-plans should render this component from the sidebar links, so ensure it is self-contained and does not rely on external services or state. Use dummy data for all plans to demonstrate the layout and functionality.

## General Component Config
- **File**: `/src/webapp/app/entities/price-plan/pricing-plan.ts`
- **Imports**: 
  - `Component`, `inject`, `signal` from `'@angular/core'`
  - `CommonModule` from `'@angular/common'`
  - `MatIconModule` from `'@angular/material/icon'`
  - `MatButtonModule` from `'@angular/material/button'`
  - `MatDialogModule`, `MatDialog` from `'@angular/material/dialog'`
  - `PricePlanDialogComponent` from `'../../components/dialogs/price-plan-dialog'`
  - `ApiService` from `'../../services/api'`
  - `DashboardStateService` from `'../../services/dashboard-state'`
- **Selector**: `hpd-pricing-plan`
- **Standalone**: `true`

## Interfaces and Data Types
At the top of the file, define interfaces and types:
```typescript
export interface PricePlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features: string[];
}
```

## Component Class Definition
The component class `PricingPlanComponent` must implement the following properties and methods:

### 1. Injected Services
- `private api = inject(PricingPlanService)`
- `private dialog = inject(MatDialog)`
- `state = inject(DashboardStateService)`

### 2. State & Properties
- `plans`: `signal<PricePlan[]>` initialized with 3 default items:
  1. id: '1', name: 'PEAR', price: 1000, billingCycle: 'MONTHLY', features: ['Basic health tracking', '5 Weekly visits', 'Basic support', 'Nursing support', 'Hospital transportation', 'Grooming assistance', 'Cooking assistance', 'Cleaning assistance', 'Washing assistance', 'Grocery shopping assistance']
  2. id: '2', name: 'MELON', price: 3000, billingCycle: 'MONTHLY', features: ['Standard health tracking', '7 Weekly visits', 'Standard support', 'Nursing support', 'Hospital transportation', 'Grooming assistance', 'Cooking assistance', 'Cleaning assistance', 'Washing assistance', 'Grocery shopping assistance']
  3. id: '3', name: 'PAWPAW', price: 5000, billingCycle: 'MONTHLY', features: ['VIP health tracking', '24/7', 'VIP support', 'Nursing support', 'Hospital transportation', 'Grooming assistance', 'Cooking assistance', 'Cleaning assistance', 'Washing assistance', 'Grocery shopping assistance']

### 3. Methods
- `openAddEditModal(plan?: PricePlan)`:
  - Guarded:
    - If `plan` exists and user doesn't have 'UPDATE' permission, return: `if (plan && !this.state.canAccess('PRICE_PLANS', 'UPDATE')) return;`
    - If `plan` doesn't exist and user doesn't have 'CREATE' permission, return: `if (!plan && !this.state.canAccess('PRICE_PLANS', 'CREATE')) return;`
  - Opens `PricePlanDialogComponent` with width `600px`, passing `plan || null` to `data`.
  - On subscribe: if `result` exists, conditionally call:
    - If `plan` exists: `api.put('/plans/${plan.id}', result).subscribe(() => this.loadPlans())`
    - Else: `api.post('/plans', result).subscribe(() => this.loadPlans())`
- `loadPlans()`:
  - Calls `this.api.get<PricePlan[]>('/plans').subscribe(...)`
  - On subscribe, if `data` is returned and `data.length > 0`, it updates the state: `this.plans.set(data)`.

## Template Structure
Ensure the layout is wrapped in `<div class="space-y-8">`.

### 1. Header Area
- Contains an items-center justify-between flex row.
- Left side: Title "Subscription Plans" (`text-xl font-semibold text-slate-800`), with subtext "Configure service tiers and feature accessibility." (`text-slate-500 text-xs mt-1`).
- Right side: Add New Plan button `(@if (state.canAccess('PRICE_PLANS', 'CREATE')))` structured as `<button mat-flat-button class="!bg-indigo-600 !text-white !rounded-xl !px-6" (click)="openAddEditModal()"><mat-icon iconPositionEnd>add</mat-icon>Add New Plan</button>`.

### 2. Main Content Grid
Flex grid layout: `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`.

#### Cards (Loop over `plans()`)
- Inner loop: `@for (plan of plans(); track plan.id)`.
- Use `[ngClass]` to style the card differently if `plan.name === 'MELON'`:
  - `MELON`: `'bg-slate-900 text-white border-slate-800'`
  - Otherwise: `'bg-white text-slate-900 border-slate-200'`
- The wrapper classes are: `border rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden transition-all hover:scale-[1.01]`.

#### Card Content Elements
- **Top Badge and Price**: `<div class="flex justify-between items-start mb-4">`
  - **Badge**: A tag utilizing `[ngClass]` for individual plan names (PEAR => `text-emerald-600 bg-emerald-50`, MELON => `text-indigo-400 bg-indigo-900/50`, PAWPAW => `text-amber-600 bg-amber-50`). Contains text displaying "Popular" for MELON, "Basic" for PEAR, "Enterprise" for others. General classes: `text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider`.
  - **Price**: `<div class="flex items-baseline gap-1">` wrapping `<span class="text-2xl font-bold">{{plan.price}}<span class="text-xs font-normal opacity-50">/mo</span></span>`.
- **Plan Name Header**: `<h3 class="text-2xl font-black tracking-tighter mb-4" [class.text-white]="plan.name === 'MELON'">{{plan.name}}</h3>`.
- **Feature List**: `<div class="space-y-1.5 flex-1">`
  - Loops over `plan.features` (`@for (feature of plan.features; track feature)`).
  - List item: `<p class="text-[10px] flex items-center gap-2" [class.text-slate-400]="plan.name === 'MELON'" [class.text-slate-500]="plan.name !== 'MELON'">`.
  - Display check mark: `<span class="text-indigo-500">✓</span> {{feature}}`.
- **Action Button Footer**: Wrapper conditionally displays via `@if (state.canAccess('PRICE_PLANS', 'UPDATE'))`.
  - Wrap in `<div class="mt-6 pt-6 border-t border-slate-100/10 flex gap-2">`.
  - Render an "Edit Plan" `<button>` firing `(click)="openAddEditModal(plan)"` taking `flex-1 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors`. Uses `[class.border-slate-800]` and `[class.hover:bg-slate-800]` when `plan.name === 'MELON'`.

Ensure the output is 100% compliant with standard formatting, spacing, styling, and animations used above.
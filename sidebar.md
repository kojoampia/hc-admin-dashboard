# AI Agent Master Prompt: Build the SidebarComponent

## Role & Context
You are an expert Angular developer specializing in modern, accessible, and highly polished UI development. Your task is to build a standalone `SidebarComponent` for a medical/health-tech dashboard application called "HealthConnect". 

You must use **Angular 19+ (Standalone Components, Signals, new control flow)** and **Tailwind CSS**. Do not use legacy Angular features (no `ngIf`, no `ngFor`, no `Observable` for local UI state).

# Component Overview
Build a standalone Angular component (`app-sidebar`) that serves as the main navigation for the dashboard. The sidebar must be collapsible (expand/shrink), automatically highlight the active route, filter navigation items based on the user's role-based access control (RBAC), and display a user profile widget at the bottom.

# Technical Requirements
- **Framework:** Angular (Standalone Component)
- **Styling:** Tailwind CSS
- **Icons:** Angular Material Icons (`<mat-icon>`)
- **Dependencies & Imports:** 
  - `CommonModule`, `RouterLink`, `RouterLinkActive`, `MatIconModule`
  - `DashboardStateService` and `AppResource` (from `../../services/dashboard-state`)

# Data Structures
Define a local interface for the menu items:
```typescript
interface MenuItem {
  label: string;
  icon: string;
  path: string;
  resource: AppResource; // used for permission filtering
}
```

Implement the following menu items in the component class:

1. DASHBOARD (icon: dashboard, path: /, resource: DASHBOARD)
2. MESSAGES (icon: chat, path: /messages, resource: MESSAGES)
3. DUTY ROSTER (icon: calendar_month, path: /roster, resource: DUTY_ROSTER)
4. PRICE PLANS (icon: subscriptions, path: /plans, resource: PRICE_PLANS)
5. CATALOG (icon: auto_stories, path: /cms, resource: CATALOG)
6. FACILITIES (icon: local_hospital, path: /facilities, resource: FACILITIES)
7. TEAMS (icon: groups, path: /teams, resource: TEAMS)
8. PROFILES (icon: people, path: /profiles, resource: PROFILES)

### Features & Behavior

1. Collapsible State (Expand/Shrink):

* * Use an Angular signal named isExpanded defaulting to true.
* * The overall sidebar container should smoothly transition its width (w-64 when expanded, w-20 when collapsed) using Tailwind (transition-all duration-300 ease-in-out).

2. Header & Logo Section:

- Display a highly polished logo button ("HC") with a background of bg-indigo-600.
- Clicking the logo button should toggle the isExpanded signal.
- The button should have hover effects (hover:scale-105 active:scale-95).
- The text "HealthConnect" should only be visible when isExpanded() is true.
- Use overflow-hidden whitespace-nowrap to prevent layout breaks during animation.

3. Navigation & Active State:

- Iterate over filteredMenuItems() to render the links.
- Use [routerLink] and routerLinkActive="bg-slate-50 !text-indigo-600 shadow-sm". Ensure the dashboard route / matches exactly using [routerLinkActiveOptions]="{ exact: item.path === '/' }".
- When clicked, call state.setMenu(item.label).
- The list items must have a subtle hover effect (e.g., hover:bg-slate-50 hover:text-slate-800 hover:scale-[1.03] active:scale-95).
- When collapsed, hide the label text and center the icon within the constrained width.
  
4. Role-Based Access Control Filtering:

- The menuItems list must be filtered natively.
- Create a computed property filteredMenuItems that returns only the items where the user is permitted to read: this.state.canAccess(item.resource, 'READ').

5. User Profile Widget (Footer):

- Access the current user via state.currentUser().
- Display the first two letters of the user's name as an avatar placeholder if expanded (or just center it if collapsed).
- Show the user's full name and their uppercase role side-by-side if expanded. Use truncate to stop text bleeding.
- Add a "logout" <mat-icon> button alongside the user information (only visible when expanded).
- Ensure the container padding comfortably accommodates the collapsed w-20 state (p-2 justify-center) vs expanded (p-4).

## State Management & Dependencies
1. **Local State:** Use Angular `signal` to manage the sidebar's expanded/collapsed state (e.g., `isExpanded = signal(true)`).
2. **Injected State:** Inject a `DashboardStateService` to access the currently logged-in user (`state.currentUser()`). The user object has the shape `{ name: string, role: string }`.
3. **Module Imports:** Include `CommonModule`, `RouterLink`, `RouterLinkActive`, and `MatIconModule` in the component's `imports` array.

## Details & Requirements

### 1. The Container
- Expand the container horizontally with smooth transitions (`transition-all duration-300 ease-in-out`).
- Width should be `w-64` when expanded and `w-20` when collapsed.
- Background should be white, with a right border (`border-r border-slate-200`).
- Use `flex`, `flex-col`, and `h-full` to occupy the full height of the parent interface.
- Must use `whitespace-nowrap` and `overflow-hidden` so text doesn't wrap or break layout during the collapse animation.

### 2. Header / Logo Area (The Trigger)
- Needs a distinct App icon box (e.g., displaying "HC" in bold) with a background of `indigo-600` and white text.
- This "HC" box serves as the toggle button. It must have a cursor pointer, subtle hover scale (`hover:scale-105`), and active scale (`active:scale-95`).
- Next to the icon box, render the text "HealthConnect" (slate-800, bold, tracking-tight).
- When collapsed, hide the "HealthConnect" text and perfectly center the "HC" icon box (`justify-center`).

### 3. Navigation Links

- Use the `@if` control flow to conditionally render elements based on the `isExpanded` signal.
- Use the `@for` control flow to iterate over the items.
- Bind links using `RouterLink` and handle active states with `RouterLinkActive`. 
- **Active State:** When a link is active, it should have a `bg-slate-50`, exact `text-indigo-600` text, and a `shadow-sm`. (Ensure `routerLinkActiveOptions="{ exact: true }"` for the root path).
- **Hover/Interaction:** Apply a subtle zoom on hover (`hover:scale-[1.03]`) and a shrink click effect (`active:scale-95`). Use `transition-all duration-200`.
- **Collapsed View:** When `!isExpanded()`, hide the label text and thoroughly center the icon in the available space. 

### 4. User Profile Widget
- Fixed at the bottom of the sidebar (`mt-auto`).
- Place it inside a faint bordered container (`border-t border-slate-100`).
- Display an Avatar circle (`w-10 h-10`, `indigo-100` background, `indigo-600` text) containing the first two letters of the user's name capitalized.
- Display the User's name (`text-sm font-bold slate-800`, truncated) and their uppercase role (`text-[10px] font-semibold text-slate-500 tracking-wider truncate`).
- Include a logout button (using the `logout` Material Icon) aligned to the right.
- **Collapsed View:** Hide the name, role, and logout button. Shrink the padding and center the Avatar circle gracefully.

## Design Philosophy & Styling Approach
- **Modern & Distinctive:** Rely heavily on high-quality spacing, rounded corners (`rounded-xl` or `rounded-lg`), subtle borders, and intentional slate/indigo coloring.
- **Animation Quality:** Make sure all interactive elements provide physical-feeling feedback. Nothing should blink or snap instantly; animations must feel seamless. Use `shrink-0` on icons/avatars to ensure they don't distort during the parent width animation.
- **Code Standard:** Group CSS cleanly, leverage Angular's `@if` blocks for conditional DOM rendering based on the `isExpanded` signal, and keep the template logic readable. 



### Styling Guidelines
- Adopt a clean, modern aesthetic similar to standard enterprise SaaS applications.
- Text colors should be soft (e.g., text-slate-500 for inactive, text-slate-800 for headers).
- Borders should be subtle (border-slate-200).
- The transition behavior should feel natural without clipping content harshly.
- DropDowns, modals, or any additional interactive elements should be designed with accessibility in mind (keyboard navigable, screen reader friendly) and opaque backgrounds.


Implement the component in separate files `.html`, `.ts` and `.scss` as per Angular best practices, ensuring the template is clean and the logic is well-organized.


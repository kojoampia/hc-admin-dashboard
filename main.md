# **Main Layout Component Generation Prompt**

Act as a Senior Frontend Angular Developer. Goal is to implement the main application layout component for a complex Angular 19 application, following best practices and utilizing the latest Angular features (Signals, Standalone Components, new control flow syntax). The layout includes a responsive toolbar with role-based menu items and a side navigation drawer. Additionally, several custom child components referenced in the layout need to be generated as standalone components.
Target folder: `src/webapp/app/layout/main` (replace all content in this folder). Ensure all generated components are properly imported and declared to compile successfully.

**Step: Main Application Layout Container & Missing Components**

**Context:** We need to implement the primary application shell/layout utilizing Angular Material. This component will host the router-outlet and manage the responsive side navigation and top toolbar. It must strictly follow Angular 19+ best practices (Signals, Standalone components, and new control flow). Furthermore, several custom child widgets are referenced in the layout but do not exist yet; they need to be generated simultaneously.

**Task:** Create the MainApplicationComponent (HTML template and TypeScript class) AND generate the missing child components/modules required for it to compile.
    Z
**Requirements:**

1. **HTML Template:** Generate the template exactly as provided below. It relies on Angular Material (mat-toolbar, mat-sidenav-container), standard flexbox utility classes (d-flex, justify-content-end, w-100, h-100), and specific custom application components. Do NOT use *ngIf or the async pipe.  
2. **TypeScript Logic (Signals):** * Inject Angular CDK's BreakpointObserver and convert its output to a Signal (e.g., using toSignal) to implement the isHandset: Signal<boolean> property. It should return true for handset viewports and false otherwise.  
   * Implement the toggleSidenav() method to toggle the #mainSidenav reference.  
   * Define a version string property or Signal (e.g., '1.0.0').  
   * Provide a method or Signal hasAnyAuthority(role: string): boolean to handle the role-based access check.  
3. **Standalone Components:** The MainApplicationComponent MUST be an Angular Standalone Component (standalone: true). Ensure you import all custom widgets and required Angular Material modules in the @Component imports array.  
4. **Generate Missing Child Components & Modules:** You MUST generate the following custom components referenced in the HTML. Create them as Angular 19 Standalone Components utilizing Signals and the new @if/@for control flow syntax. Provide basic, functional template scaffolding for each:  
   * AdminMenuComponent (Selector: <hpd-admin-menu>)  
   * ChatMenuComponent (Selector: <hpd-chat-menu>)  
   * LanguageMenuComponent (Selector: <hpd-language-menu>)  
   * SettingMenuComponent (Selector: <hpd-setting-menu>)  
   * SidebarComponent (Selector: <hpd-sidebar>)  
   * Prioritize purely Standalone direct imports is preferred for Angular 19.

**Exact HTML Template to Implement:**
```html
<div class="h-100 w-100">  
    <mat-toolbar class="mat-elevation-z3">  
        <a mat-icon-button (click)="toggleSidenav()" class="link-unstyled">  
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>  
        </a>  
        <ng-container>  
            <img class="sidenav-logo mr-2" [src]="'content/images/logo.png'" />  
            <span class="ml-2 version-text">{{'v' + version}}</span>  
        </ng-container>  
        <div class="d-flex justify-content-end w-100">  
            @if (hasAnyAuthority('ROLE_ADMIN')) {  
                <hpd-admin-menu></hpd-admin-menu>  
            }  
            <hpd-chat-menu></hpd-chat-menu>  
            <hpd-language-menu></hpd-language-menu>  
            <hpd-setting-menu></hpd-setting-menu>  
        </div>  
    </mat-toolbar>  
    <mat-sidenav-container class="sidebar-container">  
        <mat-sidenav #mainSidebar class="sidenav light-bg"   
                     [attr.role]="isHandset() ? 'dialog' : 'navigation'"   
                     [mode]="isHandset() ? 'over' : 'side'"   
                     [opened]="!isHandset()"   
                     [position]="'start'">  
            <hpd-sidebar></hpd-sidebar>  
        </mat-sidenav>  
        <mat-sidenav-content class="sidenav-content primary-light-bg">  
            <div class="p-3">  
                <router-outlet></router-outlet>  
            </div>  
        </mat-sidenav-content>  
    </mat-sidenav-container>  
</div>  
```
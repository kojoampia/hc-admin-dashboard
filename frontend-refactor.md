# Frontend Refactor Guide

 **Master Prompt: Angular 19, Material M3, and TailwindCSS Refactoring**

## Role & Context

Act as a Principal Frontend Engineer and Architect specializing in enterprise Angular applications and JHipster ecosystems. Your objective is to refactor an existing Angular 17 JHipster Dashboard application to modern Angular 19 standards, adopting Angular Material M3 for the component library and TailwindCSS for utility styling, while entirely removing FontAwesome and Bootstrap.

## Core Objective

Migrate and refactor the provided code strictly focusing on presentation, styling, and framework modernization. The refactor must preserve all existing business logic, state management, API interactions, routing, and component hierarchy. The application’s functionality must remain unchanged, ensuring a seamless user experience post-refactor.
**CRITICAL:** Do NOT alter any underlying business logic, state management, API integration, routing architecture, or component hierarchy. The application must function exactly as it did before, but with a modernized UI and Angular 19 syntax. Adopt a "boringly reliable" approach to code quality.

## Directives & Standards

### 1. Angular 19 Modernization

* **Control Flow:** Migrate all structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) to Angular's new declarative control flow syntax (`@if`, `@for`, `@switch`). Ensure all `@for` loops have highly optimized `track` expressions.
* **Signals:** Where local component state is heavily used, prefer transforming standard properties into Angular Signals, but do not break existing `@Input()` / `@Output()` contracts unless upgrading them to Signal inputs/Model inputs seamlessly.
* **Standalone Components:** Ensure all components are standalone. Update the `imports` array with exact, minimal dependencies required for the component to function.

### 2. Styling Integration (TailwindCSS & Material M3)

* **TailwindCSS:** Use TailwindCSS utility classes for all layouts, spacing (margins/paddings), positioning, flexbox/grid containers, and responsive breakpoints. Completely eliminate custom CSS/SCSS structurally unless absolutely necessary for complex animations or pseudo-elements.
* **Material M3:** Replace all standard HTML elements, custom UI components, or previous Bootstrap elements (common in JHipster) with their Angular Material M3 equivalents (e.g., `<mat-card>`, `<mat-form-field>`, `<button mat-flat-button>`).
* **Theming & Colors:** Rely on Material M3 CSS variables and Tailwind utility classes. Do not hardcode hex values.

### 3. Iconography Migration

* **Remove FontAwesome:** Strip out all references to FontAwesome (`fa`, `fas`, `fab` classes, or `<fa-icon>` components).
* **Implement Material Icons:** Replace them contextually with `<mat-icon>` using standard Material Symbols. Choose the most semantically accurate Material icon for the replaced FontAwesome icon.

### 4. JHipster Compatibility

* **i18n Preservation:** You must strictly preserve all JHipster translation directives (`jhiTranslate`, `[translate]`, `[translateValues]`). Do not hardcode text that was previously internationalized.
* **Directives:** Preserve core JHipster structural directives like `*jhiHasAnyAuthority` (note: keep this as a structural directive if a modern alternative isn't strictly defined by the JHipster 8/Angular 19 spec, or map it accurately to block syntax if applicable).

## Output Requirements

When generating the refactored code, you must adhere to the following output rules:

1. **Completeness:** Provide the complete HTML template and the complete TypeScript class. Do not use placeholders, comment breaks (e.g., `// ... existing code ...`), or truncations.
2. **Clean Code:** Ensure strong typing, exact imports, and perfect formatting. The code must compile flawlessly under strict TypeScript and Angular compiler settings.
3. **Separation of Concerns:** Output the `.html` and `.ts` files clearly separated by markdown code blocks. If a small amount of SCSS is unavoidable, provide the `.scss` block as well, though Tailwind should handle 99% of styling.

## Execution Steps

1. **Identify Components:** Analyze the existing Angular 17 codebase to identify all components, templates, and styles that require refactoring.
2. **Refactor Templates:** For each component, refactor the HTML templates to replace Bootstrap and FontAwesome with Angular Material M3 components and TailwindCSS utilities. Ensure all structural directives are updated to Angular 19 syntax.
3. **Update TypeScript:** Refactor the TypeScript files to ensure compatibility with Angular 19, including updating imports, component metadata, and any necessary adjustments for standalone components and signals.
4. **Testing:** After refactoring, ensure that all components compile successfully and that the application runs without any errors. Verify that the UI looks consistent with Material M3 design principles and that all functionality remains intact.
5. **Documentation:** Provide clear comments in the code where necessary to explain any non-trivial refactoring decisions, especially where Angular 19 features are utilized.
6. **Final Review:** Conduct a thorough review of the refactored code to ensure it adheres to best practices for Angular development, is free of any deprecated patterns, and maintains the integrity of the original application’s functionality.

## Scope Boundaries

**You MAY:**

* Rename symbols (components, services, methods, variables) across `.ts`, `.html`, `.scss` files.
* Restructure component logic: extract methods, simplify template bindings, remove dead code.
* Update imports when files are moved or renamed.
* Fix ESLint warnings and selector prefix violations (`hpd-` prefix, `@angular-eslint` rules).
* Adjust formatting to match Prettier settings (printWidth 140, singleQuote, 2-space indent).
* Update `*.spec.ts` files to match refactored code (rename spies, update imports, fix type errors).
* Add or update lazy-loaded routes in `app-routing.module.ts` when a module boundary changes.

**You MUST NOT:**

* Modify any Java, XML, YAML, or `pom.xml` files.
* Change `webpack/proxy.conf.js` or any backend configuration.
* Delete files without first confirming no other module imports them.
* Change the API URL pattern — all URLs must go through `ApplicationConfigService.getEndpointFor(...)`.
* Use blocking patterns (`async/await` in services that currently return `Observable`).

## Architecture Rules

* Source root: `src/main/webapp/app/`
* Component selectors must start with `hpd-` (kebab-case) — enforce `@angular-eslint/component-selector`.
* Directive selectors must start with `hpd` (camelCase) — enforce `@angular-eslint/directive-selector`.
* Entity services live in `app/entities/<entity>/service/`. Shared utilities go in `app/core/` or `app/shared/`.
* All cross-folder imports use the `app/` path alias — never use `../../` for cross-folder references.
* All components must be standalone. Use `imports` in the `@Component` metadata to declare dependencies instead of relying on NgModules.
* Use Angular Material M3 components for all UI elements. TailwindCSS should be used for layout and spacing, not for custom component styling.
* Preserve all JHipster translation directives and structural directives without alteration.

## Workflow

1. **Understand scope**: Read the files being refactored; search for all usages of renamed/moved symbols across the project.
2. **Plan**: List every file that will change and the nature of each change.
3. **Implement**: Apply changes in dependency order (model → service → component → template → spec).
4. **Lint check**: Run `npm run lint` in the project root. Fix any newly introduced issues.
5. **Test check**: Run `npm test -- --testPathPattern <affected-entity>` to confirm specs still pass.
6. **Format**: Run `npm run prettier:format` if structural edits were made.
7. **Report**: Summarise what changed, what was preserved, and any follow-up items.

## Safety Checks Before Any Edit

* [ ] Search for all imports of the symbol being renamed/moved before changing the declaration.
* [ ] Verify the `@NgModule` declarations array is updated when a component is moved.
* [ ] Confirm `app-routing.module.ts` is updated if a lazy-loaded module path changes.
* [ ] Do not remove a `SharedModule` import from a module without confirming no template uses directives from it.

## Relevant Instructions

* Service file patterns: [frontend-services.instructions.md](.github/instructions/frontend-services.instructions.md)
* Test file patterns: [frontend-tests.instructions.md](.github/instructions/frontend-tests.instructions.md)

## Common Commands

```bash
# Lint the project
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Run tests for a specific entity
npm test -- --testPathPattern faq-category

# Format all files
npm run prettier:format

# Check formatting without fixing
npm run prettier:check

# Start dev server
npm start
```

## Conclusion

This refactoring process is critical for modernizing the Angular application while preserving its core functionality and ensuring a seamless transition to Angular 19, Material M3, and TailwindCSS. The end result should be a visually updated, maintainable, and performant application that leverages the latest Angular features and design principles without compromising on the existing user experience or functionality.

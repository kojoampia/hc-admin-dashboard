# MessageComponent Master Prompt

You are an expert Angular developer tasked with creating a standalone `MessageComponent`.
Create a single standalone file at `/src/webapp/app/entities/message/message.ts`.
Adhere to Angular 19+ control flow (`@if`, `@for`) and Signals for state management. For all styling and layouts, strictly use Tailwind CSS utility classes.

This component will serve as a communication hub within a healthcare management system, allowing users to view, manage, and respond to messages from various system entities such as vendors, patients, professionals, and internal system alerts. The design should be clean, modern, and responsive, utilizing CSS flexbox for layout and Tailwind for styling. The component should also include interactive elements such as message categorization, search functionality, and a template-based reply system to enhance user experience.

The route /messages should render this component from the sidebar links, so ensure it is self-contained and does not rely on external services or state. Use dummy data for all messages and templates to demonstrate the layout and functionality.

## General Component Config
- **File**: `/src/webapp/app/entities/message/message.ts`
- **Imports**: `Component`, `signal`, `computed` from `'@angular/core'`; `CommonModule` from `'@angular/common'`; `FormsModule` from `'@angular/forms'`; `MatIconModule` from `'@angular/material/icon'`; `MatButtonModule` from `'@angular/material/button'`; `MatTooltipModule` from `'@angular/material/tooltip'`; `MatMenuModule` from `'@angular/material/menu'`.
- **Selector**: `hpd-messages`
- **Standalone**: `true`

Make extensive use of existing models, services and data structures where applicable, but ensure that the component is fully functional and visually consistent with the rest of the application.

## Interfaces and Data Types
At the top of the file, define interfaces and types:
```typescript
export type MessageCategory = 'Urgent' | 'Inquiry' | 'System' | 'Other';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export interface Message {
  id: number;
  sender: string;
  senderEmail: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  category: MessageCategory;
}
```

## Component Class Definition
The component class `MessageComponent` must implement the following properties and methods:

### 1. State Signals
- `messages`: A signal of `Message[]`. Initialize with 4 items:
  1. sender: 'MediCorp Systems', senderEmail: 'accounts@medicorp.com', subject: 'New Vendor Application', content: '...', date: 'Oct 24, 2023', isRead: false, category: 'Inquiry'.
  2. sender: 'System Autobot', senderEmail: 'noreply@system.local', subject: 'Shift Schedule Update', content: '...', date: 'Oct 23, 2023', isRead: true, category: 'System'.
  3. sender: 'DevOps Team', senderEmail: 'devops@system.local', subject: 'System Maintenance', content: '...', date: 'Oct 22, 2023', isRead: true, category: 'System'.
  4. sender: 'Health Monitor AI', senderEmail: 'alerts@system.local', subject: 'Patient Data Alert', content: '...', date: 'Oct 21, 2023', isRead: false, category: 'Urgent'. (Feel free to elaborate on message content as logical).
- `activeCategory`: `signal<'All' | MessageCategory>('All')`
- `searchQuery`: `signal<string>('')`
- `selectedMessage`: `signal<Message | null>(null)`
- `replyContent`: `signal<string>('')`
- `templates`: a signal of `MessageTemplate[]` initialized with 4 default templates (e.g., 'Acknowledge Receipt', 'Request More Info', 'Issue Resolved', 'Follow up'). Each should have an `id`, `name`, and `content`.
- `showTemplateManager`: `signal(false)`
- `editingTemplate`: `signal<MessageTemplate | null>(null)`

### 2. Computed Properties
- `filteredMessages`: returns the list based on `activeCategory` ('All' ignores category filter) and case-insensitive matching of `searchQuery` against `sender`, `subject`, and `content`.

### 3. Methods
- **Template CRUD**: Provide standard template operations including `openTemplateManager`, `closeTemplateManager`, `createNewTemplate`, `editTemplate`, `deleteTemplate`, `saveTemplate`, `applyTemplate(content: string)`. Save utilizes `editingTemplate` and updates `templates`.
- **Reply**: `sendReply()`: clears `replyContent` if it is not totally empty string.
- **Categorization**: `getCategoryClasses(category: string)`: maps 'Urgent' to `'bg-rose-100 text-rose-700'`, 'Inquiry' to `'bg-indigo-100 text-indigo-700'`, 'System' to `'bg-slate-200 text-slate-700'`, default to `'bg-slate-100 text-slate-600'`.
- **List Interaction**: `selectMessage(msg)` flags it as `isRead: true` inside `messages` list and sets `selectedMessage`.
- Provide helper actions for the details view: `markAsUnread`, `deleteMessage`, `closeDetails`.

## Template Structure
Ensure the layout is wrapped in `<div class="flex flex-col h-[calc(100vh-8rem)]">`. 

### 1. Header Area
- Contains an items-center flex row with spacing `mb-6 shrink-0 gap-4`.
- Left Side: The title "Communication Center" (`text-xl font-semibold`) and subtitle description.
- Right Side: Search row including...
  - A relative wrapping div for placing a `mat-icon` (search element) over an `input` (`(input)="searchQuery.set($any($event.target).value)"`).
  - Next to it, a pill-style container (`bg-slate-100 p-1 rounded-xl`) holding `<button>` elements for categories. Iterate categories (All, Urgent, Inquiry, System). Check active state to change button's class map (active => `bg-white shadow-sm` along with appropriate text-color per category type).

### 2. Main Content
Flex box structure `<div class="flex-1 flex gap-6 overflow-hidden min-h-0">`. This will contain two panels.

#### Panel A: Message List
- Takes `w-full` if no message is selected, else `w-[30%]`. Also applies `flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden shrink-0 transition-all duration-300`.
- An `@for` loop over `filteredMessages()`. List displays:
  - An icon circle dependent on `isRead` flag (read => `mail_outline`, unread => `mark_email_unread`). 
  - Main text area showing `.sender` and `.date`. Below it, display the category badge calling `getCategoryClasses(msg.category)`. Next to the badge show `msg.subject` and `msg.content`. Make unread texts `font-bold` vs standard read texts.

#### Panel B: Message Details / Reply Area
- Rendered conditionally via `@if (selectedMessage(); as msg)`.
- Takes `w-[70%] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0 overflow-hidden`.
- **Top Bar**: displays sender avatar/initial (`w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full`), `sender`, `senderEmail`, and action icon-buttons with `matTooltip` (`markAsUnread`, `deleteMessage`, `closeDetails`).
- **Body Area**: scrollable container displaying the `subject` (`text-xl font-bold`) and `<div class="prose whitespace-pre-wrap">` containing the `content`.
- **Reply Box**: `p-6 bg-slate-50 border-t border-slate-200 shrink-0`.
  - Provide a `<textarea>` bound to `replyContent` via `[ngModel]` and `(ngModelChange)`.
  - Below it: a toolbar showing standard icon buttons (attach file, insert photo) alongside a `<button [matMenuTriggerFor]="templateMenu">` button. Use a `mat-menu` to render an `@for` loop of `templates()`, plus a static item to "Manage Templates" (`(click)="openTemplateManager()"`).
  - Also provide "Send Reply" `<button>`.

### 3. Template Manager Modal
- Rendered conditionally via `@if (showTemplateManager())`.
- Wrapper: `fixed inset-0 z-[100] bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-sm`.
- Centered Container: `max-w-4xl w-full h-[600px] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden`.
- Top header with Title "Manage Templates".
- **Sidebar**: `w-[280px] border-r border-slate-100 flex flex-col`. Contains a "New Template" button at the top, and a scrollable list of templates below it (showing `name` and a hovering delete button). Highlights if active.
- **Main Editor**: `flex-1 flex flex-col`. Display `editingTemplate()` state if active. Gives standard inputs `<input...>` and `<textarea...>` bound to `editorState.name` and `editorState.content`. Bottom footer gives Cancel and Save buttons (save button disabled if empty).

Ensure the output is 100% compliant with standard formatting, spacing, styling, and animations used above.
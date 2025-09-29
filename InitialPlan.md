## KPERS Fund Manager Relations POC – Frontend Initial Plan

This document summarizes our shared understanding for the frontend work and provides a concrete, step-by-step plan that a second-year CS student can follow over the course of a day. It is based on `PRD.md`, the provided wireframes, and the constraints we agreed on.

### Objectives for Today
- Build a scalable React app shell (Vite + React + SST) with a collapsible left navbar and initial routes.
- Use MUI as the component library and approximate KSERS/KPERS brand styling.
- Scaffold pages that map to the wireframes: Dashboard, Managers, Manager Detail, Events, Event Create, Search, Settings, Admin.
- Add a modular Search component (stubbed) we can iterate on later.
- Review and preserve the template’s Cognito auth pattern with protected routes.
- Add placeholders and comments for RBAC and backend API assumptions without implementing the backend.

### Out of Scope (Today)
- Real backend integration, database, storage, or file upload.
- Full RBAC and complex a11y. No localStorage for menu persistence.
- Performance tuning and end-to-end tests beyond smoke checks.

---

## Tech Stack and Conventions
- Vite + React + TypeScript + SST (keep as-is).
- MUI (Material UI) for components and theming.
- Routing: React Router (already used by current template).
- State: minimal React state and Context where necessary; no global store for now.
- Code style: keep existing ESLint/Prettier settings.

### Proposed Project Structure (frontend)
We will gradually evolve to a domain-oriented structure while keeping it simple. Navigation is a reusable component (not tied to layout) so agents and humans can reason about it in isolation.

```text
packages/frontend/src/
  app/
    AppShell.tsx            # Layout container wiring header/content/drawer
    routes.tsx              # Central route definitions
    theme.ts                # MUI theme approximating KPERS brand
  pages/
    Dashboard/
      DashboardPage.tsx
    Managers/
      ManagersPage.tsx
      ManagerDetailPage.tsx
    Events/
      EventsPage.tsx
      EventCreatePage.tsx
    Search/
      SearchPage.tsx
    Settings/SettingsPage.tsx
    Admin/AdminPage.tsx
  components/
    navigation/
      SidebarNav.tsx        # Collapsible left navbar (reusable)
      NavSection.tsx        # Small helper for grouped menus
    PageHeader.tsx
    DataTable.tsx           # Simple, placeholder table
    Search/
      SearchBar.tsx         # Modular, stubbed search component
  auth/
    AuthProvider.tsx        # Wraps existing Cognito auth utilities
    ProtectedRoute.tsx      # Gate for authenticated users
  types/
    domain.ts               # Manager, Event, User interfaces
```

Notes:
- We will reuse existing helper files in `src/lib` where applicable and introduce small adapters instead of rewiring everything at once.
- Keep imports path-relative for now; avoid alias churn.
- Rationale for `components/navigation/SidebarNav.tsx` instead of `app/`: it is a pure, reusable view component with its own props and state that can be embedded in different layout shells or storybooks; keeping it under `components` makes ownership and testing clearer.

---

## Routing Plan

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Redirect to `/dashboard` | Signed-in default lands on dashboard |
| `/login` | Login (unprotected) | Required for Cognito sign-in |
| `/dashboard` | DashboardPage | Overview tiles matching wireframe sections |
| `/managers` | ManagersPage | List of fund managers |
| `/managers/:id` | ManagerDetailPage | Combines performance, library, contacts, meetings summary |
| `/events` | EventsPage | List/browse events |
| `/events/new` | EventCreatePage | “Create Event” form per wireframe |
| `/events/:id` | ManagerDetailPage or Open Event (future) | Placeholder view for opening an event |
| `/search` | SearchPage | Uses modular SearchBar + results table |
| `/settings` | SettingsPage | User preferences placeholders |
| `/admin` | AdminPage | RBAC notes; disabled actions for non-admin |

Auth protection policy:
- Only `/login` is public. All other routes (including `/search` and `/settings`) require authentication and are wrapped with `ProtectedRoute`.

---

## Layout and Navigation
- Left sidebar: collapsible; starts collapsed by default. Persist collapsed state to `localStorage`.
- Content area: non-sticky header; each page uses `PageHeader` for a consistent title bar.
- Responsive: basic responsiveness from MUI’s grid; detailed breakpoints later.

Sidebar information architecture (grouped):
- Dashboard
  - Manager Dashboard → `/dashboard`
- Managers
  - Management View → `/managers`
  - Manager Detail (via row click) → `/managers/:id`
- Events
  - Create Event → `/events/new`
  - Browse Events → `/events`
- Documentation
  - Add Notes to an Event → placeholder (navigates to `/events` with filter)
  - Add Memos → placeholder (quick memo creation)
  - Add Documents → placeholder (file upload)
  - Import/Rename Q-Reports → placeholder (Q-Report management)
- Probation Management
  - Create Probation → placeholder
  - Update Probation → placeholder
  - Terminated Manager Checklist (Create/Update) → placeholders
- Admin
  - Admin Console → `/admin` (guarded by role; disabled by default)
- Settings
  - User Settings → `/settings`

We will wire the actionable ones to the real routes, keep placeholders disabled with tooltips and clear TODO comments, and ensure group headings are non-clickable.

### UI State Persistence (localStorage)
- Keys and semantics:
  - `ui.sidebar.expanded: 'true' | 'false'` – controls Drawer collapsed state.
  - `ui.search.lastQuery: string` – optional; remember the last search term for convenience.
  - `ui.managers.table.columns: string[]` – optional; future column preferences.
- Implement a thin `usePersistentState(key, defaultValue)` hook to abstract `localStorage` get/set with JSON and guard for SSR/undefined window.

---

## MUI Theme – KPERS Brand Approximation

We will approximate colors and typography inspired by `https://www.kspers.gov/`:
- Primary: deep blue/navy (e.g., `#003366`)
- Secondary: accent teal/green (e.g., `#2e7d32` or `#0f766e`)
- Background: light gray/white
- Typography: Roboto/Inter; keep MUI defaults if unsure

Deliverables:
- `app/theme.ts` exports `createTheme({...})` with primary/secondary palette and component defaults for Buttons, AppBar, Drawer, ListItem, and Table to match wireframes.

---

## Authentication – Cognito Template Review

Goal: Preserve current template’s Cognito approach while wrapping it in a clearer provider and route guard.

Plan:
1) Audit existing `src/lib/awsLib.ts`, `contextLib.ts`, `hooksLib.ts`, and any `AuthenticatedRoute`/`UnauthenticatedRoute` components.
2) Create `auth/AuthProvider.tsx` that exposes `useAuth()` for auth state, `signIn`, `signOut` methods, and user info (email, roles placeholder).
3) Create `auth/ProtectedRoute.tsx` to gate routes; if unauthenticated, redirect to `/login`.
4) Reuse existing login/signup pages initially; lightly refresh styles with MUI.

RBAC placeholders:
- Recognize roles `Viewer`, `Editor`, `Administrator`.
- Roles will eventually come from ID token claims or an API; for now, use a hard-coded `role: 'Viewer'` and annotate with `// TODO` for real source.

---

## Backend API Assumptions (for comments and stubbed types)

We will not implement backend logic today. We will add comments and types to document expectations so the backend team can implement compatible endpoints later.

The detailed REST plan is extracted to `RESTApiPlan.md` for backend implementation. Below are the core domain types used by the frontend stubs.

TypeScript interfaces (placeholders to be refined):

```ts
export interface Manager {
  id: string;
  name: string;
  status: 'Active' | 'Terminated' | 'Probation';
  marketValue?: number;        // USD; assumed from latest performance snapshot
  asOfDate?: string;           // ISO date string
}

export interface EventRecord {
  id: string;
  managerId: string;
  date: string;                // ISO
  type: 'Meeting' | 'Memo' | 'Report';
  staffAttending?: string[];
  comments?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'Viewer' | 'Editor' | 'Administrator';
}
```

---

## Page Scaffolds

1) DashboardPage
   - Sections matching wireframe: Manager Selection, Performance table, Meeting Calendar, Due Diligence Library, Manager Contacts.
   - Use simple `DataTable` placeholders and `Paper` components; buttons are present but `onClick` can `console.log` for now.

2) ManagersPage
   - List of managers with basic columns: Name, Status, Market Value, As of Date.
   - Row click navigates to `/managers/:id`.

3) ManagerDetailPage
   - Mirrors the dashboard center/right panels for a single manager.
   - Tabs or stacked sections: Performance, Due Diligence Library, Contacts, Meetings.

4) EventsPage
   - Simple table of events; row click navigates to a placeholder detail.

5) EventCreatePage
   - Form per wireframe: Manager, Event Date, Staff Attending, Event Type, Comments.
   - “Add Attach” is a button with a TODO note – no upload backend yet.

6) SearchPage
   - Uses `components/Search/SearchBar.tsx` (modular) + results table.
   - The search bar props: `{ query, onQueryChange, types, onSearch }`.

7) SettingsPage & AdminPage
   - Minimal placeholders; show role and feature flags, with TODOs for future.

---

## Multi-Step Day Plan (Follow in Order)

Time estimates assume familiarity with React + MUI. Adjust as needed.

1) Bootstrap theme and deps (30 min)
   - Install MUI: `npm i @mui/material @emotion/react @emotion/styled @mui/icons-material`.
   - Create `app/theme.ts` with KPERS-like palette and component defaults.
   - Wrap app in `ThemeProvider` in `main.tsx`.

2) App shell and navbar (45 min)
   - Create `AppShell.tsx` with `Drawer` (collapsed by default), `SidebarNav.tsx`, and `Box` content area.
   - Implement a collapse toggle button inside the Drawer header.
   - Ensure keyboard focus order is reasonable (basic a11y from MUI).

3) Routes (30 min)
   - Centralize route config in `app/routes.tsx`.
   - Add redirects from `/` -> `/dashboard`.
   - Wire pages into `AppShell`.

4) Scaffold pages (60 min)
   - Create each page component with a `PageHeader`, placeholder content, and TODO comments referencing `PRD.md` sections.

5) Search module (30 min)
   - Implement `SearchBar.tsx` with `TextField`, optional type chips, and a `Search` button.
   - On submit, populate a local table with mock data.

6) Cognito auth review + guard (45 min)
   - Read existing auth utilities/components in `src/lib`.
   - Implement `AuthProvider` and `ProtectedRoute` adapters that preserve behavior.
   - Guard all app routes; keep login/signup as-is.

7) RBAC placeholders (15 min)
   - Add `role` field to auth context (hard-coded `Viewer`).
   - Disable Admin-only UI in `AdminPage` with a tooltip and TODO.

8) Types and API assumptions (20 min)
   - Add `types/domain.ts` with the interfaces above.
   - Add TODO comments in pages where data would be fetched.

9) Lint/typecheck pass (15 min)
   - Run `npm run lint` and `npm run typecheck` (or `tsc --noEmit`).
   - Fix any straightforward issues.

10) Docs (20 min)
   - Update `README.md` (frontend) with how to run, theme info, and where to add pages.

Commit checkpoints:
- feat(theme): add MUI theme
- feat(shell): app shell with collapsible navbar and routes
- feat(pages): scaffold initial pages
- feat(search): add modular search bar
- feat(auth): wrap Cognito auth with provider and guards
- docs: update README with dev instructions

Definition of Done for Today:
- App runs with theme, app shell, and all routes accessible behind auth.
- Sidebar collapses and expands.
- Pages show placeholder content mapped to wireframes.
- Search bar works over mock data.
- No TypeScript or ESLint errors.

---

## Risks & Future Work
- Branding accuracy: Requires a proper design token pass from the KPERS brand team.
- Auth roles: Need integration with real token claims or a user API.
- Data volume: Tables will need virtualization and pagination later.
- File attachments: Requires storage service and signed URLs.
- Accessibility: Add keyboard shortcuts and detailed aria where appropriate.

## How to Run (Frontend)
```bash
cd packages/frontend
npm install
npm run dev
```

Ensure the SST environment variables for Cognito are already wired as in the template. If not, sign-in related routes will show placeholders.



## KPERS Fund Manager Relations POC – Frontend Progress & Next Steps



This document summarizes our shared understanding for the frontend work and provides a concrete, step-by-step plan that a second-year CS student can follow. It is based on `PRD.md`, the provided wireframes, and the constraints we agreed on.

### ✅ COMPLETED WORK
- ✅ Built scalable React app shell (Vite + React + SST) with collapsible left navbar
- ✅ Installed and configured MUI with KPERS-inspired theme
- ✅ Created AppShell with smooth transitions and localStorage persistence
- ✅ Implemented SidebarNav with grouped menu items and proper icon alignment
- ✅ Created sample Dashboard page with wireframe-matching layout
- ✅ Set up routing with protected routes (only `/login` public)
- ✅ Fixed sidebar spacing, scrollbars, and hamburger alignment issues

### 🎯 CURRENT STATUS
The app shell is complete and functional. You can run `npm run dev` in `packages/frontend` to see:
- Collapsible sidebar (starts collapsed, persists state)
- Hamburger menu aligned with sidebar icons
- Sample Dashboard page with grid layout
- Smooth transitions and proper spacing
- All routes protected except `/login`

### 📋 NEXT STEPS (Priority Order)
1. **Complete Page Scaffolding** - Create remaining placeholder pages
2. **Modular Search Component** - Build reusable search bar with mock data
3. **Auth Integration** - Review Cognito auth and add proper route guards
4. **Domain Types** - Add TypeScript interfaces for Manager, Event, User
5. **RBAC Placeholders** - Add role-based UI states and TODOs
6. **Documentation** - Update README with dev instructions

### Out of Scope (For Now)
- Real backend integration, database, storage, or file upload
- Full RBAC implementation (placeholder only)
- Complex accessibility features
- Performance tuning and end-to-end tests

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

## NEXT STEPS - Detailed Implementation Plan

### Step 1: Complete Page Scaffolding (60 min)
**Goal**: Create all remaining placeholder pages with consistent structure

**Tasks**:
- Create `pages/Managers/ManagersPage.tsx` - List view with mock data table
- Create `pages/Managers/ManagerDetailPage.tsx` - Detail view with tabs/sections  
- Create `pages/Events/EventsPage.tsx` - Events list with filters
- Create `pages/Events/EventCreatePage.tsx` - Form matching wireframe
- Create `pages/Search/SearchPage.tsx` - Search interface placeholder
- Create `pages/Settings/SettingsPage.tsx` - User preferences placeholder
- Create `pages/Admin/AdminPage.tsx` - Admin console placeholder
- Update `Routes.tsx` to include all new routes
- Add navigation links in `SidebarNav.tsx` to wire up the routes

**Key Files to Create**:
```
packages/frontend/src/pages/
  Managers/
    ManagersPage.tsx
    ManagerDetailPage.tsx
  Events/
    EventsPage.tsx
    EventCreatePage.tsx
  Search/SearchPage.tsx
  Settings/SettingsPage.tsx
  Admin/AdminPage.tsx
```

### Step 2: Modular Search Component (30 min)
**Goal**: Build reusable search component with mock data

**Tasks**:
- Create `components/Search/SearchBar.tsx` with props: `{ query, onQueryChange, types, onSearch }`
- Add search type chips (Manager, Event, Document)
- Implement mock search results in `SearchPage.tsx`
- Add search functionality to other pages where appropriate

### Step 3: Auth Integration Review (45 min)
**Goal**: Properly integrate Cognito auth with route guards

**Tasks**:
- Review existing `src/lib/awsLib.ts`, `contextLib.ts`, `hooksLib.ts`
- Create `auth/AuthProvider.tsx` wrapper for auth state
- Create `auth/ProtectedRoute.tsx` for route protection
- Update `App.tsx` to use new auth provider
- Ensure login/signup pages work with MUI styling

### Step 4: Domain Types & API Assumptions (20 min)
**Goal**: Add TypeScript interfaces and API documentation

**Tasks**:
- Create `types/domain.ts` with Manager, Event, User interfaces
- Add TODO comments in pages where data would be fetched
- Reference `RESTApiPlan.md` for backend expectations

### Step 5: RBAC Placeholders (15 min)
**Goal**: Add role-based UI states and feature flags

**Tasks**:
- Add `role` field to auth context (hard-coded `Viewer` for now)
- Disable Admin-only UI with tooltips and TODO comments
- Add role checks in `AdminPage.tsx` and other restricted areas

### Step 6: Final Polish (30 min)
**Goal**: Clean up and document

**Tasks**:
- Run `npm run lint` and `npm run typecheck`
- Fix any TypeScript or ESLint errors
- Update `README.md` with dev instructions and project structure
- Test all routes and navigation

## 🚀 QUICK START GUIDE

**To continue this work in a new context:**

1. **Review Current State**: Run `npm run dev` in `packages/frontend` to see the working app shell
2. **Read Key Files**: 
   - `packages/frontend/src/app/AppShell.tsx` - Main layout with collapsible sidebar
   - `packages/frontend/src/components/navigation/SidebarNav.tsx` - Navigation menu
   - `packages/frontend/src/pages/Dashboard/DashboardPage.tsx` - Sample page structure
3. **Follow Next Steps**: Start with Step 1 (Complete Page Scaffolding) above
4. **Reference Documents**: 
   - `PRD.md` - Project requirements and wireframes
   - `RESTApiPlan.md` - Backend API specifications

## 📁 CURRENT FILE STRUCTURE
```
packages/frontend/src/
  app/
    AppShell.tsx ✅          # Layout with collapsible sidebar
    theme.ts ✅              # MUI theme with KPERS colors
  components/
    navigation/
      SidebarNav.tsx ✅      # Grouped menu with proper alignment
  pages/
    Dashboard/
      DashboardPage.tsx ✅   # Sample page with grid layout
  Routes.tsx ✅              # Protected routing setup
  App.tsx ✅                # Main app with AppShell
  main.tsx ✅               # ThemeProvider setup
```

## 🎯 SUCCESS CRITERIA
- All placeholder pages created and accessible via navigation
- Search component works with mock data
- Auth integration preserves existing Cognito behavior
- TypeScript interfaces defined for domain objects
- RBAC placeholders with clear TODO comments
- No linting errors, clean codebase

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



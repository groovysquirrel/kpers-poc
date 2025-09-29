## REST API Plan – KPERS Fund Manager Relations POC

This document specifies the REST endpoints for a future backend implementation (Azure API Management + Azure Functions or SST API + Lambda). It is intentionally simple-first with clear room to evolve. All IDs are opaque strings (UUID).

### Conventions
- Base path: `/api`.
- Auth: All endpoints require authentication (JWT/OIDC via API Gateway authorizer). Roles: `Viewer`, `Editor`, `Administrator`.
- Pagination: `page` (1-based) and `pageSize` (default 25, max 100).
- Dates: ISO-8601 strings in UTC.
- Errors: JSON problem format `{ status, code, message, details? }`.

---

## Managers

GET `/api/managers`
- Query: `q?`, `status?` in `Active|Terminated|Probation`, `page?`, `pageSize?`
- Returns: `{ items: Manager[], page, pageSize, total }`

GET `/api/managers/:id`
- Returns: `Manager`

GET `/api/managers/:id/events`
- Query: `type?` in `Meeting|Memo|Report`, `from?` ISO, `to?` ISO, `page?`, `pageSize?`
- Returns: `{ items: EventRecord[], page, pageSize, total }`

---

## Events

POST `/api/events`  (role: Editor+)
- Body: `EventCreate { managerId, date, type, staffAttending?, comments? }`
- Returns: `EventRecord`

GET `/api/events`
- Query: `managerId?`, `type?`, `from?`, `to?`, `page?`, `pageSize?`
- Returns: `{ items: EventRecord[], page, pageSize, total }`

GET `/api/events/:id`
- Returns: `EventRecord`

PUT `/api/events/:id` (role: Editor+)
- Body: `EventUpdate { date?, type?, staffAttending?, comments? }`
- Returns: `EventRecord`

DELETE `/api/events/:id` (role: Admin or Editor with ownership rules – TBD)
- Returns: `{ ok: true }`

---

## Documents (Due Diligence Library)

GET `/api/documents`
- Query: `managerId?`, `eventId?`, `q?`, `page?`, `pageSize?`
- Returns: `{ items: DocumentItem[], page, pageSize, total }`

POST `/api/documents` (role: Editor+) – multipart upload or pre-signed URL flow
- Body: `{ managerId, eventId?, filename, contentType, size }`
- Returns: `{ uploadUrl, document: DocumentItem }`

GET `/api/documents/:id`
- Returns: `DocumentItem` (include download URL if authorized)

DELETE `/api/documents/:id` (role: Editor+ or Admin)
- Returns: `{ ok: true }`

---

## Search

GET `/api/search`
- Query: `q`, `types?` comma list of `manager,event,document`, `from?`, `to?`, `page?`, `pageSize?`
- Returns: `{ items: SearchResult[], page, pageSize, total }`

---

## Users & RBAC (foundation)

GET `/api/me`
- Returns: `User` including `role`.

GET `/api/users/:id` (role: Admin)
- Returns: `User`

PUT `/api/users/:id/role` (role: Admin)
- Body: `{ role: 'Viewer'|'Editor'|'Administrator' }`
- Returns: `User`

---

## Data Models

Based on actual sample data from the legacy system:

```ts
export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  status: 'Active' | 'Terminated' | 'Probation';
  marketValue: number;         // USD
  asOfDate: string;           // ISO
}

export interface EventRecord {
  id: string;
  managerId: string;
  date: string;                // ISO
  type: string;                // Event type from EventTypes table
  staffAttending: string[];    // Array of staff member names
  comments: string;
}

export interface MeetingNote {
  id: string;
  eventId: string;
  managerId: string;
  date: string;                // ISO
  title: string;
  content: string;
  createdBy: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
}

export interface EventType {
  id: string;
  name: string;
}

export interface DocumentItem {
  id: string;
  managerId: string;
  eventId?: string;
  title: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;           // ISO
}

export interface User {
  id: string;
  email: string;
  role: 'Viewer' | 'Editor' | 'Administrator';
}

export interface SearchResult {
  id: string;
  type: 'manager' | 'event' | 'document';
  title: string;
  snippet?: string;
  metadata?: Record<string, unknown>;
}

export interface EventCreate {
  managerId: string;
  date: string;
  type: 'Meeting' | 'Memo' | 'Report';
  staffAttending?: string[];
  comments?: string;
}

export interface EventUpdate extends Partial<EventCreate> {}
```

---

## Security & Notes
- All endpoints should validate role-based access in middleware.
- Document upload should use pre-signed URLs; the API only returns `uploadUrl` and records metadata.
- Rate limiting and audit logging recommended for Admin operations.

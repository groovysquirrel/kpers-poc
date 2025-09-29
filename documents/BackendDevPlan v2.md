## REST API Plan – KPERS Fund Manager Relations POC

This document specifies the REST endpoints for a future backend implementation (Azure API Management + Azure Functions or SST API + Lambda). It is intentionally simple-first with clear room to evolve. All IDs are opaque strings (UUID).

## 🎯 PROJECT STATUS SUMMARY

### ✅ COMPLETED WORK
- **Frontend App Shell**: Complete React app with collapsible sidebar, MUI theme, and routing
- **Core Pages**: Managers list/detail, Events list/create, Search page with modular components
- **Fake API Layer**: Complete API implementation matching this specification exactly
- **TypeScript Types**: All domain interfaces defined and documented
- **Mock Data Integration**: Real sample data from legacy CSV files
- **Search Functionality**: Cross-entity search with filtering and pagination
- **Documentation**: Comprehensive API documentation and usage examples

### 🚧 CURRENT STATUS
The frontend is **fully functional** with a complete fake API that simulates real backend behavior. All endpoints from this specification are implemented and working. The app is ready for backend integration.

### 📋 NEXT STEPS (Priority Order)
1. **Backend Implementation** - Build real API endpoints matching this specification
2. **Database Setup** - Create database schema and seed with sample data
3. **Authentication Integration** - Implement JWT/OIDC authentication
4. **File Upload System** - Implement document storage with pre-signed URLs
5. **Deployment** - Deploy to Azure with CI/CD pipeline
6. **Testing** - Add comprehensive test coverage
7. **Performance** - Optimize for production scale

## 📊 IMPLEMENTATION STATUS

### Frontend Implementation Status
| Component | Status | Notes |
|-----------|--------|-------|
| App Shell | ✅ Complete | Collapsible sidebar, MUI theme, routing |
| Managers Page | ✅ Complete | List view with search, filters, pagination |
| Manager Detail | ✅ Complete | Tabbed interface with events, notes, performance |
| Events Page | ✅ Complete | List view with advanced filtering |
| Event Create | ✅ Complete | Form validation, manager selection, staff autocomplete |
| Search Page | ✅ Complete | Cross-entity search with type filtering |
| Navigation | ✅ Complete | Sidebar with grouped menu items |
| Fake API | ✅ Complete | All endpoints implemented with realistic delays |
| TypeScript Types | ✅ Complete | All domain interfaces defined |

### Backend Implementation Status
| Endpoint | Status | Priority |
|----------|--------|----------|
| GET /api/managers | ❌ Not Started | High |
| GET /api/managers/:id | ❌ Not Started | High |
| GET /api/managers/:id/events | ❌ Not Started | High |
| POST /api/events | ❌ Not Started | High |
| GET /api/events | ❌ Not Started | High |
| GET /api/events/:id | ❌ Not Started | Medium |
| PUT /api/events/:id | ❌ Not Started | Medium |
| DELETE /api/events/:id | ❌ Not Started | Low |
| GET /api/documents | ❌ Not Started | Medium |
| POST /api/documents | ❌ Not Started | Medium |
| GET /api/documents/:id | ❌ Not Started | Medium |
| DELETE /api/documents/:id | ❌ Not Started | Low |
| GET /api/search | ❌ Not Started | High |
| GET /api/me | ❌ Not Started | High |
| GET /api/users/:id | ❌ Not Started | Low |
| PUT /api/users/:id/role | ❌ Not Started | Low |

### Database Schema Status
| Table | Status | Notes |
|-------|--------|-------|
| Managers | ❌ Not Started | Core entity |
| Events | ❌ Not Started | Core entity |
| MeetingNotes | ❌ Not Started | Related to events |
| StaffMembers | ❌ Not Started | Reference data |
| EventTypes | ❌ Not Started | Reference data |
| Documents | ❌ Not Started | File attachments |
| Users | ❌ Not Started | Authentication |

## 🔧 TECHNICAL DEBT & IMPROVEMENTS

### Frontend Improvements Needed
- [ ] Replace direct mockData imports with API client calls
- [ ] Add error boundaries for better error handling
- [ ] Implement loading states consistently
- [ ] Add form validation improvements
- [ ] Optimize bundle size and performance
- [ ] Add unit tests for components
- [ ] Add integration tests for API calls

### Backend Requirements
- [ ] Choose technology stack (ASP.NET Core vs Node.js)
- [ ] Set up database (Azure SQL vs PostgreSQL)
- [ ] Implement authentication (Azure AD B2C vs Auth0)
- [ ] Set up file storage (Azure Blob Storage)
- [ ] Configure API Gateway (Azure API Management)
- [ ] Set up CI/CD pipeline (Azure DevOps vs GitHub Actions)

## 🏗️ CURRENT ARCHITECTURE

### Frontend Structure
```
packages/frontend/src/
├── api/
│   ├── fakeApi.ts          # Complete fake API implementation
│   ├── client.ts           # API client wrapper (fake ↔ real)
│   └── README.md           # API documentation
├── components/
│   ├── navigation/         # Sidebar navigation
│   └── Search/             # Modular search components
├── pages/
│   ├── Dashboard/          # Dashboard page
│   ├── Managers/           # Manager list and detail
│   ├── Events/             # Event list and create
│   └── Search/             # Search page
├── types/
│   └── domain.ts           # All TypeScript interfaces
└── data/
    └── mockData.json       # Sample data from legacy system
```

### API Layer Design
- **Fake API**: Complete implementation of all endpoints with realistic behavior
- **Client Wrapper**: Single point of configuration to switch between fake and real APIs
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Consistent error format matching BackendDevPlan
- **Ready for Integration**: One config change switches to real backend

## 🚀 IMMEDIATE NEXT STEPS

### Phase 1: Backend Foundation (Week 1-2)
1. **Choose Technology Stack**
   - ASP.NET Core Web API (recommended for Azure integration)
   - Entity Framework Core for data access
   - Azure SQL Database for storage

2. **Set Up Project Structure**
   - Create backend solution
   - Set up Entity Framework models
   - Configure dependency injection
   - Set up basic API controllers

3. **Implement Core Endpoints**
   - GET /api/managers (with pagination and filtering)
   - GET /api/managers/:id
   - GET /api/events (with pagination and filtering)
   - POST /api/events

### Phase 2: Database & Authentication (Week 3-4)
1. **Database Setup**
   - Create database schema
   - Seed with sample data from CSV files
   - Set up migrations

2. **Authentication**
   - Implement JWT authentication
   - Set up role-based authorization
   - Integrate with Azure AD B2C

### Phase 3: Advanced Features (Week 5-6)
1. **Search Implementation**
   - Full-text search across entities
   - Elasticsearch or SQL Server full-text search

2. **File Upload**
   - Azure Blob Storage integration
   - Pre-signed URL generation
   - Document management endpoints

### Phase 4: Integration & Deployment (Week 7-8)
1. **Frontend Integration**
   - Update API client to use real endpoints
   - Test all functionality
   - Fix any integration issues

2. **Deployment**
   - Set up Azure resources
   - Configure CI/CD pipeline
   - Deploy to staging and production

## 📋 DEVELOPMENT CHECKLIST

### Backend Development
- [ ] Set up ASP.NET Core Web API project
- [ ] Create Entity Framework models
- [ ] Implement Managers controller
- [ ] Implement Events controller
- [ ] Implement Search controller
- [ ] Add authentication middleware
- [ ] Add role-based authorization
- [ ] Set up database migrations
- [ ] Seed database with sample data
- [ ] Implement file upload system
- [ ] Add comprehensive error handling
- [ ] Add API documentation (Swagger)
- [ ] Add unit tests
- [ ] Add integration tests

### Frontend Integration
- [ ] Update all pages to use API client instead of direct mockData
- [ ] Add proper loading states
- [ ] Add error handling and user feedback
- [ ] Test all functionality with real API
- [ ] Optimize performance
- [ ] Add error boundaries
- [ ] Add unit tests for components

### Deployment & DevOps
- [ ] Set up Azure resources (App Service, SQL Database, Blob Storage)
- [ ] Configure authentication (Azure AD B2C)
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring and logging
- [ ] Set up staging environment
- [ ] Deploy to production
- [ ] Set up backup and disaster recovery

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

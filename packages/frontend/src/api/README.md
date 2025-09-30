# API Layer - Complete Guide

The API layer provides a clean, type-safe interface between the frontend and backend using **IAM authentication** via AWS Cognito. All API requests are automatically signed with AWS Signature Version 4.

## 📁 Structure

```
api/
├── client.ts              # Main API client (facade)
├── http.ts                # HTTP client with IAM auth
├── transformers.ts        # Data converters (snake_case ↔ camelCase)
├── services/              # API service modules
│   ├── index.ts          # Service exports
│   ├── managers.ts       # Managers CRUD operations
│   ├── events.ts         # Events CRUD operations
│   └── event-types.ts    # Event Types CRUD operations
├── fakeApi.ts            # Mock API for development
├── data/                 # Mock data
└── README.md             # This file
```

---

## 🚀 Quick Start

### 1. Deploy Backend

```bash
sst deploy
```

### 2. Configure Environment

Create `packages/frontend/.env.local`:

```bash
# Get these values from: sst env list
VITE_REGION=us-east-1
VITE_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com
VITE_USER_POOL_ID=us-east-1_xxxxx
VITE_USER_POOL_CLIENT_ID=xxxxx
VITE_IDENTITY_POOL_ID=us-east-1:xxxxx-xxxxx-xxxxx
```

### 3. Verify Setup

```bash
cd packages/frontend
node verify-auth-setup.js
```

### 4. Create Test User

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --username test@example.com \
  --temporary-password "TempPassword123!" \
  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --username test@example.com \
  --password "YourPassword123!" \
  --permanent
```

### 5. Start Dev Server & Login

```bash
npm run dev
# Navigate to /login and sign in
```

---

## 🔐 Authentication Overview

### How It Works

```
1. User Login → Cognito User Pool
2. Get JWT Tokens → Identity Pool
3. Exchange for AWS Credentials (Access Key, Secret, Session Token)
4. API Call → Amplify signs with AWS Signature V4
5. API Gateway validates signature
6. Lambda executes
```

### Key Points

- **IAM Authentication Required**: All API routes use `auth: { iam: true }`
- **Automatic Signing**: AWS Amplify API module signs every request
- **Plain fetch() FAILS**: Must use Amplify API module
- **Credentials expire**: After 1 hour (auto-refreshed)

### Configuration

**Backend** (`infra/auth.ts`):
```typescript
export const identityPool = new sst.aws.CognitoIdentityPool("IdentityPool", {
  permissions: {
    authenticated: [{
      actions: ["execute-api:*"],  // Grants API access
      resources: [/* API Gateway ARN */],
    }],
  },
});
```

**Frontend** (`main.tsx`):
```typescript
Amplify.configure({
  Auth: {
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID,
  },
  API: {
    endpoints: [{
      name: "api",  // Must match httpClient apiName
      endpoint: config.apiGateway.URL,
      region: config.apiGateway.REGION,
    }],
  },
});
```

**HTTP Client** (`api/http.ts`):
```typescript
import { API } from 'aws-amplify';

async get<T>(path: string): Promise<T> {
  // Automatically signs with AWS Sig V4
  return await API.get('api', path, { headers: {} });
}
```

---

## 💻 Usage

### In Components (Recommended)

```typescript
import { useManagers } from '@/lib/hooks/useManagers';

function ManagersPage() {
  const { managers, loading, error, createManager } = useManagers();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  
  return <ManagersList managers={managers} />;
}
```

### Direct API Calls

```typescript
import { client } from '@/api/client';

// List managers
const response = await client.getManagers({ 
  page: 1, 
  pageSize: 10,
  status: 'Active' 
});

// Create manager
const newManager = await client.createManager({
  firstName: 'John',
  lastName: 'Doe',
  company: 'Acme Corp',
  email: 'john@example.com',
  phone: '555-1234',
  status: 'Active',
  marketValue: 1000000,
  asOfDate: '2025-01-01',
});

// Update manager
const updated = await client.updateManager('manager-id', {
  status: 'Probation',
});

// Delete manager
await client.deleteManager('manager-id');

// List events for a manager
const eventsResponse = await client.getEvents({ 
  managerId: 'manager-id',
  page: 1 
});

// Create event
const newEvent = await client.createEvent({
  managerId: 'manager-id',
  type: 'event-type-id', // Get from getEventTypes()
  date: '2025-01-15',
  staffAttending: ['Staff One', 'Staff Two'],
  comments: 'Quarterly review meeting',
});

// Get event types (for dropdowns)
const eventTypes = await client.getEventTypes();
// Returns: [{ id: '1', name: 'Q-Meeting' }, ...]
```

### Error Handling

```typescript
try {
  const managers = await client.getManagers();
} catch (error) {
  if (error.status === 403) {
    // Not authenticated
  } else if (error.status === 404) {
    // Not found
  }
  console.error('API Error:', error.message);
}
```

---

## 🛠️ Architecture & Patterns

### Data Flow

```
Component
  ↓
Hook (useManagers)
  ↓
API Client (client.ts)
  ↓
Service (managers.ts)
  ↓
HTTP Client (http.ts)
  ↓
AWS Amplify API (signs request)
  ↓
API Gateway (validates signature)
  ↓
Lambda Function
```

### Adding New Endpoints

Follow this 4-step pattern:

#### Step 1: Add Transformers

```typescript
// In transformers.ts
export interface EventRow {
  id: string;
  event_date: string;  // Backend: snake_case
  manager_id: string;
}

export function toFrontendEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    date: row.event_date,      // Frontend: camelCase
    managerId: row.manager_id,
  };
}

export function toBackendEventCreate(data: EventCreate) {
  return {
    managerId: data.managerId,
    eventDate: data.date,
    // ... other fields
  };
}
```

#### Step 2: Create Service

```typescript
// In services/events.ts
import { httpClient } from '../http';
import { EventRow, toFrontendEvent, toBackendEventCreate } from '../transformers';

class EventsService {
  private readonly basePath = '/events';

  async list(params = {}) {
    const rows = await httpClient.get<EventRow[]>(this.basePath, params);
    return rows.map(toFrontendEvent);
  }

  async create(data: EventCreate) {
    const input = toBackendEventCreate(data);
    const row = await httpClient.post<EventRow>(this.basePath, input);
    return toFrontendEvent(row);
  }

  // ... get, update, delete
}

export const eventsService = new EventsService();
```

#### Step 3: Update Client

```typescript
// In client.ts
import { eventsService } from './services/events';

async getEvents(params) {
  if (API_CONFIG.useFakeApi) {
    return await fakeApi.getEvents(params);
  }
  return await eventsService.list(params);
}
```

#### Step 4: Create Hook

```typescript
// In hooks/useEvents.ts
export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchEvents = async () => {
    setLoading(true);
    const data = await client.getEvents();
    setEvents(data);
    setLoading(false);
  };
  
  return { events, loading, fetchEvents };
}
```

---

## ✅ Implemented APIs

### Managers API (Full CRUD)
- Backend: `/managers` endpoints
- Frontend: `managersService` + `useManagers` hook
- Features: List, get, create, update, delete
- Status: **✅ Fully implemented**

### Events API (Full CRUD)
- Backend: `/events` endpoints  
- Frontend: `eventsService` + `useEvents` hook
- Features: List, get, create, update, delete
- Transformers: Converts `staff_attending` (semicolon-separated string) ↔ `staffAttending` (array)
- Status: **✅ Fully implemented**

### Event Types API (Read-only)
- Backend: `/event-types` endpoints
- Frontend: `eventTypesService`
- Features: List event types for dropdowns
- Status: **✅ Fully implemented**

### Example: Using Events in Components

```typescript
import { useEvents } from '@/lib/hooks/useEvents';

function EventsList({ managerId }: { managerId: string }) {
  const { events, loading, error, createEvent } = useEvents({
    managerId,
    autoFetch: true
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.type}</h3>
          <p>{event.date}</p>
          <p>Staff: {event.staffAttending.join(', ')}</p>
          <p>{event.comments}</p>
        </div>
      ))}
    </div>
  );
}
```

### Data Transformation Example

**Backend format** (snake_case):
```json
{
  "id": "1",
  "manager_id": "mgr-123",
  "event_type_id": "evt-1",
  "event_date": "2025-01-15",
  "staff_attending": "John Doe;Jane Smith",
  "comments": "Meeting notes",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Frontend format** (camelCase):
```json
{
  "id": "1",
  "managerId": "mgr-123",
  "type": "evt-1",
  "date": "2025-01-15",
  "staffAttending": ["John Doe", "Jane Smith"],
  "comments": "Meeting notes",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

The transformers handle this automatically!

---

## 🐛 Troubleshooting

### 403 Forbidden Error

**Symptom:** API requests return 403 Forbidden

**Checklist:**

1. **Environment variables set?**
   ```bash
   node verify-auth-setup.js
   ```

2. **User logged in?**
   ```javascript
   Auth.currentSession()  // In browser console
   ```

3. **Request being signed?** (Check Network tab)
   - Should see: `Authorization: AWS4-HMAC-SHA256 ...`
   - Should see: `X-Amz-Date`
   - Should see: `X-Amz-Security-Token`

4. **API name matches?**
   - Amplify config: `name: "api"`
   - HTTP client: `apiName = 'api'`

5. **Credentials valid?**
   ```javascript
   Auth.currentCredentials()  // Should not throw
   ```

**Quick Fixes:**

```javascript
// Force logout and re-login
await Auth.signOut();
// Navigate to /login

// Force credential refresh
await Auth.currentCredentials({ refresh: true });
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "No current user" | Not logged in | Navigate to `/login` |
| "InvalidSignatureException" | Credentials expired | Logout and login again |
| "UnauthorizedException" | Identity Pool misconfigured | Check `infra/auth.ts` permissions |
| "API endpoint not found" | Wrong API name | Verify Amplify config matches httpClient |

### Debug Commands

```javascript
// In browser console
Auth.currentSession()           // Check if logged in
Auth.currentAuthenticatedUser() // Get user info
Auth.currentCredentials()       // Get AWS credentials
API.get('api', '/managers', {}) // Test API call
```

---

## 📚 Available Endpoints

### Managers ✅
- `getManagers(params)` - List with filtering/pagination
- `getManager(id)` - Get by ID
- `createManager(data)` - Create new
- `updateManager(id, data)` - Update existing
- `deleteManager(id)` - Delete

### Events ✅
- `getEvents(params)` - List events (filter by managerId, type, date range)
- `getEvent(id)` - Get by ID
- `createEvent(data)` - Create event
- `updateEvent(id, data)` - Update event
- `deleteEvent(id)` - Delete event

### Event Types ✅
- `getEventTypes()` - List all event types (for dropdowns)

### Documents (Coming Soon)
- `getDocuments(params)` - List documents
- `createDocument(data)` - Upload document
- `deleteDocument(id)` - Delete document

### Search (Coming Soon)
- `search(params)` - Global search

---

## 🧪 Development Mode

### Switch Between APIs

```typescript
// In client.ts
const API_CONFIG = {
  useFakeApi: false,  // false = real API, true = mock
};

// Or programmatically:
client.enableFakeApi();   // Use mock data (no auth required)
client.enableRealApi();   // Use real API (auth required)
```

### Enable Error Simulation

```typescript
client.enableErrorSimulation();  // 5% random errors
client.disableErrorSimulation(); // Normal mode
```

---

## 🔒 Security

- ✅ IAM authentication on all requests
- ✅ Credentials auto-refresh every hour
- ✅ HTTPS enforced by API Gateway
- ✅ Least-privilege IAM policies
- ✅ User Pool + Identity Pool separation

---

## 📖 Data Models

All types in `types/domain.ts`:

- `Manager` - Fund manager information
- `EventRecord` - Meetings/events
- `Note` - Meeting notes
- `DocumentItem` - File attachments
- `User` - User accounts with RBAC
- `SearchResult` - Search results

---

## 🎯 Key Takeaways

1. **IAM auth requires signing** - Plain `fetch()` won't work → 403 Forbidden
2. **Use Amplify API module** - Handles signing automatically
3. **Match API names** - Must be consistent: Amplify config ↔ httpClient
4. **Environment required** - All VITE_* variables must be set
5. **Test user needed** - Create in Cognito User Pool first

---

## 📝 Quick Reference

### Environment Variables
```bash
VITE_REGION=us-east-1
VITE_API_URL=https://xxxxx.execute-api.us-east-1.amazonaws.com
VITE_USER_POOL_ID=us-east-1_xxxxx
VITE_USER_POOL_CLIENT_ID=xxxxx
VITE_IDENTITY_POOL_ID=us-east-1:xxxxx-xxxxx-xxxxx
```

### Verify Setup
```bash
node verify-auth-setup.js          # Check environment
sst env list                       # Get resource IDs
npm run dev                        # Start dev server
```

### Test Authentication
```javascript
Auth.currentSession()              // ✅ = logged in
Auth.currentCredentials()          // ✅ = has credentials
API.get('api', '/managers', {})    // ✅ = API works
```

---

## 🆘 Support

**Getting 403 errors?** → Check troubleshooting section above  
**Adding new endpoint?** → Follow the 4-step pattern  
**Environment issues?** → Run `node verify-auth-setup.js`  
**Need more help?** → Check [SST Guide](https://guide.sst.dev/)

---

## 📚 References

- [SST Guide - Secure APIs](https://guide.sst.dev/chapters/secure-our-serverless-apis.html)
- [Cognito User Pool vs Identity Pool](https://guide.sst.dev/chapters/cognito-user-pool-vs-identity-pool.html)
- [AWS Amplify API](https://docs.amplify.aws/lib/restapi/getting-started/q/platform/js/)
- [AWS Signature Version 4](https://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)

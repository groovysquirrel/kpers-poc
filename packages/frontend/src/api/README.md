# API Layer Documentation

## Overview

The API layer provides a clean interface between the frontend and backend, currently using a fake API for development. It's designed to match the BackendDevPlan v1.md exactly.

## Files

- `fakeApi.ts` - Complete fake API implementation with all endpoints
- `client.ts` - API client wrapper that can switch between fake and real APIs
- `types/domain.ts` - TypeScript interfaces for all data models

## Usage Examples

### Basic Usage

```typescript
import { client } from '../api/client';

// Get managers with pagination
const managers = await client.getManagers({ 
  page: 1, 
  pageSize: 10,
  status: 'Active' 
});

// Get a specific manager
const manager = await client.getManager('1');

// Create a new event
const newEvent = await client.createEvent({
  managerId: '1',
  date: '2025-01-15',
  type: 'Q-Meeting',
  staffAttending: ['Staff One', 'Staff Two'],
  comments: 'Quarterly review meeting'
});

// Search across all data
const searchResults = await client.search({
  q: 'vanguard',
  types: 'manager,event',
  page: 1,
  pageSize: 25
});
```

### Error Handling

```typescript
try {
  const managers = await client.getManagers();
  // Handle success
} catch (error) {
  if (error.status === 404) {
    // Handle not found
  } else if (error.status === 500) {
    // Handle server error
  }
  console.error('API Error:', error.message);
}
```

### Switching to Real API

When the backend is ready, simply change the configuration:

```typescript
// In client.ts, change:
const API_CONFIG = {
  useFakeApi: false, // Set to false
  baseUrl: 'https://your-api.com/api',
  timeout: 10000,
};
```

## Available Endpoints

### Managers
- `getManagers(params)` - List managers with filtering and pagination
- `getManager(id)` - Get specific manager
- `getManagerEvents(managerId, params)` - Get events for a manager

### Events
- `createEvent(eventData)` - Create new event
- `getEvents(params)` - List events with filtering
- `getEvent(id)` - Get specific event
- `updateEvent(id, eventData)` - Update event
- `deleteEvent(id)` - Delete event

### Documents
- `getDocuments(params)` - List documents
- `createDocument(documentData)` - Create document (returns upload URL)
- `getDocument(id)` - Get specific document
- `deleteDocument(id)` - Delete document

### Search
- `search(params)` - Search across managers, events, notes, documents

### Users & RBAC
- `getMe()` - Get current user info
- `getUser(id)` - Get specific user
- `updateUserRole(id, role)` - Update user role

### Utilities
- `getEventTypes()` - Get all event types
- `getStaff()` - Get all staff members

## Data Models

All data models are defined in `types/domain.ts` and match the BackendDevPlan:

- `Manager` - Fund manager information
- `EventRecord` - Events/meetings/notes
- `MeetingNote` - Detailed meeting notes
- `DocumentItem` - File attachments
- `User` - User accounts and roles
- `SearchResult` - Unified search results

## Development Notes

- The fake API simulates realistic delays (300-1000ms)
- 5% chance of simulated errors for testing error handling
- All endpoints return promises with proper TypeScript types
- Pagination follows the BackendDevPlan format
- Error responses match the BackendDevPlan format

## Future Integration

When integrating with the real backend:

1. Update `API_CONFIG.useFakeApi = false`
2. Replace TODO comments in `client.ts` with real fetch calls
3. Add authentication headers
4. Update base URL
5. Test all endpoints

The interface remains the same, so no changes are needed in the frontend components.

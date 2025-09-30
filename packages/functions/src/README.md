# Backend Functions - Development Pattern

This document describes the established patterns for implementing CRUD operations in this serverless backend.

## 🏗️ Architecture Pattern

### One Lambda Per Operation
Each CRUD operation is a separate Lambda function for:
- **Clear separation of concerns** - each function does one thing
- **Independent scaling** - frequently used operations scale independently
- **Easy debugging** - isolated function logs
- **Granular permissions** - each function can have specific IAM policies

### Directory Structure
```
packages/functions/src/
├── shared/              # Shared utilities
│   ├── database.ts     # Database abstraction layer
│   ├── handler.ts      # Lambda response wrapper
│   └── types.ts        # TypeScript interfaces
├── [entity]/           # One folder per entity
│   ├── list.ts         # GET /entity
│   ├── get.ts          # GET /entity/:id
│   ├── create.ts       # POST /entity
│   ├── update.ts       # PUT /entity/:id
│   └── delete.ts       # DELETE /entity/:id
```

## 📦 Database Abstraction Layer

### Why Abstract?
The database abstraction decouples business logic from Aurora-specific implementation details, making code:
- **Database-agnostic** - swap databases without changing CRUD logic
- **Easier to test** - mock the `Database` interface
- **Cleaner to read** - `db.query()` vs `withAuroraRetry(() => executeStatement())`

### Usage
```typescript
import { db, QueryParameter } from "../shared/database";

// Execute a query and get results
const result = await db.query("SELECT * FROM managers WHERE id = :id", [
  { name: "id", value: managerId }
]);

// Execute without expecting results (INSERT, UPDATE, DELETE)
await db.execute("INSERT INTO managers (...) VALUES (...)", params);
```

### Query Parameters
```typescript
// Simple parameter (type auto-inferred)
{ name: "name", value: "John" }           // → string

// Explicit type
{ name: "count", value: 42, type: "long" }        // → long
{ name: "active", value: true, type: "boolean" }  // → boolean
{ name: "price", value: 19.99, type: "double" }   // → double

// Null values
{ name: "email", value: null }            // → NULL in database
```

## 🎯 CRUD Implementation Pattern

### 1. List Operation (`list.ts`)

**Key Pattern:** Error-driven table creation

```typescript
export const main = handler(async () => {
  try {
    // Try to query directly (optimistic - table exists)
    const records = await selectRecords();
    return JSON.stringify(records);
  } catch (err: any) {
    // Only create/seed if table doesn't exist
    if (err?.message?.includes("doesn't exist") || 
        err?.message?.includes("Table") && err?.message?.includes("not found")) {
      await createTableAndSeed();
      const records = await selectRecords();
      return JSON.stringify(records);
    }
    throw err;
  }
});
```

**Why this pattern?**
- ✅ **Efficient:** 1 query on normal requests (not 3+ with preventative checks)
- ✅ **Self-healing:** First request creates table if missing
- ✅ **Production-ready:** Table creation only happens once

### 2. Get Operation (`get.ts`)

```typescript
export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "ID is required" }),
    };
  }

  const result = await db.query("SELECT * FROM table WHERE id = :id", [
    { name: "id", value: id }
  ]);
  
  if (!result.records || result.records.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Not found" }),
    };
  }

  const record = mapRecordToType(result.records[0]);
  return JSON.stringify(record);
});
```

**Key points:**
- Validate input before database call
- Return custom status codes using `HandlerResponse` object
- Use helper function to map database records to TypeScript types

### 3. Create Operation (`create.ts`)

```typescript
export const main = handler(async (event) => {
  // Parse and validate input
  let data: CreateInput;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  // Validate required fields
  if (!data.requiredField) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
  }

  // Generate ID
  const id = uuid.v4();

  // Insert
  const params: QueryParameter[] = [
    { name: "id", value: id },
    { name: "field", value: data.field },
    { name: "count", value: data.count, type: "long" },
  ];
  await db.execute("INSERT INTO table (...) VALUES (...)", params);

  // Fetch and return created record
  const result = await db.query("SELECT * FROM table WHERE id = :id", [
    { name: "id", value: id }
  ]);
  
  return JSON.stringify(mapRecordToType(result.records[0]));
});
```

### 4. Update Operation (`update.ts`)

**Key Pattern:** Dynamic UPDATE query

```typescript
export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  let data: UpdateInput;
  
  // Validate...

  // Check existence
  const checkResult = await db.query("SELECT id FROM table WHERE id = :id", [
    { name: "id", value: id }
  ]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
  }

  // Build dynamic UPDATE based on provided fields
  const updates: string[] = [];
  const parameters: QueryParameter[] = [{ name: "id", value: id }];

  if (data.field1 !== undefined) {
    updates.push("field1 = :field1");
    parameters.push({ name: "field1", value: data.field1 });
  }
  if (data.field2 !== undefined) {
    updates.push("field2 = :field2");
    parameters.push({ name: "field2", value: data.field2 });
  }

  if (updates.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "No fields to update" }) };
  }

  await db.execute(`UPDATE table SET ${updates.join(", ")} WHERE id = :id`, parameters);

  // Fetch and return updated record
  const result = await db.query("SELECT * FROM table WHERE id = :id", [
    { name: "id", value: id }
  ]);
  
  return JSON.stringify(mapRecordToType(result.records[0]));
});
```

**Why dynamic updates?**
- ✅ Supports partial updates (PATCH-like behavior)
- ✅ Only updates fields that are provided
- ✅ Prevents overwriting fields with undefined

### 5. Delete Operation (`delete.ts`)

```typescript
export const main = handler(async (event) => {
  const id = event.pathParameters?.id;
  
  // Check existence
  const checkResult = await db.query("SELECT id FROM table WHERE id = :id", [
    { name: "id", value: id }
  ]);
  
  if (!checkResult.records || checkResult.records.length === 0) {
    return { statusCode: 404, body: JSON.stringify({ error: "Not found" }) };
  }

  await db.execute("DELETE FROM table WHERE id = :id", [
    { name: "id", value: id }
  ]);

  return JSON.stringify({ ok: true, id });
});
```

## 🗄️ Database Schema Pattern

Schema files live in `packages/database/[entity]/`:

```
packages/database/
├── index.ts              # Export paths for SST copyFiles
├── manager/
│   ├── schema.sql        # Table definition
│   └── data.json         # Default seed data
└── event-types/
    ├── schema.sql
    └── data.json
```

### Schema Example (`schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS managers (
  id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(200) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Conventions:**
- Use `snake_case` for column names
- Always include `id` as PRIMARY KEY (UUID)
- Include `created_at` and `updated_at` with auto-timestamps
- Use `CREATE TABLE IF NOT EXISTS` for idempotency

### Default Data (`data.json`)
```json
[
  {
    "id": "uuid-1",
    "first_name": "John",
    "last_name": "Doe",
    "company": "Acme Corp",
    "status": "Active"
  }
]
```

## 📝 TypeScript Types Pattern

Add types to `shared/types.ts`:

```typescript
// Database row (matches DB columns exactly)
export interface EntityRow {
  id: string;
  first_name: string;  // snake_case matches DB
  last_name: string;
  created_at: string;
  updated_at: string;
}

// Create input (camelCase from API)
export interface EntityCreateInput {
  firstName: string;
  lastName: string;
}

// Update input (all fields optional for partial updates)
export interface EntityUpdateInput {
  firstName?: string;
  lastName?: string;
}
```

## 🧪 Testing Pattern

Test scripts live in `packages/scripts/`:

```bash
# Run full CRUD test suite
./packages/scripts/managers-CRUD-api.sh

# Environment variables
AUTO_CONTINUE=true   # Skip prompts between steps
VERBOSE=true         # Show detailed output
MANAGER_ID=uuid      # Test specific ID
```

## 🚀 Adding a New Entity

### 1. Create Database Files
```bash
mkdir packages/database/my-entity
# Create schema.sql and data.json
```

### 2. Update Database Index
```typescript
// packages/database/index.ts
export const dbConfigs = [
  // ... existing
  { from: "packages/database/my-entity", to: "database/my-entity" },
];
```

### 3. Add TypeScript Types
```typescript
// packages/functions/src/shared/types.ts
export interface MyEntityRow { /* ... */ }
export interface MyEntityCreateInput { /* ... */ }
export interface MyEntityUpdateInput { /* ... */ }
```

### 4. Implement CRUD Functions
```bash
mkdir packages/functions/src/my-entity
# Create list.ts, get.ts, create.ts, update.ts, delete.ts
# Copy from managers/ and adapt
```

### 5. Register API Routes
```typescript
// infra/api.ts
api.route("GET /my-entity", "packages/functions/src/my-entity/list.main");
api.route("GET /my-entity/{id}", "packages/functions/src/my-entity/get.main");
api.route("POST /my-entity", "packages/functions/src/my-entity/create.main");
api.route("PUT /my-entity/{id}", "packages/functions/src/my-entity/update.main");
api.route("DELETE /my-entity/{id}", "packages/functions/src/my-entity/delete.main");
```

### 6. Create Test Script
```bash
cp packages/scripts/managers-CRUD-api.sh packages/scripts/my-entity-CRUD-api.sh
# Update entity name and test data
chmod +x packages/scripts/my-entity-CRUD-api.sh
```

### 7. Deploy and Test
```bash
sst deploy
./packages/scripts/my-entity-CRUD-api.sh
```

## 🔑 Key Principles

1. **One Lambda = One Operation** - Keep functions small and focused
2. **Error-Driven Creation** - Don't check if table exists; catch errors instead
3. **Database Abstraction** - Never import from `aurora.ts`; always use `db` from `database.ts`
4. **Custom Status Codes** - Return `{ statusCode, body }` objects for non-200 responses
5. **Type Safety** - Define interfaces for Row, CreateInput, and UpdateInput
6. **Partial Updates** - Use dynamic SQL for flexible UPDATE operations
7. **Test Everything** - Create comprehensive test scripts for each entity

## 📚 Reference Implementations

- **Complete CRUD:** See `managers/` or `event-types/`
- **Database abstraction:** See `shared/database.ts`
- **Handler wrapper:** See `shared/handler.ts`
- **Test script:** See `packages/scripts/managers-CRUD-api.sh`

---

**Last Updated:** September 30, 2025  
**Pattern Status:** ✅ Production-ready and battle-tested


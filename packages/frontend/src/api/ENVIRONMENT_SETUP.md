# Environment Setup for API Client

## Issue Fixed
The original code was using `process.env.REACT_APP_API_BASE_URL` which caused a browser error:
```
Uncaught ReferenceError: process is not defined
```

## Solution
Updated the API client to use Vite's environment variable system:
```typescript
// Before (caused error)
baseUrl: process.env.REACT_APP_API_BASE_URL || '/api',

// After (works correctly)
baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
```

## Environment Variables

### Vite Environment Variables
In Vite-based React applications, environment variables must be prefixed with `VITE_` to be accessible in the browser.

### Configuration
Create a `.env.local` file in the frontend package root with:
```bash
# API Configuration
VITE_API_BASE_URL=/api
```

### Example Configurations
```bash
# Development with fake API (default)
VITE_API_BASE_URL=/api

# Development with local backend
VITE_API_BASE_URL=http://localhost:3000/api

# Production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## API Client Configuration
The API client automatically uses the environment variable or falls back to `/api` if not set:

```typescript
const API_CONFIG = {
  useFakeApi: true, // Set to false when real API is ready
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
};
```

## Switching to Real API
When ready to use the real backend:

1. Set `useFakeApi: false` in `client.ts`
2. Configure `VITE_API_BASE_URL` to point to your backend
3. Ensure your backend implements the API endpoints as specified in `BackendDevPlan v2.md`

## Notes
- Environment variables are built into the bundle at build time
- Changes to `.env.local` require a restart of the dev server
- The `VITE_` prefix is required for security (only these variables are exposed to the browser)



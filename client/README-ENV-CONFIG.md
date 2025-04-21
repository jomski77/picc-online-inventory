# Environment Configuration Guide

This document explains how the environment configuration works in this application.

## Environment Files

The application uses different environment files for development and production:

1. `.env` - Base environment variables that apply to all environments
2. `.env.development` - Development-specific environment variables (overrides .env)
3. `.env.production` - Production-specific environment variables (overrides .env)

## API Configuration

The API can be configured to use different base URLs for development and production:

- Development: `http://localhost:3000` (default)
- Production: `https://picc-online-inventory.onrender.com:10000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_MODE | Current API mode (development/production) | development |
| VITE_API_BASE_URL | Base URL for API requests | Based on mode |
| VITE_SUPABASE_URL | Supabase URL for storage | As defined in .env |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key | As defined in .env |
| VITE_SUPABASE_STORAGE_URL | Supabase storage URL | As defined in .env |

## Using API Utility

The application includes an API utility (`src/utils/apiConfig.js`) that automatically selects the correct API base URL based on the environment. To use it:

```js
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiConfig';

// Example GET request
const fetchData = async () => {
  const response = await apiGet('items');
  const data = await response.json();
  // ...
};

// Example POST request
const createData = async (data) => {
  const response = await apiPost('items', data);
  const result = await response.json();
  // ...
};
```

## Building for Production

When building for production, Vite will automatically use the `.env.production` file:

```bash
npm run build
```

This will configure the application to use the production API URL.

## Running in Development Mode

When running in development mode, Vite will use the `.env.development` file:

```bash
npm run dev
```

This will configure the application to use the development API URL and proxy API requests to the local server.

## Custom Environment

If you need to customize the environment variables, you can:

1. Edit the corresponding `.env` file
2. Create a custom `.env.local` file (not committed to Git)
3. Set environment variables in your command line before running the app

For example:

```bash
VITE_API_BASE_URL=https://my-custom-api.com npm run dev
``` 
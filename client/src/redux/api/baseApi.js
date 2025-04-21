import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Determine if we're in production mode
const isProduction = import.meta.env.MODE === 'production';

// Get the appropriate base URL based on environment
const baseUrl = isProduction
  ? import.meta.env.VITE_API_BASE_URL_PRODUCTION || 'https://picc-online-inventory.onrender.com:10000/api'
  : '/api'; // Use relative URL for development with proxy

// Log the environment and base URL in development
if (import.meta.env.DEV) {
  console.log('Environment:', import.meta.env.MODE);
  console.log('API Base URL:', baseUrl);
}

// Create the API with proper credential handling
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the user state if available
      const token = getState()?.user?.token;
      
      // If we have a token, add it to the request headers
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
    credentials: 'include', // Include credentials in all requests
    // Handle fetch errors
    fetchFn: async (...args) => {
      try {
        return await fetch(...args);
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    }
  }),
  endpoints: () => ({}),
});

export const {
  // Add specific endpoints here when needed
} = baseApi; 
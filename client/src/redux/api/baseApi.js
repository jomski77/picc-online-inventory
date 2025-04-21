import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Force all requests to use the production URL
const baseUrl = 'https://picc-online-inventory.onrender.com/api';

// Log configuration
console.log('API Configuration');
console.log('Base URL:', baseUrl);
console.log('Mode:', import.meta.env.VITE_API_MODE);
console.log('Env:', import.meta.env.MODE);
console.log('Dev:', import.meta.env.DEV ? 'Yes' : 'No');

// Create the API with proper error handling
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
    responseHandler: async (response) => {
      // For non-JSON responses (like HTML error pages)
      if (!response.ok) {
        const error = await response.text();
        return Promise.reject(new Error(error || `Error ${response.status}: ${response.statusText}`));
      }
      
      // For JSON responses
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          const text = await response.text();
          console.warn('Non-JSON response received:', text);
          return text;
        }
      } catch (error) {
        console.error('Failed to parse response:', error);
        const text = await response.text();
        console.error('Response text:', text);
        return Promise.reject(new Error(`JSON parse error: ${error.message}`));
      }
    }
  }),
  endpoints: () => ({}),
});

export const {
  // Add specific endpoints here when needed
} = baseApi; 
/**
 * API Configuration Utility
 * 
 * This file provides a centralized configuration for API calls,
 * automatically selecting the correct base URL based on the environment.
 */

// Force all requests to the production URL
const apiMode = 'production';
const API_BASE_URL = 'https://picc-online-inventory.onrender.com';

// Log the API configuration in development mode
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    mode: apiMode,
    baseUrl: API_BASE_URL
  });
}

/**
 * Make an API GET request
 * @param {string} endpoint - The API endpoint (without /api prefix)
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiGet = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api/${endpoint.replace(/^\//, '')}`;
  
  const defaultOptions = {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };
  
  return fetch(url, defaultOptions);
};

/**
 * Make an API POST request
 * @param {string} endpoint - The API endpoint (without /api prefix)
 * @param {Object} data - The request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiPost = async (endpoint, data, options = {}) => {
  const url = `${API_BASE_URL}/api/${endpoint.replace(/^\//, '')}`;
  
  const defaultOptions = {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    ...options,
  };
  
  return fetch(url, defaultOptions);
};

/**
 * Make an API PUT request
 * @param {string} endpoint - The API endpoint (without /api prefix)
 * @param {Object} data - The request body data
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiPut = async (endpoint, data, options = {}) => {
  const url = `${API_BASE_URL}/api/${endpoint.replace(/^\//, '')}`;
  
  const defaultOptions = {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    ...options,
  };
  
  return fetch(url, defaultOptions);
};

/**
 * Make an API DELETE request
 * @param {string} endpoint - The API endpoint (without /api prefix)
 * @param {Object} options - Additional fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const apiDelete = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}/api/${endpoint.replace(/^\//, '')}`;
  
  const defaultOptions = {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };
  
  return fetch(url, defaultOptions);
};

export default {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  baseUrl: API_BASE_URL
}; 
import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add Authorization header
api.interceptors.request.use((config) => {
  // Get API key from wherever you store it (this should be handled securely)
  const apiKey = "YOUR_API_KEY"; // This should be handled securely, not hardcoded
  
  if (apiKey) {
    config.headers.Authorization = apiKey;
  }
  
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
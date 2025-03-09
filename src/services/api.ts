
import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Добавляем параметр, который предотвращает кеширование запросов браузером
  params: {
    _timestamp: Date.now()
  },
  // Add a timeout to ensure API requests don't hang indefinitely
  timeout: 10000 // 10 seconds timeout
});

// Добавляем интерцептор для каждого запроса
api.interceptors.request.use((config) => {
  // Добавляем случайный параметр к каждому запросу для предотвращения кеширования
  config.params = {
    ...config.params,
    _timestamp: Date.now(),
    _random: Math.random()
  };
  
  return config;
});

// Add response interceptor for error handling with more detailed logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error - Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error - Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error - Setup:', error.message);
    }
    
    return Promise.reject(error);
  }
);

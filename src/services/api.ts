
import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Добавляем параметр, который предотвращает кеширование запросов браузером
  params: {
    _timestamp: Date.now()
  }
});

// Добавляем интерцептор для каждого запроса
api.interceptors.request.use((config) => {
  // Добавляем случайный параметр к каждому запросу для предотвращения кеширования
  config.params = {
    ...config.params,
    _timestamp: Date.now(),
    _random: Math.random()
  };
  
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

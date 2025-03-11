
import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Add parameter to prevent browser caching
  params: {
    _timestamp: Date.now()
  }
});

// Add interceptor for each request
api.interceptors.request.use((config) => {
  // Add random parameter to each request to prevent caching
  config.params = {
    ...config.params,
    _timestamp: Date.now(),
    _random: Math.random()
  };
  
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Логирование для проверки наличия nm_id в ответе
    if (response.data && Array.isArray(response.data)) {
      const hasNmId = response.data.some(item => 'nmId' in item || 'nm_id' in item);
      if (hasNmId) {
        console.log('API response contains nmId:', 
          response.data.slice(0, 2).map(item => ({nmId: item.nmId || item.nm_id}))
        );
      }
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Add detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      // Enhance error object with more information
      error.detail = error.response.data?.message || 
                     error.response.data?.error ||
                     `Error ${error.response.status}: ${error.response.statusText}`;
                     
      // Handle rate limiting (429)
      if (error.response.status === 429) {
        error.detail = 'Превышен лимит запросов к API. Пожалуйста, повторите попытку позже.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request made but no response received:', error.request);
      error.detail = 'Сервер не отвечает. Проверьте подключение к интернету.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error during request setup:', error.message);
      error.detail = 'Ошибка при настройке запроса: ' + error.message;
    }
    
    return Promise.reject(error);
  }
);

// Function to set API key
export const setApiKey = (apiKey: string) => {
  api.defaults.headers.common['Authorization'] = apiKey;
};

// Функция для получения себестоимости товара по nm_id
export const getCostPriceByNmId = async (nmId: number, storeId: string): Promise<number> => {
  try {
    // Пробуем получить из локального хранилища
    const products = JSON.parse(localStorage.getItem(`products_${storeId}`) || "[]");
    const product = products.find((p: any) => p.nmId === nmId);
    
    if (product && product.costPrice) {
      console.log(`Found cost price for nmId ${nmId}: ${product.costPrice}`);
      return product.costPrice;
    }
    
    // Если нет в локальном хранилище, пробуем получить с сервера
    try {
      const response = await api.get(`http://localhost:3001/api/products/cost-price/${nmId}?storeId=${storeId}`);
      if (response.data && response.data.costPrice) {
        return response.data.costPrice;
      }
    } catch (error) {
      console.error(`Error fetching cost price for nmId ${nmId}:`, error);
    }
    
    return 0; // Если себестоимость не найдена
  } catch (error) {
    console.error(`Error in getCostPriceByNmId for nmId ${nmId}:`, error);
    return 0;
  }
};

export default api;

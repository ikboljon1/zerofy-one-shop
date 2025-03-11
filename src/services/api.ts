
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
  (response) => response,
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

// Функция для сохранения себестоимости товара
export const saveProductCostPrice = async (
  storeId: string,
  nmId: string | number,
  costPrice: number
): Promise<boolean> => {
  try {
    // Сначала пробуем сохранить через API
    await api.post('/api/products/cost-price', {
      storeId,
      nmId,
      costPrice
    });
    console.log(`API: Saved cost price for nmId ${nmId}: ${costPrice}`);
    return true;
  } catch (error) {
    console.error('Error saving product cost price via API:', error);
    
    // Если API недоступен, сохраняем в localStorage
    try {
      // Убедимся, что ключ соответствует тому, который используется в аналитике
      const storageKey = `products_cost_price_${storeId}`;
      let productsCostPrice = [];
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        productsCostPrice = JSON.parse(storedData);
      }
      
      const existingIndex = productsCostPrice.findIndex(
        (item: any) => item.nmId.toString() === nmId.toString()
      );
      
      if (existingIndex >= 0) {
        productsCostPrice[existingIndex].costPrice = costPrice;
      } else {
        productsCostPrice.push({ nmId, costPrice });
      }
      
      localStorage.setItem(storageKey, JSON.stringify(productsCostPrice));
      console.log(`Saved cost price for nmId ${nmId}: ${costPrice} to localStorage with key ${storageKey}`);
      return true;
    } catch (localError) {
      console.error('Error saving to localStorage:', localError);
      return false;
    }
  }
};

export default api;

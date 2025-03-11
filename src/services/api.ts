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
    // Улучшенное логирование для проверки наличия nm_id и других данных в ответе
    if (response.data) {
      console.log('API Response Structure:', Object.keys(response.data));
      
      // Проверка на наличие nm_id в ответе API
      if (Array.isArray(response.data)) {
        const hasNmId = response.data.some(item => 'nmId' in item || 'nm_id' in item);
        if (hasNmId) {
          console.log('API response contains nmId:', 
            response.data.slice(0, 2).map(item => ({
              nmId: item.nmId || item.nm_id,
              price: item.priceWithDisc || item.price,
              title: item.subject || item.title || 'N/A'
            }))
          );
        } else {
          console.log('API response does NOT contain nmId in items. First item keys:', 
            Array.isArray(response.data) && response.data.length > 0 
              ? Object.keys(response.data[0]) 
              : 'Empty array'
          );
        }
      }
      
      // Проверка для аналитических данных
      if (response.data.dailySales && Array.isArray(response.data.dailySales)) {
        const saleItem = response.data.dailySales[0]?.sales?.[0];
        if (saleItem) {
          console.log('Sales item structure:', Object.keys(saleItem));
          console.log('Sales item nmId present:', 'nmId' in saleItem || 'nm_id' in saleItem);
          if ('nmId' in saleItem || 'nm_id' in saleItem) {
            console.log('Example sale nmId:', saleItem.nmId || saleItem.nm_id);
          }
        }
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

// Function to get cost price by subject name
export const getCostPriceBySubjectName = async (subjectName: string, storeId: string): Promise<number> => {
  try {
    console.log(`Getting cost price for subject name "${subjectName}" from store ${storeId}`);
    
    // Get products from local storage
    const products = JSON.parse(localStorage.getItem(`products_${storeId}`) || "[]");
    
    // Find all products matching the subject name
    const matchingProducts = products.filter((p: any) => 
      p.subject === subjectName || 
      p.subject_name === subjectName || 
      p.subjectName === subjectName
    );
    
    console.log(`Found ${matchingProducts.length} products matching subject "${subjectName}"`);
    
    if (matchingProducts.length > 0) {
      // Calculate average cost price from all matching products
      let totalCostPrice = 0;
      let productsWithCostPrice = 0;
      
      for (const product of matchingProducts) {
        if (product.costPrice && product.costPrice > 0) {
          totalCostPrice += product.costPrice;
          productsWithCostPrice++;
        }
      }
      
      if (productsWithCostPrice > 0) {
        const avgCostPrice = totalCostPrice / productsWithCostPrice;
        console.log(`Average cost price for "${subjectName}": ${avgCostPrice} from ${productsWithCostPrice} products`);
        return avgCostPrice;
      }
      
      // If no cost price found in products, try to get from server
      try {
        const response = await api.get(`http://localhost:3001/api/products/cost-price-by-subject/${encodeURIComponent(subjectName)}?storeId=${storeId}`);
        if (response.data && response.data.costPrice) {
          console.log(`Received cost price from server for subject "${subjectName}": ${response.data.costPrice}`);
          return response.data.costPrice;
        }
      } catch (error) {
        console.error(`Error fetching cost price for subject "${subjectName}":`, error);
      }
    }
    
    return 0; // No cost price found
  } catch (error) {
    console.error(`Error in getCostPriceBySubjectName for "${subjectName}":`, error);
    return 0;
  }
};

// Function to get cost price by nm_id
export const getCostPriceByNmId = async (nmId: number, storeId: string): Promise<number> => {
  try {
    console.log(`Getting cost price for nmId ${nmId} from store ${storeId}`);
    // Пробуем получить из локального хранилища
    const products = JSON.parse(localStorage.getItem(`products_${storeId}`) || "[]");
    const product = products.find((p: any) => p.nmId === nmId || p.nmID === nmId);
    
    if (product && product.costPrice) {
      console.log(`Found cost price for nmId ${nmId}: ${product.costPrice}`);
      return product.costPrice;
    }
    
    console.log(`No cost price found for nmId ${nmId} in localStorage`);
    
    // Если нет в локальном хранилище, пробуем получить с сервера
    try {
      const response = await api.get(`http://localhost:3001/api/products/cost-price/${nmId}?storeId=${storeId}`);
      if (response.data && response.data.costPrice) {
        console.log(`Received cost price from server for nmId ${nmId}: ${response.data.costPrice}`);
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

// Function to find nmId for a subject name
export const findNmIdBySubjectName = (subjectName: string, storeId: string): number | undefined => {
  try {
    const products = JSON.parse(localStorage.getItem(`products_${storeId}`) || "[]");
    const matchingProduct = products.find((p: any) => 
      p.subject === subjectName || 
      p.subject_name === subjectName || 
      p.subjectName === subjectName
    );
    
    if (matchingProduct) {
      const nmId = matchingProduct.nmId || matchingProduct.nmID;
      console.log(`Found nmId ${nmId} for subject "${subjectName}"`);
      return nmId;
    }
    
    console.log(`No nmId found for subject "${subjectName}"`);
    return undefined;
  } catch (error) {
    console.error(`Error finding nmId for subject "${subjectName}":`, error);
    return undefined;
  }
};

// Function to match product sales data with product nmIds
export const enhanceProductSalesWithNmId = (productSales: any[], storeId: string): any[] => {
  try {
    const products = JSON.parse(localStorage.getItem(`products_${storeId}`) || "[]");
    
    return productSales.map(sale => {
      if (sale.subject_name) {
        const matchingProducts = products.filter((p: any) => 
          p.subject === sale.subject_name || 
          p.subject_name === sale.subject_name ||
          p.subjectName === sale.subject_name
        );
        
        if (matchingProducts.length > 0) {
          const nmId = matchingProducts[0].nmId || matchingProducts[0].nmID;
          if (nmId) {
            console.log(`Enhanced product sale: added nmId ${nmId} to "${sale.subject_name}"`);
            return { ...sale, nmId };
          }
        }
      }
      return sale;
    });
  } catch (error) {
    console.error('Error enhancing product sales with nmId:', error);
    return productSales;
  }
};

// Function to calculate total cost price
export const calculateTotalCostPrice = async (sales: any[], storeId: string): Promise<number> => {
  if (!sales || !Array.isArray(sales) || sales.length === 0) {
    console.log('No sales data to calculate cost price');
    return 0;
  }
  
  console.log(`Calculating total cost price for ${sales.length} sales items`);
  console.log('Sales data sample:', sales.slice(0, 2));
  
  let totalCostPrice = 0;
  let processedItems = 0;
  let missingNmIdItems = 0;
  let itemsProcessedBySubject = 0;
  
  for (const sale of sales) {
    const nmId = sale.nmId || sale.nm_id || sale.product?.nmId || sale.product?.nm_id;
    const quantity = Math.abs(sale.quantity || 1); // Use absolute value of quantity
    
    if (nmId) {
      // If nmId is available, use it to get cost price
      const costPrice = await getCostPriceByNmId(nmId, storeId);
      
      if (costPrice > 0) {
        const itemCostPrice = costPrice * quantity;
        totalCostPrice += itemCostPrice;
        processedItems++;
        console.log(`Added cost for nmId ${nmId}: ${costPrice} x ${quantity} = ${itemCostPrice}`);
      } else {
        console.warn(`Zero cost price for nmId ${nmId}`);
      }
    } else if (sale.subject_name) {
      // If nmId is not available but subject_name is, use subject_name to get cost price
      missingNmIdItems++;
      const subjectName = sale.subject_name;
      const costPrice = await getCostPriceBySubjectName(subjectName, storeId);
      
      if (costPrice > 0) {
        const itemCostPrice = costPrice * quantity;
        totalCostPrice += itemCostPrice;
        itemsProcessedBySubject++;
        console.log(`Added cost for subject "${subjectName}": ${costPrice} x ${quantity} = ${itemCostPrice}`);
      } else {
        console.warn(`Zero cost price for subject "${subjectName}"`);
      }
    } else {
      missingNmIdItems++;
      console.warn('Missing both nmId and subject_name in sale item:', sale);
    }
  }
  
  console.log(`Total cost price calculation results:
    - Total cost: ${totalCostPrice}
    - Processed items by nmId: ${processedItems}
    - Processed items by subject: ${itemsProcessedBySubject}
    - Items missing nmId: ${missingNmIdItems}
    - Items processed total: ${processedItems + itemsProcessedBySubject}
    - Total items: ${sales.length}
  `);
  
  return totalCostPrice;
};

// Function to fetch sales report
export const fetchSalesReport = async (apiKey: string, dateFrom: Date, dateTo: Date, limit = 100000, rrdid = 0) => {
  try {
    // Format dates in the required format
    const fromDate = dateFrom.toISOString().split('T')[0];
    const toDate = dateTo.toISOString().split('T')[0];
    
    console.log(`Fetching sales report from ${fromDate} to ${toDate} with rrdid=${rrdid}`);
    
    const response = await axios.get('https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod', {
      headers: {
        'Authorization': apiKey
      },
      params: {
        dateFrom: fromDate,
        dateTo: toDate,
        limit,
        rrdid
      }
    });
    
    console.log(`Received ${response.data?.length || 0} sales report items`);
    
    // Check for nm_id in the response
    if (Array.isArray(response.data) && response.data.length > 0) {
      const hasNmId = response.data.some(item => 'nm_id' in item);
      console.log('Sales report contains nm_id:', hasNmId);
      if (hasNmId) {
        const examples = response.data.slice(0, 3).map(item => ({
          nm_id: item.nm_id,
          quantity: item.quantity,
          subject: item.subject_name
        }));
        console.log('Examples of sales with nm_id:', examples);
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching sales report:', error);
    throw error;
  }
};

// Function to process sales report
export const processSalesReport = async (apiKey: string, dateFrom: Date, dateTo: Date, storeId: string): Promise<{
  sales: any[],
  totalCostPrice: number
}> => {
  try {
    let allSales: any[] = [];
    let rrdid = 0;
    let hasMoreData = true;
    
    // Get all report data (possibly multiple pages)
    while (hasMoreData) {
      const salesData = await fetchSalesReport(apiKey, dateFrom, dateTo, 100000, rrdid);
      
      if (!salesData || !Array.isArray(salesData) || salesData.length === 0) {
        hasMoreData = false;
        continue;
      }
      
      allSales = [...allSales, ...salesData];
      console.log(`Fetched ${salesData.length} sales records, total: ${allSales.length}`);
      
      // Check if another page needs to be loaded
      if (salesData.length > 0) {
        const lastItem = salesData[salesData.length - 1];
        rrdid = lastItem.rrd_id || 0;
      } else {
        hasMoreData = false;
      }
    }
    
    console.log(`Total sales records fetched: ${allSales.length}`);
    
    // Calculate total cost price
    const totalCostPrice = await calculateTotalCostPrice(allSales, storeId);
    
    return {
      sales: allSales,
      totalCostPrice
    };
  } catch (error) {
    console.error('Error processing sales report:', error);
    return {
      sales: [],
      totalCostPrice: 0
    };
  }
};

export default api;

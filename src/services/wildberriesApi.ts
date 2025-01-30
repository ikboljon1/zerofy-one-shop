export interface WildberriesResponse {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
    };
    netProfit: number;
    acceptance: number;
  };
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
  }>;
  productSales: Array<{
    subject_name: string;
    quantity: number;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
}

interface WildberriesReportItem {
  realizationreport_id: number;
  date_from: string;
  date_to: string;
  nm_id: string;
  doc_type_name: string;
  quantity: number;
  retail_amount: number;
  ppvz_for_pay: number;
  delivery_rub: number;
  penalty: number;
  storage_fee: number;
  acceptance: number;
  deduction: number;
  sale_dt: string;
  subject_name: string;
}

interface CachedData {
  timestamp: number;
  data: WildberriesReportItem[];
}

const WB_REPORT_URL = 'https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod';
const WB_CONTENT_URL = "https://suppliers-api.wildberries.ru/content/v2/get/cards/list";

const dataCache: { [key: string]: CachedData } = {};
const requestTimestamps: { [key: string]: number } = {};

// Increased delays and limits for better rate limiting handling
const RETRY_DELAY = 60000; // 1 minute delay between retries
const INITIAL_RETRY_DELAY = 5000; // 5 seconds for first retry
const MAX_RETRIES = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 minute window for rate limiting
const MAX_REQUESTS_PER_WINDOW = 5; // Maximum requests per minute

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldThrottle = (key: string): boolean => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Count requests in the current window
  const requestsInWindow = Object.entries(requestTimestamps)
    .filter(([, timestamp]) => timestamp > windowStart)
    .length;
    
  return requestsInWindow >= MAX_REQUESTS_PER_WINDOW;
};

const updateRequestTimestamp = (key: string) => {
  requestTimestamps[key] = Date.now();
  
  // Cleanup old timestamps
  const windowStart = Date.now() - RATE_LIMIT_WINDOW;
  Object.keys(requestTimestamps).forEach(key => {
    if (requestTimestamps[key] < windowStart) {
      delete requestTimestamps[key];
    }
  });
};

const calculateRetryDelay = (retryCount: number): number => {
  if (retryCount === 0) return INITIAL_RETRY_DELAY;
  return Math.min(RETRY_DELAY * Math.pow(2, retryCount - 1), 300000); // Max 5 minutes
};

const fetchWithRetry = async (
  url: string, 
  headers: HeadersInit, 
  params?: URLSearchParams, 
  method: string = 'GET',
  body?: any,
  retryCount = 0
): Promise<any> => {
  const requestKey = `${url}${params ? params.toString() : ''}`;

  if (shouldThrottle(requestKey)) {
    console.log('Rate limiting in effect, waiting before making request...');
    await delay(calculateRetryDelay(retryCount));
  }

  try {
    updateRequestTimestamp(requestKey);
    
    const requestOptions: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    const fullUrl = `${url}${params ? `?${params}` : ''}`;
    const response = await fetch(fullUrl, requestOptions);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : calculateRetryDelay(retryCount);
      
      console.log(`Rate limit hit, waiting ${waitTime/1000} seconds before retry ${retryCount + 1}/${MAX_RETRIES}`);
      
      if (retryCount < MAX_RETRIES) {
        await delay(waitTime);
        return fetchWithRetry(url, headers, params, method, body, retryCount + 1);
      }
    }

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    return response.json();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const waitTime = calculateRetryDelay(retryCount);
      console.log(`Request failed, waiting ${waitTime/1000} seconds before retry ${retryCount + 1}/${MAX_RETRIES}`);
      await delay(waitTime);
      return fetchWithRetry(url, headers, params, method, body, retryCount + 1);
    }
    
    if (error instanceof Error) {
      console.error('Fetch error:', error.message);
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
};

const fetchAndCacheData = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<WildberriesReportItem[]> => {
  const cacheKey = `${apiKey}_${dateFrom.toISOString()}_${dateTo.toISOString()}`;
  const now = Date.now();
  
  if (dataCache[cacheKey] && (now - dataCache[cacheKey].timestamp) < 3600000) {
    console.log('Using cached data');
    return dataCache[cacheKey].data;
  }

  const params = new URLSearchParams({
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0],
    limit: '100000'
  });

  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json'
  };

  try {
    const data = await fetchWithRetry(WB_REPORT_URL, headers, params);
    
    dataCache[cacheKey] = {
      timestamp: now,
      data: data
    };

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch Wildberries data');
  }
};

const fetchProductNames = async (apiKey: string, nmIds: string[]): Promise<Map<string, { name: string, image: string }>> => {
  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json'
  };

  const payload = {
    settings: {
      filter: {
        withPhoto: -1,
        nmID: nmIds
      },
      cursor: {
        limit: 100
      }
    }
  };

  try {
    // Changed to use POST method and include payload
    const data = await fetchWithRetry(
      WB_CONTENT_URL, 
      headers, 
      undefined, 
      'POST', 
      payload
    );
    
    const productInfo = new Map<string, { name: string, image: string }>();

    if (data.cards) {
      data.cards.forEach((card: any) => {
        const image = card.photos && card.photos.length > 0 ? card.photos[0].big : null;
        productInfo.set(card.nmID.toString(), {
          name: card.title || 'Неизвестный товар',
          image: image || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
        });
      });
    }

    return productInfo;
  } catch (error) {
    console.error('Error fetching product names:', error);
    return new Map();
  }
};

const fetchProductExpenses = async (apiKey: string, nmId: string, dateFrom: Date, dateTo: Date) => {
  try {
    const url = new URL("https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod");
    url.searchParams.append("dateFrom", dateFrom.toISOString().split('T')[0]);
    url.searchParams.append("dateTo", dateTo.toISOString().split('T')[0]);
    url.searchParams.append("limit", "100000");
    url.searchParams.append("nmId", nmId);

    console.log('Fetching expenses for product:', nmId);

    const response = await fetch(url.toString(), {
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Суммируем все расходы для товара
    const totalExpenses = {
      logistics: 0,
      storage: 0,
      penalties: 0,
      acceptance: 0
    };

    data.forEach((item: any) => {
      totalExpenses.logistics += item.delivery_rub || 0;
      totalExpenses.storage += item.storage_fee || 0;
      totalExpenses.penalties += item.penalty || 0;
      totalExpenses.acceptance += item.acceptance || 0;
    });

    console.log('Total expenses for product', nmId, ':', totalExpenses);
    return totalExpenses;
  } catch (error) {
    console.error('Error fetching product expenses:', error);
    return {
      logistics: 0,
      storage: 0,
      penalties: 0,
      acceptance: 0
    };
  }
};

const calculateStats = async (data: WildberriesReportItem[], apiKey: string): Promise<WildberriesResponse> => {
  const stats: WildberriesResponse = {
    currentPeriod: {
      sales: 0,
      transferred: 0,
      expenses: {
        total: 0,
        logistics: 0,
        storage: 0,
        penalties: 0
      },
      netProfit: 0,
      acceptance: 0
    },
    dailySales: [],
    productSales: []
  };

  const dailySales = new Map<string, { sales: number; previousSales: number }>();
  const productSales = new Map<string, number>();
  const salesByProduct = new Map<string, number>();

  // Получаем общие расходы для каждого товара
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (const item of data) {
    if (item.doc_type_name === "Продажа") {
      const expenses = await fetchProductExpenses(apiKey, item.nm_id, startDate, endDate);
      
      // Сохраняем общие расходы в localStorage
      const expensesData = JSON.parse(localStorage.getItem('expenses_data') || '{}');
      expensesData[item.nm_id] = expenses;
      localStorage.setItem('expenses_data', JSON.stringify(expensesData));
    }

    const saleDate = item.sale_dt.split('T')[0];
    const currentSales = dailySales.get(saleDate) || { sales: 0, previousSales: 0 };
    currentSales.sales += item.retail_amount || 0;
    dailySales.set(saleDate, currentSales);

    const currentQuantity = productSales.get(item.subject_name) || 0;
    productSales.set(item.subject_name, currentQuantity + (item.quantity || 0));

    stats.currentPeriod.sales += item.retail_amount || 0;
    stats.currentPeriod.transferred += item.ppvz_for_pay || 0;
    
    const logistics = item.delivery_rub || 0;
    const storage = item.storage_fee || 0;
    const penalties = item.penalty || 0;
    const acceptance = item.acceptance || 0;
    const deduction = item.deduction || 0;

    stats.currentPeriod.expenses.logistics += logistics;
    stats.currentPeriod.expenses.storage += storage;
    stats.currentPeriod.expenses.penalties += penalties;
    stats.currentPeriod.acceptance += acceptance;

    stats.currentPeriod.expenses.total += logistics + storage + penalties + acceptance + deduction;
    
    if (item.doc_type_name === "Продажа") {
      const currentSalesByProduct = salesByProduct.get(item.nm_id) || 0;
      salesByProduct.set(item.nm_id, currentSalesByProduct + (item.quantity || 0));
    }
  }

  stats.currentPeriod.netProfit = 
    stats.currentPeriod.transferred - stats.currentPeriod.expenses.total;

  const sortedDailySales = Array.from(dailySales.entries())
    .map(([date, values]) => ({
      date,
      ...values
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const sortedProductSales = Array.from(productSales.entries())
    .map(([name, quantity]) => ({
      subject_name: name,
      quantity
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  stats.dailySales = sortedDailySales;
  stats.productSales = sortedProductSales;

  // Save sales data to localStorage
  const salesData: { [key: string]: number } = {};
  salesByProduct.forEach((value, key) => {
    salesData[key] = value;
  });
  
  // Get store ID from localStorage (you'll need to set this when selecting a store)
  const storeId = localStorage.getItem('currentStoreId');
  if (storeId) {
    localStorage.setItem(`sales_${storeId}`, JSON.stringify(salesData));
  }

  const { topProfitable, topUnprofitable } = await getTopProducts(data, apiKey);
  
  stats.topProfitableProducts = topProfitable;
  stats.topUnprofitableProducts = topUnprofitable;

  return stats;
};

const getTopProducts = async (data: WildberriesReportItem[], apiKey: string) => {
  // Create a map to store product data
  const productMap = new Map<string, {
    sales: number;
    profit: number;
    nmId: string;
  }>();

  // Calculate sales and profit for each product
  data.forEach((item) => {
    if (item.doc_type_name === "Продажа") {
      const nmId = item.nm_id;
      const currentData = productMap.get(nmId) || {
        sales: 0,
        profit: 0,
        nmId: nmId
      };

      currentData.sales += item.quantity || 0;
      currentData.profit += item.ppvz_for_pay || 0;
      
      // Subtract expenses
      currentData.profit -= (
        (item.delivery_rub || 0) +
        (item.storage_fee || 0) +
        (item.penalty || 0) +
        (item.acceptance || 0)
      );

      productMap.set(nmId, currentData);
    }
  });

  // Convert map to array and sort by profit
  const sortedProducts = Array.from(productMap.values())
    .sort((a, b) => b.profit - a.profit);

  // Get product details from content API
  const nmIds = sortedProducts.map(p => p.nmId);
  const productInfo = await fetchProductNames(apiKey, nmIds);

  // Prepare top profitable and unprofitable products
  const topProfitable = sortedProducts
    .slice(0, 5)
    .map(product => ({
      name: productInfo.get(product.nmId)?.name || 'Неизвестный товар',
      price: product.sales.toString(),
      profit: product.profit.toFixed(2),
      image: productInfo.get(product.nmId)?.image || ''
    }));

  const topUnprofitable = sortedProducts
    .slice(-5)
    .reverse()
    .map(product => ({
      name: productInfo.get(product.nmId)?.name || 'Неизвестный товар',
      price: product.sales.toString(),
      profit: product.profit.toFixed(2),
      image: productInfo.get(product.nmId)?.image || ''
    }));

  return {
    topProfitable,
    topUnprofitable
  };
};

export const fetchWildberriesStats = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<WildberriesResponse> => {
  try {
    const data = await fetchAndCacheData(apiKey, dateFrom, dateTo);
    return await calculateStats(data, apiKey);
  } catch (error) {
    console.error('Ошибка получения статистики Wildberries:', error);
    throw new Error('Не удалось загрузить статистику Wildberries');
  }
};

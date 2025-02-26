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

interface Warehouse {
  name: string;
  officeId: number;
  id: number;
  cargoType: 1 | 2 | 3;
  deliveryType: 1 | 2 | 3;
}

interface WarehouseRemains {
  brand: string;
  subjectName: string;
  vendorCode: string;
  nmId: number;
  barcode: string;
  techSize: string;
  volume: number;
  inWayToClient: number;
  inWayFromClient: number;
  quantityWarehousesFull: number;
  warehouses: Array<{
    warehouseName: string;
    quantity: number;
  }>;
}

const WB_REPORT_URL = 'https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod';
const WB_CONTENT_URL = "https://suppliers-api.wildberries.ru/content/v2/get/cards/list";
const WB_MARKETPLACE_API = 'https://marketplace-api.wildberries.ru';
const WB_ANALYTICS_API = 'https://seller-analytics-api.wildberries.ru';

const dataCache: { [key: string]: CachedData } = {};
const requestTimestamps: { [key: string]: number } = {};

const RETRY_DELAY = 2000; // 2 seconds between retries
const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW = 1000; // 1 second window
const MAX_REQUESTS_PER_WINDOW = 2;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldThrottle = (key: string): boolean => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  const requestsInWindow = Object.entries(requestTimestamps)
    .filter(([, timestamp]) => timestamp > windowStart)
    .length;
    
  return requestsInWindow >= MAX_REQUESTS_PER_WINDOW;
};

const updateRequestTimestamp = (key: string) => {
  requestTimestamps[key] = Date.now();
  
  const windowStart = Date.now() - RATE_LIMIT_WINDOW;
  Object.keys(requestTimestamps).forEach(key => {
    if (requestTimestamps[key] < windowStart) {
      delete requestTimestamps[key];
    }
  });
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
    await delay(RETRY_DELAY);
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
      if (retryCount < MAX_RETRIES) {
        await delay(RETRY_DELAY * (retryCount + 1));
        return fetchWithRetry(url, headers, params, method, body, retryCount + 1);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY * (retryCount + 1));
      return fetchWithRetry(url, headers, params, method, body, retryCount + 1);
    }
    throw error;
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

const calculateProductStats = (data: WildberriesReportItem[]) => {
  const productStats = new Map<string, {
    name: string,
    profit: number,
    price: number,
    sales: number,
    quantity: number,
    returns: number,
    logistics: number,
    storage: number,
    penalties: number,
    deductions: number,
    nmId: string
  }>();

  data.forEach(item => {
    const currentStats = productStats.get(item.subject_name) || {
      name: item.subject_name,
      profit: 0,
      price: 0,
      sales: 0,
      quantity: 0,
      returns: 0,
      logistics: 0,
      storage: 0,
      penalties: 0,
      deductions: 0,
      nmId: item.nm_id
    };

    if (item.doc_type_name === "Продажа") {
      currentStats.sales += item.retail_amount || 0;
      currentStats.quantity += item.quantity || 0;
      currentStats.logistics += item.delivery_rub || 0;
      currentStats.storage += item.storage_fee || 0;
      currentStats.penalties += item.penalty || 0;
      currentStats.deductions += item.deduction || 0;
    } else if (item.doc_type_name === "Возврат") {
      currentStats.returns += item.retail_amount || 0;
    }

    currentStats.profit = currentStats.sales - (
      currentStats.logistics +
      currentStats.storage +
      currentStats.penalties +
      currentStats.deductions +
      currentStats.returns
    );

    currentStats.price = currentStats.sales / (currentStats.quantity || 1);

    productStats.set(item.subject_name, currentStats);
  });

  return Array.from(productStats.values());
};

const getTopProducts = async (data: WildberriesReportItem[], apiKey: string) => {
  const productProfits: { [key: string]: number } = {};
  const nmIdsList: string[] = [];

  data.forEach(item => {
    const nmId = item.nm_id;
    if (!nmId) return;

    nmIdsList.push(nmId);
    
    const ppvzForPay = item.ppvz_for_pay || 0;
    const deliveryRub = item.delivery_rub || 0;
    const storageFee = item.storage_fee || 0;
    const penalty = item.penalty || 0;
    const deduction = item.deduction || 0;
    const acceptance = item.acceptance || 0;
    const retailAmount = item.retail_amount || 0;

    const profit = ppvzForPay - deliveryRub - storageFee - penalty - deduction - acceptance - retailAmount;

    if (!productProfits[nmId]) {
      productProfits[nmId] = 0;
    }
    productProfits[nmId] += profit;
  });

  const productInfo = await fetchProductNames(apiKey, Array.from(new Set(nmIdsList)));

  const sortedProducts = Object.entries(productProfits)
    .sort(([, a], [, b]) => b - a);

  const topProfitable = sortedProducts.slice(0, 3).map(([nmId, profit]) => {
    const info = productInfo.get(nmId) || { 
      name: 'Неизвестный товар',
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
    };
    return {
      name: info.name,
      price: "0",
      profit: `+${profit.toFixed(0)}`,
      image: info.image
    };
  });

  const topUnprofitable = sortedProducts.slice(-3).reverse().map(([nmId, profit]) => {
    const info = productInfo.get(nmId) || {
      name: 'Неизвестный товар',
      image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
    };
    return {
      name: info.name,
      price: "0",
      profit: profit.toFixed(0),
      image: info.image
    };
  });

  return { topProfitable, topUnprofitable };
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

  data.forEach(item => {
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
  });

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

  stats.topProfitableProducts = [
    {
      name: "Загрузка...",
      price: "0",
      profit: "+0",
      image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
    }
  ];
  
  stats.topUnprofitableProducts = [
    {
      name: "Загрузка...",
      price: "0",
      profit: "0",
      image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
    }
  ];

  return stats;
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

export const fetchWarehouses = async (apiKey: string): Promise<Warehouse[]> => {
  try {
    const response = await fetch('https://suppliers-api.wildberries.ru/api/v3/offices', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch warehouses');
    }

    const data = await response.json();
    console.log('Warehouses data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

export const fetchWarehouseRemains = async (apiKey: string): Promise<WarehouseRemains[]> => {
  try {
    const response = await fetch('https://statistics-api.wildberries.ru/api/v1/supplier/stocks', {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch warehouse remains');
    }

    const data = await response.json();
    console.log('Warehouse remains data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching warehouse remains:', error);
    throw error;
  }
};

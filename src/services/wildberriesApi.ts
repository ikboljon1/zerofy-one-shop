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

const RETRY_DELAY = 60000; // 60 seconds delay between retries
const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW = 60000; // 1 minute window for rate limiting

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldThrottle = (key: string): boolean => {
  const now = Date.now();
  const lastRequest = requestTimestamps[key] || 0;
  return (now - lastRequest) < RATE_LIMIT_WINDOW;
};

const updateRequestTimestamp = (key: string) => {
  requestTimestamps[key] = Date.now();
};

const fetchWithRetry = async (url: string, headers: HeadersInit, params?: URLSearchParams, retryCount = 0): Promise<any> => {
  const requestKey = `${url}${params ? params.toString() : ''}`;

  if (shouldThrottle(requestKey) && retryCount === 0) {
    console.log('Rate limiting in effect, waiting before making request...');
    await delay(RATE_LIMIT_WINDOW);
  }

  try {
    updateRequestTimestamp(requestKey);
    const response = await fetch(`${url}${params ? `?${params}` : ''}`, { headers });
    
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      console.log(`Rate limit hit, waiting ${RETRY_DELAY/1000} seconds before retry ${retryCount + 1}/${MAX_RETRIES}`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, headers, params, retryCount + 1);
    }

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    return response.json();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Request failed, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, headers, params, retryCount + 1);
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
        withPhoto: -1
      },
      cursor: {
        limit: 100
      }
    }
  };

  try {
    const data = await fetchWithRetry(WB_CONTENT_URL, headers, undefined);
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
}

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
    } else if (item.doc_type_name === "Возврат") {
      currentStats.returns += item.retail_amount || 0;
    }

    currentStats.logistics += item.delivery_rub || 0;
    currentStats.storage += item.storage_fee || 0;
    currentStats.penalties += item.penalty || 0;
    currentStats.deductions += item.deduction || 0;
    
    currentStats.profit = item.ppvz_for_pay - (
      currentStats.logistics +
      currentStats.storage +
      currentStats.penalties +
      currentStats.deductions +
      currentStats.returns
    );

    currentStats.price = item.retail_amount / (item.quantity || 1);

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

  const { topProfitable, topUnprofitable } = await getTopProducts(data, apiKey);
  
  stats.topProfitableProducts = topProfitable;
  stats.topUnprofitableProducts = topUnprofitable;

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

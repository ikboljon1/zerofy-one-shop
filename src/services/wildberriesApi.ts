export interface WildberriesResponse {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      acceptance: number;
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
  retail_price: number;
  retail_price_withdisc_rub: number;
  ppvz_for_pay: number;
  delivery_rub: number;
  penalty: number;
  storage_fee: number;
  acceptance: number;
  deduction: number;
  rebill_logistic_cost: number;
  sale_dt: string;
  subject_name: string;
  bonus_type_name?: string;
  acquiring_fee?: number;
  ppvz_vw?: number;
  rrd_id?: number;
}

interface CachedData {
  timestamp: number;
  data: WildberriesReportItem[];
}

const WB_REPORT_URL = 'https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod';
const WB_CONTENT_URL = "https://suppliers-api.wildberries.ru/content/v2/get/cards/list";

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

/**
 * Fetches all data with pagination, similar to Python implementation
 */
const fetchAllDataWithPagination = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<WildberriesReportItem[]> => {
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json'
  };

  let allData: WildberriesReportItem[] = [];
  let nextRrdId = 0;

  while (true) {
    const params = new URLSearchParams({
      dateFrom: formatDate(dateFrom),
      dateTo: formatDate(dateTo),
      rrdid: nextRrdId.toString(),
      limit: '100000'
    });

    try {
      console.log(`Fetching data with rrdid: ${nextRrdId}`);
      const reportData = await fetchWithRetry(WB_REPORT_URL, headers, params);
      
      if (!reportData || reportData.length === 0) {
        console.log("No more data to fetch");
        break;
      }

      allData = [...allData, ...reportData];
      
      // Get the next rrdid for pagination from the last record
      const lastRecord = reportData[reportData.length - 1];
      nextRrdId = lastRecord?.rrd_id || 0;
      
      if (!nextRrdId) {
        console.log("No next rrdid, pagination complete");
        break;
      }
      
      console.log(`Loaded ${reportData.length} rows. Next rrd_id: ${nextRrdId}`);
    } catch (error) {
      console.error('Error fetching paginated data:', error);
      break;
    }
  }

  return allData;
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

  try {
    const data = await fetchAllDataWithPagination(apiKey, dateFrom, dateTo);
    
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

/**
 * Calculate metrics based on the Python implementation
 */
const calculateMetrics = (data: WildberriesReportItem[]): any => {
  if (!data || data.length === 0) {
    return null;
  }

  let totalSales = 0;           // Продажа
  let totalForPay = 0;          // К перечислению за товар
  let totalDeliveryRub = 0;     // Стоимость логистики
  let totalRebillLogisticCost = 0; // Логистика (возмещение издержек) 
  let totalStorageFee = 0;      // Стоимость хранения
  let totalReturns = 0;         // Возврат
  let totalPenalty = 0;         // Штрафы
  let totalDeduction = 0;       // Удержания
  let totalAcceptance = 0;      // Приемка
  
  // Daily sales tracking
  const dailySalesMap = new Map<string, { sales: number; previousSales: number }>();
  
  // Product sales tracking for pie chart
  const productSalesMap = new Map<string, number>();

  for (const record of data) {
    if (record.doc_type_name === 'Продажа') {
      totalSales += record.retail_price_withdisc_rub || record.retail_amount || 0;
      totalForPay += record.ppvz_for_pay || 0;
      
      // Add to product sales for pie chart
      const currentQuantity = productSalesMap.get(record.subject_name) || 0;
      productSalesMap.set(record.subject_name, currentQuantity + (record.quantity || 0));
      
      // Track daily sales
      const saleDate = record.sale_dt.split('T')[0];
      const currentDailySales = dailySalesMap.get(saleDate) || { sales: 0, previousSales: 0 };
      currentDailySales.sales += record.retail_price_withdisc_rub || record.retail_amount || 0;
      dailySalesMap.set(saleDate, currentDailySales);
    } else if (record.doc_type_name === 'Возврат') {
      totalReturns += record.ppvz_for_pay || 0;
    }

    // Track expenses for all operations
    totalDeliveryRub += record.delivery_rub || 0;
    totalRebillLogisticCost += record.rebill_logistic_cost || 0;
    totalStorageFee += record.storage_fee || 0;
    totalPenalty += record.penalty || 0;
    totalDeduction += record.deduction || 0;
    totalAcceptance += record.acceptance || 0;
  }

  // Calculate total to pay (net profit)
  const totalToPay = totalForPay - totalDeliveryRub - totalStorageFee - totalReturns - totalPenalty - totalDeduction;

  // Prepare daily sales for chart
  const sortedDailySales = Array.from(dailySalesMap.entries())
    .map(([date, values]) => ({
      date,
      ...values
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Prepare product sales for pie chart
  const sortedProductSales = Array.from(productSalesMap.entries())
    .map(([name, quantity]) => ({
      subject_name: name,
      quantity
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return {
    metrics: {
      total_sales: totalSales,
      total_for_pay: totalForPay,
      total_delivery_rub: totalDeliveryRub,
      total_rebill_logistic_cost: totalRebillLogisticCost,
      total_storage_fee: totalStorageFee,
      total_returns: totalReturns,
      total_penalty: totalPenalty,
      total_deduction: totalDeduction,
      total_to_pay: totalToPay,
      total_acceptance: totalAcceptance
    },
    dailySales: sortedDailySales,
    productSales: sortedProductSales
  };
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

/**
 * Calculate stats based on the Python implementation
 */
const calculateStats = async (data: WildberriesReportItem[], apiKey: string): Promise<WildberriesResponse> => {
  const metricsData = calculateMetrics(data);
  
  if (!metricsData) {
    throw new Error('No data available to calculate metrics');
  }
  
  // Initialize stats object
  const stats: WildberriesResponse = {
    currentPeriod: {
      sales: metricsData.metrics.total_sales,
      transferred: metricsData.metrics.total_for_pay,
      expenses: {
        total: (
          metricsData.metrics.total_delivery_rub + 
          metricsData.metrics.total_storage_fee +
          metricsData.metrics.total_penalty +
          metricsData.metrics.total_deduction +
          metricsData.metrics.total_acceptance
        ),
        logistics: metricsData.metrics.total_delivery_rub,
        storage: metricsData.metrics.total_storage_fee,
        penalties: metricsData.metrics.total_penalty,
        acceptance: metricsData.metrics.total_acceptance
      },
      netProfit: metricsData.metrics.total_to_pay,
      acceptance: metricsData.metrics.total_acceptance
    },
    dailySales: metricsData.dailySales,
    productSales: metricsData.productSales,
    topProfitableProducts: [
      {
        name: "Загрузка...",
        price: "0",
        profit: "+0",
        image: "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"
      }
    ],
    topUnprofitableProducts: [
      {
        name: "Загрузка...",
        price: "0",
        profit: "0",
        image: "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg"
      }
    ]
  };

  return stats;
};

export const fetchWildberriesStats = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<WildberriesResponse> => {
  try {
    console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    const data = await fetchAndCacheData(apiKey, dateFrom, dateTo);
    console.log(`Received ${data.length} records from Wildberries API`);
    return await calculateStats(data, apiKey);
  } catch (error) {
    console.error('Ошибка получения статистики Wildberries:', error);
    throw new Error('Не удалось загрузить статистику Wildberries');
  }
};

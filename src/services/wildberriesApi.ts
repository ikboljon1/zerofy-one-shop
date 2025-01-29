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

const dataCache: { [key: string]: CachedData } = {};

const requestTimestamps: { [key: string]: number } = {};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const waitForRateLimit = async (apiKey: string) => {
  const now = Date.now();
  const lastRequestTime = requestTimestamps[apiKey] || 0;
  const timeToWait = Math.max(0, lastRequestTime + 60000 - now);

  if (timeToWait > 0) {
    console.log(`Ожидание ограничения скорости: ${timeToWait}мс до следующего запроса`);
    await delay(timeToWait);
  }

  requestTimestamps[apiKey] = Date.now();
};

const fetchAndCacheData = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date
): Promise<WildberriesReportItem[]> => {
  const cacheKey = `${apiKey}_${dateFrom.toISOString()}_${dateTo.toISOString()}`;
  const now = Date.now();
  
  if (dataCache[cacheKey] && (now - dataCache[cacheKey].timestamp) < 3600000) {
    console.log('Используются кэшированные данные');
    return dataCache[cacheKey].data;
  }

  await waitForRateLimit(apiKey);

  const params = new URLSearchParams({
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0],
    limit: '100000'
  });

  const response = await fetch(`${WB_REPORT_URL}?${params}`, {
    headers: { 'Authorization': apiKey }
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Превышен лимит запросов к API. Пожалуйста, подождите минуту.');
    }
    throw new Error(`Ошибка HTTP! статус: ${response.status}`);
  }

  const data: WildberriesReportItem[] = await response.json();
  
  dataCache[cacheKey] = {
    timestamp: now,
    data: data
  };

  return data;
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

const fetchProductNames = async (apiKey: string, nmIds: string[]): Promise<Map<string, string>> => {
  const productNames = new Map<string, string>();
  
  const payload = {
    settings: {
      filter: {
        nmIDs: nmIds,
        withPhoto: -1
      },
      cursor: {
        limit: 100
      }
    }
  };

  try {
    const response = await fetch('https://content-api.wildberries.ru/content/v2/get/cards/list', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    data.cards.forEach((card: any) => {
      productNames.set(card.nmID.toString(), card.title || 'Неизвестный товар');
    });
  } catch (error) {
    console.error('Error fetching product names:', error);
  }

  return productNames;
}

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

  const productStats = calculateProductStats(data);
  
  const nmIds = productStats.map(product => product.nmId).filter(Boolean);
  const productNames = await fetchProductNames(apiKey, nmIds);
  
  const sortedByProfit = [...productStats].sort((a, b) => b.profit - a.profit);
  
  const defaultProductImage = "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg";
  const defaultUnprofitableImage = "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg";
  
  stats.topProfitableProducts = sortedByProfit.slice(0, 3).map(product => ({
    name: productNames.get(product.nmId) || product.name,
    price: product.price.toFixed(2),
    profit: `+${product.profit.toFixed(0)}`,
    image: defaultProductImage
  }));

  stats.topUnprofitableProducts = sortedByProfit.slice(-3).reverse().map(product => ({
    name: productNames.get(product.nmId) || product.name,
    price: product.price.toFixed(2),
    profit: product.profit.toFixed(0),
    image: defaultUnprofitableImage
  }));

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

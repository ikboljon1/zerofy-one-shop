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
  ppvz_for_pay: number;
  delivery_rub: number;
  penalty: number;
  storage_fee: number;
  acceptance: number;
  deduction: number;
  sale_dt: string;
  subject_name: string;
  bonus_type_name?: string;
  acquiring_fee?: number;
  ppvz_vw?: number;
  rebill_logistic_cost?: number;
  retail_price?: number;
  retail_price_withdisc_rub?: number;
}

const WB_REPORT_URL = 'https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod';
const WB_CONTENT_URL = "https://suppliers-api.wildberries.ru/content/v2/get/cards/list";

const requestTimestamps: { [key: string]: number } = {};

const RETRY_DELAY = 2000; // 2 секунды между повторными попытками
const MAX_RETRIES = 3;
const RATE_LIMIT_WINDOW = 1000; // 1 секундное окно
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
    console.log(`Выполняется запрос к API: ${fullUrl}`);
    
    const response = await fetch(fullUrl, requestOptions);
    
    if (response.status === 429) {
      console.log('Получен статус 429 (слишком много запросов), ожидание перед повторной попыткой...');
      if (retryCount < MAX_RETRIES) {
        await delay(RETRY_DELAY * (retryCount + 1));
        return fetchWithRetry(url, headers, params, method, body, retryCount + 1);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Получены данные от API, количество записей: ${Array.isArray(data) ? data.length : 'Неизвестно'}`);
    return data;
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    if (retryCount < MAX_RETRIES) {
      console.log(`Повторная попытка ${retryCount + 1} из ${MAX_RETRIES}...`);
      await delay(RETRY_DELAY * (retryCount + 1));
      return fetchWithRetry(url, headers, params, method, body, retryCount + 1);
    }
    throw error;
  }
};

const fetchData = async (
  apiKey: string,
  dateFrom: Date,
  dateTo: Date,
  rrdid = 0
): Promise<WildberriesReportItem[]> => {
  console.log(`Запрос данных за период: ${dateFrom.toISOString()} - ${dateTo.toISOString()}, rrdid: ${rrdid}`);
  
  const params = new URLSearchParams({
    dateFrom: dateFrom.toISOString().split('T')[0],
    dateTo: dateTo.toISOString().split('T')[0],
    limit: '100000',
    rrdid: rrdid.toString()
  });

  const headers = {
    'Authorization': apiKey,
    'Content-Type': 'application/json'
  };

  try {
    const data = await fetchWithRetry(WB_REPORT_URL, headers, params);
    
    if (!Array.isArray(data)) {
      console.error('Неожиданный формат данных от API:', data);
      return [];
    }
    
    if (data.length > 0) {
      const lastRecord = data[data.length - 1];
      const nextRrdid = lastRecord.rrd_id;
      
      if (nextRrdid && nextRrdid !== rrdid) {
        console.log(`Обнаружена пагинация, следующий rrdid: ${nextRrdid}`);
        const nextPageData = await fetchData(apiKey, dateFrom, dateTo, nextRrdid);
        return [...data, ...nextPageData];
      }
    }
    
    return data;
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    throw new Error('Не удалось получить данные от Wildberries API');
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
    console.error('Ошибка при получении информации о товарах:', error);
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

const calculateStats = async (data: WildberriesReportItem[], apiKey: string): Promise<WildberriesResponse> => {
  const stats: WildberriesResponse = {
    currentPeriod: {
      sales: 0,
      transferred: 0,
      expenses: {
        total: 0,
        logistics: 0,
        storage: 0,
        penalties: 0,
        acceptance: 0
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
    
    if (item.doc_type_name === "Продажа") {
      stats.currentPeriod.sales += item.retail_amount || 0;
      currentSales.sales += item.retail_amount || 0;
      dailySales.set(saleDate, currentSales);
      
      const currentQuantity = productSales.get(item.subject_name) || 0;
      productSales.set(item.subject_name, currentQuantity + (item.quantity || 0));
      
      stats.currentPeriod.transferred += item.ppvz_for_pay || 0;
    }
    
    let logistics = item.rebill_logistic_cost || item.delivery_rub || 0;
    let storage = item.storage_fee || 0;
    let penalties = item.penalty || 0;
    let acceptance = item.acceptance || 0;
    
    if (item.bonus_type_name) {
      penalties = 0;
    }
    
    stats.currentPeriod.expenses.logistics += logistics;
    stats.currentPeriod.expenses.storage += storage;
    stats.currentPeriod.expenses.penalties += penalties;
    stats.currentPeriod.expenses.acceptance += acceptance;
    
    const acquiringFee = item.acquiring_fee || 0;
    const ppvzVw = Math.abs(item.ppvz_vw || 0);
    const deduction = item.deduction || 0;
    
    stats.currentPeriod.expenses.total += logistics + storage + penalties + acceptance + acquiringFee + ppvzVw + deduction;
  });

  stats.currentPeriod.netProfit = stats.currentPeriod.transferred - stats.currentPeriod.expenses.total;

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
    console.log('Запуск получения статистики Wildberries...');
    
    const data = await fetchData(apiKey, dateFrom, dateTo);
    console.log(`Получено ${data.length} записей от API`);
    
    const stats = await calculateStats(data, apiKey);
    console.log('Статистика успешно рассчитана');
    
    return stats;
  } catch (error) {
    console.error('Ошибка получения статистики Wildberries:', error);
    throw new Error('Не удалось загрузить статистику Wildberries');
  }
};

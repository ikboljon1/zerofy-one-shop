import { differenceInMonths } from 'date-fns';

export interface WildberriesReportItem {
  date: string;
  quantity: number;
  acceptedQuantity: number;
  acceptedAmount: number;
  storageAmount: number;
  logisticAmount: number;
  penaltyAmount: number;
  sale: number;
  ppvz_for_pay: number;
  acceptance: number;
  nm_id: string;
  subject_name: string;
  doc_type_name: string;
  delivery_rub: number;
  penalty: number;
  storage_fee: number;
  retail_amount: number;
  retail_price: number;
  deduction: number;
}

export interface ProductInfo {
  nm_id: string;
  name: string;
  profit: number;
  image: string;
}

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
    profitableProducts: ProductInfo[];
    unprofitableProducts: ProductInfo[];
  };
}

const WB_REPORT_URL = 'https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod';
const WB_CONTENT_URL = 'https://suppliers-api.wildberries.ru/content/v2/get/cards/list';

// Rate limiting implementation
const requestTimestamps: { [key: string]: number } = {};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const waitForRateLimit = async (apiKey: string) => {
  const now = Date.now();
  const lastRequestTime = requestTimestamps[apiKey] || 0;
  const timeToWait = Math.max(0, lastRequestTime + 60000 - now); // 60000ms = 1 minute

  if (timeToWait > 0) {
    console.log(`Ожидание ограничения скорости: ${timeToWait}мс до следующего запроса`);
    await delay(timeToWait);
  }

  requestTimestamps[apiKey] = Date.now();
};

const fetchWithRetry = async (url: string, options: RequestInit, apiKey: string) => {
  await waitForRateLimit(apiKey);
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Превышен лимит запросов к API. Пожалуйста, подождите минуту и попробуйте снова.');
    }
    throw new Error(`Ошибка HTTP! статус: ${response.status}`);
  }

  return response.json();
};

const calculateProductProfits = (data: WildberriesReportItem[]): Map<string, number> => {
  const productProfits = new Map<string, number>();

  data.forEach(item => {
    if (!item.nm_id) return;

    const profit = (item.ppvz_for_pay || 0) -
                  (item.delivery_rub || 0) -
                  (item.storage_fee || 0) -
                  (item.penalty || 0) -
                  (item.deduction || 0) -
                  (item.acceptance || 0) -
                  (item.retail_amount || 0);

    const currentProfit = productProfits.get(item.nm_id) || 0;
    productProfits.set(item.nm_id, currentProfit + profit);
  });

  return productProfits;
};

export const fetchWildberriesStats = async (
  apiKey: string, 
  dateFrom: Date, 
  dateTo: Date
): Promise<WildberriesResponse> => {
  try {
    const currentUrl = new URL(WB_REPORT_URL);
    currentUrl.searchParams.append('dateFrom', dateFrom.toISOString().split('T')[0]);
    currentUrl.searchParams.append('dateTo', dateTo.toISOString().split('T')[0]);
    currentUrl.searchParams.append('limit', '100000');

    const currentData = await fetchWithRetry(
      currentUrl.toString(),
      { headers: { 'Authorization': apiKey } },
      apiKey
    );

    // Process sales data
    const salesData = currentData.filter((item: WildberriesReportItem) => item.quantity > 0);
    
    // Calculate profits per product
    const productProfits = calculateProductProfits(salesData);

    // Sort products by profit
    const sortedProducts = Array.from(productProfits.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([nm_id, profit]) => ({
        nm_id,
        name: `Товар ${nm_id}`, // Simplified as we're not fetching names to avoid rate limits
        profit: Math.round(profit * 100) / 100,
        image: `https://images.wbstatic.net/big/new/${nm_id.slice(0, -5)}0000/${nm_id}-1.jpg`
      }));

    const currentStats = {
      sales: salesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.sale || 0), 0),
      transferred: salesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.ppvz_for_pay || 0), 0),
      expenses: {
        total: salesData.reduce((sum: number, item: WildberriesReportItem) => 
          sum + 
          (item.delivery_rub || 0) +
          (item.storage_fee || 0) +
          (item.penalty || 0) +
          (item.deduction || 0) +
          (item.acceptance || 0), 0),
        logistics: salesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.delivery_rub || 0), 0),
        storage: salesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.storage_fee || 0), 0),
        penalties: salesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.penalty || 0), 0)
      },
      acceptance: salesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.acceptance || 0), 0),
      netProfit: 0,
      profitableProducts: sortedProducts.slice(0, 3),
      unprofitableProducts: sortedProducts.slice(-3).reverse()
    };

    currentStats.netProfit = currentStats.transferred - currentStats.expenses.total;

    return {
      currentPeriod: currentStats
    };

  } catch (error) {
    console.error('Ошибка получения статистики Wildberries:', error);
    throw new Error('Не удалось загрузить статистику Wildberries');
  }
};
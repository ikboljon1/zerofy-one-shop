import { differenceInMonths, subMonths } from 'date-fns';

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
  };
  previousPeriod: {
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
  salesTrend: Array<{
    date: string;
    currentValue: number;
    previousValue: number;
  }>;
}

// Rate limiting implementation
const requestTimestamps: { [key: string]: number } = {};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const waitForRateLimit = async (apiKey: string) => {
  const now = Date.now();
  const lastRequestTime = requestTimestamps[apiKey] || 0;
  const timeToWait = Math.max(0, lastRequestTime + 60000 - now); // 60000ms = 1 minute

  if (timeToWait > 0) {
    console.log(`Rate limiting: waiting ${timeToWait}ms before next request`);
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
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const fetchWildberriesStats = async (
  apiKey: string, 
  dateFrom: Date, 
  dateTo: Date
): Promise<WildberriesResponse> => {
  try {
    const monthsDiff = differenceInMonths(dateTo, dateFrom) + 1;
    const previousDateFrom = subMonths(dateFrom, monthsDiff);
    const previousDateTo = subMonths(dateTo, monthsDiff);

    // First request for current period
    const currentUrl = new URL('https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod');
    currentUrl.searchParams.append('dateFrom', dateFrom.toISOString().split('T')[0]);
    currentUrl.searchParams.append('dateTo', dateTo.toISOString().split('T')[0]);
    currentUrl.searchParams.append('limit', '100000');

    const currentData = await fetchWithRetry(
      currentUrl.toString(),
      { headers: { 'Authorization': apiKey } },
      apiKey
    );

    // Second request for previous period (will automatically wait due to rate limiting)
    const previousUrl = new URL('https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod');
    previousUrl.searchParams.append('dateFrom', previousDateFrom.toISOString().split('T')[0]);
    previousUrl.searchParams.append('dateTo', previousDateTo.toISOString().split('T')[0]);
    previousUrl.searchParams.append('limit', '100000');

    const previousData = await fetchWithRetry(
      previousUrl.toString(),
      { headers: { 'Authorization': apiKey } },
      apiKey
    );

    // Process current period data
    const currentSalesData = currentData.filter((item: WildberriesReportItem) => item.quantity > 0);
    const currentTotalExpenses = currentSalesData.reduce((sum: number, item: WildberriesReportItem) => {
      return sum + 
        (item.acceptance || 0) +
        (item.storageAmount || 0) +
        (item.logisticAmount || 0) +
        (item.penaltyAmount || 0);
    }, 0);

    // Process previous period data
    const previousSalesData = previousData.filter((item: WildberriesReportItem) => item.quantity > 0);
    const previousTotalExpenses = previousSalesData.reduce((sum: number, item: WildberriesReportItem) => {
      return sum + 
        (item.acceptance || 0) +
        (item.storageAmount || 0) +
        (item.logisticAmount || 0) +
        (item.penaltyAmount || 0);
    }, 0);

    const currentStats = {
      sales: currentSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.sale || 0), 0),
      transferred: currentSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.ppvz_for_pay || 0), 0),
      expenses: {
        total: currentTotalExpenses,
        logistics: currentSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.logisticAmount || 0), 0),
        storage: currentSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.storageAmount || 0), 0),
        penalties: currentSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.penaltyAmount || 0), 0)
      },
      acceptance: currentSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.acceptance || 0), 0),
      netProfit: 0
    };
    currentStats.netProfit = currentStats.transferred - currentStats.expenses.total;

    // Calculate previous period stats
    const previousStats = {
      sales: previousSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.sale || 0), 0),
      transferred: previousSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.ppvz_for_pay || 0), 0),
      expenses: {
        total: previousTotalExpenses,
        logistics: previousSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.logisticAmount || 0), 0),
        storage: previousSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.storageAmount || 0), 0),
        penalties: previousSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.penaltyAmount || 0), 0)
      },
      acceptance: previousSalesData.reduce((sum: number, item: WildberriesReportItem) => sum + (item.acceptance || 0), 0),
      netProfit: 0
    };
    previousStats.netProfit = previousStats.transferred - previousStats.expenses.total;

    // Prepare sales trend data
    const salesByDate = new Map();
    const previousSalesByDate = new Map();

    currentSalesData.forEach((item: WildberriesReportItem) => {
      const date = item.date.split('T')[0];
      salesByDate.set(date, (salesByDate.get(date) || 0) + (item.sale || 0));
    });

    previousSalesData.forEach((item: WildberriesReportItem) => {
      const date = item.date.split('T')[0];
      previousSalesByDate.set(date, (previousSalesByDate.get(date) || 0) + (item.sale || 0));
    });

    const salesTrend = Array.from(salesByDate.entries()).map(([date, value]) => ({
      date,
      currentValue: value,
      previousValue: previousSalesByDate.get(date) || 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      currentPeriod: currentStats,
      previousPeriod: previousStats,
      salesTrend
    };

  } catch (error) {
    console.error('Error fetching Wildberries stats:', error);
    throw new Error('Не удалось загрузить статистику Wildberries');
  }
};

import { differenceInMonths } from 'date-fns';

interface WildberriesReportItem {
  realizationreport_id: number;
  date_from: string;
  date_to: string;
  create_dt: string;
  currency_name: string;
  suppliercontract_code: string;
  rrd_id: number;
  gi_id: number;
  subject_name: string;
  nm_id: string;
  brand_name: string;
  sa_name: string;
  ts_name: string;
  barcode: string;
  doc_type_name: string;
  quantity: number;
  retail_price: number;
  retail_amount: number;
  sale_percent: number;
  commission_percent: number;
  office_name: string;
  supplier_oper_name: string;
  order_dt: string;
  sale_dt: string;
  rr_dt: string;
  shk_id: number;
  retail_price_withdisc_rub: number;
  delivery_amount: number;
  return_amount: number;
  delivery_rub: number;
  ppvz_spp_prc: number;
  ppvz_kvw_prc_base: number;
  ppvz_kvw_prc: number;
  ppvz_sales_commission: number;
  ppvz_for_pay: number;
  ppvz_reward: number;
  ppvz_vw: number;
  ppvz_vw_nds: number;
  penalty: number;
  additional_payment: number;
  storage_fee: number;
  deduction: number;
  acceptance: number;
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

const calculateProductProfits = (data: WildberriesReportItem[]): Map<string, number> => {
  const productProfits = new Map<string, number>();

  data.forEach(item => {
    if (!item.nm_id) return;

    const profit = (item.ppvz_for_pay || 0) -
                  (item.delivery_rub || 0) -
                  (item.storage_fee || 0) -
                  (item.penalty || 0) -
                  (item.deduction || 0) -
                  (item.acceptance || 0);

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
        throw new Error('Превышен лимит запросов к API. Пожалуйста, подождите минуту и попробуйте снова.');
      }
      throw new Error(`Ошибка HTTP! статус: ${response.status}`);
    }

    const data: WildberriesReportItem[] = await response.json();
    
    // Calculate profits per product
    const productProfits = calculateProductProfits(data);

    // Sort products by profit
    const sortedProducts = Array.from(productProfits.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([nm_id, profit]) => ({
        nm_id,
        name: `Товар ${nm_id}`,
        profit: Math.round(profit * 100) / 100,
        image: `https://images.wbstatic.net/big/new/${nm_id.slice(0, -5)}0000/${nm_id}-1.jpg`
      }));

    const currentStats = {
      sales: data.reduce((sum, item) => sum + (item.retail_amount || 0), 0),
      transferred: data.reduce((sum, item) => sum + (item.ppvz_for_pay || 0), 0),
      expenses: {
        total: data.reduce((sum, item) => 
          sum + 
          (item.delivery_rub || 0) +
          (item.storage_fee || 0) +
          (item.penalty || 0) +
          (item.deduction || 0) +
          (item.acceptance || 0), 0),
        logistics: data.reduce((sum, item) => sum + (item.delivery_rub || 0), 0),
        storage: data.reduce((sum, item) => sum + (item.storage_fee || 0), 0),
        penalties: data.reduce((sum, item) => sum + (item.penalty || 0), 0)
      },
      acceptance: data.reduce((sum, item) => sum + (item.acceptance || 0), 0),
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
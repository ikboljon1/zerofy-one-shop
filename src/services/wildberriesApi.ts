import axios from 'axios';
import { WildberriesOrder, WildberriesSale } from "@/types/store";

// Поддерживаем текущую структуру для совместимости с другими частями приложения
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
      advertising: number;
      deductions?: number;
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
  productReturns: Array<{
    name: string;
    value: number;
    count?: number;
    isNegative?: boolean;
  }>;
  penaltiesData?: Array<{
    name: string;
    value: number;
    isNegative?: boolean;
  }>;
  deductionsData?: Array<{
    name: string;
    value: number;
    nm_id?: string | number;
    isNegative?: boolean;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  orders?: WildberriesOrder[];
  sales?: WildberriesSale[];
  warehouseDistribution?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  regionDistribution?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDateRFC3339 = (date: Date, isEnd: boolean = false): string => {
  const formattedDate = date.toISOString().split('T')[0];
  return isEnd ? `${formattedDate}T23:59:59` : `${formattedDate}T00:00:00`;
};

/**
 * Загружает детальный отчет с Wildberries API с поддержкой пагинации
 * Реализация в соответствии с функцией fetch_wb_report_detail из Python-скрипта
 */
const fetchReportDetail = async (apiKey: string, dateFrom: Date, dateTo: Date, rrdid = 0, limit = 100000) => {
  try {
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDateFrom,
      "dateTo": formattedDateTo,
      "rrdid": rrdid,
      "limit": limit,
    };
    
    console.log(`Fetching report detail from Wildberries API with rrdid ${rrdid}...`);
    const response = await axios.get(url, { headers, params });
    
    // Определяем ID для следующего запроса в соответствии с Python-скриптом
    let nextRrdid = 0;
    if (response.data && response.data.length > 0) {
      const lastRecord = response.data[response.data.length - 1];
      nextRrdid = lastRecord.rrd_id || 0;
    }
    
    return { data: response.data, nextRrdid };
  } catch (error) {
    console.error("Error fetching report detail:", error);
    return { data: null, nextRrdid: 0 };
  }
};

/**
 * Загружает все данные отчета с поддержкой пагинации
 * Реализация в соответствии с циклом while из Python-скрипта
 */
const fetchAllReportDetails = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  let allData: any[] = [];
  let nextRrdid = 0;
  let hasMoreData = true;
  let pageCount = 0;
  
  console.log("Starting pagination process for all report details...");
  
  while (hasMoreData) {
    pageCount++;
    console.log(`Fetching page ${pageCount} with rrdid ${nextRrdid}...`);
    
    const result = await fetchReportDetail(apiKey, dateFrom, dateTo, nextRrdid);
    const data = result.data;
    
    if (!data || data.length === 0) {
      console.log(`Page ${pageCount} returned no data, ending pagination.`);
      hasMoreData = false;
      continue;
    }
    
    allData = [...allData, ...data];
    
    // Получаем идентификатор для следующего запроса
    const prevRrdid = nextRrdid;
    nextRrdid = result.nextRrdid;
    
    console.log(`Page ${pageCount} received ${data.length} records, last rrdid: ${nextRrdid}`);
    
    // Если вернулось меньше записей, чем размер страницы, или если rrdid не изменился, значит данных больше нет
    if (data.length < 100000 || nextRrdid === 0 || nextRrdid === prevRrdid) {
      console.log(`End of pagination reached after ${pageCount} pages. Total records: ${allData.length}`);
      hasMoreData = false;
    }
  }
  
  console.log(`Completed fetching all pages. Total records: ${allData.length}`);
  return allData;
};

/**
 * Загружает отчет о платной приемке с Wildberries API
 * Реализация в соответствии с функцией fetch_paid_acceptance_report из Python-скрипта
 */
const fetchPaidAcceptanceReport = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    const url = "https://seller-analytics-api.wildberries.ru/api/v1/analytics/acceptance-report";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDateFrom,
      "dateTo": formattedDateTo,
    };
    
    console.log("Fetching paid acceptance report from Wildberries API...");
    const response = await axios.get(url, { headers, params });
    return response.data.report || [];
  } catch (error) {
    console.error("Error fetching paid acceptance report:", error);
    return [];
  }
};

/**
 * Рассчитывает метрики на основе данных отчета
 * Реализация в соответствии с функцией calculate_metrics из Python-скрипта
 */
const calculateMetrics = (data: any[], paidAcceptanceData: any[] = []) => {
  if (!data || data.length === 0) {
    return null;
  }

  let totalSales = 0;           // Продажа (retail_price_withdisc_rub)
  let totalForPay = 0;          // К перечислению за товар (ppvz_for_pay)
  let totalDeliveryRub = 0;     // Стоимость логистики (delivery_rub)
  let totalRebillLogisticCost = 0; // Логистика возмещение издержек (rebill_logistic_cost)
  let totalStorageFee = 0;      // Стоимость хранения (storage_fee)
  let totalReturns = 0;         // Возврат (отрицательные ppvz_for_pay)
  let totalPenalty = 0;         // Штрафы (penalty)
  let totalDeduction = 0;       // Удержания (deduction)
  let totalReturnCount = 0;     // Количество возвратов
  let totalToPay = 0;           // Итого к оплате

  const returnsByProduct: Record<string, { value: number; count: number }> = {};
  const returnsByNmId: Record<string, number> = {}; // Словарь для хранения информации о возвратах по nmId
  const penaltiesByReason: Record<string, number> = {};
  const deductionsByReason: Record<string, { total: number; items: Array<{nm_id?: string | number; value: number}> }> = {};
  
  // Метрики для расчета прибыльности товаров
  const productProfitability: Record<string, { 
    name: string;
    price: number;
    sales: number;
    costs: number;
    profit: number;
    image: string;
    count: number;
    returnCount: number;
  }> = {};

  console.log(`Processing ${data.length} records for metrics calculation...`);
  
  for (const record of data) {
    // Обработка продаж в соответствии с Python-скриптом
    if (record.doc_type_name === 'Продажа') {
      totalSales += record.retail_price_withdisc_rub || 0;
      totalForPay += record.ppvz_for_pay || 0;
      
      // Учет данных для расчета прибыльности товаров
      if (record.sa_name) {
        const productName = record.sa_name;
        if (!productProfitability[productName]) {
          productProfitability[productName] = { 
            name: productName,
            price: record.retail_price || 0,
            sales: 0,
            costs: 0,
            profit: 0,
            image: record.pic_url || '',
            count: 0,
            returnCount: 0
          };
        }
        
        productProfitability[productName].sales += record.ppvz_for_pay || 0;
        productProfitability[productName].costs += (record.delivery_rub || 0) + 
                                               (record.storage_fee || 0) + 
                                               (record.penalty || 0) +
                                               (record.deduction || 0);
        productProfitability[productName].price = record.retail_price || productProfitability[productName].price;
        if (record.pic_url && !productProfitability[productName].image) {
          productProfitability[productName].image = record.pic_url;
        }
        productProfitability[productName].count += 1;
      }
    } 
    // Обработка возвратов в соответствии с Python-скриптом
    else if (record.doc_type_name === 'Возврат') {
      totalReturns += Math.abs(record.ppvz_for_pay || 0);
      totalReturnCount += 1;
      
      // Учет возвратов по nmId в соответствии с Python-скриптом
      if (record.nm_id) {
        const nmId = record.nm_id.toString();
        if (!returnsByNmId[nmId]) {
          returnsByNmId[nmId] = 0;
        }
        returnsByNmId[nmId] += 1;
      }
      
      if (record.sa_name) {
        const productName = record.sa_name;
        if (!productProfitability[productName]) {
          productProfitability[productName] = { 
            name: productName,
            price: record.retail_price || 0,
            sales: 0,
            costs: 0,
            profit: 0,
            image: record.pic_url || '',
            count: 0,
            returnCount: 0
          };
        }
        
        productProfitability[productName].returnCount += 1;
        
        if (!returnsByProduct[productName]) {
          returnsByProduct[productName] = { value: 0, count: 0 };
        }
        returnsByProduct[productName].value += Math.abs(record.ppvz_for_pay || 0);
        returnsByProduct[productName].count += 1;
      }
    }
    
    // Учет расходов на логистику и хранение в соответствии с Python-скриптом
    totalDeliveryRub += record.delivery_rub || 0;
    totalRebillLogisticCost += record.rebill_logistic_cost || 0;
    totalStorageFee += record.storage_fee || 0;
    
    // Обработка штрафов (сохраняем существующую логику)
    if (record.penalty && record.penalty > 0) {
      const reason = record.penalty_reason || record.bonus_type_name || 'Другие причины';
      if (!penaltiesByReason[reason]) {
        penaltiesByReason[reason] = 0;
      }
      penaltiesByReason[reason] += record.penalty;
      totalPenalty += record.penalty;
    }
    
    // Обработка удержаний (сохраняем существующую логику)
    if (record.deduction !== undefined && record.deduction !== null) {
      const reason = record.bonus_type_name || 'Прочие удержания';
      
      if (!deductionsByReason[reason]) {
        deductionsByReason[reason] = { total: 0, items: [] };
      }
      
      deductionsByReason[reason].total += record.deduction;
      deductionsByReason[reason].items.push({
        nm_id: record.nm_id || record.shk || '',
        value: record.deduction
      });
      
      totalDeduction += record.deduction;
    }
  }

  // Расчет общей суммы по платной приемке
  const totalAcceptance = paidAcceptanceData.reduce((sum, record) => sum + (record.total || 0), 0);

  // Расчет итоговой суммы к оплате по логике Python-скрипта
  totalToPay = totalForPay - totalDeliveryRub - totalStorageFee - totalReturns;

  // Расчет прибыльности товаров
  for (const key in productProfitability) {
    productProfitability[key].profit = productProfitability[key].sales - productProfitability[key].costs;
  }

  // Подготовка данных о возвратах по товарам
  const productReturns = Object.entries(returnsByProduct)
    .map(([name, { value, count }]) => ({ name, value, count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Подготовка данных о штрафах
  const penaltiesData = Object.entries(penaltiesByReason)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }))
    .sort((a, b) => b.value - a.value);

  // Подготовка данных об удержаниях
  const deductionsData = Object.entries(deductionsByReason)
    .map(([name, data]) => {
      if (data.total === 0) return null;
      
      return {
        name,
        value: Math.round(data.total * 100) / 100,
        count: data.items.length,
        isNegative: data.total < 0
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => Math.abs((b?.value || 0)) - Math.abs((a?.value || 0)));

  // Подготовка данных о самых прибыльных и убыточных товарах
  const productProfitabilityArray = Object.values(productProfitability);

  const sortedByProfit = [...productProfitabilityArray].sort((a, b) => b.profit - a.profit);
  const topProfitableProducts = sortedByProfit.slice(0, 3).map(item => ({
    name: item.name,
    price: item.price.toString(),
    profit: item.profit.toString(),
    image: item.image || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg",
    quantitySold: item.count || 0,
    margin: Math.round((item.profit / item.sales) * 100) || 0,
    returnCount: item.returnCount || 0,
    category: "Одежда"
  }));

  const sortedByLoss = [...productProfitabilityArray].sort((a, b) => a.profit - b.profit);
  const topUnprofitableProducts = sortedByLoss.slice(0, 3).map(item => ({
    name: item.name,
    price: item.price.toString(),
    profit: item.profit.toString(),
    image: item.image || "https://storage.googleapis.com/a1aa/image/OVMl1GnzKz6bgDAEJKScyzvR2diNKk-j6FoazEY-XRI.jpg",
    quantitySold: item.count || 0,
    margin: Math.round((item.profit / item.sales) * 100) || 0,
    returnCount: item.returnCount || 0,
    category: "Одежда"
  }));

  console.log(`Calculated metrics: Total sales: ${totalSales}, Total for pay: ${totalForPay}, Logistics: ${totalDeliveryRub}, Storage: ${totalStorageFee}, Returns: ${totalReturns}, Total to pay: ${totalToPay}`);

  return {
    metrics: {
      total_sales: Math.round(totalSales * 100) / 100,
      total_for_pay: Math.round(totalForPay * 100) / 100,
      total_delivery_rub: Math.round(totalDeliveryRub * 100) / 100,
      total_rebill_logistic_cost: Math.round(totalRebillLogisticCost * 100) / 100,
      total_storage_fee: Math.round(totalStorageFee * 100) / 100,
      total_returns: Math.round(Math.abs(totalReturns) * 100) / 100,
      total_penalty: Math.round(totalPenalty * 100) / 100,
      total_deduction: Math.round(Math.abs(totalDeduction) * 100) / 100,
      total_to_pay: Math.round(totalToPay * 100) / 100,
      total_acceptance: Math.round(totalAcceptance * 100) / 100,
      total_return_count: totalReturnCount
    },
    penaltiesData,
    deductionsData,
    productReturns,
    topProfitableProducts,
    topUnprofitableProducts,
    returnsByNmId,
    dailySales: []
  };
};

export const fetchWildberriesOrders = async (apiKey: string, dateFrom: Date): Promise<WildberriesOrder[]> => {
  try {
    const formattedDate = formatDateRFC3339(dateFrom);
    const url = "https://statistics-api.wildberries.ru/api/v1/supplier/orders";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDate
    };
    
    console.log("Fetching orders from Wildberries API...");
    const response = await axios.get(url, { headers, params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

export const fetchWildberriesSales = async (apiKey: string, dateFrom: Date): Promise<WildberriesSale[]> => {
  try {
    const formattedDate = formatDateRFC3339(dateFrom);
    const url = "https://statistics-api.wildberries.ru/api/v1/supplier/sales";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": formattedDate
    };
    
    console.log("Fetching sales from Wildberries API...");
    const response = await axios.get(url, { headers, params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching sales:", error);
    return [];
  }
};

/**
 * Загружает статистику с Wildberries API
 * @param apiKey Ключ API
 * @param dateFrom Начальная дата
 * @param dateTo Конечная дата
 * @returns Статистика Wildberries
 */
export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    
    if (process.env.NODE_ENV === 'development' && !apiKey.startsWith('eyJ')) {
      console.log('Using demo data in development mode');
      return getDemoData();
    }
    
    // 1. Получаем детальный отчет через пагинацию (в соответствии с Python-скриптом)
    console.log("Starting to fetch all report details with pagination...");
    const reportData = await fetchAllReportDetails(apiKey, dateFrom, dateTo);
    console.log(`Completed fetching all report details. Total records: ${reportData.length}`);
    
    // 2. Получаем данные о платной приемке (в соответствии с Python-скриптом)
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    const paidAcceptanceData = await fetchPaidAcceptanceReport(apiKey, dateFrom, dateTo);
    
    // 3. Получаем данные о заказах и продажах
    const ordersData = await fetchWildberriesOrders(apiKey, dateFrom);
    const salesData = await fetchWildberriesSales(apiKey, dateFrom);
    
    // 4. Если данных нет, возвращаем демо-данные
    if (!reportData || reportData.length === 0) {
      console.log('No data received from Wildberries API, using demo data');
      return getDemoData();
    }
    
    // 5. Рассчитываем метрики на основе получ��нных данных (в соответствии с Python-скриптом)
    console.log("Calculating metrics from report data...");
    const result = calculateMetrics(reportData, paidAcceptanceData);
    
    if (!result || !result.metrics) {
      console.log('Failed to calculate metrics, using demo data');
      return getDemoData();
    }
    
    const { 
      metrics, 
      productReturns, 
      penaltiesData, 
      deductionsData, 
      topProfitableProducts, 
      topUnprofitableProducts, 
      returnsByNmId 
    } = result;
    
    // 6. Группируем продажи по категориям
    const salesByCategory: Record<string, number> = {};
    for (const record of reportData) {
      if (record.doc_type_name === 'Продажа' && record.subject_name) {
        if (!salesByCategory[record.subject_name]) {
          salesByCategory[record.subject_name] = 0;
        }
        salesByCategory[record.subject_name]++;
      }
    }
    
    const productSales = Object.entries(salesByCategory)
      .map(([subject_name, quantity]) => ({ subject_name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    // 7. Группируем продажи по дням
    const salesByDay: Record<string, { sales: number, previousSales: number }> = {};
    for (const record of reportData) {
      if (record.doc_type_name === 'Продажа' && record.rr_dt) {
        const date = record.rr_dt.split('T')[0];
        if (!salesByDay[date]) {
          salesByDay[date] = { sales: 0, previousSales: 0 };
        }
        salesByDay[date].sales += record.retail_price_withdisc_rub || 0;
      }
    }
    
    const dailySales = Object.entries(salesByDay)
      .map(([date, { sales, previousSales }]) => ({ date, sales, previousSales }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 8. Рассчитываем распределение по складам
    const warehouseCounts: Record<string, number> = {};
    const totalOrders = ordersData.length;
    
    ordersData.forEach(order => {
      if (order.warehouseName) {
        warehouseCounts[order.warehouseName] = (warehouseCounts[order.warehouseName] || 0) + 1;
      }
    });
    
    const warehouseDistribution = Object.entries(warehouseCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalOrders) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // 9. Рассчитываем распределение по регионам
    const regionCounts: Record<string, number> = {};
    
    ordersData.forEach(order => {
      if (order.regionName) {
        regionCounts[order.regionName] = (regionCounts[order.regionName] || 0) + 1;
      }
    });
    
    const regionDistribution = Object.entries(regionCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalOrders) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // 10. Формируем итоговый ответ с использованием метрик из Python-скрипта
    const response: WildberriesResponse = {
      currentPeriod: {
        sales: metrics.total_sales,
        transferred: metrics.total_for_pay, // По логике Python-скрипта используем total_for_pay как transferred
        expenses: {
          total: metrics.total_delivery_rub + metrics.total_storage_fee + metrics.total_penalty + metrics.total_acceptance,
          logistics: metrics.total_delivery_rub,
          storage: metrics.total_storage_fee,
          penalties: metrics.total_penalty,
          acceptance: metrics.total_acceptance,
          advertising: 0,  // Рекламные расходы в скрипте не учитываем
          deductions: metrics.total_deduction
        },
        netProfit: metrics.total_to_pay, // По логике Python-скрипта используем total_to_pay как netProfit
        acceptance: metrics.total_acceptance
      },
      dailySales,
      productSales,
      productReturns,
      penaltiesData,
      deductionsData,
      topProfitableProducts,
      topUnprofitableProducts,
      orders: ordersData,
      sales: salesData,
      warehouseDistribution,
      regionDistribution
    };
    
    console.log(`Successfully processed data from Wildberries API. Net profit (total_to_pay): ${metrics.total_to_pay}`);
    
    return response;
  } catch (error) {
    console.error("Error fetching Wildberries stats:", error);
    return getDemoData();
  }
};

/**
 * Возвращает детальный отчет от Wildberries API
 * @param apiKey Ключ API
 * @param dateFrom Начальная дата
 * @param dateTo Конечная дата
 */
export const fetchReportDetailByPeriod = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    if (process.env.NODE_ENV === 'development' && !apiKey.startsWith('eyJ')) {
      console.log('Using demo report detail data in development mode');
      return getDemoReportDetailData();
    }
    
    console.log(`Fetching report detail from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    return await fetchAllReportDetails(apiKey, dateFrom, dateTo);
  } catch (error) {
    console.error("Error fetching report detail:", error);
    return getDemoReportDetailData();
  }
};

/**
 * Возвращает демо-данные для тестирования и отладки
 * @returns Демо-данные для Wildberries
 */
const getDemoData = (): WildberriesResponse => {
  return {
    currentPeriod: {
      sales: 294290.6,
      transferred: 218227.70,
      expenses: {
        total: 65794.94, 
        logistics: 35669.16,
        storage: 23125.78,
        penalties: 0,
        acceptance: 0,
        advertising: 0,
        deductions: 7000 
      },
      netProfit: 147037.23,
      acceptance: 0
    },
    dailySales: [
      {
        date: "2025-02-26",
        sales: 36652.93,
        previousSales: 0
      },
      {
        date: "2025-02-27",
        sales: 79814.5,
        previousSales: 0
      },
      {
        date: "2025-02-28",
        sales: 37899.90,
        previousSales: 0
      },
      {
        date: "2025-03-01",
        sales: 62596.15,
        previousSales: 0
      },
      {
        date: "2025-03-02",
        sales: 77327.11,
        previousSales: 0
      }
    ],
    productSales: [
      { subject_name: "Костюмы", quantity: 48 },
      { subject_name: "Платья", quantity: 6 },
      { subject_name: "Свитшоты", quantity: 4 },
      { subject_name: "Лонгсливы", quantity: 3 },
      { subject_name: "Костюмы спортивные", quantity: 1 }
    ],
    productReturns: [
      { name: "Костюм женский спортивный", value: 12000, count: 3 },
      { name: "Платье летнее", value: 8500, count: 2 },
      { name: "Футболка мужская", value: 6300, count: 4 },
      { name: "Джинсы классические", value: 4200, count: 1 },
      { name: "Куртка зимняя", value: 3000, count: 1 }
    ],
    penaltiesData: [
      { name: "Недопоставка", value: 3500 },
      { name: "Нарушение упаковки", value: 2800 },
      { name: "Нарушение маркировки", value: 1200 },
      { name: "Другие причины", value: 2500 }
    ],
    deductionsData: [ 
      { name: "Услуги доставки транзитных поставок", value: 17265.33 },
      { name: "Штраф за перенос поставки", value: -1079.00, isNegative: true },
      { name: "Штраф за недопоставку", value: -2345.67, isNegative: true },
      { name: "Компенсация клиенту за брак", value: -1587.45, isNegative: true },
      { name: "Недостача товара", value: -3254.89, isNegative: true }
    ],
    topProfitableProducts: [
      { 
        name: "Костюм женский спортивный", 
        price: "3200", 
        profit: "25000", 
        image: "https://images.wbstatic.net/big/new/25250000/25251346-1.jpg",
        quantitySold: 65,
        margin: 42,
        returnCount: 3,
        category: "Женская одежда"
      },
      { 
        name: "Платье летнее", 
        price: "1200", 
        profit: "18000", 
        image: "https://images.wbstatic.net/big/new/22270000/22271973-1.jpg",
        quantitySold: 58,
        margin: 45,
        returnCount: 2,
        category: "Женская одежда" 
      },
      { 
        name: "Джинсы классические", 
        price: "2800", 
        profit: "15500", 
        image: "https://images.wbstatic.net/big/new/13730000/13733711-1.jpg",
        quantitySold: 42,
        margin: 35,
        returnCount: 1,
        category: "Мужская одежда" 
      }
    ],
    topUnprofitableProducts: [
      { 
        name: "Шарф зимний", 
        price: "800", 
        profit: "-5200", 
        image: "https://images.wbstatic.net/big/new/11080000/11081822-1.jpg",
        quantitySold: 4,
        margin: 8,
        returnCount: 12,
        category: "Аксессуары" 
      },
      { 
        name: "Рубашка офисная", 
        price: "1500", 
        profit: "-3800", 
        image: "https://images.wbstatic.net/big/new/9080000/9080277-1.jpg",
        quantitySold: 3,
        margin: 5,
        returnCount: 8,
        category: "Мужская одежда" 
      },
      { 
        name: "Перчатки кожаные", 
        price: "1200", 
        profit: "-2900", 
        image: "https://images.wbstatic.net/big/new/10320000/10328291-1.jpg",
        quantitySold: 2,
        margin: 12,
        returnCount: 10,
        category: "Аксессуары" 
      }
    ],
    orders: [],
    sales: [],
    warehouseDistribution: [],
    regionDistribution: []
  };
};

/**
 * Возвращает демо-данные детального отчета для тестирования и отладки
 * @returns Демо-данные детального отчета Wildberries
 */
const getDemoReportDetailData = () => {
  return [
    {
      "realizationreport_id": 1234567,
      "date_from": "2022-10-17",
      "date_to": "2022-10-23",
      "create_dt": "2022-10-24",
      "currency_name": "руб",
      "suppliercontract_code": null,
      "rrd_id": 1232610467,
      "gi_id": 123456,
      "dlv_prc": 1.8,
      "fix_tariff_date_from": "2024-10-23",
      "fix_tariff_date_to": "2024-11-18",
      "subject_name": "Мини-печи",
      "nm_id": 1234567,
      "brand_name": "BlahBlah",
      "sa_name": "MAB123",
      "ts_name": "0",
      "barcode": "1231312352310",
      "doc_type_name": "Продажа",
      "quantity": 1,
      "retail_price": 1249,
      "retail_amount": 367,
      "sale_percent": 68,
      "commission_percent": 0.1324,
      "office_name": "Коледино",
      "supplier_oper_name": "Продажа",
      "order_dt": "2022-10-13T00:00:00Z",
      "sale_dt": "2022-10-20T00:00:00Z",
      "rr_dt": "2022-10-20",
      "shk_id": 1239159661,
      "retail_price_withdisc_rub": 399.68,
      "delivery_amount": 0,
      "return_amount": 0,
      "delivery_rub": 0,
      "gi_box_type_name": "Монопаллета",
      "product_discount_for_report": 399.68,
      "supplier_promo": 0,
      "rid": 123722249253,
      "ppvz_spp_prc": 0.1581,
      "ppvz_kvw_prc_base": 0.15,
      "ppvz_kvw_prc": -0.0081,
      "sup_rating_prc_up": 0,
      "is_kgvp_v2": 0,
      "ppvz_sales_commission": -3.74,
      "ppvz_for_pay": 376.99,
      "ppvz_reward": 0,
      "acquiring_fee": 14.89,
      "acquiring_percent": 4.06,
      "payment_processing": "Комиссия за организацию платежа с НДС",
      "acquiring_bank": "Тинькофф",
      "ppvz_vw": -3.74,
      "ppvz_vw_nds": -0.75,
      "ppvz_office_name": "Пункт самовывоза (ПВЗ)",
      "ppvz_office_id": 105383,
      "ppvz_supplier_id": 186465,
      "ppvz_supplier_name": "ИП Жасмин",
      "ppvz_inn": "010101010101",
      "declaration_number": "",
      "bonus_type_name": "Штраф МП. Невыполненный заказ (отмена клиентом после недовоза)",
      "sticker_id": "1964038895",
      "site_country": "Россия",
      "srv_dbs": true,
      "penalty": 231.35,
      "additional_payment": 0,
      "rebill_logistic_cost": 1.349,
      "rebill_logistic_org": "ИП Иванов Иван Иванович(123456789012)",
      "storage_fee": 12647.29,
      "deduction": 6354,
      "acceptance": 865,
      "assembly_id": 2816993144,
      "kiz": "0102900000376311210G2CIS?ehge)S\u001d91002A\u001d92F9Qof4FDo/31Icm14kmtuVYQzLypxm3HWkC1vQ/+pVVjm1dNAth1laFMoAGn7yEMWlTjxIe7lQnJqZ7TRZhlHQ==",
      "srid": "0f1c3999172603062979867564654dac5b702849",
      "report_type": 1,
      "is_legal_entity": false,
      "trbx_id": "WB-TRBX-1234567"
    },
    {
      "realizationreport_id": 1234568,
      "date_from": "2022-10-17",
      "date_to": "2022-10-23",
      "create_dt": "2022-10-24",
      "currency_name": "руб",
      "suppliercontract_code": null,
      "rrd_id": 1232610468,
      "gi_id": 123457,
      "dlv_prc": 1.8,
      "fix_tariff_date_from": "2024-10-23",
      "fix_tariff_date_to": "2024-11-18",
      "subject_name": "Пылесосы",
      "nm_id": 7654321,
      "brand_name": "CleanTech",
      "sa_name": "CT5000",
      "ts_name": "0",
      "barcode": "7890123456789",
      "doc_type_name": "Продажа",
      "quantity": 1,
      "retail_price": 5499,
      "retail_amount": 4999,
      "sale_percent": 10,
      "commission_percent": 0.15,
      "office_name": "Коледино",
      "supplier_oper_name": "Продажа",
      "order_dt": "2022-10-15T00:00:00Z",
      "sale_dt": "2022-10-21T00:00:00Z",
      "rr_dt": "2022-10-21",
      "shk_id": 1239159662,
      "retail_price_withdisc_rub": 4999,
      "delivery_amount": 0,
      "return_amount": 0,
      "delivery_rub": 350,
      "gi_box_type_name": "Монопаллета",
      "product_discount_for_report": 4999,
      "supplier_promo": 0,
      "rid": 123722249254,
      "ppvz_spp_prc": 0.16,
      "ppvz_kvw_prc_base": 0.15,
      "ppvz_kvw_prc": -0.01,
      "sup_rating_prc_up": 0,
      "is_kgvp_v2": 0,
      "ppvz_sales_commission": -749.85,
      "ppvz_for_pay": 4249.15,
      "ppvz_reward": 0,
      "acquiring_fee": 199.96,
      "acquiring_percent": 4,
      "payment_processing": "Комиссия за организацию платежа с НДС",
      "acquiring_bank": "Тинькофф",
      "ppvz_vw": -749.85,
      "ppvz_vw_nds": -149.97,
      "ppvz_office_name": "Склад",
      "ppvz_office_id": 105384,
      "ppvz_supplier_id": 186466,
      "ppvz_supplier_name": "ООО Техника",
      "ppvz_inn": "7123456789",
      "declaration_number": "",
      "bonus_type_name": "",
      "sticker_id": "1964038896",
      "site_country": "Россия",
      "srv_dbs": true,
      "penalty": 0,
      "additional_payment": 0,
      "rebill_logistic_cost": 0,
      "rebill_logistic_org": "",
      "storage_fee": 120,
      "deduction": 0,
      "acceptance": 150,
      "assembly_id": 2816993145,
      "srid": "1f2c3999172603062979867564654dac5b702850",
      "report_type": 1,
      "is_legal_entity": true,
      "trbx_id": "WB-TRBX-1234568"
    },
    {
      "realizationreport_id": 1234569,
      "date_from": "2022-10-17",
      "date_to": "2022-10-23",
      "create_dt": "2022-10-24",
      "currency_name": "руб",
      "suppliercontract_code": null,
      "rrd_id": 1232610469,
      "gi_id": 123458,
      "dlv_prc": 1.8,
      "fix_tariff_date_from": "2024-10-23",
      "fix_tariff_date_to": "2024-11-18",
      "subject_name": "Костюмы женские",
      "nm_id": 8765432,
      "brand_name": "FashionStyle",
      "sa_name": "FS2022",
      "ts_name": "44",
      "barcode": "3456789012345",
      "doc_type_name": "Возврат",
      "quantity": 1,
      "retail_price": 3200,
      "retail_amount": 2880,
      "sale_percent": 10,
      "commission_percent": 0.18,
      "office_name": "Подольск",
      "supplier_oper_name": "Возврат",
      "order_dt": "2022-10-12T00:00:00Z",
      "sale_dt": "2022-10-18T00:00:00Z",
      "rr_dt": "2022-10-22",
      "shk_id": 1239159663,
      "retail_price_withdisc_rub": -2880,
      "delivery_amount": 0,
      "return_amount": 2880,
      "delivery_rub": 250,
      "gi_box_type_name": "Монопаллета",
      "product_discount_for_report": -2880,
      "supplier_promo": 0,
      "rid": 123722249255,
      "ppvz_spp_prc": 0.18,
      "ppvz_kvw_prc_base": 0.18,
      "ppvz_kvw_prc": 0,
      "sup_rating_prc_up": 0,
      "is_kgvp_v2": 0,
      "ppvz_sales_commission": 518.4,
      "ppvz_for_pay": -2361.6,
      "ppvz_reward": 0,
      "acquiring_fee": 115.2,
      "acquiring_percent": 4,
      "payment_processing": "Комиссия за организацию платежа с НДС",
      "acquiring_bank": "Тинькофф",
      "ppvz_vw": 518.4,
      "ppvz_vw_nds": 103.68,
      "ppvz_office_name": "Пункт самовывоза (ПВЗ)",
      "ppvz_office_id": 105385,
      "ppvz_supplier_id": 186467,
      "ppvz_supplier_name": "ИП Стиль",
      "ppvz_inn": "6123456789",
      "declaration_number": "",
      "bonus_type_name": "Штраф за отмену поставки",
      "sticker_id": "1964038897",
      "site_country": "Россия",
      "srv_dbs": true,
      "penalty": 500,
      "additional_payment": 0,
      "rebill_logistic_cost": 0,
      "rebill_logistic_org": "",
      "storage_fee": 80,
      "deduction": 200,
      "acceptance": 0,
      "assembly_id": 2816993146,
      "srid": "2f3c3999172603062979867564654dac5b702851",
      "report_type": 1,
      "is_legal_entity": false,
      "trbx_id": "WB-TRBX-1234569"
    }
  ];
};

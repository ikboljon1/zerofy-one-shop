
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
  error?: {
    message: string;
    code: number;
  };
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
    
    let nextRrdid = 0;
    if (response.data && response.data.length > 0) {
      const lastRecord = response.data[response.data.length - 1];
      nextRrdid = lastRecord.rrd_id || 0;
    }
    
    return { data: response.data, nextRrdid };
  } catch (error) {
    console.error("Error fetching report detail:", error);
    throw error;
  }
};

/**
 * Загружает все данные отчета с поддержкой пагинации
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
    
    try {
      const result = await fetchReportDetail(apiKey, dateFrom, dateTo, nextRrdid);
      const data = result.data;
      
      if (!data || data.length === 0) {
        console.log(`Page ${pageCount} returned no data, ending pagination.`);
        hasMoreData = false;
        continue;
      }
      
      allData = [...allData, ...data];
      
      const prevRrdid = nextRrdid;
      nextRrdid = result.nextRrdid;
      
      console.log(`Page ${pageCount} received ${data.length} records, last rrdid: ${nextRrdid}`);
      
      if (data.length < 100000 || nextRrdid === 0 || nextRrdid === prevRrdid) {
        console.log(`End of pagination reached after ${pageCount} pages. Total records: ${allData.length}`);
        hasMoreData = false;
      }
    } catch (error) {
      console.error(`Error fetching page ${pageCount}:`, error);
      hasMoreData = false;
      throw error;
    }
  }
  
  console.log(`Completed fetching all pages. Total records: ${allData.length}`);
  return allData;
};

/**
 * Загружает отчет о платной приемке с Wildberries API
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
    throw error;
  }
};

/**
 * Рассчитывает метрики на основе данных отчета
 */
const calculateMetrics = (data: any[], paidAcceptanceData: any[] = []) => {
  if (!data || data.length === 0) {
    throw new Error("No data provided for metrics calculation");
  }

  let totalSales = 0;
  let totalForPay = 0;
  let totalDeliveryRub = 0;
  let totalRebillLogisticCost = 0;
  let totalStorageFee = 0;
  let totalReturns = 0;
  let totalPenalty = 0;
  let totalDeduction = 0;
  let totalReturnCount = 0;
  let totalToPay = 0;

  const returnsByProduct: Record<string, { value: number; count: number }> = {};
  const returnsByNmId: Record<string, number> = {};
  const penaltiesByReason: Record<string, number> = {};
  const deductionsByReason: Record<string, { total: number; items: Array<{nm_id?: string | number; value: number}> }> = {};
  
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
    if (record.doc_type_name === 'Продажа') {
      totalSales += record.retail_price_withdisc_rub || 0;
      totalForPay += record.ppvz_for_pay || 0;
      
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
    else if (record.doc_type_name === 'Возврат') {
      totalReturns += Math.abs(record.ppvz_for_pay || 0);
      totalReturnCount += 1;
      
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
    
    totalDeliveryRub += record.delivery_rub || 0;
    totalRebillLogisticCost += record.rebill_logistic_cost || 0;
    totalStorageFee += record.storage_fee || 0;
    
    if (record.penalty && record.penalty > 0) {
      const reason = record.penalty_reason || record.bonus_type_name || 'Другие причины';
      if (!penaltiesByReason[reason]) {
        penaltiesByReason[reason] = 0;
      }
      penaltiesByReason[reason] += record.penalty;
      totalPenalty += record.penalty;
    }
    
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

  const totalAcceptance = paidAcceptanceData.reduce((sum, record) => sum + (record.total || 0), 0);

  totalToPay = totalForPay - totalDeliveryRub - totalStorageFee - totalReturns;

  for (const key in productProfitability) {
    productProfitability[key].profit = productProfitability[key].sales - productProfitability[key].costs;
  }

  const productReturns = Object.entries(returnsByProduct)
    .map(([name, { value, count }]) => ({ name, value, count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const penaltiesData = Object.entries(penaltiesByReason)
    .map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }))
    .sort((a, b) => b.value - a.value);

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
    throw error;
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
    throw error;
  }
};

/**
 * Загружает статистику с Wildberries API
 * @param apiKey Ключ API
 * @param dateFrom Начальная дата
 * @param dateTo Конечная дата
 * @returns Статистика Wildberries или сообщение об ошибке
 */
export const fetchWildberriesStats = async (apiKey: string, dateFrom: Date, dateTo: Date): Promise<WildberriesResponse> => {
  try {
    console.log(`Fetching Wildberries stats from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`);
    
    // 1. Получаем детальный отчет через пагинацию
    console.log("Starting to fetch all report details with pagination...");
    const reportData = await fetchAllReportDetails(apiKey, dateFrom, dateTo);
    console.log(`Completed fetching all report details. Total records: ${reportData.length}`);
    
    // 2. Получаем данные о платной приемке
    const paidAcceptanceData = await fetchPaidAcceptanceReport(apiKey, dateFrom, dateTo);
    
    // 3. Получаем данные о заказах и продажах
    const ordersData = await fetchWildberriesOrders(apiKey, dateFrom);
    const salesData = await fetchWildberriesSales(apiKey, dateFrom);
    
    // 4. Если данных нет, возвращаем ошибку
    if (!reportData || reportData.length === 0) {
      return {
        currentPeriod: {
          sales: 0,
          transferred: 0,
          expenses: {
            total: 0,
            logistics: 0,
            storage: 0,
            penalties: 0,
            acceptance: 0,
            advertising: 0,
            deductions: 0
          },
          netProfit: 0,
          acceptance: 0
        },
        dailySales: [],
        productSales: [],
        productReturns: [],
        error: {
          message: "Нет данных для указанного периода",
          code: 404
        }
      };
    }
    
    // 5. Рассчитываем метрики на основе полученных данных
    console.log("Calculating metrics from report data...");
    const result = calculateMetrics(reportData, paidAcceptanceData);
    
    if (!result || !result.metrics) {
      return {
        currentPeriod: {
          sales: 0,
          transferred: 0,
          expenses: {
            total: 0,
            logistics: 0,
            storage: 0,
            penalties: 0,
            acceptance: 0,
            advertising: 0,
            deductions: 0
          },
          netProfit: 0,
          acceptance: 0
        },
        dailySales: [],
        productSales: [],
        productReturns: [],
        error: {
          message: "Ошибка при расчете метрик",
          code: 500
        }
      };
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
    
    // 10. Формируем итоговый ответ
    const response: WildberriesResponse = {
      currentPeriod: {
        sales: metrics.total_sales,
        transferred: metrics.total_for_pay,
        expenses: {
          total: metrics.total_delivery_rub + metrics.total_storage_fee + metrics.total_penalty + metrics.total_acceptance,
          logistics: metrics.total_delivery_rub,
          storage: metrics.total_storage_fee,
          penalties: metrics.total_penalty,
          acceptance: metrics.total_acceptance,
          advertising: 0,  // Рекламные расходы нужно будет добавить из отдельного API
          deductions: metrics.total_deduction
        },
        netProfit: metrics.total_to_pay,
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
  } catch (error: any) {
    console.error("Error fetching Wildberries stats:", error);
    
    // Возвращаем структуру с информацией об ошибке
    return {
      currentPeriod: {
        sales: 0,
        transferred: 0,
        expenses: {
          total: 0,
          logistics: 0,
          storage: 0,
          penalties: 0,
          acceptance: 0,
          advertising: 0,
          deductions: 0
        },
        netProfit: 0,
        acceptance: 0
      },
      dailySales: [],
      productSales: [],
      productReturns: [],
      error: {
        message: error.response?.status === 429 
          ? "Превышен лимит запросов к API Wildberries. Пожалуйста, повторите попытку позже." 
          : "Ошибка при получении данных от API Wildberries",
        code: error.response?.status || 500
      }
    };
  }
};

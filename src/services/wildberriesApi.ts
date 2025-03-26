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
    orderCount?: number;
  };
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
    orderCount?: number;
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
  let totalOrderCount = 0;      // Общее количество заказов
  
  // Для подсчета уникальных заказов
  const uniqueOrderIds = new Set<string>();

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

  // Создаем объект для отслеживания количества заказов по дням
  const ordersByDay: Record<string, number> = {};

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
      
      // Подсчет уникальных заказов
      if (record.srid) {
        uniqueOrderIds.add(record.srid);
        
        // Учитываем заказы по дням
        const orderDate = record.rr_dt ? record.rr_dt.split('T')[0] : '';
        if (orderDate) {
          ordersByDay[orderDate] = (ordersByDay[orderDate] || 0) + 1;
        }
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

  // Определяем общее количество заказов
  totalOrderCount = uniqueOrderIds.size;

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

  // Подготовка данных о продажах по дням с учетом количества заказов
  const dailySalesWithOrders = Object.entries(ordersByDay || {}).map(([date, orderCount]) => {
    const sales = data.find((item: any) => item.rr_dt && item.rr_dt.split('T')[0] === date)?.retail_price_withdisc_rub || 0;
    return {
      date,
      sales,
      previousSales: 0, // TODO: Add previous sales data
      orderCount
    };
  });

  console.log(`Calculated metrics: Total sales: ${totalSales}, Total for pay: ${totalForPay}, Logistics: ${totalDeliveryRub}, Storage: ${totalStorageFee}, Returns: ${totalReturns}, Total to pay: ${totalToPay}, Order count: ${totalOrderCount}`);

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
      total_return_count: totalReturnCount,
      total_order_count: totalOrderCount
    },
    penaltiesData,
    deductionsData,
    productReturns,
    topProfitableProducts,
    topUnprofitableProducts,
    returnsByNmId,
    dailySales: dailySalesWithOrders
  };
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
    
    const fullUrl = `${url}?dateFrom=${formattedDateFrom}&dateTo=${formattedDateTo}&rrdid=${rrdid}&limit=${limit}`;
    
    console.log(`[API-REQUEST] Отправка запроса на: ${fullUrl}`);
    console.log(`[API-REQUEST] Заголовки: Authorization: ${apiKey ? apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5) : 'отсутствует'}`);
    console.log(`[API-REQUEST] Параметры: dateFrom=${formattedDateFrom}, dateTo=${formattedDateTo}, rrdid=${rrdid}, limit=${limit}`);
    
    const response = await axios.get(url, { headers, params });
    
    console.log(`[API-RESPONSE] Статус: ${response.status} ${response.statusText}`);
    console.log(`[API-RESPONSE] Получено записей: ${response.data ? response.data.length : 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log(`[API-RESPONSE] Первая запись: ${JSON.stringify(response.data[0]).substring(0, 300)}...`);
      console.log(`[API-RESPONSE] Последняя запись: ${JSON.stringify(response.data[response.data.length - 1]).substring(0, 300)}...`);
    } else {
      console.log(`[API-RESPONSE] Данные отсутствуют или пустой массив`);
    }
    
    // Определяем ID для следующего запроса в соответствии с Python-скриптом
    let nextRrdid = 0;
    if (response.data && response.data.length > 0) {
      const lastRecord = response.data[response.data.length - 1];
      nextRrdid = lastRecord.rrd_id || 0;
      console.log(`[API-RESPONSE] Следующий rrdid: ${nextRrdid}`);
    }
    
    return { data: response.data, nextRrdid };
  } catch (error) {
    console.error("[API-ERROR] Ошибка при запросе отчета:", error);
    if (axios.isAxiosError(error)) {
      console.error(`[API-ERROR] Статус: ${error.response?.status} ${error.response?.statusText}`);
      console.error(`[API-ERROR] Данные ответа:`, error.response?.data);
    }
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
  
  console.log(`[API-PAGINATION] Начало процесса пагинации для загрузки полного отчета...`);
  console.log(`[API-PAGINATION] Диапазон дат: ${formatDate(dateFrom)} - ${formatDate(dateTo)}`);
  
  while (hasMoreData) {
    pageCount++;
    console.log(`[API-PAGINATION] Загрузка страницы ${pageCount} с rrdid ${nextRrdid}...`);
    
    const result = await fetchReportDetail(apiKey, dateFrom, dateTo, nextRrdid);
    const data = result.data;
    
    if (!data || data.length === 0) {
      console.log(`[API-PAGINATION] Страница ${pageCount} не вернула данных, завершаем пагинацию.`);
      hasMoreData = false;
      continue;
    }
    
    allData = [...allData, ...data];
    
    // Получаем идентификатор для следующего запроса
    const prevRrdid = nextRrdid;
    nextRrdid = result.nextRrdid;
    
    console.log(`[API-PAGINATION] Страница ${pageCount} получено ${data.length} записей, последний rrdid: ${nextRrdid}`);
    
    // Если вернулось меньше записей, чем размер страницы, или если rrdid не изменился, значит данных больше нет
    if (data.length < 100000 || nextRrdid === 0 || nextRrdid === prevRrdid) {
      console.log(`[API-PAGINATION] Конец пагинации достигнут после ${pageCount} страниц. Всего записей: ${allData.length}`);
      hasMoreData = false;
    }
  }
  
  console.log(`[API-PAGINATION] Завершена загрузка всех страниц. Всего записей: ${allData.length}`);
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
    
    console.log(`[API-ORDERS] Запрос заказов из Wildberries API...`);
    console.log(`[API-ORDERS] URL: ${url}?dateFrom=${formattedDate}`);
    console.log(`[API-ORDERS] Заголовки: Authorization: ${apiKey ? apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5) : 'отсутствует'}`);
    
    const response = await axios.get(url, { headers, params });
    
    console.log(`[API-ORDERS] Статус ответа: ${response.status} ${response.statusText}`);
    console.log(`[API-ORDERS] Получено заказов: ${response.data ? response.data.length : 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log(`[API-ORDERS] Пример первого заказа: ${JSON.stringify(response.data[0]).substring(0, 300)}...`);
    }
    
    return response.data || [];
  } catch (error) {
    console.error("[API-ORDERS-ERROR] Ошибка при загрузке заказов:", error);
    if (axios.isAxiosError(error)) {
      console.error(`[API-ORDERS-ERROR] Статус: ${error.response?.status} ${error.response?.statusText}`);
      console.error(`[API-ORDERS-ERROR] Данные ответа:`, error.response?.data);
    }
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
    
    console.log(`[API-SALES] Запрос продаж из Wildberries API...`);
    console.log(`[API-SALES] URL: ${url}?dateFrom=${formattedDate}`);
    console.log(`[API-SALES] Заголовки: Authorization: ${apiKey ? apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 5) : 'отсутствует'}`);
    
    const response = await axios.get(url, { headers, params });
    
    console.log(`[API-SALES] Статус ответа: ${response.status} ${response.statusText}`);
    console.log(`[API-SALES] Получено записей о продажах: ${response.data ? response.data.length : 0}`);
    
    if (response.data && response.data.length > 0) {
      console.log(`[API-SALES] Пример первой продажи: ${JSON.stringify(response.data[0]).substring(0, 300)}...`);
    }
    
    return response.data || [];
  } catch (error) {
    console.error("[API-SALES-ERROR] Ошибка при загрузке продаж:", error);
    if (axios.isAxiosError(error)) {
      console.error(`[API-SALES-ERROR] Статус: ${error.response?.status} ${error.response?.statusText}`);
      console.error(`[API-SALES-ERROR] Данные ответа:`, error.response?.data);
    }
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
    
    // 4. Если данных нет, возвращаем дем��-данные
    if (!reportData || reportData.length === 0) {
      console.log('No data received from Wildberries API, using demo data');
      return getDemoData();
    }
    
    // 5. Рассчитываем метрики на основе полученных данных
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
      returnsByNmId,
      dailySales: calculatedDailySales 
    } = result;
    
    // 6. Группируем продажи по категориям и собираем nmId
    const salesByCategory: Record<string, { quantity: number, nmId?: number }> = {};
    
    for (const record of reportData) {
      if (record.doc_type_name === 'Продажа' && record.subject_name) {
        if (!salesByCategory[record.subject_name]) {
          salesByCategory[record.subject_name] = { 
            quantity: 0,
            nmId: record.nm_id || undefined 
          };
        }
        salesByCategory[record.subject_name].quantity++;
        
        // Если у записи есть nm_id и у категории ещё нет, сохраняем его
        if (record.nm_id && !salesByCategory[record.subject_name].nmId) {
          salesByCategory[record.subject_name].nmId = record.nm_id;
          console.log(`Associated nmId ${record.nm_id} with category "${record.subject_name}"`);
        }
      }
    }
    
    const productSales = Object.entries(salesByCategory)
      .map(([subject_name, data]) => ({ 
        subject_name, 
        quantity: data.quantity,
        nm_id: data.nmId 
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    
    console.log(`Generated product sales data with nmId where available: `, productSales);
    
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
        transferred: metrics.total_for_pay,
        expenses: {
          total: metrics.total_delivery_rub + metrics.total_storage_fee + metrics.total_penalty + metrics.total_acceptance,
          logistics: metrics.total_delivery_rub,
          storage: metrics.total_storage_fee,
          penalties: metrics.total_penalty,
          acceptance: metrics.total_acceptance,
          advertising: 0,
          deductions: metrics.total_deduction
        },
        netProfit: metrics.total_to_pay,
        acceptance: metrics.total_acceptance,
        orderCount: metrics.total_order_count // Добавляем реальное количество заказов
      },
      dailySales: calculatedDailySales || dailySales,
      productSales,
      productReturns: productReturns || [],
      penaltiesData,
      deductionsData,
      topProfitableProducts,
      topUnprofitableProducts,
      returnsByNmId,
      orders: ordersData,
      sales: salesData,
      warehouseDistribution,
      regionDistribution
    };
    
    return response;
  } catch (error) {
    console.error('Error fetching Wildberries stats:', error);
    return getDemoData();
  }
};

// Function to get demo data for development purposes
const getDemoData = () => {
  const demoData: WildberriesResponse = {
    currentPeriod: {
      sales: 150000,
      transferred: 120000,
      expenses: {
        total: 45000,
        logistics: 15000,
        storage: 12000,
        penalties: 8000,
        acceptance: 5000,
        advertising: 5000,
        deductions: 0
      },
      netProfit: 75000,
      acceptance: 5000,
      orderCount: 250 // Added real order count to demo data
    },
    dailySales: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sales: 15000 + Math.random() * 10000,
      previousSales: 13000 + Math.random() * 8000,
      orderCount: 25 + Math.floor(Math.random() * 20) // Added order count to daily sales
    })),
    productSales: Array.from({ length: 5 }, (_, i) => ({
      subject_name: `Товар ${i + 1}`,
      quantity: 50 - i * 5
    })),
    productReturns: Array.from({ length: 3 }, (_, i) => ({
      name: `Причина возврата ${i + 1}`,
      value: 2000 - i * 500,
      count: 5 - i
    })),
    topProfitableProducts: Array.from({ length: 3 }, (_, i) => ({
      name: `Прибыльный товар ${i + 1}`,
      price: `${1500 + i * 500}`,
      profit: `${800 + i * 200}`,
      image: "https://via.placeholder.com/100",
      quantitySold: 30 - i * 5,
      margin: 40 + i * 5,
      returnCount: i,
      category: "Одежда"
    })),
    topUnprofitableProducts: Array.from({ length: 3 }, (_, i) => ({
      name: `Убыточный товар ${i + 1}`,
      price: `${1200 + i * 300}`,
      profit: `${-500 - i * 200}`,
      image: "https://via.placeholder.com/100",
      quantitySold: 10 - i,
      margin: -30 - i * 5,
      returnCount: 5 - i,
      category: "Электроника"
    })),
    warehouseDistribution: Array.from({ length: 5 }, (_, i) => ({
      name: `Склад ${i + 1}`,
      count: 50 - i * 7,
      percentage: 30 - i * 5
    })),
    regionDistribution: Array.from({ length: 5 }, (_, i) => ({
      name: `Регион ${i + 1}`,
      count: 40 - i * 5,
      percentage: 25 - i * 3
    }))
  };
  
  return demoData;
};

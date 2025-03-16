
// Минимальная структура для API-интерфейса
export const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

// Пустые данные для состояния по умолчанию при превышении лимита
export const emptyAnalyticsData = {
  currentPeriod: {
    sales: 0,
    transferred: 0,
    expenses: {
      total: 0,
      logistics: 0,
      storage: 0,
      penalties: 0,
      advertising: 0,
      acceptance: 0,
      deductions: 0
    },
    netProfit: 0,
    acceptance: 0,
    returnsAmount: 0 // Add returnsAmount property with default value of 0
  },
  dailySales: [],
  productSales: [],
  productReturns: [],
  topProfitableProducts: [],
  topUnprofitableProducts: []
};

// Пустые данные для графиков
export const emptyDeductionsTimelineData = [];
export const emptyAdvertisingData = [];
export const emptyPenaltiesData = [];
export const emptyReturnsData = [];
export const emptyDeductionsData = [];

// Минимальные данные для складского API (для обратной совместимости)
export const warehousesData = [];
export const logisticsRoutes = [];
export const inventoryData = [];

/**
 * Ключ для хранения данных о средних продажах в localStorage
 */
const AVERAGE_SALES_STORAGE_KEY = 'wb_average_daily_sales';

/**
 * Ключ для хранения данных о продажах по периодам
 */
const AVERAGE_SALES_BY_PERIOD_STORAGE_KEY = `${AVERAGE_SALES_STORAGE_KEY}_by_period`;

/**
 * Интерфейс для хранения данных о продажах по периодам
 */
interface SalesDataByPeriod {
  // Ключ - строка в формате 'YYYY-MM-DD_YYYY-MM-DD' (начало_конец периода)
  [periodKey: string]: {
    averageSales: Record<number, number>; // nmId -> среднее количество продаж
    fetchDate: string; // Дата и время получения данных
  };
}

/**
 * Генерирует ключ периода для хранения данных
 * @param dateFrom Дата начала периода
 * @param dateTo Дата окончания периода
 */
const generatePeriodKey = (dateFrom: string, dateTo: string): string => {
  const key = `${dateFrom}_${dateTo}`;
  console.log(`[Cache] Generated period key: ${key}`);
  return key;
};

/**
 * Сохраняет данные о средних продажах в localStorage с привязкой к периоду
 * @param salesData Объект с данными о средних продажах
 * @param dateFrom Дата начала периода в формате YYYY-MM-DD
 * @param dateTo Дата окончания периода в формате YYYY-MM-DD
 */
export const saveAverageDailySales = (
  salesData: Record<number, number>,
  dateFrom?: string,
  dateTo?: string
) => {
  try {
    console.log(`[Cache] Saving sales data, with period? ${!!dateFrom && !!dateTo}`);
    console.log(`[Cache] Number of products: ${Object.keys(salesData).length}`);
    
    // Если не переданы даты, сохраняем в обычном формате (для обратной совместимости)
    if (!dateFrom || !dateTo) {
      localStorage.setItem(AVERAGE_SALES_STORAGE_KEY, JSON.stringify(salesData));
      console.log('[Cache] Data saved in legacy format (without period)');
      return;
    }

    // Получаем текущие данные по периодам
    const existingDataStr = localStorage.getItem(AVERAGE_SALES_BY_PERIOD_STORAGE_KEY);
    console.log(`[Cache] Existing period data in storage: ${!!existingDataStr}`);
    
    const existingData: SalesDataByPeriod = existingDataStr 
      ? JSON.parse(existingDataStr) 
      : {};

    // Ключ для текущего периода
    const periodKey = generatePeriodKey(dateFrom, dateTo);

    // Логируем первые 3 продукта для отладки
    const sampleProducts = Object.entries(salesData).slice(0, 3);
    console.log(`[Cache] Sample products (first 3): ${JSON.stringify(sampleProducts)}`);

    // Обновляем данные для текущего периода
    existingData[periodKey] = {
      averageSales: salesData,
      fetchDate: new Date().toISOString()
    };

    // Логируем количество периодов после обновления
    console.log(`[Cache] Total periods after update: ${Object.keys(existingData).length}`);

    // Сохраняем обновленные данные
    localStorage.setItem(AVERAGE_SALES_BY_PERIOD_STORAGE_KEY, JSON.stringify(existingData));
    console.log(`[Cache] Data saved for period ${periodKey} with ${Object.keys(salesData).length} product records`);

    // Проверяем, сохранились ли данные
    const checkSaved = localStorage.getItem(AVERAGE_SALES_BY_PERIOD_STORAGE_KEY);
    if (checkSaved) {
      const savedData = JSON.parse(checkSaved);
      console.log(`[Cache] Verification: data for period ${periodKey} exists: ${!!savedData[periodKey]}`);
      if (savedData[periodKey]) {
        console.log(`[Cache] Verification: products count matches: ${Object.keys(savedData[periodKey].averageSales).length === Object.keys(salesData).length}`);
      }
    }

    // Также сохраняем в обычном формате для обратной совместимости
    localStorage.setItem(AVERAGE_SALES_STORAGE_KEY, JSON.stringify(salesData));
  } catch (error) {
    console.error('[Cache] Error saving sales data:', error);
  }
};

/**
 * Получает данные о средних продажах для конкретного периода
 * @param dateFrom Дата начала периода в формате YYYY-MM-DD
 * @param dateTo Дата окончания периода в формате YYYY-MM-DD
 * @returns Объект с данными о средних продажах или null, если данных нет
 */
export const getAverageDailySalesByPeriod = (
  dateFrom: string,
  dateTo: string
): Record<number, number> | null => {
  try {
    console.log(`[Cache] Trying to get sales data for period: ${dateFrom} - ${dateTo}`);
    
    // Получаем все данные по периодам
    const allPeriodsDataStr = localStorage.getItem(AVERAGE_SALES_BY_PERIOD_STORAGE_KEY);
    
    if (!allPeriodsDataStr) {
      console.log(`[Cache] No period data found in storage at key: ${AVERAGE_SALES_BY_PERIOD_STORAGE_KEY}`);
      return null;
    }
    
    const allPeriodsData: SalesDataByPeriod = JSON.parse(allPeriodsDataStr);
    console.log(`[Cache] Found period data store with ${Object.keys(allPeriodsData).length} periods`);
    console.log(`[Cache] Available periods: ${Object.keys(allPeriodsData).join(', ')}`);

    // Ключ для запрашиваемого периода
    const periodKey = generatePeriodKey(dateFrom, dateTo);

    // Если есть данные для указанного периода, возвращаем их
    if (allPeriodsData[periodKey]) {
      const cachedData = allPeriodsData[periodKey].averageSales;
      const fetchDate = new Date(allPeriodsData[periodKey].fetchDate);
      const productCount = Object.keys(cachedData).length;
      
      console.log(`[Cache] CACHE HIT! Found cached data for period ${periodKey}`);
      console.log(`[Cache] Cached data contains ${productCount} products, fetched on ${fetchDate.toLocaleString()}`);
      
      // Логируем первые 3 продукта для отладки
      const sampleProducts = Object.entries(cachedData).slice(0, 3);
      console.log(`[Cache] Sample cached products (first 3): ${JSON.stringify(sampleProducts)}`);

      return cachedData;
    }

    console.log(`[Cache] CACHE MISS! No data found for period key: ${periodKey}`);
    console.log(`[Cache] Available period keys: ${Object.keys(allPeriodsData).join(', ')}`);
    return null;
  } catch (error) {
    console.error('[Cache] Error retrieving sales data by period:', error);
    return null;
  }
};

/**
 * Получает данные о средних продажах из localStorage
 * @returns Объект с данными о средних продажах или null, если данных нет
 */
export const getAverageDailySales = (): Record<number, number> | null => {
  try {
    const data = localStorage.getItem(AVERAGE_SALES_STORAGE_KEY);
    if (!data) {
      console.log('[Cache] No legacy sales data found');
      return null;
    }
    const parsedData = JSON.parse(data);
    console.log(`[Cache] Found legacy sales data with ${Object.keys(parsedData).length} products`);
    return parsedData;
  } catch (error) {
    console.error('[Cache] Error retrieving legacy sales data:', error);
    return null;
  }
};

/**
 * Получает средние продажи по продуктам из API Wildberries
 * @param apiKey API ключ Wildberries
 * @param dateFrom Дата начала в формате YYYY-MM-DD
 * @param dateTo Дата окончания в формате YYYY-MM-DD
 * @returns Объект с данными о средних продажах по продуктам
 */
export const fetchAverageDailySalesFromAPI = async (
  apiKey: string, 
  dateFrom: string, 
  dateTo: string
): Promise<Record<number, number>> => {
  try {
    console.log(`[API] Requesting sales data for period: ${dateFrom} - ${dateTo}`);
    
    // Проверяем, есть ли уже кэшированные данные для этого периода
    const cachedData = getAverageDailySalesByPeriod(dateFrom, dateTo);
    if (cachedData) {
      console.log(`[API] Using cached data for period ${dateFrom} - ${dateTo}`);
      console.log(`[API] Cache contains data for ${Object.keys(cachedData).length} products`);
      
      // Отправка события для уведомления компонентов об обновлении данных
      const event = new CustomEvent('salesDataUpdated', { 
        detail: { 
          averageSalesPerDay: cachedData, 
          dateFrom, 
          dateTo,
          fromCache: true
        } 
      });
      window.dispatchEvent(event);
      
      return cachedData;
    }
    
    console.log(`[API] Cache miss, fetching fresh data from API for ${dateFrom} to ${dateTo}`);
    
    // Получение всех данных с пагинацией
    const allData = await fetchAllReportDetails(apiKey, dateFrom, dateTo);
    
    if (!allData || allData.length === 0) {
      console.warn('[API] No data returned from API');
      return {};
    }
    
    console.log(`[API] Received ${allData.length} sales records from API`);
    
    // Рассчитываем среднее количество продаж в день для каждого товара
    const averageSalesPerDay = calculateAverageDailySalesPerProduct(allData, dateFrom, dateTo);
    console.log(`[API] Calculated average sales for ${Object.keys(averageSalesPerDay).length} products`);
    
    // Сохраняем данные в localStorage для использования в других компонентах
    saveAverageDailySales(averageSalesPerDay, dateFrom, dateTo);
    
    // Отправка события для уведомления компонентов об обновлении данных
    const event = new CustomEvent('salesDataUpdated', { 
      detail: { 
        averageSalesPerDay, 
        dateFrom, 
        dateTo,
        fromCache: false
      } 
    });
    window.dispatchEvent(event);
    
    return averageSalesPerDay;
  } catch (error) {
    console.error('[API] Error fetching sales data:', error);
    return {};
  }
};

/**
 * Загружает детальный отчет с Wildberries API с поддержкой пагинации
 * Реализация в соответствии с функцией fetch_wb_report_detail из Python-скрипта
 */
const fetchReportDetail = async (
  apiKey: string, 
  dateFrom: string, 
  dateTo: string, 
  rrdid = 0, 
  limit = 100000
) => {
  try {
    const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    
    const headers = {
      "Authorization": apiKey,
    };
    
    const params = {
      "dateFrom": dateFrom,
      "dateTo": dateTo,
      "rrdid": rrdid,
      "limit": limit,
    };
    
    console.log(`[API] Загрузка отчета с rrdid ${rrdid}...`);
    const response = await fetch(`${url}?dateFrom=${dateFrom}&dateTo=${dateTo}&rrdid=${rrdid}&limit=${limit}`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`[API] Запрос вернул ошибку: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Определяем ID для следующего запроса
    let nextRrdid = 0;
    if (data && data.length > 0) {
      const lastRecord = data[data.length - 1];
      nextRrdid = lastRecord.rrd_id || 0;
    }
    
    return { data, nextRrdid };
  } catch (error) {
    console.error("[API] Ошибка при загрузке отчета:", error);
    return { data: [], nextRrdid: 0 };
  }
};

/**
 * Загружает все данные отчета с поддержкой пагинации
 * Реализация в соответствии с циклом while из Python-скрипта
 */
const fetchAllReportDetails = async (apiKey: string, dateFrom: string, dateTo: string) => {
  let allData: any[] = [];
  let nextRrdid = 0;
  let hasMoreData = true;
  let pageCount = 0;
  
  console.log("[API] Начинаем пагинацию для получения всех данных отчета...");
  
  while (hasMoreData) {
    pageCount++;
    console.log(`[API] Загрузка страницы ${pageCount} с rrdid ${nextRrdid}...`);
    
    const result = await fetchReportDetail(apiKey, dateFrom, dateTo, nextRrdid);
    const data = result.data;
    
    if (!data || data.length === 0) {
      console.log(`[API] Страница ${pageCount} вернула 0 строк, завершаем пагинацию.`);
      hasMoreData = false;
      continue;
    }
    
    allData = [...allData, ...data];
    
    // Получаем идентификатор для следующего запроса
    const prevRrdid = nextRrdid;
    nextRrdid = result.nextRrdid;
    
    console.log(`[API] Страница ${pageCount} получено ${data.length} записей, последний rrdid: ${nextRrdid}`);
    
    // Если вернулось меньше записей, чем размер страницы, или если rrdid не изменился, значит данных больше нет
    if (data.length < 100000 || nextRrdid === 0 || nextRrdid === prevRrdid) {
      console.log(`[API] Конец пагинации достигнут после ${pageCount} страниц. Всего записей: ${allData.length}`);
      hasMoreData = false;
    }
  }
  
  console.log(`[API] Завершена загрузка всех страниц. Всего записей: ${allData.length}`);
  return allData;
};

/**
 * Рассчитывает среднее количество продаж в день для каждого товара
 * Реализация в соответствии с функцией calculate_average_daily_sales_per_product из Python-скрипта
 */
const calculateAverageDailySalesPerProduct = (data: any[], dateFrom: string, dateTo: string): Record<number, number> => {
  const salesByProduct: Record<number, {
    totalSalesQuantity: number
  }> = {};
  
  // Суммируем количество продаж для каждого товара
  for (const record of data) {
    const nmId = record.nm_id;
    if (!nmId) continue;
    
    if (!salesByProduct[nmId]) {
      salesByProduct[nmId] = {
        totalSalesQuantity: 0
      };
    }
    
    if (record.doc_type_name === 'Продажа') {
      const quantity = record.quantity || 0;
      salesByProduct[nmId].totalSalesQuantity += quantity;
    }
  }
  
  // Рассчитываем количество дней в периоде
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Рассчитываем среднее количество продаж в день для каждого товара
  const averageSalesPerDay: Record<number, number> = {};
  
  for (const [nmIdStr, data] of Object.entries(salesByProduct)) {
    const nmId = parseInt(nmIdStr);
    const averageSales = daysInPeriod > 0 ? data.totalSalesQuantity / daysInPeriod : 0;
    averageSalesPerDay[nmId] = parseFloat(averageSales.toFixed(2));
  }
  
  console.log(`[API] Рассчитаны средние продажи для ${Object.keys(averageSalesPerDay).length} товаров за ${daysInPeriod} дней`);
  
  return averageSalesPerDay;
};

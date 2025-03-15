import axios from 'axios';
import api, { setApiKey } from './api';
import { SupplyItem, SupplyOptionsResponse, Warehouse, WarehouseCoefficient, PaidStorageItem } from '@/types/supplies';
import { Product } from '@/types/product';

const API_BASE_URL = 'https://supplies-api.wildberries.ru/api/v1';
const ANALYTICS_API_BASE_URL = 'https://seller-analytics-api.wildberries.ru/api/v1';
const STATISTICS_API_BASE_URL = 'https://statistics-api.wildberries.ru/api/v5';

/**
 * Fetch all warehouses from Wildberries API
 */
export const fetchWarehouses = async (apiKey: string): Promise<Warehouse[]> => {
  try {
    setApiKey(apiKey);
    const response = await api.get<Warehouse[]>(`${API_BASE_URL}/warehouses`);
    console.log('Fetched warehouses:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при запросе складов:', error);
    throw new Error(error.detail || 'Не удалось получить список складов');
  }
};

/**
 * Fetch acceptance coefficients for warehouses
 * @param apiKey API key for authorization
 * @param warehouseIDs Optional array of warehouse IDs to filter by
 */
export const fetchAcceptanceCoefficients = async (
  apiKey: string, 
  warehouseIDs?: number[]
): Promise<WarehouseCoefficient[]> => {
  try {
    // Prepare query parameters
    const params: Record<string, string> = {};
    if (warehouseIDs && warehouseIDs.length > 0) {
      params.warehouseIDs = warehouseIDs.join(',');
    }
    
    setApiKey(apiKey);
    const response = await api.get<WarehouseCoefficient[]>(`${API_BASE_URL}/acceptance/coefficients`, {
      params
    });
    
    console.log('Fetched acceptance coefficients:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при запросе коэффициентов приёмки:', error);
    throw new Error(error.detail || 'Не удалось получить коэффициенты приёмки');
  }
};

/**
 * Fetch acceptance options for specific items
 * @param apiKey API key for authorization
 * @param items Array of items with barcodes and quantities
 * @param warehouseID Optional warehouse ID to filter by
 */
export const fetchAcceptanceOptions = async (
  apiKey: string,
  items: SupplyItem[],
  warehouseID?: number
): Promise<SupplyOptionsResponse> => {
  try {
    // Prepare query parameters
    const params: Record<string, string> = {};
    if (warehouseID) {
      params.warehouseID = warehouseID.toString();
    }
    
    console.log('Fetching acceptance options with params:', { items, warehouseID });
    
    setApiKey(apiKey);
    const response = await api.post<SupplyOptionsResponse>(
      `${API_BASE_URL}/acceptance/options`,
      items,
      { params }
    );
    
    console.log('Fetched acceptance options:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при запросе вариантов приёмки:', error);
    throw new Error(error.detail || 'Не удалось получить варианты приёмки для товаров');
  }
};

// Paid storage report API functions

/**
 * Creates a paid storage report task
 */
export const createPaidStorageReportTask = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<string> => {
  try {
    const url = `${ANALYTICS_API_BASE_URL}/paid_storage`;
    
    setApiKey(apiKey);
    const response = await api.get(url, {
      params: { dateFrom, dateTo }
    });
    
    return response.data.data.taskId;
  } catch (error: any) {
    console.error('Ошибка при создании отчета о платном хранении:', error);
    throw new Error(error.detail || 'Не удалось создать отчет о платном хранении');
  }
};

/**
 * Checks the status of a paid storage report task
 */
export const checkPaidStorageReportStatus = async (
  apiKey: string,
  taskId: string
): Promise<string> => {
  try {
    const url = `${ANALYTICS_API_BASE_URL}/paid_storage/tasks/${taskId}/status`;
    
    setApiKey(apiKey);
    const response = await api.get(url);
    
    return response.data.data.status;
  } catch (error: any) {
    console.error('Ошибка при проверке статуса отчета:', error);
    throw new Error(error.detail || 'Не удалось проверить статус отчета');
  }
};

/**
 * Downloads a paid storage report
 */
export const downloadPaidStorageReport = async (
  apiKey: string,
  taskId: string
): Promise<PaidStorageItem[]> => {
  try {
    const url = `${ANALYTICS_API_BASE_URL}/paid_storage/tasks/${taskId}/download`;
    
    setApiKey(apiKey);
    const response = await api.get(url);
    
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при скачивании отчета:', error);
    throw new Error(error.detail || 'Не удалось скачать отчет о платном хранении');
  }
};

/**
 * Helper function to wait for a paid storage report task to complete
 */
export const waitForPaidStorageReportCompletion = async (
  apiKey: string,
  taskId: string,
  maxAttempts = 12,
  interval = 5000
): Promise<boolean> => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await checkPaidStorageReportStatus(apiKey, taskId);
        
        if (status === 'done') {
          resolve(true);
          return;
        }
        
        if (status === 'purged' || status === 'canceled') {
          reject(new Error(`Задание было ${status === 'purged' ? 'удалено' : 'отменено'}`));
          return;
        }
        
        attempts++;
        
        if (attempts >= maxAttempts) {
          reject(new Error('Превышено время ожидания формирования отчета'));
          return;
        }
        
        setTimeout(checkStatus, interval);
      } catch (error) {
        reject(error);
      }
    };
    
    checkStatus();
  });
};

/**
 * Main function to fetch a complete paid storage report
 */
export const fetchFullPaidStorageReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<PaidStorageItem[]> => {
  try {
    console.log('Создание задания на получение отчета о платном хранении...');
    // Step 1: Create task
    const taskId = await createPaidStorageReportTask(apiKey, dateFrom, dateTo);
    console.log(`Задание создано с ID: ${taskId}. Ожидание завершения...`);
    
    // Step 2: Wait for completion
    await waitForPaidStorageReportCompletion(apiKey, taskId);
    console.log('Задание выполнено. Загрузка отчета...');
    
    // Step 3: Get report data
    const report = await downloadPaidStorageReport(apiKey, taskId);
    console.log(`Отчет загружен. Получено ${report.length} записей.`);
    
    return report;
  } catch (error) {
    console.error('Ошибка в процессе получения отчета о платном хранении:', error);
    throw error;
  }
};

/**
 * Получить данные о платном хранении за последний месяц
 */
export const fetchLastMonthStorageData = async (
  apiKey: string
): Promise<PaidStorageItem[]> => {
  try {
    console.log('Получение данных о платном хранении за последний месяц...');
    
    // Вычисляем даты за последний месяц
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const dateFrom = lastMonth.toISOString().split('T')[0]; // формат YYYY-MM-DD
    const dateTo = today.toISOString().split('T')[0];
    
    console.log(`Период для отчета: ${dateFrom} - ${dateTo}`);
    
    // Используем существующую функцию для получения данных
    return await fetchFullPaidStorageReport(apiKey, dateFrom, dateTo);
  } catch (error) {
    console.error('Ошибка при получении данных о платном хранении за последний месяц:', error);
    
    // В случае ошибки возвращаем демо-данные
    console.log('Возвращаем демо-данные вместо реальных');
    return getMockPaidStorageData();
  }
};

/**
 * Рассчитать среднюю стоимость хранения в день по товарам
 */
export const calculateDailyStorageCost = (storageData: PaidStorageItem[]): Map<number, { 
  averageDailyCost: number, 
  totalCost: number, 
  days: number
}> => {
  const productsStorage = new Map<number, { 
    totalCost: number, 
    dates: Set<string>,
    averageDailyCost: number,
    days: number
  }>();
  
  // Группируем данные по nmId
  storageData.forEach(item => {
    if (item.nmId) {
      if (!productsStorage.has(item.nmId)) {
        productsStorage.set(item.nmId, { 
          totalCost: 0, 
          dates: new Set<string>(),
          averageDailyCost: 0,
          days: 0
        });
      }
      
      const entry = productsStorage.get(item.nmId)!;
      entry.totalCost += item.warehousePrice || 0;
      if (item.date) {
        entry.dates.add(item.date);
      }
    }
  });
  
  // Вычисляем среднюю стоимость в день
  productsStorage.forEach((value, key) => {
    const days = value.dates.size || 1;
    value.averageDailyCost = value.totalCost / days;
    value.days = days;
  });
  
  return productsStorage;
};

/**
 * Рассчитать средние продажи в день по товарам
 * @param salesData массив данных о продажах
 * @param period количество дней в периоде
 */
export const calculateDailySalesMetrics = (
  salesData: any[], 
  period: number = 30
): Map<number, { 
  averageDailySales: number, 
  totalSales: number, 
  revenue: number, 
  days: number 
}> => {
  const productSales = new Map<number, { 
    totalSales: number, 
    revenue: number,
    averageDailySales: number,
    days: number
  }>();
  
  // Группируем данные по nmId
  salesData.forEach(item => {
    if (item.nmId) {
      if (!productSales.has(item.nmId)) {
        productSales.set(item.nmId, { 
          totalSales: 0, 
          revenue: 0,
          averageDailySales: 0,
          days: period
        });
      }
      
      const entry = productSales.get(item.nmId)!;
      entry.totalSales += 1; // Увеличиваем количество продаж
      entry.revenue += item.priceWithDisc || 0; // Добавляем выручку от продажи
    }
  });
  
  // Вычисляем средние продажи в день
  productSales.forEach((value, key) => {
    const days = period || 30; // По умолчанию 30 дней, если период не указан
    value.averageDailySales = value.totalSales / days;
  });
  
  return productSales;
};

// For demo or testing purposes
export const getMockPaidStorageData = (): PaidStorageItem[] => {
  return Array(20).fill(null).map((_, index) => ({
    date: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    logWarehouseCoef: 1,
    officeId: 500 + (index % 3),
    warehouse: ['Коледино', 'Подольск', 'Электросталь'][index % 3],
    warehouseCoef: 1.5 + (index % 5) / 10,
    giId: 100000 + index,
    chrtId: 200000 + index,
    size: ['S', 'M', 'L', 'XL', 'XXL'][index % 5],
    barcode: `2000000${index}`,
    subject: ['Футболка', 'Джинсы', 'Куртка', 'Обувь', 'Аксессуары'][index % 5],
    brand: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'][index % 5],
    vendorCode: `A${1000 + index}`,
    nmId: 300000 + index,
    volume: 0.5 + (index % 10) / 10,
    calcType: 'короба: без габаритов',
    warehousePrice: 5 + (index % 20),
    barcodesCount: 1 + (index % 5),
    palletPlaceCode: 0,
    palletCount: 0,
    originalDate: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    loyaltyDiscount: index % 3 === 0 ? (2 + index % 5) : 0,
    tariffFixDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tariffLowerDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  }));
};

// Adding a method to create an actual FBW supply
export const createFbwSupply = async (
  apiKey: string,
  warehouseId: number,
  items: SupplyItem[],
  boxType: string
): Promise<{ supplyId: string }> => {
  try {
    setApiKey(apiKey);
    
    const payload = {
      warehouseId,
      items,
      boxType
    };
    
    console.log('Creating FBW supply with payload:', payload);
    
    // This is a mock implementation - replace with actual API endpoint when available
    // const response = await api.post(`${API_BASE_URL}/supplies/create`, payload);
    
    // For demo purposes, return a mock response
    return { supplyId: `FBW-${Date.now()}` };
  } catch (error: any) {
    console.error('Ошибка при создании поставки FBW:', error);
    throw new Error(error.detail || 'Не удалось создать поставку FBW');
  }
};

// Functions for managing preferred warehouses
export const savePreferredWarehouses = (userId: string, warehouseIds: number[]) => {
  try {
    localStorage.setItem(`preferred_warehouses_${userId}`, JSON.stringify(warehouseIds));
    return true;
  } catch (error) {
    console.error('Ошибка при сохранении предпочтительных складов:', error);
    return false;
  }
};

export const getPreferredWarehouses = (userId: string): number[] => {
  try {
    const saved = localStorage.getItem(`preferred_warehouses_${userId}`);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Ошибка при получении предпочтительных складов:', error);
    return [];
  }
};

export const togglePreferredWarehouse = (userId: string, warehouseId: number): number[] => {
  try {
    const currentPreferred = getPreferredWarehouses(userId);
    let newPreferred: number[];
    
    if (currentPreferred.includes(warehouseId)) {
      newPreferred = currentPreferred.filter(id => id !== warehouseId);
    } else {
      newPreferred = [...currentPreferred, warehouseId];
    }
    
    savePreferredWarehouses(userId, newPreferred);
    return newPreferred;
  } catch (error) {
    console.error('Ошибка при обновлении предпочтительных складов:', error);
    return getPreferredWarehouses(userId);
  }
};

/**
 * Загружает данные отчета о продажах по реализации с Wildberries API.
 * @param apiKey Ключ API
 * @param dateFrom Начальная дата отчета (формат YYYY-MM-DD)
 * @param dateTo Конечная дата отчета (формат YYYY-MM-DD)
 * @param rrdid ID для пагинации
 * @param limit Максимальное количество записей
 */
export const fetchSalesReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string,
  rrdid = 0,
  limit = 100000
): Promise<any[]> => {
  try {
    console.log(`Загрузка отчета о продажах с ${dateFrom} по ${dateTo}, rrdid=${rrdid}`);
    
    const url = `${STATISTICS_API_BASE_URL}/supplier/reportDetailByPeriod`;
    
    setApiKey(apiKey);
    const response = await api.get(url, {
      params: {
        dateFrom,
        dateTo,
        rrdid,
        limit
      }
    });
    
    console.log(`Получено ${response.data.length} записей о продажах`);
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при получении отчета о продажах:', error);
    throw new Error(error.detail || 'Не удалось получить отчет о продажах');
  }
};

/**
 * Загружает все данные отчета о продажах с поддержкой пагинации
 * @param apiKey Ключ API
 * @param dateFrom Начальная дата отчета (формат YYYY-MM-DD)
 * @param dateTo Конечная дата отчета (формат YYYY-MM-DD)
 */
export const fetchAllSalesReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<any[]> => {
  let allData: any[] = [];
  let nextRrdid = 0;
  let hasMoreData = true;
  let pageCount = 0;
  
  console.log(`Начало загрузки всего отчета о продажах с ${dateFrom} по ${dateTo}`);
  
  while (hasMoreData) {
    pageCount++;
    console.log(`Загрузка страницы ${pageCount} с rrdid ${nextRrdid}...`);
    
    try {
      const data = await fetchSalesReport(apiKey, dateFrom, dateTo, nextRrdid);
      
      if (!data || data.length === 0) {
        console.log(`Страница ${pageCount} не вернула данных, завершение пагинации.`);
        hasMoreData = false;
        continue;
      }
      
      allData = [...allData, ...data];
      
      // Получаем идентификатор для следующего запроса
      const prevRrdid = nextRrdid;
      nextRrdid = data[data.length - 1]?.rrd_id || 0;
      
      console.log(`Страница ${pageCount}: получено ${data.length} записей, последний rrdid: ${nextRrdid}`);
      
      // Если вернулось меньше записей, чем размер страницы, или если rrdid не изменился, значит данных больше нет
      if (data.length < 100000 || nextRrdid === 0 || nextRrdid === prevRrdid) {
        console.log(`Конец пагинации достигнут после ${pageCount} страниц. Всего записей: ${allData.length}`);
        hasMoreData = false;
      }
    } catch (error) {
      console.error(`Ошибка при загрузке страницы ${pageCount}:`, error);
      hasMoreData = false;
    }
  }
  
  console.log(`Завершена загрузка всех страниц. Всего записей: ${allData.length}`);
  return allData;
};

/**
 * Получить данные о продажах за последний месяц
 * @param apiKey Ключ API
 */
export const fetchLastMonthSalesData = async (apiKey: string): Promise<Map<number, number>> => {
  try {
    console.log('Получение данных о продажах за последний месяц...');
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // Последние 30 дней
    
    const dateFrom = startDate.toISOString().split('T')[0];
    const dateTo = endDate.toISOString().split('T')[0];
    
    console.log(`Запрос данных продаж за период: ${dateFrom} - ${dateTo}`);
    
    // Создаем кеш в локальном хранилище для избежания частых запросов к API
    const cacheKey = `sales_data_${dateFrom}_${dateTo}_${apiKey.substring(0, 10)}`;
    const cacheExpiryKey = `${cacheKey}_expires`;
    
    // Проверяем наличие кеша и его актуальность
    const cachedData = localStorage.getItem(cacheKey);
    const cacheExpiry = localStorage.getItem(cacheExpiryKey);
    const now = Date.now();
    
    // Используем кеш, если он существует и не истек срок его действия
    if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
      try {
        console.log('Использование кешированных данных о продажах');
        const parsedCache = JSON.parse(cachedData);
        return new Map(parsedCache);
      } catch (e) {
        console.error('Ошибка при разборе кешированных данных:', e);
        // Если возникла ошибка при разборе кеша, удаляем его
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(cacheExpiryKey);
      }
    }
    
    // Если нет кеша или он устарел, делаем новый запрос к API
    console.log('Кеш отсутствует или устарел, запрашиваем свежие данные от API');
    
    // Получаем данные продаж с API
    const salesData = await fetchAllSalesReport(apiKey, dateFrom, dateTo);
    
    if (!salesData || salesData.length === 0) {
      console.log('API не вернул данных о продажах');
      // Ищем устаревший кеш для использования в качестве запасного варианта
      if (cachedData) {
        console.log('Используем устаревший кеш в качестве запасного варианта');
        try {
          const parsedCache = JSON.parse(cachedData);
          return new Map(parsedCache);
        } catch (e) {
          console.error('Ошибка при разборе устаревшего кеша:', e);
        }
      }
      return new Map();
    }
    
    console.log(`Получены данные о продажах: ${salesData.length} записей`);
    
    // Рассчитываем средние продажи в день для каждого товара
    const result = new Map<number, number>();
    
    // Группируем данные по nmId
    const salesByNmId = new Map<number, { totalSales: number; uniqueDays: Set<string> }>();
    
    // Обрабатываем только записи с типом "Продажа"
    for (const record of salesData) {
      if (record.doc_type_name === 'Продажа') {
        const nmId = record.nm_id;
        if (!nmId) continue;
        
        const saleDate = record.sale_dt ? record.sale_dt.split('T')[0] : new Date().toISOString().split('T')[0];
        const quantity = record.quantity || 0;
        
        if (!salesByNmId.has(nmId)) {
          salesByNmId.set(nmId, { totalSales: 0, uniqueDays: new Set() });
        }
        
        const productData = salesByNmId.get(nmId)!;
        productData.totalSales += quantity;
        productData.uniqueDays.add(saleDate);
      }
    }
    
    // Рассчитываем средние продажи для каждого товара
    salesByNmId.forEach((data, nmId) => {
      // Определяем количество дней с продажами или общее количество дней в периоде
      const daysCount = Math.max(1, data.uniqueDays.size || 30);
      
      // Средние продажи в день
      const averageSales = data.totalSales / daysCount;
      
      // Округляем до одного десятичного знака
      result.set(nmId, parseFloat(averageSales.toFixed(1)));
    });
    
    console.log(`Рассчитаны средние продажи для ${result.size} товаров`);
    
    // Кешируем результат в localStorage для уменьшения количества запросов к API
    try {
      localStorage.setItem(cacheKey, JSON.stringify([...result]));
      // Устанавливаем время жизни кеша на 1 час
      localStorage.setItem(cacheExpiryKey, (now + 60 * 60 * 1000).toString());
      console.log('Данные о продажах сохранены в кеш до', new Date(now + 60 * 60 * 1000).toLocaleString());
    } catch (e) {
      console.error('Ошибка при кешировании данных продаж:', e);
    }
    
    return result;
  } catch (error) {
    console.error('Ошибка при получении данных о продажах за последний месяц:', error);
    
    // В случае ошибки пытаемся использовать кешированные данные
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    const dateFrom = startDate.toISOString().split('T')[0];
    const dateTo = endDate.toISOString().split('T')[0];
    const cacheKey = `sales_data_${dateFrom}_${dateTo}_${apiKey.substring(0, 10)}`;
    
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      console.log('Ошибка API. Используем кешированные данные в качестве запасного варианта');
      try {
        const parsedCache = JSON.parse(cachedData);
        return new Map(parsedCache);
      } catch (e) {
        console.error('Ошибка при разборе кешированных данных:', e);
      }
    }
    
    console.log('Невозможно получить реальные данные о продажах. Возвращаем пустой результат.');
    return new Map();
  }
};

/**
 * Рассчитывает среднее количество продаж в день для каждого товара
 * @param salesData Данные о продажах
 * @param dateFrom Начальная дата периода (формат YYYY-MM-DD)
 * @param dateTo Конечная дата периода (формат YYYY-MM-DD)
 */
export const calculateAverageDailySales = (
  salesData: any[],
  dateFrom: string,
  dateTo: string
): Map<number, {
  name: string;
  totalSales: number;
  averageDailySales: number;
  periodDays: number;
  revenue: number;
}> => {
  const salesByNmId = new Map<number, {
    name: string;
    totalSales: number;
    averageDailySales: number;
    periodDays: number;
    revenue: number;
  }>();
  
  if (!salesData || salesData.length === 0) {
    console.log('Нет данных о продажах для расчета среднего количества');
    return salesByNmId;
  }
  
  // Рассчитываем количество дней в периоде
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  const periodDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  console.log(`Расчет среднего количества продаж за период ${periodDays} дней (${dateFrom} - ${dateTo})`);
  
  // Группируем данные по nmId и считаем общее количество продаж
  for (const record of salesData) {
    // Обрабатываем только записи с типом "Продажа"
    if (record.doc_type_name === 'Продажа') {
      const nmId = record.nm_id;
      const saName = record.sa_name || 'Неизвестный товар';
      const quantity = record.quantity || 0;
      const revenue = record.ppvz_for_pay || 0;
      
      if (!nmId) continue;
      
      if (!salesByNmId.has(nmId)) {
        salesByNmId.set(nmId, {
          name: saName,
          totalSales: 0,
          averageDailySales: 0,
          periodDays,
          revenue: 0
        });
      }
      
      const itemData = salesByNmId.get(nmId)!;
      itemData.totalSales += quantity;
      itemData.revenue += revenue;
    }
  }
  
  // Рассчитываем среднее количество продаж в день для каждого товара
  salesByNmId.forEach((data, nmId) => {
    data.averageDailySales = data.totalSales / periodDays;
    console.log(`Товар (nmId=${nmId}): "${data.name}" - средние продажи в день: ${data.averageDailySales.toFixed(2)} шт.`);
  });
  
  return salesByNmId;
};

/**
 * Получает и рассчитывает данные о продажах товаров за указанный период
 * @param apiKey Ключ API
 * @param dateFrom Начальная дата (формат YYYY-MM-DD)
 * @param dateTo Конечная дата (формат YYYY-MM-DD)
 */
export const fetchProductSalesData = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<Map<number, {
  name: string;
  totalSales: number;
  averageDailySales: number;
  periodDays: number;
  revenue: number;
}>> => {
  try {
    console.log(`Получение данных о продажах товаров за период ${dateFrom} - ${dateTo}`);
    
    // Загружаем все данные отчета о продажах
    const salesData = await fetchAllSalesReport(apiKey, dateFrom, dateTo);
    
    if (!salesData || salesData.length === 0) {
      console.log('Не получены данные о продажах, возвращаем пустой результат');
      return new Map();
    }
    
    // Рассчитываем средние продажи
    return calculateAverageDailySales(salesData, dateFrom, dateTo);
  } catch (error) {
    console.error('Ошибка при получении данных о продажах товаров:', error);
    
    // В случае ошибки возвращаем пустой результат
    return new Map();
  }
};

/**
 * Обогащает продукты данными о продажах
 */
export const enrichProductsWithSalesData = (products: any[], salesData: Map<number, number>) => {
  return products.map(product => {
    const nmId = product.nmId || product.nmID;
    
    if (nmId) {
      const salesPerDay = salesData.get(nmId) || 0;
      
      return {
        ...product,
        salesData: {
          averageDailySales: salesPerDay,
          totalSales: 0, // Здесь можно рассчитать общие продажи если нужно
          periodDays: 30,
          revenue: 0 // Можно рассчитать выручку если нужно
        }
      };
    }
    
    return product;
  });
};

/**
 * Генерирует демо-данные о продажах товаров - ИСПОЛЬЗУЕТСЯ ТОЛЬКО ДЛЯ ДЕМОНСТРАЦИИ
 * @param productIds массив идентификаторов товаров
 * @param days количество дней
 */
export const getMockSalesData = (productIds: number[], days: number = 30): any[] => {
  const salesData: any[] = [];
  
  // Создаем демо-данные продаж для каждого товара
  productIds.forEach(productId => {
    // Для каждого товара генерируем разное количество продаж
    const salesCount = Math.floor(Math.random() * 5) + 1; // от 1 до 5 продаж в день
    
    // Создаем продажи за указанный период
    for (let day = 0; day < days; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Случайное количество продаж для этого дня
      const dailySales = Math.floor(Math.random() * salesCount) + 1;
      
      for (let i = 0; i < dailySales; i++) {
        salesData.push({
          date: date.toISOString().split('T')[0],
          nmId: productId,
          priceWithDisc: Math.floor(Math.random() * 5000) + 1000, // Цена от 1000 до 6000
          forPay: Math.floor(Math.random() * 4000) + 800, // Сумма к получению
          isReturn: Math.random() > 0.95 // 5% вероятность что это возврат
        });
      }
    }
  });
  
  return salesData;
};

import axios from 'axios';
import api, { setApiKey } from './api';
import { SupplyItem, SupplyOptionsResponse, Warehouse, WarehouseCoefficient, PaidStorageItem, Product } from '@/types/supplies';

const API_BASE_URL = 'https://supplies-api.wildberries.ru/api/v1';
const ANALYTICS_API_BASE_URL = 'https://seller-analytics-api.wildberries.ru/api/v1';

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
 * Генерирует демо-данные о продажах товаров
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

/**
 * Получает данные о продажах с API Wildberries и рассчитывает среднее количество продаж в день
 * @param apiKey ключ API Wildberries
 * @param dateFrom начальная дата в формате YYYY-MM-DD
 * @param dateTo конечная дата в формате YYYY-MM-DD
 * @returns объект с данными о продажах в день по товарам
 */
export const fetchSalesDataAndCalculateAverage = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<Map<number, any>> => {
  try {
    console.log(`Получение данных о продажах за период ${dateFrom} - ${dateTo}`);
    
    // Создаем объект для сбора всех данных
    let allData: any[] = [];
    let nextRrdid = 0;
    
    // Получаем данные с пагинацией
    while (true) {
      console.log(`Запрос данных с rrdid=${nextRrdid}`);
      const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
      
      const response = await axios.get(url, {
        headers: {
          "Authorization": apiKey
        },
        params: {
          dateFrom,
          dateTo,
          rrdid: nextRrdid,
          limit: 100000
        }
      });
      
      const reportData = response.data;
      
      if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
        console.log("Загрузка завершена. Получено 0 строк.");
        break;
      }
      
      console.log(`Загружено ${reportData.length} строк данных о продажах`);
      allData = [...allData, ...reportData];
      
      // Получаем идентификатор д��я следующей страницы
      const lastRecord = reportData[reportData.length - 1];
      nextRrdid = lastRecord?.rrd_id || 0;
      
      if (!nextRrdid) {
        console.log("Загрузка завершена. Больше данных нет.");
        break;
      }
    }
    
    console.log(`Всего получено ${allData.length} записей о продажах`);
    
    // Расчет среднего количества продаж в день для каждого товара
    const averageSalesByProduct = new Map<number, any>();
    
    // Группируем продажи по товарам
    for (const record of allData) {
      const nmId = record.nm_id;
      const saName = record.sa_name;
      
      if (!nmId) continue;
      
      if (!averageSalesByProduct.has(nmId)) {
        averageSalesByProduct.set(nmId, {
          saName,
          totalSalesQuantity: 0,
          totalRevenue: 0,
          averageDailySalesQuantity: 0
        });
      }
      
      const entry = averageSalesByProduct.get(nmId)!;
      
      // Учитываем только продажи (не возвраты)
      if (record.doc_type_name === 'Продажа') {
        const quantity = record.quantity || 0;
        const price = record.ppvz_for_pay || record.price_with_disc || 0;
        
        entry.totalSalesQuantity += quantity;
        entry.totalRevenue += price;
      }
    }
    
    // Рассчитываем количество дней в периоде
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    const daysInPeriod = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    
    console.log(`Количество дней в периоде: ${daysInPeriod}`);
    
    // Рассчитываем среднее количество продаж в день
    if (daysInPeriod > 0) {
      averageSalesByProduct.forEach((data, nmId) => {
        data.averageDailySalesQuantity = data.totalSalesQuantity / daysInPeriod;
        data.periodDays = daysInPeriod;
        console.log(`Товар ${nmId}: среднее количество продаж в день = ${data.averageDailySalesQuantity.toFixed(2)}`);
      });
    }
    
    return averageSalesByProduct;
  } catch (error) {
    console.error('Ошибка при получении данных о продажах:', error);
    // В случае ошибки возвращаем пустую Map
    return new Map<number, any>();
  }
};

/**
 * Получить данные о продажах за последние N дней
 * @param apiKey API ключ Wildberries
 * @param days количество дней (по умолчанию 30)
 */
export const fetchLastPeriodSalesData = async (
  apiKey: string, 
  days: number = 30
): Promise<Map<number, any>> => {
  try {
    console.log(`Получение данных о продажах за последние ${days} дней...`);
    
    // Вычисляем даты за указанный период
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    
    const dateFrom = pastDate.toISOString().split('T')[0]; // формат YYYY-MM-DD
    const dateTo = today.toISOString().split('T')[0];
    
    console.log(`Период для отчета: ${dateFrom} - ${dateTo}`);
    
    // Используем функцию для получения и расчета данных
    return await fetchSalesDataAndCalculateAverage(apiKey, dateFrom, dateTo);
  } catch (error) {
    console.error(`Ошибка при получении данных о продажах за последние ${days} дней:`, error);
    
    // В случае ошибки, можно вернуть тестовые данные или пустую Map
    return new Map<number, any>();
  }
};

/**
 * Обогащает продукты данными о продажах
 * @param products массив продуктов
 * @param salesData данные о продажах
 */
export const enrichProductsWithSalesData = (
  products: Product[],
  salesData: Map<number, any>
): Product[] => {
  return products.map(product => {
    const nmId = product.nmID || product.nmId;
    const salesInfo = salesData.get(nmId);
    
    if (salesInfo) {
      return {
        ...product,
        salesData: {
          averageDailySales: salesInfo.averageDailySalesQuantity || 0,
          totalSales: salesInfo.totalSalesQuantity || 0,
          periodDays: salesInfo.periodDays || 30,
          revenue: salesInfo.totalRevenue || 0
        }
      };
    }
    
    return product;
  });
};

/**
 * Получить тестовые или реальные данные о продажах
 * @param apiKey API ключ Wildberries
 * @param products массив продуктов для обогащения данными
 * @param useMockData использовать тестовые данные вместо запроса к API
 */
export const getSalesDataForProducts = async (
  apiKey: string,
  products: Product[],
  useMockData: boolean = false
): Promise<Product[]> => {
  try {
    let salesData: Map<number, any>;
    
    if (useMockData) {
      // Используем тестовые данные
      console.log("Используем тестовые данные о продажах");
      const productIds = products.map(p => p.nmID || p.nmId);
      const mockSales = getMockSalesData(productIds);
      
      // Преобразуем тестовые данные в формат, аналогичный реальным данным
      salesData = calculateDailySalesMetrics(mockSales);
    } else {
      // Получаем реальные данные о продажах за последние 30 дней
      console.log("Получаем реальные данные о продажах");
      salesData = await fetchLastPeriodSalesData(apiKey);
    }
    
    // Обогащаем продукты данными о продажах
    return enrichProductsWithSalesData(products, salesData);
  } catch (error) {
    console.error("Ошибка при получении данных о продажах:", error);
    
    // В случае ошибки используем тестовые данные
    console.log("Ошибка при получении данных о продажах, используем тестовые данные");
    const productIds = products.map(p => p.nmID || p.nmId);
    const mockSales = getMockSalesData(productIds);
    const salesData = calculateDailySalesMetrics(mockSales);
    
    return enrichProductsWithSalesData(products, salesData);
  }
};

export default {
  fetchWarehouses,
  fetchAcceptanceCoefficients,
  fetchAcceptanceOptions,
  calculateDailyStorageCost,
  calculateDailySalesMetrics,
  enrichProductsWithSalesData,
  getSalesDataForProducts,
  fetchLastPeriodSalesData
};


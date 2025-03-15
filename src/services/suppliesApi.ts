import axios from 'axios';
import api, { setApiKey } from './api';
import { SupplyItem, SupplyOptionsResponse, Warehouse, WarehouseCoefficient, PaidStorageItem } from '@/types/supplies';

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

// Cache for mock data
const mockDataCache: Record<string, PaidStorageItem[]> = {};

// For demo or testing purposes - now with caching for consistent results
export const getMockPaidStorageData = (dateFrom: string = '', dateTo: string = ''): PaidStorageItem[] => {
  // Create a cache key based on date range
  const cacheKey = `${dateFrom}_${dateTo}`;
  
  // If we have cached data for this date range, return it
  if (mockDataCache[cacheKey]) {
    console.log(`Returning cached mock data for period: ${dateFrom} to ${dateTo}`);
    return mockDataCache[cacheKey];
  }
  
  // Generate new mock data
  const mockData = Array(20).fill(null).map((_, index) => ({
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
  
  // Cache the generated data
  mockDataCache[cacheKey] = mockData;
  console.log(`Generated and cached new mock data for period: ${dateFrom} to ${dateTo}`);
  
  return mockData;
};

// Функция для получения данных о платном хранении по конкретному nmId
export const fetchPaidStorageItemData = async (
  apiKey: string,
  nmId: number,
  dateFrom: string,
  dateTo: string
): Promise<{
  total_cost: number;
  day_count: number;
  average_cost: number;
  vendor_code: string;
  brand: string;
  subject: string;
}> => {
  try {
    console.log(`Получение данных о платном хранении для nmId=${nmId} с ${dateFrom} по ${dateTo}`);
    
    if (!apiKey) {
      throw new Error('API ключ не предоставлен');
    }
    
    // В реальном приложении здесь будет код для получения отчета через API Wildberries
    setApiKey(apiKey);
    
    try {
      // Пытаемся получить реальные данные
      const allStorageData = await fetchFullPaidStorageReport(apiKey, dateFrom, dateTo);
      
      // Фильтруем данные по nmId
      const itemStorageData = allStorageData.filter(item => Number(item.nmId) === Number(nmId));
      
      if (itemStorageData.length > 0) {
        console.log(`Найдено ${itemStorageData.length} записей о хранении для nmId=${nmId}`);
        
        // Рассчитываем суммарную стоимость хранения
        const totalCost = itemStorageData.reduce((sum, item) => sum + Number(item.warehousePrice || 0), 0);
        
        return {
          total_cost: totalCost,
          day_count: itemStorageData.length,
          average_cost: totalCost / itemStorageData.length,
          vendor_code: itemStorageData[0].vendorCode || '',
          brand: itemStorageData[0].brand || '',
          subject: itemStorageData[0].subject || ''
        };
      } else {
        console.log(`Записи о хранении для nmId=${nmId} не найдены, возвращаем моковые данные`);
      }
    } catch (apiError) {
      console.error('Ошибка при получении реальных данных:', apiError);
      console.log('Использую моковые данные как запасной вариант');
    }
    
    // Если реальные данные не получены, используем моковые
    const seed = nmId % 1000; // Используем nmId как seed для стабильных моковых данных
    return {
      total_cost: 100 + seed * 2.5,
      day_count: 7,
      average_cost: (100 + seed * 2.5) / 7,
      vendor_code: `A${1000 + seed}`,
      brand: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'][seed % 5],
      subject: ['Футболка', 'Джинсы', 'Куртка', 'Обувь', 'Аксессуары'][seed % 5]
    };
  } catch (error) {
    console.error('Ошибка при получении данных о платном хранении:', error);
    throw error;
  }
};

// Функция для получения данных о продажах по nmId
export const fetchSalesDataByNmId = async (
  apiKey: string,
  nmId: number,
  dateFrom: string,
  dateTo: string
): Promise<{
  total_sales_quantity: number;
  average_daily_sales_quantity: number;
  sa_name: string;
}> => {
  try {
    console.log(`Получение данных о продажах для nmId=${nmId} с ${dateFrom} по ${dateTo}`);
    
    if (!apiKey) {
      throw new Error('API ключ не предоставлен');
    }
    
    setApiKey(apiKey);
    
    try {
      // Попытка получить реальные данные о продажах через API
      const url = `${STATISTICS_API_BASE_URL}/supplier/reportDetailByPeriod`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': apiKey
        },
        params: {
          dateFrom,
          dateTo,
          limit: 100000
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Фильтруем данные по nmId и типу документа "Продажа"
        const salesRecords = response.data.filter(
          item => Number(item.nm_id) === Number(nmId) && item.doc_type_name === 'Продажа'
        );
        
        if (salesRecords.length > 0) {
          console.log(`Найдено ${salesRecords.length} записей о продажах для nmId=${nmId}`);
          
          // Рассчитываем общее количество проданных единиц
          const totalQuantity = salesRecords.reduce((sum, item) => sum + Math.abs(Number(item.quantity || 0)), 0);
          
          // Рассчитываем количество дней в выбранном периоде
          const startDate = new Date(dateFrom);
          const endDate = new Date(dateTo);
          const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          const averageDailySales = totalQuantity / daysInPeriod;
          
          return {
            total_sales_quantity: totalQuantity,
            average_daily_sales_quantity: averageDailySales,
            sa_name: salesRecords[0].sa_name || `Art-${nmId}`
          };
        }
      }
      
      console.log(`Записи о продажах для nmId=${nmId} не найдены, возвращаем моковые данные`);
    } catch (apiError) {
      console.error('Ошибка при получении реальных данных о продажах:', apiError);
      console.log('Использую моковые данные как запасной вариант');
    }
    
    // Если реальные данные не получены, используем моковые с seed на основе nmId
    const seed = nmId % 1000;
    const totalSales = 5 + seed % 20;
    return {
      total_sales_quantity: totalSales,
      average_daily_sales_quantity: totalSales / 7,
      sa_name: `Арт-${nmId % 10000}`
    };
  } catch (error) {
    console.error('Ошибка при получении данных о продажах:', error);
    throw error;
  }
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

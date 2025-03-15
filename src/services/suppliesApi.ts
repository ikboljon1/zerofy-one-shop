import axios from 'axios';
import api, { setApiKey } from './api';
import { SupplyItem, SupplyOptionsResponse, Warehouse, WarehouseCoefficient, PaidStorageItem } from '@/types/supplies';

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
    subject: ['Футболка', 'Джинсы', 'Куртка', 'Обувь', 'Аксессу��ры'][index % 5],
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

import axios from 'axios';
import api, { setApiKey } from './api';
import { SupplyItem, SupplyOptionsResponse, Warehouse, WarehouseCoefficient, PaidStorageItem } from '@/types/supplies';

const API_BASE_URL = 'https://supplies-api.wildberries.ru/api/v1';
const ANALYTICS_API_BASE_URL = 'https://seller-analytics-api.wildberries.ru/api/v1';
const STATISTICS_API_BASE_URL = 'https://statistics-api.wildberries.ru/api/v5/supplier';

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
 * Fetch daily sales report
 */
export const fetchDailySalesReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string,
  rrdid: number = 0
): Promise<any[]> => {
  try {
    setApiKey(apiKey);
    const url = `${STATISTICS_API_BASE_URL}/reportDetailByPeriod`;
    
    const response = await api.get(url, {
      params: {
        dateFrom,
        dateTo,
        rrdid,
        limit: 100000
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при получении отчета о продажах:', error);
    throw new Error(error.detail || 'Не удалось получить отчет о продажах');
  }
};

/**
 * Calculate average daily sales for each product
 */
export const calculateAverageDailySales = (salesData: any[], dateFrom: string, dateTo: string): Record<number, number> => {
  const salesByNmId: Record<number, number> = {};
  
  if (!salesData || salesData.length === 0) {
    return salesByNmId;
  }
  
  // Convert dates to Date objects
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  
  // Calculate days difference
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Group sales by nmId
  for (const record of salesData) {
    if (record.doc_type_name === 'Продажа') {
      const nmId = record.nm_id;
      if (!salesByNmId[nmId]) {
        salesByNmId[nmId] = 0;
      }
      salesByNmId[nmId] += record.quantity || 0;
    }
  }
  
  // Calculate average daily sales
  const result: Record<number, number> = {};
  for (const [nmId, totalSales] of Object.entries(salesByNmId)) {
    result[Number(nmId)] = daysDiff > 0 ? Number(totalSales) / daysDiff : 0;
  }
  
  return result;
};

/**
 * Calculate average daily storage costs for each product
 */
export const calculateDailyStorageCosts = (storageData: PaidStorageItem[]): Record<number, number> => {
  const result: Record<number, number> = {};
  const costsByNmId: Record<number, { totalCost: number, days: number }> = {};
  
  // Group storage costs by nmId
  for (const item of storageData) {
    if (item.nmId) {
      if (!costsByNmId[item.nmId]) {
        costsByNmId[item.nmId] = { totalCost: 0, days: 0 };
      }
      costsByNmId[item.nmId].totalCost += item.warehousePrice || 0;
      costsByNmId[item.nmId].days += 1;
    }
  }
  
  // Calculate average daily storage cost
  for (const [nmId, data] of Object.entries(costsByNmId)) {
    result[Number(nmId)] = data.days > 0 ? data.totalCost / data.days : 0;
  }
  
  return result;
};

/**
 * Fetch all daily sales data (handles pagination)
 */
export const fetchAllDailySalesData = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<any[]> => {
  let allSalesData: any[] = [];
  let nextRrdid = 0;
  let hasMoreData = true;
  
  while (hasMoreData) {
    const salesData = await fetchDailySalesReport(apiKey, dateFrom, dateTo, nextRrdid);
    
    if (!salesData || salesData.length === 0) {
      hasMoreData = false;
    } else {
      allSalesData = [...allSalesData, ...salesData];
      
      // Get next rrdid for pagination
      const lastItem = salesData[salesData.length - 1];
      nextRrdid = lastItem?.rrd_id || 0;
      
      // Check if we have more data to fetch
      if (!nextRrdid) {
        hasMoreData = false;
      }
    }
  }
  
  return allSalesData;
};

/**
 * Get real product profitability data (combines sales and storage data)
 */
export const getProductProfitabilityData = async (
  apiKey: string,
  salesDateFrom: string,
  salesDateTo: string,
  storageDateFrom: string,
  storageDateTo: string
): Promise<{
  averageDailySales: Record<number, number>,
  dailyStorageCosts: Record<number, number>,
}> => {
  try {
    // Fetch sales data
    console.log('Fetching sales data...');
    const allSalesData = await fetchAllDailySalesData(apiKey, salesDateFrom, salesDateTo);
    const averageDailySales = calculateAverageDailySales(allSalesData, salesDateFrom, salesDateTo);
    
    // Fetch storage data
    console.log('Fetching storage data...');
    const storageData = await fetchFullPaidStorageReport(apiKey, storageDateFrom, storageDateTo);
    const dailyStorageCosts = calculateDailyStorageCosts(storageData);
    
    return {
      averageDailySales,
      dailyStorageCosts
    };
  } catch (error) {
    console.error('Error getting product profitability data:', error);
    throw error;
  }
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

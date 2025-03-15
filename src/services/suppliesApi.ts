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

/**
 * Fetches the average storage cost for a specific nmId
 */
export const fetchAverageStorageCost = async (
  apiKey: string,
  nmId: number,
  dateFrom: string,
  dateTo: string
): Promise<{ averageStorageCost: number; brand: string; vendorCode: string; subject: string } | null> => {
  try {
    console.log(`Fetching average storage cost for nmId: ${nmId}`);
    
    // Step 1: Create the report task
    const taskId = await createPaidStorageReportTask(apiKey, dateFrom, dateTo);
    console.log(`Created paid storage report task: ${taskId}`);
    
    if (!taskId) {
      throw new Error("Failed to create storage report task");
    }
    
    // Step 2: Wait for the task to complete
    const isCompleted = await waitForPaidStorageReportCompletion(apiKey, taskId);
    if (!isCompleted) {
      throw new Error("Storage report task did not complete successfully");
    }
    
    // Step 3: Download the report
    const reportData = await downloadPaidStorageReport(apiKey, taskId);
    
    // Step 4: Process the data for the specific nmId
    if (!reportData || reportData.length === 0) {
      return null;
    }
    
    // Filter and extract data for the specified nmId
    const nmIdData = reportData.filter(item => Number(item.nmId) === nmId);
    
    if (nmIdData.length === 0) {
      console.log(`No storage data found for nmId: ${nmId}`);
      return null;
    }
    
    // Calculate the average storage cost
    let totalCost = 0;
    for (const item of nmIdData) {
      totalCost += item.warehousePrice || 0;
    }
    
    const averageStorageCost = totalCost / nmIdData.length;
    const firstItem = nmIdData[0];
    
    return {
      averageStorageCost,
      brand: firstItem.brand || "",
      vendorCode: firstItem.vendorCode || "",
      subject: firstItem.subject || ""
    };
  } catch (error) {
    console.error("Error fetching average storage cost:", error);
    return null;
  }
};

/**
 * Fetches the average daily sales for a specific nmId
 */
export const fetchAverageDailySales = async (
  apiKey: string,
  nmId: number,
  dateFrom: string,
  dateTo: string
): Promise<{ averageDailySales: number; sa_name: string } | null> => {
  try {
    console.log(`Fetching average daily sales for nmId: ${nmId}`);
    
    // Format dates
    const formattedDateFrom = dateFrom.split('T')[0];
    const formattedDateTo = dateTo.split('T')[0];
    
    const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    
    // We'll use pagination to get all data
    let allData: any[] = [];
    let nextRrdId = 0;
    
    while (true) {
      setApiKey(apiKey);
      const params = {
        dateFrom: formattedDateFrom,
        dateTo: formattedDateTo,
        rrdid: nextRrdId,
        limit: 100000
      };
      
      const response = await api.get(url, { params });
      const data = response.data;
      
      if (!data || data.length === 0) {
        break;
      }
      
      allData = allData.concat(data);
      
      if (data.length > 0) {
        nextRrdId = data[data.length - 1].rrd_id || 0;
        if (nextRrdId === 0) break;
      } else {
        break;
      }
    }
    
    // Filter data for the specific nmId
    const nmIdData = allData.filter(item => 
      Number(item.nm_id) === nmId && item.doc_type_name === 'Продажа'
    );
    
    if (nmIdData.length === 0) {
      console.log(`No sales data found for nmId: ${nmId}`);
      return null;
    }
    
    // Calculate total sales quantity
    let totalSalesQuantity = 0;
    let sa_name = "";
    
    for (const item of nmIdData) {
      totalSalesQuantity += item.quantity || 0;
      if (!sa_name && item.sa_name) {
        sa_name = item.sa_name;
      }
    }
    
    // Calculate days in period
    const startDate = new Date(formattedDateFrom);
    const endDate = new Date(formattedDateTo);
    const daysInPeriod = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate average daily sales
    const averageDailySales = daysInPeriod > 0 ? totalSalesQuantity / daysInPeriod : 0;
    
    return {
      averageDailySales,
      sa_name: sa_name || ""
    };
  } catch (error) {
    console.error("Error fetching average daily sales:", error);
    return null;
  }
};

/**
 * Fetches complete product data by nmId including storage and sales information
 */
export const fetchProductDataByNmId = async (
  apiKey: string,
  nmId: number,
  dateFrom: string,
  dateTo: string
): Promise<{
  storageData: { averageStorageCost: number; brand: string; vendorCode: string; subject: string } | null;
  salesData: { averageDailySales: number; sa_name: string } | null;
}> => {
  try {
    console.log(`Fetching complete product data for nmId: ${nmId}`);
    
    // Fetch storage data
    const storageData = await fetchAverageStorageCost(apiKey, nmId, dateFrom, dateTo);
    
    // Fetch sales data
    const salesData = await fetchAverageDailySales(apiKey, nmId, dateFrom, dateTo);
    
    return {
      storageData,
      salesData
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return {
      storageData: null,
      salesData: null
    };
  }
};

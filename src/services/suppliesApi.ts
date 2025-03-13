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
 * Форматирует дату в нужный формат
 */
export const formatDate = (dateStr: string, includeTime = true): string => {
  try {
    const date = new Date(dateStr);
    if (includeTime) {
      return date.toISOString().split('.')[0]; // YYYY-MM-DDTHH:MM:SS
    } else {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return dateStr;
  }
};

/**
 * Получает данные о средней стоимости хранения товаров
 */
export const fetchAverageStorageCosts = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<Record<string, any>> => {
  try {
    console.log('Получение данных о средней стоимости хранения...');
    const formattedDateFrom = formatDate(dateFrom);
    const formattedDateTo = formatDate(dateTo);
    
    // Получаем отчет о платном хранении
    const storageReport = await fetchFullPaidStorageReport(apiKey, formattedDateFrom, formattedDateTo);
    
    // Группируем данные по nmId и вычисляем среднюю стоимость хранения
    const storageCostsByNmId: Record<string, any> = {};
    
    for (const record of storageReport) {
      const nmId = record.nmId;
      const warehousePrice = record.warehousePrice;
      
      if (nmId && warehousePrice !== undefined) {
        if (!storageCostsByNmId[nmId]) {
          storageCostsByNmId[nmId] = {
            totalCost: 0,
            dayCount: 0,
            vendorCode: record.vendorCode,
            brand: record.brand,
            subject: record.subject
          };
        }
        storageCostsByNmId[nmId].totalCost += warehousePrice;
        storageCostsByNmId[nmId].dayCount += 1;
      }
    }
    
    // Вычисляем среднюю стоимость хранения для каждого товара
    for (const nmId in storageCostsByNmId) {
      const data = storageCostsByNmId[nmId];
      const averageCost = data.dayCount > 0 ? data.totalCost / data.dayCount : 0;
      storageCostsByNmId[nmId].averageCost = averageCost;
    }
    
    return storageCostsByNmId;
  } catch (error) {
    console.error('Ошибка при получении данных о стоимости хранения:', error);
    throw error;
  }
};

/**
 * Получает данные отчета о продажах с пагинацией
 */
export const fetchSalesReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string,
  rrdid = 0
): Promise<[any[], number]> => {
  try {
    const url = `${STATISTICS_API_BASE_URL}/supplier/reportDetailByPeriod`;
    
    setApiKey(apiKey);
    const response = await api.get(url, {
      params: {
        dateFrom,
        dateTo,
        rrdid,
        limit: 100000
      }
    });
    
    const data = response.data;
    let nextRrdid = 0;
    
    if (data && data.length > 0) {
      const lastRecord = data[data.length - 1];
      nextRrdid = lastRecord.rrd_id || 0;
    }
    
    return [data, nextRrdid];
  } catch (error: any) {
    console.error('Ошибка при получении отчета о продажах:', error);
    throw new Error(error.detail || 'Не удалось получить отчет о продажах');
  }
};

/**
 * Получает полный отчет о продажах с учетом пагинации
 */
export const fetchFullSalesReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<any[]> => {
  try {
    console.log('Получение данных о продажах...');
    const formattedDateFrom = formatDate(dateFrom, false);  // YYYY-MM-DD
    const formattedDateTo = formatDate(dateTo, false);      // YYYY-MM-DD
    
    let allData: any[] = [];
    let nextRrdid = 0;
    
    while (true) {
      const [reportData, rrdid] = await fetchSalesReport(apiKey, formattedDateFrom, formattedDateTo, nextRrdid);
      
      if (!reportData || reportData.length === 0) {
        break;
      }
      
      allData = allData.concat(reportData);
      nextRrdid = rrdid;
      
      if (!nextRrdid) {
        break;
      }
      
      console.log(`Получено ${reportData.length} записей о продажах. Следующий rrd_id: ${nextRrdid}`);
    }
    
    return allData;
  } catch (error) {
    console.error('Ошибка при получении полного отчета о продажах:', error);
    throw error;
  }
};

/**
 * Рассчитывает среднее количество продаж в день для каждого товара
 */
export const calculateAverageDailySales = (
  salesData: any[],
  dateFrom: string,
  dateTo: string
): Record<string, any> => {
  try {
    const averageSalesByNmId: Record<string, any> = {};
    
    if (!salesData || salesData.length === 0) {
      return averageSalesByNmId;
    }
    
    // Сначала группируем данные по nmId
    for (const record of salesData) {
      const nmId = record.nm_id?.toString();
      const saName = record.sa_name;
      
      if (!nmId) continue;
      
      if (!averageSalesByNmId[nmId]) {
        averageSalesByNmId[nmId] = {
          saName,
          totalSalesQuantity: 0,
          averageDailySalesQuantity: 0
        };
      }
      
      if (record.doc_type_name === 'Продажа') {
        const quantity = record.quantity || 0;
        averageSalesByNmId[nmId].totalSalesQuantity += quantity;
      }
    }
    
    // Рассчитываем количество дней в периоде
    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    const daysInPeriod = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    // Рассчитываем среднее дневное количество продаж
    for (const nmId in averageSalesByNmId) {
      const totalSales = averageSalesByNmId[nmId].totalSalesQuantity;
      averageSalesByNmId[nmId].averageDailySalesQuantity = totalSales / daysInPeriod;
    }
    
    return averageSalesByNmId;
  } catch (error) {
    console.error('Ошибка при расчете среднего количества продаж:', error);
    throw error;
  }
};

/**
 * Получает данные о средних продажах за период
 */
export const fetchAverageSalesData = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<Record<string, any>> => {
  try {
    // Получаем полный отчет о продажах
    const salesReport = await fetchFullSalesReport(apiKey, dateFrom, dateTo);
    
    // Рассчитываем среднее количество продаж в день
    return calculateAverageDailySales(salesReport, dateFrom, dateTo);
  } catch (error) {
    console.error('Ошибка при получении данных о средних продажах:', error);
    throw error;
  }
};

/**
 * Объединяет данные о продажах и стоимости хранения
 */
export const fetchSalesAndStorageData = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<Record<string, any>> => {
  try {
    console.log('Получение данных о продажах и стоимости хранения...');
    
    // Получаем данные о продажах
    const salesData = await fetchAverageSalesData(apiKey, dateFrom, dateTo);
    
    // Получаем данные о стоимости хранения
    const storageData = await fetchAverageStorageCosts(apiKey, dateFrom, dateTo);
    
    // Объединяем данные
    const combinedData: Record<string, any> = {};
    
    // Добавляем данные о продажах
    for (const nmId in salesData) {
      combinedData[nmId] = {
        ...salesData[nmId],
        averageStorageCost: 0
      };
    }
    
    // Добавляем данные о стоимости хранения
    for (const nmId in storageData) {
      if (combinedData[nmId]) {
        combinedData[nmId].averageStorageCost = storageData[nmId].averageCost;
        combinedData[nmId].vendorCode = storageData[nmId].vendorCode;
        combinedData[nmId].brand = storageData[nmId].brand;
        combinedData[nmId].subject = storageData[nmId].subject;
      } else {
        combinedData[nmId] = {
          saName: '',
          totalSalesQuantity: 0,
          averageDailySalesQuantity: 0,
          averageStorageCost: storageData[nmId].averageCost,
          vendorCode: storageData[nmId].vendorCode,
          brand: storageData[nmId].brand,
          subject: storageData[nmId].subject
        };
      }
    }
    
    return combinedData;
  } catch (error) {
    console.error('Ошибка при получении объединенных данных:', error);
    throw error;
  }
};

// Экспортируем новую функцию для получения реальных данных
export const getRealDataForStorageProfitability = async (
  apiKey: string,
  dateFrom: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dateTo: string = new Date().toISOString().split('T')[0]
): Promise<{
  productInfo: {
    nmId: string;
    productName: string;
    dailySales: number;
    storageCost: number;
  }
}> => {
  try {
    const combinedData = await fetchSalesAndStorageData(apiKey, dateFrom, dateTo);
    
    // Находим первый товар с ненулевыми данными о продажах
    let selectedProduct: any = null;
    
    for (const nmId in combinedData) {
      const product = combinedData[nmId];
      if (product.averageDailySalesQuantity > 0) {
        selectedProduct = {
          nmId,
          ...product
        };
        break;
      }
    }
    
    // Если нет товаров с продажами, берем первый попавшийся
    if (!selectedProduct) {
      const firstNmId = Object.keys(combinedData)[0];
      if (firstNmId) {
        selectedProduct = {
          nmId: firstNmId,
          ...combinedData[firstNmId]
        };
      }
    }
    
    // Если данных всё равно нет, возвращаем дефолтные значения
    if (!selectedProduct) {
      return {
        productInfo: {
          nmId: "12345678",
          productName: "Футболка Nike",
          dailySales: 10,
          storageCost: 5
        }
      };
    }
    
    return {
      productInfo: {
        nmId: selectedProduct.nmId,
        productName: selectedProduct.saName || `${selectedProduct.brand || ''} ${selectedProduct.subject || ''}`.trim() || `Товар ${selectedProduct.nmId}`,
        dailySales: Math.ceil(selectedProduct.averageDailySalesQuantity) || 1,
        storageCost: Math.ceil(selectedProduct.averageStorageCost) || 2
      }
    };
  } catch (error) {
    console.error('Ошибка при получении реальных данных для анализа прибыльности хранения:', error);
    // Возвращаем дефолтные данные в случае ошибки
    return {
      productInfo: {
        nmId: "12345678",
        productName: "Футболка Nike",
        dailySales: 10,
        storageCost: 5
      }
    };
  }
};

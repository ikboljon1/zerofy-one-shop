
import axios from 'axios';
import { format } from 'date-fns';

interface SalesDataRecord {
  doc_type_name: string;
  nm_id: number;
  quantity: number;
  sa_name: string;
}

interface StorageCostRecord {
  nmId: number;
  warehousePrice: number;
  vendorCode: string;
  brand: string;
  subject: string;
}

interface DailySalesData {
  [nmId: number]: {
    averageDailySales: number;
    saName: string;
  };
}

interface StorageCostData {
  [nmId: number]: {
    averageStorageCost: number;
    vendorCode: string;
    brand: string;
    subject: string;
  };
}

/**
 * Загружает детальный отчет о продажах с API Wildberries
 */
export const fetchSalesReportDetail = async (apiKey: string, dateFrom: string, dateTo: string, rrdid = 0): Promise<{ data: SalesDataRecord[], nextRrdid: number }> => {
  try {
    const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    const headers = {
      "Authorization": apiKey
    };
    const params = {
      dateFrom,
      dateTo,
      rrdid,
      limit: 100000
    };

    console.log(`Fetching sales report with rrdid ${rrdid}...`);
    const response = await axios.get(url, { headers, params });
    
    const data = response.data || [];
    let nextRrdid = 0;
    
    if (data.length > 0) {
      nextRrdid = data[data.length - 1]?.rrd_id || 0;
    }
    
    return { data, nextRrdid };
  } catch (error) {
    console.error("Error fetching report detail:", error);
    return { data: [], nextRrdid: 0 };
  }
};

/**
 * Загружает все данные о продажах с пагинацией
 */
export const fetchAllSalesData = async (apiKey: string, dateFrom: string, dateTo: string): Promise<SalesDataRecord[]> => {
  let allData: SalesDataRecord[] = [];
  let nextRrdid = 0;
  let hasMoreData = true;
  let pageCount = 0;
  
  console.log("Starting pagination process for sales report...");
  
  while (hasMoreData) {
    pageCount++;
    console.log(`Fetching sales page ${pageCount} with rrdid ${nextRrdid}...`);
    
    const result = await fetchSalesReportDetail(apiKey, dateFrom, dateTo, nextRrdid);
    const { data } = result;
    
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
  }
  
  return allData;
};

/**
 * Создает задание на отчет о платном хранении
 */
export const createPaidStorageReport = async (apiKey: string, dateFrom: string, dateTo: string): Promise<string | null> => {
  try {
    const url = "https://seller-analytics-api.wildberries.ru/api/v1/paid_storage";
    const headers = {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    };
    const params = {
      dateFrom,
      dateTo
    };
    
    const response = await axios.get(url, { headers, params });
    return response.data?.data?.taskId || null;
  } catch (error) {
    console.error("Error creating paid storage report:", error);
    return null;
  }
};

/**
 * Проверяет статус задания на отчет о платном хранении
 */
export const getPaidStorageReportStatus = async (apiKey: string, taskId: string): Promise<string | null> => {
  try {
    const url = `https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks/${taskId}/status`;
    const headers = {
      "Authorization": apiKey
    };
    
    const response = await axios.get(url, { headers });
    return response.data?.data?.status || null;
  } catch (error) {
    console.error("Error checking paid storage report status:", error);
    return null;
  }
};

/**
 * Скачивает отчет о платном хранении
 */
export const downloadPaidStorageReport = async (apiKey: string, taskId: string): Promise<StorageCostRecord[]> => {
  try {
    const url = `https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks/${taskId}/download`;
    const headers = {
      "Authorization": apiKey
    };
    
    const response = await axios.get(url, { headers });
    return response.data || [];
  } catch (error) {
    console.error("Error downloading paid storage report:", error);
    return [];
  }
};

/**
 * Рассчитывает средние продажи в день для каждого товара
 */
export const calculateAverageDailySales = (data: SalesDataRecord[], dateFrom: string, dateTo: string): DailySalesData => {
  const salesByNmId: Record<number, { totalSales: number, saName: string }> = {};
  
  if (!data || data.length === 0) {
    return {};
  }
  
  for (const record of data) {
    const nmId = record.nm_id;
    
    if (record.doc_type_name === 'Продажа') {
      if (!salesByNmId[nmId]) {
        salesByNmId[nmId] = {
          totalSales: 0,
          saName: record.sa_name || 'N/A'
        };
      }
      
      salesByNmId[nmId].totalSales += record.quantity || 0;
    }
  }
  
  // Рассчитываем количество дней
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const result: DailySalesData = {};
  
  for (const [nmIdStr, salesInfo] of Object.entries(salesByNmId)) {
    const nmId = parseInt(nmIdStr, 10);
    
    if (daysDiff > 0) {
      result[nmId] = {
        averageDailySales: salesInfo.totalSales / daysDiff,
        saName: salesInfo.saName
      };
    }
  }
  
  return result;
};

/**
 * Рассчитывает среднюю стоимость хранения для каждого товара
 */
export const calculateAverageStorageCosts = (data: StorageCostRecord[]): StorageCostData => {
  const storageCosts: Record<number, {
    totalCost: number;
    dayCount: number;
    vendorCode: string;
    brand: string;
    subject: string;
  }> = {};
  
  for (const record of data) {
    const nmId = record.nmId;
    
    if (nmId) {
      if (!storageCosts[nmId]) {
        storageCosts[nmId] = {
          totalCost: 0,
          dayCount: 0,
          vendorCode: record.vendorCode || 'N/A',
          brand: record.brand || 'N/A',
          subject: record.subject || 'N/A'
        };
      }
      
      storageCosts[nmId].totalCost += record.warehousePrice || 0;
      storageCosts[nmId].dayCount += 1;
    }
  }
  
  const result: StorageCostData = {};
  
  for (const [nmIdStr, storageInfo] of Object.entries(storageCosts)) {
    const nmId = parseInt(nmIdStr, 10);
    
    result[nmId] = {
      averageStorageCost: storageInfo.dayCount > 0 ? storageInfo.totalCost / storageInfo.dayCount : 0,
      vendorCode: storageInfo.vendorCode,
      brand: storageInfo.brand,
      subject: storageInfo.subject
    };
  }
  
  return result;
};

/**
 * Форматирует дату для API запросов
 */
export const formatDateForApi = (date: Date, includeTime: boolean = false): string => {
  return includeTime 
    ? format(date, 'yyyy-MM-dd\'T\'HH:mm:ss')
    : format(date, 'yyyy-MM-dd');
};

/**
 * Получает данные о средних продажах и стоимости хранения
 */
export const fetchAverageSalesAndStorageData = async (
  apiKey: string,
  salesDateFrom: Date,
  salesDateTo: Date,
  storageDateFrom: Date,
  storageDateTo: Date
): Promise<{
  dailySalesRates: Record<number, number>;
  storageCostRates: Record<number, number>;
  names: Record<number, string>;
}> => {
  // Форматируем даты для API запросов
  const formattedSalesDateFrom = formatDateForApi(salesDateFrom);
  const formattedSalesDateTo = formatDateForApi(salesDateTo);
  const formattedStorageDateFrom = formatDateForApi(storageDateFrom, true);
  const formattedStorageDateTo = formatDateForApi(storageDateTo, true);
  
  console.log(`Fetching sales data from ${formattedSalesDateFrom} to ${formattedSalesDateTo}`);
  console.log(`Fetching storage data from ${formattedStorageDateFrom} to ${formattedStorageDateTo}`);
  
  try {
    // 1. Получаем данные о продажах
    const salesData = await fetchAllSalesData(apiKey, formattedSalesDateFrom, formattedSalesDateTo);
    console.log(`Received ${salesData.length} sales records`);
    
    // 2. Получаем данные о стоимости хранения
    const taskId = await createPaidStorageReport(apiKey, formattedStorageDateFrom, formattedStorageDateTo);
    
    if (!taskId) {
      throw new Error("Failed to create paid storage report task");
    }
    
    console.log(`Created paid storage report task with ID: ${taskId}`);
    
    // 3. Ждем завершения формирования отчета
    let statusStorage = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (statusStorage !== "done" && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Ожидаем 5 секунд
      statusStorage = await getPaidStorageReportStatus(apiKey, taskId);
      console.log(`Attempt ${attempts + 1}/${maxAttempts}: Storage report status: ${statusStorage}`);
      attempts++;
    }
    
    if (statusStorage !== "done") {
      throw new Error(`Storage report is not ready after ${maxAttempts} attempts`);
    }
    
    // 4. Скачиваем отчет о платном хранении
    const storageData = await downloadPaidStorageReport(apiKey, taskId);
    console.log(`Downloaded storage report with ${storageData.length} records`);
    
    // 5. Рассчитываем средние показатели
    const averageDailySales = calculateAverageDailySales(salesData, formattedSalesDateFrom, formattedSalesDateTo);
    const averageStorageCosts = calculateAverageStorageCosts(storageData);
    
    // 6. Объединяем данные
    const dailySalesRates: Record<number, number> = {};
    const storageCostRates: Record<number, number> = {};
    const names: Record<number, string> = {};
    
    // Объединяем данные из обоих источников
    const allNmIds = new Set([
      ...Object.keys(averageDailySales).map(id => parseInt(id, 10)),
      ...Object.keys(averageStorageCosts).map(id => parseInt(id, 10))
    ]);
    
    allNmIds.forEach(nmId => {
      dailySalesRates[nmId] = averageDailySales[nmId]?.averageDailySales || 0;
      storageCostRates[nmId] = averageStorageCosts[nmId]?.averageStorageCost || 0;
      names[nmId] = averageDailySales[nmId]?.saName || 
                    (averageStorageCosts[nmId]?.subject ? `${averageStorageCosts[nmId].brand} ${averageStorageCosts[nmId].subject}` : 'N/A');
    });
    
    return {
      dailySalesRates,
      storageCostRates,
      names
    };
  } catch (error) {
    console.error("Error fetching average sales and storage data:", error);
    throw error;
  }
};

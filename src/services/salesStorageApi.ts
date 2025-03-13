
import axios from 'axios';
import { format } from 'date-fns';

/**
 * Загружает детальный отчет по продажам с Wildberries API
 */
export const fetchSalesReportDetail = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string,
  rrdid = 0
): Promise<{ data: any[], nextRrdid: number }> => {
  try {
    const url = "https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod";
    const headers = { Authorization: apiKey };
    const params = {
      dateFrom,
      dateTo,
      rrdid,
      limit: 100000,
    };

    console.log(`Загрузка отчета о продажах с ${dateFrom} по ${dateTo}, rrdid=${rrdid}`);
    const response = await axios.get(url, { headers, params });
    
    const data = response.data;
    const nextRrdid = data.length > 0 ? data[data.length - 1].rrd_id || 0 : 0;
    
    return { data, nextRrdid };
  } catch (error: any) {
    console.error("Ошибка при загрузке отчета о продажах:", error);
    throw new Error(`Ошибка при загрузке отчета о продажах: ${error.response?.status || error.message}`);
  }
};

/**
 * Рассчитывает среднее количество продаж в день для каждого товара
 */
export const calculateAverageDailySales = (
  data: any[],
  dateFrom: string,
  dateTo: string
): Record<number, { averageDailySales: number, saName: string }> => {
  if (!data || data.length === 0) {
    return {};
  }

  const salesByNmId: Record<number, { totalSales: number, saName: string }> = {};
  
  for (const record of data) {
    const nmId = record.nm_id;
    if (!nmId || record.doc_type_name !== 'Продажа') continue;
    
    if (!salesByNmId[nmId]) {
      salesByNmId[nmId] = { totalSales: 0, saName: record.sa_name || 'Н/Д' };
    }
    
    salesByNmId[nmId].totalSales += record.quantity || 0;
  }
  
  // Рассчитываем количество дней в периоде
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Преобразуем общие продажи в среднедневные
  const result: Record<number, { averageDailySales: number, saName: string }> = {};
  
  for (const [nmIdStr, data] of Object.entries(salesByNmId)) {
    const nmId = Number(nmIdStr);
    result[nmId] = {
      averageDailySales: daysDiff > 0 ? data.totalSales / daysDiff : 0,
      saName: data.saName
    };
  }
  
  return result;
};

/**
 * Создает задание на отчет о платном хранении
 */
export const createPaidStorageReportTask = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<string> => {
  try {
    const url = "https://seller-analytics-api.wildberries.ru/api/v1/paid_storage";
    const headers = { 
      Authorization: apiKey, 
      "Content-Type": "application/json" 
    };
    const params = { dateFrom, dateTo };
    
    console.log(`Создание задания на получение отчета о платном хранении с ${dateFrom} по ${dateTo}`);
    const response = await axios.get(url, { headers, params });
    
    return response.data?.data?.taskId;
  } catch (error: any) {
    console.error("Ошибка при создании отчета о платном хранении:", error);
    throw new Error(`Ошибка при создании отчета: ${error.response?.status || error.message}`);
  }
};

/**
 * Проверяет статус задания на отчет о платном хранении
 */
export const checkPaidStorageReportStatus = async (
  apiKey: string,
  taskId: string
): Promise<string> => {
  try {
    const url = `https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks/${taskId}/status`;
    const headers = { Authorization: apiKey };
    
    const response = await axios.get(url, { headers });
    
    return response.data?.data?.status;
  } catch (error: any) {
    console.error("Ошибка при проверке статуса отчета:", error);
    throw new Error(`Ошибка при проверке статуса: ${error.response?.status || error.message}`);
  }
};

/**
 * Загружает отчет о платном хранении
 */
export const downloadPaidStorageReport = async (
  apiKey: string,
  taskId: string
): Promise<any[]> => {
  try {
    const url = `https://seller-analytics-api.wildberries.ru/api/v1/paid_storage/tasks/${taskId}/download`;
    const headers = { Authorization: apiKey };
    
    const response = await axios.get(url, { headers });
    
    return response.data || [];
  } catch (error: any) {
    console.error("Ошибка при загрузке отчета о платном хранении:", error);
    throw new Error(`Ошибка при загрузке отчета: ${error.response?.status || error.message}`);
  }
};

/**
 * Ожидает завершения задания на отчет о платном хранении
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
        
        if (status === "done") {
          resolve(true);
          return;
        }
        
        if (status === "purged" || status === "canceled") {
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
 * Рассчитывает средние затраты на хранение по товарам
 */
export const calculateAverageStorageCosts = (
  reportData: any[]
): Record<number, number> => {
  if (!reportData || reportData.length === 0) {
    return {};
  }
  
  const storageCosts: Record<number, { totalCost: number, dayCount: number }> = {};
  
  for (const record of reportData) {
    const nmId = record.nmId;
    if (!nmId) continue;
    
    if (!storageCosts[nmId]) {
      storageCosts[nmId] = { totalCost: 0, dayCount: 0 };
    }
    
    storageCosts[nmId].totalCost += record.warehousePrice || 0;
    storageCosts[nmId].dayCount++;
  }
  
  // Преобразуем в средние затраты на хранение
  const result: Record<number, number> = {};
  
  for (const [nmIdStr, data] of Object.entries(storageCosts)) {
    const nmId = Number(nmIdStr);
    result[nmId] = data.dayCount > 0 ? data.totalCost / data.dayCount : 0;
  }
  
  return result;
};

/**
 * Получает полные данные о продажах, включая все страницы отчета
 */
export const fetchAllSalesReportData = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<any[]> => {
  let allData: any[] = [];
  let nextRrdid = 0;
  let hasMoreData = true;
  
  console.log("Загрузка всех данных об отчете по продажам...");
  
  try {
    while (hasMoreData) {
      const result = await fetchSalesReportDetail(apiKey, dateFrom, dateTo, nextRrdid);
      
      if (!result.data || result.data.length === 0) {
        hasMoreData = false;
        continue;
      }
      
      allData = [...allData, ...result.data];
      
      const prevRrdid = nextRrdid;
      nextRrdid = result.nextRrdid;
      
      console.log(`Получено ${result.data.length} записей, всего: ${allData.length}, следующий rrdid: ${nextRrdid}`);
      
      if (nextRrdid === 0 || nextRrdid === prevRrdid || result.data.length < 100000) {
        hasMoreData = false;
      }
    }
    
    console.log(`Всего получено ${allData.length} записей о продажах`);
    return allData;
  } catch (error) {
    console.error("Ошибка при загрузке отчета о продажах:", error);
    throw error;
  }
};

/**
 * Получает полный отчет о платном хранении
 */
export const fetchFullPaidStorageReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<any[]> => {
  try {
    console.log("Создание задания на получение отчета о платном хранении...");
    const taskId = await createPaidStorageReportTask(apiKey, dateFrom, dateTo);
    
    if (!taskId) {
      throw new Error("Не удалось создать задание на отчет о платном хранении");
    }
    
    console.log(`Задание на отчет создано с ID: ${taskId}, ожидание завершения...`);
    await waitForPaidStorageReportCompletion(apiKey, taskId);
    
    console.log("Задание завершено, загрузка отчета...");
    const reportData = await downloadPaidStorageReport(apiKey, taskId);
    
    console.log(`Отчет о платном хранении загружен, получено ${reportData.length} записей`);
    return reportData;
  } catch (error) {
    console.error("Ошибка при получении отчета о платном хранении:", error);
    throw error;
  }
};

/**
 * Главная функция для получения средних продаж и затрат на хранение
 */
export const fetchAverageSalesAndStorageCosts = async (
  apiKey: string,
  salesDateFrom: Date,
  salesDateTo: Date,
  storageDateFrom: Date,
  storageDateTo: Date
): Promise<{
  averageDailySales: Record<number, number>,
  storageDaily: Record<number, number>
}> => {
  try {
    // Форматируем даты
    const formattedSalesDateFrom = format(salesDateFrom, 'yyyy-MM-dd');
    const formattedSalesDateTo = format(salesDateTo, 'yyyy-MM-dd');
    const formattedStorageDateFrom = format(storageDateFrom, "yyyy-MM-dd'T'HH:mm:ss");
    const formattedStorageDateTo = format(storageDateTo, "yyyy-MM-dd'T'HH:mm:ss");
    
    console.log(`Получение данных о продажах с ${formattedSalesDateFrom} по ${formattedSalesDateTo}`);
    console.log(`Получение данных о хранении с ${formattedStorageDateFrom} по ${formattedStorageDateTo}`);
    
    // Получаем данные о продажах
    const salesData = await fetchAllSalesReportData(apiKey, formattedSalesDateFrom, formattedSalesDateTo);
    
    // Рассчитываем средние продажи
    const salesByProduct = calculateAverageDailySales(salesData, formattedSalesDateFrom, formattedSalesDateTo);
    
    // Получаем данные о хранении
    const storageData = await fetchFullPaidStorageReport(apiKey, formattedStorageDateFrom, formattedStorageDateTo);
    
    // Рассчитываем средние затраты на хранение
    const storageCosts = calculateAverageStorageCosts(storageData);
    
    // Преобразуем формат данных о продажах
    const averageDailySales: Record<number, number> = {};
    for (const [nmIdStr, data] of Object.entries(salesByProduct)) {
      const nmId = Number(nmIdStr);
      averageDailySales[nmId] = data.averageDailySales;
    }
    
    return {
      averageDailySales,
      storageDaily: storageCosts
    };
  } catch (error) {
    console.error("Ошибка при получении данных о продажах и хранении:", error);
    throw error;
  }
};

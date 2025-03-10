import axios from 'axios';
import { SupplyItem, SupplyOptionsResponse, Warehouse, WarehouseCoefficient, PaidStorageItem } from '@/types/supplies';

const API_BASE_URL = 'https://seller-analytics-api.wildberries.ru/api/v1';

export const fetchWarehouses = async (apiKey: string): Promise<Warehouse[]> => {
  try {
    const response = await axios.get<Warehouse[]>(`${API_BASE_URL}/warehouses`, {
      headers: {
        Authorization: apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    throw error;
  }
};

export const fetchAcceptanceCoefficients = async (apiKey: string): Promise<WarehouseCoefficient[]> => {
  try {
    const response = await axios.get<WarehouseCoefficient[]>(`${API_BASE_URL}/acceptance_coefficients`, {
      headers: {
        Authorization: apiKey,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    throw error;
  }
};

export const fetchAcceptanceOptions = async (
  apiKey: string,
  items: SupplyItem[],
  warehouseID: number
): Promise<SupplyOptionsResponse> => {
  try {
    const response = await axios.post<SupplyOptionsResponse>(
      `${API_BASE_URL}/acceptance_options`,
      {
        items,
        warehouseID,
      },
      {
        headers: {
          Authorization: apiKey,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка при запросе к API:', error);
    throw error;
  }
};

// New functions for paid storage API

/**
 * Creates a paid storage report task
 */
export const createPaidStorageReportTask = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<string> => {
  try {
    const url = `${API_BASE_URL}/paid_storage`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: apiKey
      },
      params: {
        dateFrom,
        dateTo
      }
    });
    
    return response.data.data.taskId;
  } catch (error: any) {
    console.error('Ошибка при создании отчета о платном хранении:', error);
    throw new Error(`Ошибка при создании отчета: ${error.response?.status || 'Неизвестная ошибка'}`);
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
    const url = `${API_BASE_URL}/paid_storage/tasks/${taskId}/status`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: apiKey
      }
    });
    
    return response.data.data.status;
  } catch (error: any) {
    console.error('Ошибка при проверке статуса отчета:', error);
    throw new Error(`Ошибка при проверке статуса: ${error.response?.status || 'Неизвестная ошибка'}`);
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
    const url = `${API_BASE_URL}/paid_storage/tasks/${taskId}/download`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: apiKey
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при скачивании отчета:', error);
    throw new Error(`Ошибка при скачивании отчета: ${error.response?.status || 'Неизвестная ошибка'}`);
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

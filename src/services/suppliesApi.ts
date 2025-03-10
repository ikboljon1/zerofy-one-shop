
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

// Функции для работы с API платного хранения

/**
 * Форматирует дату в формат, необходимый для API платного хранения
 */
const formatDateForStorageAPI = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

/**
 * Создает задание на генерацию отчета о платном хранении
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
        dateFrom: formatDateForStorageAPI(dateFrom),
        dateTo: formatDateForStorageAPI(dateTo)
      }
    });
    
    return response.data.data.taskId;
  } catch (error: any) {
    console.error('Ошибка при создании отчета о платном хранении:', error);
    throw new Error(`Ошибка при создании отчета: ${error.response?.status || 'Неизвестная ошибка'}`);
  }
};

/**
 * Проверяет статус задания на генерацию отчета о платном хранении
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
 * Скачивает отчет о платном хранении
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
 * Ожидает завершения задания на генерацию отчета о платном хранении
 */
export const waitForPaidStorageReportCompletion = async (
  apiKey: string,
  taskId: string,
  maxAttempts = 12, // Максимальное количество попыток
  interval = 5000 // Интервал между попытками в миллисекундах
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
 * Получает полный отчет о платном хранении
 */
export const fetchFullPaidStorageReport = async (
  apiKey: string,
  dateFrom: string,
  dateTo: string
): Promise<PaidStorageItem[]> => {
  try {
    console.log('Создание задания на получение отчета о платном хранении...');
    // Шаг 1: Создаем задание
    const taskId = await createPaidStorageReportTask(apiKey, dateFrom, dateTo);
    console.log(`Задание создано с ID: ${taskId}. Ожидание завершения...`);
    
    // Шаг 2: Ожидаем завершения
    await waitForPaidStorageReportCompletion(apiKey, taskId);
    console.log('Задание выполнено. Загрузка отчета...');
    
    // Шаг 3: Получаем данные отчета
    const report = await downloadPaidStorageReport(apiKey, taskId);
    console.log(`Отчет загружен. Получено ${report.length} записей.`);
    
    return report;
  } catch (error) {
    console.error('Ошибка в процессе получения отчета о платном хранении:', error);
    throw error;
  }
};

/**
 * Автоматически заполняет данные о стоимости хранения для товаров на основе отчета о платном хранении
 * @param warehouseRemains - Список товаров на складе
 * @param paidStorageData - Данные отчета о платном хранении
 * @returns Словарь с ежедневной стоимостью хранения для каждого товара по nmId
 */
export const calculateDailyStorageCosts = (
  warehouseRemains: any[],
  paidStorageData: PaidStorageItem[]
): Record<number, number> => {
  const result: Record<number, number> = {};
  
  // Создаем карту поиска по nmId для быстрого доступа
  const storageMap = new Map<number, PaidStorageItem[]>();
  
  // Группируем данные о платном хранении по nmId
  paidStorageData.forEach(item => {
    if (!storageMap.has(item.nmId)) {
      storageMap.set(item.nmId, []);
    }
    storageMap.get(item.nmId)?.push(item);
  });
  
  // Рассчитываем стоимость хранения для каждого товара
  warehouseRemains.forEach(item => {
    const nmId = item.nmId;
    const matchingStorageItems = storageMap.get(nmId) || [];
    
    if (matchingStorageItems.length > 0) {
      // Рассчитываем среднюю дневную стоимость хранения из соответствующих записей
      const totalCost = matchingStorageItems.reduce((sum, psi) => sum + psi.warehousePrice, 0);
      const avgDailyCost = totalCost / matchingStorageItems.length;
      result[nmId] = avgDailyCost;
    } else {
      // Если нет соответствующих данных, используем приблизительный расчет на основе объема
      const volume = item.volume || 1;
      result[nmId] = volume * 5; // Примерный расчет на основе объема
    }
  });
  
  return result;
};

// Для демонстрации или тестирования
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

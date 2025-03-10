
import axios from 'axios';
import { WarehouseRemainItem, CreateTaskResponse, TaskStatusResponse } from '@/types/supplies';

const API_BASE_URL = 'https://seller-analytics-api.wildberries.ru/api/v1';

// Create a report task
export const createWarehouseRemainsTask = async (
  apiKey: string,
  params: {
    locale?: string;
    groupByBrand?: boolean;
    groupBySubject?: boolean;
    groupBySa?: boolean;
    groupByNm?: boolean;
    groupByBarcode?: boolean;
    groupBySize?: boolean;
    filterPics?: number;
    filterVolume?: number;
  } = {}
): Promise<string> => {
  try {
    const response = await axios.get<CreateTaskResponse>(`${API_BASE_URL}/warehouse_remains`, {
      headers: {
        Authorization: apiKey,
      },
      params: {
        locale: 'ru',
        ...params
      }
    });
    
    return response.data.data.taskId;
  } catch (error: any) {
    console.error('Ошибка при создании отчета:', error);
    throw new Error(`Ошибка при создании отчета: ${error.response?.status || 'Неизвестная ошибка'}`);
  }
};

// Check task status
export const checkTaskStatus = async (
  apiKey: string,
  taskId: string
): Promise<string> => {
  try {
    const response = await axios.get<TaskStatusResponse>(
      `${API_BASE_URL}/warehouse_remains/tasks/${taskId}/status`,
      {
        headers: {
          Authorization: apiKey,
        }
      }
    );
    
    return response.data.data.status;
  } catch (error: any) {
    console.error('Ошибка при проверке статуса задания:', error);
    throw new Error(`Ошибка при проверке статуса: ${error.response?.status || 'Неизвестная ошибка'}`);
  }
};

// Get report data
export const getWarehouseRemainsReport = async (
  apiKey: string,
  taskId: string
): Promise<WarehouseRemainItem[]> => {
  try {
    const response = await axios.get<WarehouseRemainItem[]>(
      `${API_BASE_URL}/warehouse_remains/tasks/${taskId}/download`,
      {
        headers: {
          Authorization: apiKey,
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при получении отчета:', error);
    throw new Error(`Ошибка при получении отчета: ${error.response?.status || 'Неизвестная ошибка'}`);
  }
};

// Helper function to wait for task to complete
export const waitForTaskCompletion = async (
  apiKey: string,
  taskId: string,
  maxAttempts = 12,
  interval = 5000
): Promise<boolean> => {
  let attempts = 0;
  
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const status = await checkTaskStatus(apiKey, taskId);
        
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

// Function that combines all steps to get warehouse remains
export const fetchWarehouseRemains = async (
  apiKey: string,
  params: {
    locale?: string;
    groupByBrand?: boolean;
    groupBySubject?: boolean;
    groupBySa?: boolean;
    groupByNm?: boolean;
    groupByBarcode?: boolean;
    groupBySize?: boolean;
    filterPics?: number;
    filterVolume?: number;
  } = {}
): Promise<WarehouseRemainItem[]> => {
  try {
    console.log('Создание задания на получение отчета...');
    // Step 1: Create task
    const taskId = await createWarehouseRemainsTask(apiKey, params);
    console.log(`Задание создано с ID: ${taskId}. Ожидание завершения...`);
    
    // Step 2: Wait for completion
    await waitForTaskCompletion(apiKey, taskId);
    console.log('Задание выполнено. Загрузка отчета...');
    
    // Step 3: Get report data
    const report = await getWarehouseRemainsReport(apiKey, taskId);
    console.log(`Отчет загружен. Получено ${report.length} записей.`);
    
    return report;
  } catch (error) {
    console.error('Ошибка в процессе получения отчета:', error);
    throw error;
  }
};

// For testing or development, return mock data
export const getMockWarehouseRemains = (): WarehouseRemainItem[] => {
  return Array(20).fill(null).map((_, index) => ({
    lastChangeDate: new Date().toISOString(),
    warehouseName: ['Коледино', 'Подольск', 'Электросталь'][index % 3],
    vendorCode: `A${1000 + index}`,
    nmId: 300000 + index,
    barcode: `2000000${index}`,
    brand: ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'][index % 5],
    category: ['Одежда', 'Обувь', 'Аксессуары'][index % 3],
    subjectName: ['Футболка', 'Джинсы', 'Куртка', 'Обувь', 'Аксессуары'][index % 5],
    chrtId: 200000 + index,
    price: 1000 + (index * 100),
    quantity: 10 + index,
    quantityFull: 10 + index,
    quantityType: 'шт',
    size: ['S', 'M', 'L', 'XL', 'XXL'][index % 5],
    techSize: ['42', '44', '46', '48', '50'][index % 5],
    inWayToClient: index,
    inWayFromClient: index % 3,
    isSupply: true,
    isRealization: false,
    volume: 0.5 + (index % 10) / 10,
    quantityWarehousesFull: 10 + index,
    quantityWarehouses: 10 + index
  }));
};

// Transform API data into more usable format (UPDATED to use correct property names)
export const processWarehouseRemains = (data: WarehouseRemainItem[]) => {
  // Get unique brands
  const brands = [...new Set(data.map(item => item.brand))];
  
  // Get unique subjects
  const subjects = [...new Set(data.map(item => item.subjectName))];
  
  // Get unique warehouses - using warehouseName property
  const warehouses = [...new Set(data.map(item => item.warehouseName))];
  
  // Calculate totals
  const totalItems = data.reduce((sum, item) => sum + (item.quantityWarehousesFull || 0), 0);
  const totalInWayToClient = data.reduce((sum, item) => sum + (item.inWayToClient || 0), 0);
  const totalInWayFromClient = data.reduce((sum, item) => sum + (item.inWayFromClient || 0), 0);
  
  // Group by brand
  const byBrand = brands.map(brand => {
    const items = data.filter(item => item.brand === brand);
    return {
      brand,
      count: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantityWarehousesFull || 0), 0),
      totalInWayToClient: items.reduce((sum, item) => sum + (item.inWayToClient || 0), 0),
      totalInWayFromClient: items.reduce((sum, item) => sum + (item.inWayFromClient || 0), 0),
    };
  });
  
  // Group by subject
  const bySubject = subjects.map(subject => {
    const items = data.filter(item => item.subjectName === subject);
    return {
      subject,
      count: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantityWarehousesFull || 0), 0),
    };
  });
  
  // Group by warehouse
  const byWarehouse = warehouses.map(warehouse => {
    const items = data.filter(item => item.warehouseName === warehouse);
    const quantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    
    return {
      warehouse,
      quantity,
    };
  });
  
  return {
    totals: {
      items: totalItems,
      inWayToClient: totalInWayToClient,
      inWayFromClient: totalInWayFromClient,
    },
    byBrand,
    bySubject,
    byWarehouse,
    raw: data,
  };
};

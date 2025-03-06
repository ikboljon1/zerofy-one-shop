
import axios from 'axios';

interface WarehouseData {
  id: number;
  name: string;
  coordinates: [number, number];
  size: string;
  items: number;
  status: 'active' | 'maintenance' | 'low-stock';
  fillRate: number;
  lastRestock: string;
  manager: string;
  totalValue: number;
  mostStockedCategory: string;
  fastMovingItems: number;
  slowMovingItems: number;
  avgProcessingTime: string;
}

interface LogisticsRoute {
  origin: number;
  destination: number;
  volume: string;
  transport: string;
  distance: string;
  travelTime: string;
  cost: number;
  frequency: string;
  carrier: string;
  status: 'active' | 'delayed';
}

interface InventoryCategory {
  category: string;
  totalItems: number;
  valueRub: number;
  topSellingItem: string;
  averageTurnover: string;
  returns: number;
  inTransit: number;
}

// Интерфейс для данных о складах от Wildberries API
interface WildberriesStockItem {
  lastChangeDate: string;
  warehouseName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  quantity: number;
  inWayToClient: number;
  inWayFromClient: number;
  quantityFull: number;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  Price: number;
  Discount: number;
  isSupply: boolean;
  isRealization: boolean;
  SCCode: string;
}

// Интерфейс для данных из отчета об остатках на складах
interface WildberriesWarehouseRemainsItem {
  brand: string;
  subjectName: string;
  vendorCode: string;
  nmId: number;
  barcode: string;
  techSize: string;
  volume: number;
  inWayToClient: number;
  inWayFromClient: number;
  quantityWarehousesFull: number;
  warehouses: {
    warehouseName: string;
    quantity: number;
  }[];
}

// Функция для получения данных о складах
export const fetchWarehouses = async (apiKey: string): Promise<WarehouseData[]> => {
  try {
    // Здесь должен быть реальный запрос к API, например:
    // const response = await axios.get('https://api.yourservice.com/warehouses', {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // });
    // return response.data;
    
    // В отсутствие реального API возвращаем демо-данные из локального хранилища
    // или импортируем из файла с демо-данными
    const storedWarehouses = localStorage.getItem('warehouse_data');
    if (storedWarehouses) {
      return JSON.parse(storedWarehouses);
    }
    
    // Если данных нет в localStorage, импортируем из файла с демо-данными
    const { warehousesData } = await import('@/components/analytics/data/demoData');
    
    // Приведение типов для coordinates, чтобы они соответствовали [number, number]
    const typedWarehouses = warehousesData.map(warehouse => ({
      ...warehouse,
      coordinates: warehouse.coordinates as [number, number],
      status: warehouse.status as 'active' | 'maintenance' | 'low-stock'
    }));
    
    return typedWarehouses;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
};

// Функция для получения данных о маршрутах логистики
export const fetchLogisticsRoutes = async (apiKey: string): Promise<LogisticsRoute[]> => {
  try {
    // Здесь должен быть реальный запрос к API
    // const response = await axios.get('https://api.yourservice.com/logistics', {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // });
    // return response.data;
    
    // В отсутствие реального API возвращаем демо-данные
    const storedRoutes = localStorage.getItem('logistics_routes');
    if (storedRoutes) {
      return JSON.parse(storedRoutes);
    }
    
    // Если данных нет в localStorage, импортируем из файла с демо-данными
    const { logisticsRoutes } = await import('@/components/analytics/data/demoData');
    
    // Приведение типов для status, чтобы они соответствовали 'active' | 'delayed'
    const typedRoutes = logisticsRoutes.map(route => ({
      ...route,
      status: route.status as 'active' | 'delayed'
    }));
    
    return typedRoutes;
  } catch (error) {
    console.error('Error fetching logistics routes:', error);
    throw error;
  }
};

// Функция для получения данных об инвентаре
export const fetchInventory = async (apiKey: string): Promise<InventoryCategory[]> => {
  try {
    // Здесь должен быть реальный запрос к API
    // const response = await axios.get('https://api.yourservice.com/inventory', {
    //   headers: { 'Authorization': `Bearer ${apiKey}` }
    // });
    // return response.data;
    
    // В отсутствие реального API возвращаем демо-данные
    const storedInventory = localStorage.getItem('inventory_data');
    if (storedInventory) {
      return JSON.parse(storedInventory);
    }
    
    // Если данных нет в localStorage, импортируем из файла с демо-данными
    const { inventoryData } = await import('@/components/analytics/data/demoData');
    return inventoryData;
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
};

// Функция для получения данных о складах через Wildberries API
export const fetchWildberriesStocks = async (apiKey: string): Promise<WildberriesStockItem[]> => {
  try {
    const dateFrom = new Date();
    dateFrom.setFullYear(dateFrom.getFullYear() - 1); // Получаем данные за последний год
    
    const formattedDate = dateFrom.toISOString().split('T')[0]; // Форматируем в YYYY-MM-DD
    
    console.log(`Fetching Wildberries stocks from ${formattedDate}`);
    
    const response = await axios.get('https://statistics-api.wildberries.ru/api/v1/supplier/stocks', {
      headers: {
        'Authorization': apiKey
      },
      params: {
        dateFrom: formattedDate
      }
    });
    
    console.log(`Received ${response.data.length} stock items from Wildberries API`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Wildberries stocks:', error);
    // В случае ошибки возвращаем пустой массив
    return [];
  }
};

// Функция для создания отчета об остатках на складах через Wildberries API
export const createWarehouseRemainsReport = async (apiKey: string): Promise<string | null> => {
  try {
    const response = await axios.get('https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains', {
      headers: {
        'Authorization': apiKey
      },
      params: {
        groupByBrand: true,
        groupBySubject: true,
        groupByNm: true
      }
    });
    
    if (response.data && response.data.data && response.data.data.taskId) {
      console.log(`Created warehouse remains report task: ${response.data.data.taskId}`);
      return response.data.data.taskId;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating warehouse remains report:', error);
    return null;
  }
};

// Функция для проверки статуса отчета об остатках на складах
export const checkWarehouseRemainsStatus = async (apiKey: string, taskId: string): Promise<string> => {
  try {
    const response = await axios.get(`https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains/tasks/${taskId}/status`, {
      headers: {
        'Authorization': apiKey
      }
    });
    
    if (response.data && response.data.data && response.data.data.status) {
      console.log(`Warehouse remains report status: ${response.data.data.status}`);
      return response.data.data.status;
    }
    
    return 'unknown';
  } catch (error) {
    console.error('Error checking warehouse remains status:', error);
    return 'error';
  }
};

// Функция для получения отчета об остатках на складах
export const getWarehouseRemainsReport = async (apiKey: string, taskId: string): Promise<WildberriesWarehouseRemainsItem[]> => {
  try {
    const response = await axios.get(`https://seller-analytics-api.wildberries.ru/api/v1/warehouse_remains/tasks/${taskId}/download`, {
      headers: {
        'Authorization': apiKey
      }
    });
    
    console.log(`Received warehouse remains report with ${response.data.length} items`);
    return response.data;
  } catch (error) {
    console.error('Error getting warehouse remains report:', error);
    return [];
  }
};

// Функция для получения полных данных об остатках на складах Wildberries
export const fetchWildberriesWarehouseData = async (apiKey: string): Promise<WarehouseData[]> => {
  try {
    // Шаг 1: Получаем данные о складах через API
    const stocks = await fetchWildberriesStocks(apiKey);
    
    if (stocks.length === 0) {
      console.log('No stock data received, using demo data');
      const { warehousesData } = await import('@/components/analytics/data/demoData');
      
      // Приведение типов для coordinates, чтобы они соответствовали [number, number]
      const typedWarehouses = warehousesData.map(warehouse => ({
        ...warehouse,
        coordinates: warehouse.coordinates as [number, number],
        status: warehouse.status as 'active' | 'maintenance' | 'low-stock'
      }));
      
      return typedWarehouses;
    }
    
    // Шаг 2: Создаем отчет об остатках
    const taskId = await createWarehouseRemainsReport(apiKey);
    
    if (!taskId) {
      console.log('Failed to create warehouse report, using stock data only');
      return transformStocksToWarehouses(stocks);
    }
    
    // Шаг 3: Проверяем статус отчета
    let status = await checkWarehouseRemainsStatus(apiKey, taskId);
    let attempts = 0;
    
    // Ждем, пока отчет не будет готов (максимум 30 попыток с интервалом 5 секунд)
    while (status !== 'done' && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Пауза 5 секунд
      status = await checkWarehouseRemainsStatus(apiKey, taskId);
      attempts++;
    }
    
    if (status !== 'done') {
      console.log('Report not ready, using stock data only');
      return transformStocksToWarehouses(stocks);
    }
    
    // Шаг 4: Получаем отчет
    const remainsReport = await getWarehouseRemainsReport(apiKey, taskId);
    
    if (remainsReport.length === 0) {
      console.log('Empty report received, using stock data only');
      return transformStocksToWarehouses(stocks);
    }
    
    // Шаг 5: Объединяем данные из stocks и remainsReport
    return transformCombinedDataToWarehouses(stocks, remainsReport);
  } catch (error) {
    console.error('Error fetching Wildberries warehouse data:', error);
    
    // В случае ошибки возвращаем демо-данные
    const { warehousesData } = await import('@/components/analytics/data/demoData');
    
    // Приведение типов для coordinates, чтобы они соответствовали [number, number]
    const typedWarehouses = warehousesData.map(warehouse => ({
      ...warehouse,
      coordinates: warehouse.coordinates as [number, number],
      status: warehouse.status as 'active' | 'maintenance' | 'low-stock'
    }));
    
    return typedWarehouses;
  }
};

// Функция для преобразования данных из API stocks в формат WarehouseData
const transformStocksToWarehouses = (stocks: WildberriesStockItem[]): WarehouseData[] => {
  // Группируем товары по складам
  const warehousesMap = new Map<string, {
    items: number;
    categories: Map<string, number>;
    lastRestock: string;
    totalValue: number;
  }>();
  
  for (const stock of stocks) {
    const warehouseName = stock.warehouseName;
    
    if (!warehousesMap.has(warehouseName)) {
      warehousesMap.set(warehouseName, {
        items: 0,
        categories: new Map<string, number>(),
        lastRestock: stock.lastChangeDate,
        totalValue: 0
      });
    }
    
    const warehouse = warehousesMap.get(warehouseName)!;
    
    // Увеличиваем количество товаров
    warehouse.items += stock.quantity;
    
    // Обновляем дату последней поставки, если текущая запись новее
    if (new Date(stock.lastChangeDate) > new Date(warehouse.lastRestock)) {
      warehouse.lastRestock = stock.lastChangeDate;
    }
    
    // Увеличиваем счетчик для категории
    const category = stock.category || 'Неизвестная категория';
    const currentCategoryCount = warehouse.categories.get(category) || 0;
    warehouse.categories.set(category, currentCategoryCount + stock.quantity);
    
    // Увеличиваем общую стоимость товаров
    warehouse.totalValue += stock.quantity * stock.Price * (1 - stock.Discount / 100);
  }
  
  // Координаты основных складов Wildberries для демонстрации
  const warehouseCoordinates: Record<string, [number, number]> = {
    'Подольск': [55.431177, 37.544737],
    'Коледино': [55.322614, 37.551605],
    'Электросталь': [55.784445, 38.444849],
    'Казань': [55.798551, 49.106324],
    'Краснодар': [45.035470, 39.032859],
    'Екатеринбург': [56.862551, 60.635006],
    'Новосибирск': [55.030199, 82.920430],
    'Хабаровск': [48.480223, 135.071917],
    'Санкт-Петербург': [59.939095, 30.315868],
    'Тула': [54.193122, 37.617348]
  };
  
  // Преобразуем данные в формат WarehouseData
  const warehouses: WarehouseData[] = Array.from(warehousesMap.entries()).map(([name, data], index) => {
    // Находим самую популярную категорию
    let mostStockedCategory = 'Разное';
    let maxCategoryCount = 0;
    
    for (const [category, count] of data.categories.entries()) {
      if (count > maxCategoryCount) {
        maxCategoryCount = count;
        mostStockedCategory = category;
      }
    }
    
    // Определяем статус склада на основе данных
    let status: 'active' | 'maintenance' | 'low-stock' = 'active';
    
    // Если товаров меньше 1000, считаем склад с низким запасом
    if (data.items < 1000) {
      status = 'low-stock';
    }
    
    // Определяем случайный процент заполненности
    const fillRate = Math.min(100, Math.floor((data.items / 10000) * 100) + Math.floor(Math.random() * 20));
    
    // Случайные данные для демонстрации
    const fastMovingItems = Math.floor(data.items * (0.3 + Math.random() * 0.2));
    const slowMovingItems = Math.floor(data.items * (0.1 + Math.random() * 0.2));
    
    // Определяем координаты склада или используем случайные, если нет в списке
    const coordinates = warehouseCoordinates[name] || [
      55.755826 + (Math.random() * 10 - 5),
      37.617300 + (Math.random() * 10 - 5)
    ];
    
    return {
      id: index + 1,
      name,
      coordinates: coordinates as [number, number],
      size: `${Math.floor(5000 + Math.random() * 15000)} м²`,
      items: data.items,
      status,
      fillRate,
      lastRestock: new Date(data.lastRestock).toLocaleDateString('ru-RU'),
      manager: `Менеджер ${index + 1}`,
      totalValue: Math.round(data.totalValue),
      mostStockedCategory,
      fastMovingItems,
      slowMovingItems,
      avgProcessingTime: `${Math.floor(2 + Math.random() * 5)} ч`
    };
  });
  
  return warehouses;
};

// Функция для преобразования комбинированных данных из API в формат WarehouseData
const transformCombinedDataToWarehouses = (
  stocks: WildberriesStockItem[],
  remains: WildberriesWarehouseRemainsItem[]
): WarehouseData[] => {
  // Сначала получаем базовые данные из stocks
  const baseWarehouses = transformStocksToWarehouses(stocks);
  
  // Создаем Map для быстрого доступа к складам по имени
  const warehousesMap = new Map<string, WarehouseData>(
    baseWarehouses.map(warehouse => [warehouse.name, warehouse])
  );
  
  // Обновляем данные на основе отчета remains
  for (const item of remains) {
    for (const warehouseData of item.warehouses) {
      const warehouseName = warehouseData.warehouseName;
      
      if (!warehousesMap.has(warehouseName)) {
        // Если склад еще не в списке, добавляем его с базовыми данными
        const newWarehouseId = baseWarehouses.length + warehousesMap.size + 1;
        
        // Координаты основных складов Wildberries
        const warehouseCoordinates: Record<string, [number, number]> = {
          'Подольск': [55.431177, 37.544737],
          'Коледино': [55.322614, 37.551605],
          'Электросталь': [55.784445, 38.444849],
          'Казань': [55.798551, 49.106324],
          'Краснодар': [45.035470, 39.032859],
          'Екатеринбург': [56.862551, 60.635006],
          'Новосибирск': [55.030199, 82.920430],
          'Хабаровск': [48.480223, 135.071917],
          'Санкт-Петербург': [59.939095, 30.315868],
          'Тула': [54.193122, 37.617348]
        };
        
        const coordinates = warehouseCoordinates[warehouseName] || [
          55.755826 + (Math.random() * 10 - 5),
          37.617300 + (Math.random() * 10 - 5)
        ];
        
        warehousesMap.set(warehouseName, {
          id: newWarehouseId,
          name: warehouseName,
          coordinates: coordinates as [number, number],
          size: `${Math.floor(5000 + Math.random() * 15000)} м²`,
          items: warehouseData.quantity,
          status: warehouseData.quantity < 1000 ? 'low-stock' : 'active',
          fillRate: Math.min(100, Math.floor((warehouseData.quantity / 10000) * 100) + Math.floor(Math.random() * 20)),
          lastRestock: new Date().toLocaleDateString('ru-RU'),
          manager: `Менеджер ${newWarehouseId}`,
          totalValue: Math.round(warehouseData.quantity * (item.volume || 1) * 1000),
          mostStockedCategory: item.subjectName,
          fastMovingItems: Math.floor(warehouseData.quantity * 0.4),
          slowMovingItems: Math.floor(warehouseData.quantity * 0.2),
          avgProcessingTime: `${Math.floor(2 + Math.random() * 5)} ч`
        });
      } else {
        // Если склад уже в списке, обновляем количество товаров
        const warehouse = warehousesMap.get(warehouseName)!;
        warehouse.items += warehouseData.quantity;
        
        // Обновляем другие данные
        warehouse.fillRate = Math.min(100, Math.floor((warehouse.items / 10000) * 100) + Math.floor(Math.random() * 20));
        warehouse.status = warehouse.items < 1000 ? 'low-stock' : 'active';
        
        // Обновляем другие поля при необходимости
      }
    }
  }
  
  return Array.from(warehousesMap.values());
};

// Функция для обновления статуса склада
export const updateWarehouseStatus = async (
  apiKey: string, 
  warehouseId: number, 
  status: 'active' | 'maintenance' | 'low-stock'
): Promise<boolean> => {
  try {
    // Здесь должен быть реальный запрос к API
    // const response = await axios.put(`https://api.yourservice.com/warehouses/${warehouseId}/status`, 
    //   { status },
    //   { headers: { 'Authorization': `Bearer ${apiKey}` }}
    // );
    // return response.data.success;
    
    // В отсутствие реального API, обновляем данные в localStorage
    const storedWarehouses = localStorage.getItem('warehouse_data');
    if (storedWarehouses) {
      const warehouses = JSON.parse(storedWarehouses);
      const updatedWarehouses = warehouses.map((warehouse: WarehouseData) => 
        warehouse.id === warehouseId ? { ...warehouse, status } : warehouse
      );
      localStorage.setItem('warehouse_data', JSON.stringify(updatedWarehouses));
    }
    
    return true;
  } catch (error) {
    console.error('Error updating warehouse status:', error);
    return false;
  }
};

// Функция для добавления новой поставки на склад
export const addWarehouseRestock = async (
  apiKey: string,
  warehouseId: number,
  items: number,
  date: string
): Promise<boolean> => {
  try {
    // Здесь должен быть реальный запрос к API
    // const response = await axios.post(`https://api.yourservice.com/warehouses/${warehouseId}/restock`, 
    //   { items, date },
    //   { headers: { 'Authorization': `Bearer ${apiKey}` }}
    // );
    // return response.data.success;
    
    // В отсутствие реального API, обновляем данные в localStorage
    const storedWarehouses = localStorage.getItem('warehouse_data');
    if (storedWarehouses) {
      const warehouses = JSON.parse(storedWarehouses);
      const updatedWarehouses = warehouses.map((warehouse: WarehouseData) => 
        warehouse.id === warehouseId 
          ? { 
              ...warehouse, 
              items: warehouse.items + items, 
              lastRestock: date,
              fillRate: Math.min(100, warehouse.fillRate + Math.round((items / 1000) * 5)) // Примерный расчет заполненности
            } 
          : warehouse
      );
      localStorage.setItem('warehouse_data', JSON.stringify(updatedWarehouses));
    }
    
    return true;
  } catch (error) {
    console.error('Error adding warehouse restock:', error);
    return false;
  }
};

// Экспортируем типы для использования в других модулях
export type { WarehouseData, LogisticsRoute, InventoryCategory, WildberriesStockItem, WildberriesWarehouseRemainsItem };

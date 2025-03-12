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
    
    // Если данных нет в localStorage, возвращаем пустой массив
    console.log("Нет данных о складах в localStorage, возвращаем пустой массив");
    return [];
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
    
    // Если данных нет в localStorage, возвращаем пустой массив
    console.log("Нет данных о маршрутах логистики в localStorage, возвращаем пустой массив");
    return [];
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
    
    // Если данных нет в localStorage, возвращаем пустой массив
    console.log("Нет данных об инвентаре в localStorage, возвращаем пустой массив");
    return [];
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
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
export type { WarehouseData, LogisticsRoute, InventoryCategory };

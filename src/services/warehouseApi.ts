
import axios from 'axios';

// Warehouse data interface
export interface WarehouseData {
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

// Logistics route interface
export interface LogisticsRoute {
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

// Inventory category interface
export interface InventoryCategory {
  category: string;
  totalItems: number;
  valueRub: number;
  topSellingItem: string;
  averageTurnover: string;
  returns: number;
  inTransit: number;
}

// Wildberries stock item interface
export interface WildberriesStockItem {
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

// Wildberries warehouse remains item interface
export interface WildberriesWarehouseRemainsItem {
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

// Function to fetch warehouses data
export const fetchWarehouses = async (apiKey: string): Promise<WarehouseData[]> => {
  try {
    // Try to fetch real data from Wildberries API
    return await fetchWildberriesWarehouseData(apiKey);
  } catch (error) {
    console.error('Error fetching warehouses with Wildberries API:', error);
    // Fall back to demo data
    const { warehousesData } = await import('@/components/analytics/data/demoData');
    return warehousesData.map(warehouse => ({
      ...warehouse,
      coordinates: warehouse.coordinates as [number, number],
      status: warehouse.status as 'active' | 'maintenance' | 'low-stock'
    }));
  }
};

// Function to fetch logistics routes
export const fetchLogisticsRoutes = async (apiKey: string): Promise<LogisticsRoute[]> => {
  try {
    const storedRoutes = localStorage.getItem('logistics_routes');
    if (storedRoutes) {
      return JSON.parse(storedRoutes);
    }
    
    // If no data in localStorage, import from demo data
    const { logisticsRoutes } = await import('@/components/analytics/data/demoData');
    return logisticsRoutes.map(route => ({
      ...route,
      status: route.status as 'active' | 'delayed'
    }));
  } catch (error) {
    console.error('Error fetching logistics routes:', error);
    throw error;
  }
};

// Function to fetch inventory data
export const fetchInventory = async (apiKey: string): Promise<InventoryCategory[]> => {
  try {
    const storedInventory = localStorage.getItem('inventory_data');
    if (storedInventory) {
      return JSON.parse(storedInventory);
    }
    
    // If no data in localStorage, import from demo data
    const { inventoryData } = await import('@/components/analytics/data/demoData');
    return inventoryData;
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
};

// Function to fetch Wildberries stocks
export const fetchWildberriesStocks = async (apiKey: string): Promise<WildberriesStockItem[]> => {
  try {
    // Get date one year ago for the dateFrom parameter
    const dateFrom = new Date();
    dateFrom.setFullYear(dateFrom.getFullYear() - 1);
    const formattedDate = dateFrom.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
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
    return [];
  }
};

// Function to create warehouse remains report
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

// Function to check warehouse remains report status
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

// Function to get warehouse remains report
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

// Function to get full Wildberries warehouse data
export const fetchWildberriesWarehouseData = async (apiKey: string): Promise<WarehouseData[]> => {
  try {
    // Step 1: Get stocks data from API
    const stocks = await fetchWildberriesStocks(apiKey);
    
    if (stocks.length === 0) {
      throw new Error('No stock data received from API');
    }
    
    // Step 2: Create warehouse remains report
    const taskId = await createWarehouseRemainsReport(apiKey);
    
    if (!taskId) {
      console.log('Failed to create warehouse report, using stock data only');
      return transformStocksToWarehouses(stocks);
    }
    
    // Step 3: Check report status
    let status = await checkWarehouseRemainsStatus(apiKey, taskId);
    let attempts = 0;
    
    // Wait for report to be ready (max 30 attempts with 5-second intervals)
    while (status !== 'done' && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second pause
      status = await checkWarehouseRemainsStatus(apiKey, taskId);
      attempts++;
    }
    
    if (status !== 'done') {
      console.log('Report not ready, using stock data only');
      return transformStocksToWarehouses(stocks);
    }
    
    // Step 4: Get report
    const remainsReport = await getWarehouseRemainsReport(apiKey, taskId);
    
    if (remainsReport.length === 0) {
      console.log('Empty report received, using stock data only');
      return transformStocksToWarehouses(stocks);
    }
    
    // Step 5: Combine data from stocks and remainsReport
    return transformCombinedDataToWarehouses(stocks, remainsReport);
  } catch (error) {
    console.error('Error fetching Wildberries warehouse data:', error);
    throw error;
  }
};

// Transform stocks data to WarehouseData format
const transformStocksToWarehouses = (stocks: WildberriesStockItem[]): WarehouseData[] => {
  // Group items by warehouse
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
    
    // Increase item count
    warehouse.items += stock.quantity;
    
    // Update last restock date if current record is newer
    if (new Date(stock.lastChangeDate) > new Date(warehouse.lastRestock)) {
      warehouse.lastRestock = stock.lastChangeDate;
    }
    
    // Increase category counter
    const category = stock.category || 'Неизвестная категория';
    const currentCategoryCount = warehouse.categories.get(category) || 0;
    warehouse.categories.set(category, currentCategoryCount + stock.quantity);
    
    // Increase total item value
    warehouse.totalValue += stock.quantity * stock.Price * (1 - stock.Discount / 100);
  }
  
  // Coordinates of major Wildberries warehouses
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
  
  // Transform data to WarehouseData format
  const warehouses: WarehouseData[] = Array.from(warehousesMap.entries()).map(([name, data], index) => {
    // Find most stocked category
    let mostStockedCategory = 'Разное';
    let maxCategoryCount = 0;
    
    for (const [category, count] of data.categories.entries()) {
      if (count > maxCategoryCount) {
        maxCategoryCount = count;
        mostStockedCategory = category;
      }
    }
    
    // Determine warehouse status based on data
    let status: 'active' | 'maintenance' | 'low-stock' = 'active';
    
    // If items less than 1000, consider low stock
    if (data.items < 1000) {
      status = 'low-stock';
    }
    
    // Random fill rate percentage
    const fillRate = Math.min(100, Math.floor((data.items / 10000) * 100) + Math.floor(Math.random() * 20));
    
    // Random data for demonstration
    const fastMovingItems = Math.floor(data.items * (0.3 + Math.random() * 0.2));
    const slowMovingItems = Math.floor(data.items * (0.1 + Math.random() * 0.2));
    
    // Get warehouse coordinates or use random if not in list
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

// Transform combined data to WarehouseData format
const transformCombinedDataToWarehouses = (
  stocks: WildberriesStockItem[],
  remains: WildberriesWarehouseRemainsItem[]
): WarehouseData[] => {
  // First get base data from stocks
  const baseWarehouses = transformStocksToWarehouses(stocks);
  
  // Create map for quick warehouse access by name
  const warehousesMap = new Map<string, WarehouseData>(
    baseWarehouses.map(warehouse => [warehouse.name, warehouse])
  );
  
  // Update data based on remains report
  for (const item of remains) {
    for (const warehouseData of item.warehouses) {
      const warehouseName = warehouseData.warehouseName;
      
      if (!warehousesMap.has(warehouseName)) {
        // If warehouse not in list, add with base data
        const newWarehouseId = baseWarehouses.length + warehousesMap.size + 1;
        
        // Coordinates of major Wildberries warehouses
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
        // If warehouse already in list, update item count
        const warehouse = warehousesMap.get(warehouseName)!;
        warehouse.items += warehouseData.quantity;
        
        // Update other data
        warehouse.fillRate = Math.min(100, Math.floor((warehouse.items / 10000) * 100) + Math.floor(Math.random() * 20));
        warehouse.status = warehouse.items < 1000 ? 'low-stock' : 'active';
      }
    }
  }
  
  return Array.from(warehousesMap.values());
};

// Function to update warehouse status
export const updateWarehouseStatus = async (
  apiKey: string, 
  warehouseId: number, 
  status: 'active' | 'maintenance' | 'low-stock'
): Promise<boolean> => {
  try {
    // Here we would have a real API request in a production environment
    
    // For now, update data in localStorage
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

// Function to add restock to warehouse
export const addWarehouseRestock = async (
  apiKey: string,
  warehouseId: number,
  items: number,
  date: string
): Promise<boolean> => {
  try {
    // Here we would have a real API request in a production environment
    
    // For now, update data in localStorage
    const storedWarehouses = localStorage.getItem('warehouse_data');
    if (storedWarehouses) {
      const warehouses = JSON.parse(storedWarehouses);
      const updatedWarehouses = warehouses.map((warehouse: WarehouseData) => 
        warehouse.id === warehouseId 
          ? { 
              ...warehouse, 
              items: warehouse.items + items, 
              lastRestock: date,
              fillRate: Math.min(100, warehouse.fillRate + Math.round((items / 1000) * 5))
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

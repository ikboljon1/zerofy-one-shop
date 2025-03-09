import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY, ORDERS_STORAGE_KEY, SALES_STORAGE_KEY } from "@/types/store";

// Функция для получения выбранного магазина
export const getSelectedStore = (): { id: string; apiKey: string } | null => {
  try {
    const storesStr = localStorage.getItem(STORES_STORAGE_KEY);
    if (!storesStr) return null;
    
    const stores = JSON.parse(storesStr);
    const selectedStore = stores.find((store: Store) => store.isSelected);
    
    if (selectedStore) {
      return {
        id: selectedStore.id,
        apiKey: selectedStore.apiKey
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting selected store:', error);
    return null;
  }
};

// Функция для получения данных о прибыльности товаров
export const getProductProfitabilityData = (storeId: string) => {
  try {
    const profitabilityKey = `profitability_${storeId}`;
    const profitabilityStr = localStorage.getItem(profitabilityKey);
    
    if (!profitabilityStr) return null;
    
    return JSON.parse(profitabilityStr);
  } catch (error) {
    console.error('Error getting product profitability data:', error);
    return null;
  }
};

// Функция для получения данных о статистике магазина
export const getStoreStats = (storeId: string) => {
  try {
    const statsKey = `${STATS_STORAGE_KEY}_${storeId}`;
    const statsStr = localStorage.getItem(statsKey);
    
    if (!statsStr) return null;
    
    const stats = JSON.parse(statsStr);
    
    // Если есть данные о ежедневных продажах, аналитика расходов и т.д. - обрабатываем их
    if (stats.dailySales) {
      stats.dailySales = stats.dailySales.map((item: any) => ({
        ...item
      }));
    }
    
    if (stats.currentPeriod && stats.currentPeriod.expenses) {
      stats.currentPeriod.expenses = {
        logistics: stats.currentPeriod.expenses.logistics || 0,
        storage: stats.currentPeriod.expenses.storage || 0,
        penalties: stats.currentPeriod.expenses.penalties || 0,
        acceptance: stats.currentPeriod.expenses.acceptance || 0,
        advertising: stats.currentPeriod.expenses.advertising || 0,
        deductions: stats.currentPeriod.expenses.deductions || 0,
        total: stats.currentPeriod.expenses.total || 0
      };
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting store stats:', error);
    return null;
  }
};

// Функция для получения данных о заказах
export const getOrdersData = (storeId: string) => {
  try {
    const key = `${ORDERS_STORAGE_KEY}_${storeId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting orders data:', error);
    return [];
  }
};

// Функция для получения данных о продажах
export const getSalesData = (storeId: string) => {
  try {
    const key = `${SALES_STORAGE_KEY}_${storeId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting sales data:', error);
    return [];
  }
};

// Функция для загрузки и обновления данных о заказах
export const fetchAndUpdateOrders = async (store: Store) => {
  // Здесь будет реальный запрос к API для получения данных о заказах
  // Для демо-версии создаем мок данные
  const mockOrders = generateMockOrders(50);
  
  const key = `${ORDERS_STORAGE_KEY}_${store.id}`;
  localStorage.setItem(key, JSON.stringify(mockOrders));
  
  console.log('Orders data updated for store:', store.id);
  return mockOrders;
};

// Функция для загрузки и обновления данных о продажах
export const fetchAndUpdateSales = async (store: Store) => {
  // Здесь будет реальный запрос к API для получения данных о продажах
  // Для демо-версии создаем мок данные
  const mockSales = generateMockSales(100);
  
  const key = `${SALES_STORAGE_KEY}_${store.id}`;
  localStorage.setItem(key, JSON.stringify(mockSales));
  
  console.log('Sales data updated for store:', store.id);
  return mockSales;
};

// Генерация мок-данных для заказов
const generateMockOrders = (count: number) => {
  const mockOrders = [];
  for (let i = 0; i < count; i++) {
    mockOrders.push({
      date: new Date().toISOString(),
      orderId: `WB-ORDER-${i}`,
      productId: `WB-PRODUCT-${i}`,
      quantity: Math.floor(Math.random() * 5) + 1,
      price: Math.floor(Math.random() * 1000) + 100,
      status: "completed"
    });
  }
  return mockOrders;
};

// Генерация мок-данных для продаж
const generateMockSales = (count: number) => {
  const mockSales = [];
  for (let i = 0; i < count; i++) {
    mockSales.push({
      date: new Date().toISOString(),
      saleId: `WB-SALE-${i}`,
      productId: `WB-PRODUCT-${i}`,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: Math.floor(Math.random() * 800) + 50,
      region: "Moscow",
      customerType: "Retail"
    });
  }
  return mockSales;
};

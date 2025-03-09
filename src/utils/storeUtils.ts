
import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY, ORDERS_STORAGE_KEY, SALES_STORAGE_KEY } from "@/types/store";
import { fetchWildberriesStats } from "@/services/wildberriesApi";

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

// Функция для загрузки списка магазинов
export const loadStores = (): Store[] => {
  try {
    const storesStr = localStorage.getItem(STORES_STORAGE_KEY);
    return storesStr ? JSON.parse(storesStr) : [];
  } catch (error) {
    console.error('Error loading stores:', error);
    return [];
  }
};

// Функция для сохранения списка магазинов
export const saveStores = (stores: Store[]) => {
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  } catch (error) {
    console.error('Error saving stores:', error);
  }
};

// Функция для обеспечения сохранения выбранного магазина между сессиями
export const ensureStoreSelectionPersistence = (): Store[] => {
  try {
    const stores = loadStores();
    
    // Если нет магазинов или уже есть выбранный магазин, просто возвращаем
    if (stores.length === 0 || stores.some(store => store.isSelected)) {
      return stores;
    }
    
    // Проверяем, есть ли сохраненный выбор из прошлой сессии
    const lastSelectedStoreStr = localStorage.getItem('last_selected_store');
    if (lastSelectedStoreStr) {
      const { storeId } = JSON.parse(lastSelectedStoreStr);
      
      // Если такой магазин существует, делаем его выбранным
      const updatedStores = stores.map(store => ({
        ...store,
        isSelected: store.id === storeId
      }));
      
      // Сохраняем обновленный список
      saveStores(updatedStores);
      
      return updatedStores;
    }
    
    // Если нет сохраненного выбора, делаем первый магазин выбранным
    if (stores.length > 0) {
      const updatedStores = stores.map((store, index) => ({
        ...store,
        isSelected: index === 0
      }));
      
      // Сохраняем обновленный список
      saveStores(updatedStores);
      
      return updatedStores;
    }
    
    return stores;
  } catch (error) {
    console.error('Error ensuring store selection persistence:', error);
    return loadStores();
  }
};

// Функция для обновления статистики магазина
export const refreshStoreStats = async (store: Store): Promise<Store | null> => {
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 7); // Получаем данные за последние 7 дней
    
    const dateTo = new Date();
    
    const stats = await fetchWildberriesStats(store.apiKey, dateFrom, dateTo);
    
    if (stats) {
      // Добавляем netProfit в currentPeriod и previousPeriod
      if (stats.currentPeriod) {
        stats.currentPeriod.netProfit = stats.currentPeriod.profit || 0;
      }
      
      if (stats.previousPeriod) {
        stats.previousPeriod.netProfit = stats.previousPeriod.profit || 0;
      }
      
      return {
        ...store,
        stats,
        lastFetchDate: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing store stats:', error);
    return null;
  }
};

// Функция для загрузки и обновления данных о заказах
export const fetchAndUpdateOrders = async (store: Store) => {
  // Здесь будет реальный запрос к API для получения данных о заказах
  // Для демо-версии создаем мок данные
  const mockOrders = generateMockOrders(50);
  
  // Создаем объект с данными заказов и аналитикой
  const orderData = {
    orders: mockOrders,
    warehouseDistribution: calculateWarehouseDistribution(mockOrders),
    regionDistribution: calculateRegionDistribution(mockOrders)
  };
  
  const key = `${ORDERS_STORAGE_KEY}_${store.id}`;
  localStorage.setItem(key, JSON.stringify(orderData));
  
  console.log('Orders data updated for store:', store.id);
  return orderData;
};

// Функция для загрузки и обновления данных о продажах
export const fetchAndUpdateSales = async (store: Store) => {
  // Здесь будет реальный запрос к API для получения данных о продажах
  // Для демо-версии создаем мок данные
  const mockSales = generateMockSales(100);
  
  // Создаем объект с данными продаж
  const salesData = {
    sales: mockSales
  };
  
  const key = `${SALES_STORAGE_KEY}_${store.id}`;
  localStorage.setItem(key, JSON.stringify(salesData));
  
  console.log('Sales data updated for store:', store.id);
  return mockSales;
};

// Функция для получения аналитических данных
export const getAnalyticsData = (storeId: string) => {
  try {
    const key = `marketplace_analytics_${storeId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting analytics data:', error);
    return null;
  }
};

// Вспомогательные функции для расчета распределения по складам и регионам
const calculateWarehouseDistribution = (orders: any[]) => {
  const warehouseCounts: Record<string, number> = {};
  const totalOrders = orders.length;

  orders.forEach(order => {
    if (order.warehouseName) {
      warehouseCounts[order.warehouseName] = (warehouseCounts[order.warehouseName] || 0) + 1;
    }
  });

  return Object.entries(warehouseCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / totalOrders) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

const calculateRegionDistribution = (orders: any[]) => {
  const regionCounts: Record<string, number> = {};
  const totalOrders = orders.length;

  orders.forEach(order => {
    if (order.regionName) {
      regionCounts[order.regionName] = (regionCounts[order.regionName] || 0) + 1;
    }
  });

  return Object.entries(regionCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / totalOrders) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

// Генерация мок-данных для заказов
const generateMockOrders = (count: number) => {
  const mockOrders = [];
  for (let i = 0; i < count; i++) {
    mockOrders.push({
      date: new Date().toISOString(),
      lastChangeDate: new Date().toISOString(),
      warehouseName: ["Подольск", "Коледино", "Электросталь", "Невинномысск", "Казань"][Math.floor(Math.random() * 5)],
      warehouseType: Math.random() > 0.5 ? "Основной" : "Транзитный",
      countryName: "Россия",
      oblastOkrugName: ["Московская область", "Ставропольский край", "Республика Татарстан"][Math.floor(Math.random() * 3)],
      regionName: ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск"][Math.floor(Math.random() * 5)],
      supplierArticle: `WB-PRODUCT-${i}`,
      nmId: Math.floor(Math.random() * 100000) + 10000,
      barcode: `1234567890${i}`,
      category: ["Одежда", "Обувь", "Аксессуары", "Товары для дома", "Электроника"][Math.floor(Math.random() * 5)],
      subject: ["Футболки", "Джинсы", "Куртки", "Кроссовки", "Часы"][Math.floor(Math.random() * 5)],
      brand: ["Nike", "Adidas", "Puma", "Reebok", "New Balance"][Math.floor(Math.random() * 5)],
      techSize: ["S", "M", "L", "XL", "XXL"][Math.floor(Math.random() * 5)],
      incomeID: Math.floor(Math.random() * 1000000),
      isSupply: Math.random() > 0.7,
      isRealization: Math.random() > 0.3,
      totalPrice: Math.floor(Math.random() * 5000) + 500,
      discountPercent: Math.floor(Math.random() * 30),
      spp: Math.floor(Math.random() * 10),
      finishedPrice: Math.floor(Math.random() * 4000) + 400,
      priceWithDisc: Math.floor(Math.random() * 3500) + 300,
      isCancel: Math.random() > 0.8,
      isReturn: Math.random() > 0.9,
      cancelDate: Math.random() > 0.8 ? new Date().toISOString() : "",
      orderType: Math.random() > 0.5 ? "Клиентский" : "Возврат",
      sticker: `WB-${Math.floor(Math.random() * 100000)}`,
      gNumber: `G-${Math.floor(Math.random() * 1000000)}`,
      srid: `WB-ORDER-${i}`
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
      lastChangeDate: new Date().toISOString(),
      warehouseName: ["Подольск", "Коледино", "Электросталь", "Невинномысск", "Казань"][Math.floor(Math.random() * 5)],
      warehouseType: Math.random() > 0.5 ? "Основной" : "Транзитный",
      countryName: "Россия",
      oblastOkrugName: ["Московская область", "Ставропольский край", "Республика Татарстан"][Math.floor(Math.random() * 3)],
      regionName: ["Москва", "Санкт-Петербург", "Казань", "Екатеринбург", "Новосибирск"][Math.floor(Math.random() * 5)],
      supplierArticle: `WB-PRODUCT-${i}`,
      nmId: Math.floor(Math.random() * 100000) + 10000,
      barcode: `1234567890${i}`,
      category: ["Одежда", "Обувь", "Аксессуары", "Товары для дома", "Электроника"][Math.floor(Math.random() * 5)],
      subject: ["Футболки", "Джинсы", "Куртки", "Кроссовки", "Часы"][Math.floor(Math.random() * 5)],
      brand: ["Nike", "Adidas", "Puma", "Reebok", "New Balance"][Math.floor(Math.random() * 5)],
      techSize: ["S", "M", "L", "XL", "XXL"][Math.floor(Math.random() * 5)],
      incomeID: Math.floor(Math.random() * 1000000),
      isSupply: Math.random() > 0.7,
      isRealization: Math.random() > 0.3,
      totalPrice: Math.floor(Math.random() * 5000) + 500,
      discountPercent: Math.floor(Math.random() * 30),
      spp: Math.floor(Math.random() * 10),
      paymentSaleAmount: Math.floor(Math.random() * 4000) + 400,
      forPay: Math.floor(Math.random() * 3800) + 380,
      finishedPrice: Math.floor(Math.random() * 4000) + 400,
      priceWithDisc: Math.floor(Math.random() * 3500) + 300,
      isReturn: Math.random() > 0.9,
      saleID: `WB-SALE-${i}`,
      orderType: Math.random() > 0.5 ? "Клиентский" : "Возврат",
      sticker: `WB-${Math.floor(Math.random() * 100000)}`,
      gNumber: `G-${Math.floor(Math.random() * 1000000)}`,
      srid: `WB-SALE-${i}`
    });
  }
  return mockSales;
};

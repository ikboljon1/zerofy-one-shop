
import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY, ORDERS_STORAGE_KEY, SALES_STORAGE_KEY, WildberriesOrder, WildberriesSale } from "@/types/store";
import { fetchWildberriesStats, fetchWildberriesOrders, fetchWildberriesSales } from "@/services/wildberriesApi";

export const getLastWeekDateRange = () => {
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);
  return { from: lastWeek, to: now };
};

export const loadStores = (): Store[] => {
  const savedStores = localStorage.getItem(STORES_STORAGE_KEY);
  return savedStores ? JSON.parse(savedStores) : [];
};

export const saveStores = (stores: Store[]): void => {
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
};

// Новая унифицированная функция для сохранения данных аналитики
export const saveAnalyticsData = (storeId: string, analyticsData: any): void => {
  if (!storeId || !analyticsData) {
    console.error('Cannot save analytics data: missing storeId or data');
    return;
  }
  
  // Убедимся, что в данных есть timestamp
  if (!analyticsData.timestamp) {
    analyticsData.timestamp = Date.now();
  }
  
  const storageKey = `marketplace_analytics_${storeId}`;
  
  // Сохраняем данные в localStorage
  localStorage.setItem(storageKey, JSON.stringify(analyticsData));
  
  // Оповещаем другие вкладки об обновлении данных
  window.dispatchEvent(new StorageEvent('storage', {
    key: storageKey,
    newValue: JSON.stringify(analyticsData)
  }));
  
  console.log(`Analytics data saved to ${storageKey} with timestamp:`, analyticsData.timestamp);
}

export const refreshStoreStats = async (store: Store): Promise<Store | null> => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from, to } = getLastWeekDateRange();
      const stats = await fetchWildberriesStats(store.apiKey, from, to);
      if (stats) {
        const updatedStore = { 
          ...store, 
          stats,
          lastFetchDate: new Date().toISOString() 
        };
        
        // Создаем базовую структуру для deductionsTimeline, если она отсутствует
        const deductionsTimeline = stats.dailySales?.map((day: any) => {
          const daysCount = stats.dailySales.length || 1;
          const logistic = (stats.currentPeriod.expenses.logistics || 0) / daysCount;
          const storage = (stats.currentPeriod.expenses.storage || 0) / daysCount;
          const penalties = (stats.currentPeriod.expenses.penalties || 0) / daysCount;
          const acceptance = (stats.currentPeriod.expenses.acceptance || 0) / daysCount;
          const advertising = (stats.currentPeriod.expenses.advertising || 0) / daysCount;
          
          return {
            date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date().toISOString().split('T')[0],
            logistic,
            storage,
            penalties,
            acceptance,
            advertising
          };
        }) || [];
        
        // Генерируем уникальный timestamp для данных
        const timestamp = Date.now();
        
        // Сохраняем полные данные статистики с timestamp
        const statsData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          stats: stats,
          deductionsTimeline: deductionsTimeline,
          timestamp: timestamp
        };
        
        localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify(statsData));
        
        // Также сохраняем данные для аналитики с тем же timestamp
        const analyticsData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          data: stats,
          deductionsTimeline: deductionsTimeline,
          penalties: [],
          returns: [],
          productAdvertisingData: [],
          advertisingBreakdown: { search: stats.currentPeriod.expenses.advertising || 0 },
          timestamp: timestamp
        };
        
        saveAnalyticsData(store.id, analyticsData);
        
        // Сохраняем данные о заказах отдельно
        if (stats.orders && stats.orders.length > 0) {
          const ordersData = {
            storeId: store.id,
            dateFrom: from.toISOString(),
            dateTo: to.toISOString(),
            orders: stats.orders,
            warehouseDistribution: stats.warehouseDistribution || [],
            regionDistribution: stats.regionDistribution || [],
            timestamp: timestamp
          };
          
          localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify(ordersData));
          
          // Оповещаем другие вкладки
          window.dispatchEvent(new StorageEvent('storage', {
            key: `${ORDERS_STORAGE_KEY}_${store.id}`,
            newValue: JSON.stringify(ordersData)
          }));
        }
        
        // Сохраняем данные о продажах отдельно
        if (stats.sales && stats.sales.length > 0) {
          const salesData = {
            storeId: store.id,
            dateFrom: from.toISOString(),
            dateTo: to.toISOString(),
            sales: stats.sales,
            timestamp: timestamp
          };
          
          localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify(salesData));
          
          // Оповещаем другие вкладки
          window.dispatchEvent(new StorageEvent('storage', {
            key: `${SALES_STORAGE_KEY}_${store.id}`,
            newValue: JSON.stringify(salesData)
          }));
        }
        
        // Детализированные данные по продуктам для раздела товаров с тем же timestamp
        if (stats.topProfitableProducts || stats.topUnprofitableProducts) {
          const productsData = {
            profitableProducts: stats.topProfitableProducts || [],
            unprofitableProducts: stats.topUnprofitableProducts || [],
            updateDate: new Date().toISOString(),
            timestamp: timestamp
          };
          
          localStorage.setItem(`products_detailed_${store.id}`, JSON.stringify(productsData));
          
          // Оповещаем другие вкладки
          window.dispatchEvent(new StorageEvent('storage', {
            key: `products_detailed_${store.id}`,
            newValue: JSON.stringify(productsData)
          }));
        }
        
        return updatedStore;
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
      // Return store without stats on error
      return store;
    }
  }
  return store;
};

// Улучшенная функция получения данных о заказах
export const getOrdersData = (storeId: string) => {
  try {
    const storedData = localStorage.getItem(`${ORDERS_STORAGE_KEY}_${storeId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading orders data:', error);
    return null;
  }
};

// Улучшенная функция получения данных о продажах
export const getSalesData = (storeId: string) => {
  try {
    const storedData = localStorage.getItem(`${SALES_STORAGE_KEY}_${storeId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading sales data:', error);
    return null;
  }
};

// Загрузка и обновление данных о заказах с поддержкой событий хранилища
export const fetchAndUpdateOrders = async (store: Store) => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from } = getLastWeekDateRange();
      const orders = await fetchWildberriesOrders(store.apiKey, from);
      
      if (orders && orders.length > 0) {
        // Рассчитываем распределение складов
        const warehouseCounts: Record<string, number> = {};
        const totalOrders = orders.length;
        
        orders.forEach(order => {
          if (order.warehouseName) {
            warehouseCounts[order.warehouseName] = (warehouseCounts[order.warehouseName] || 0) + 1;
          }
        });
        
        const warehouseDistribution = Object.entries(warehouseCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: (count / totalOrders) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Рассчитываем распределение регионов
        const regionCounts: Record<string, number> = {};
        
        orders.forEach(order => {
          if (order.regionName) {
            regionCounts[order.regionName] = (regionCounts[order.regionName] || 0) + 1;
          }
        });
        
        const regionDistribution = Object.entries(regionCounts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: (count / totalOrders) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        
        // Создаем объект с данными и timestamp
        const ordersData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: new Date().toISOString(),
          orders,
          warehouseDistribution,
          regionDistribution,
          timestamp: Date.now()
        };
        
        // Сохраняем данные в localStorage
        localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify(ordersData));
        
        // Оповещаем другие вкладки
        window.dispatchEvent(new StorageEvent('storage', {
          key: `${ORDERS_STORAGE_KEY}_${store.id}`,
          newValue: JSON.stringify(ordersData)
        }));
        
        return {
          orders,
          warehouseDistribution,
          regionDistribution
        };
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }
  return null;
};

// Загрузка и обновление данных о продажах с поддержкой событий хранилища
export const fetchAndUpdateSales = async (store: Store) => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from } = getLastWeekDateRange();
      const sales = await fetchWildberriesSales(store.apiKey, from);
      
      if (sales && sales.length > 0) {
        // Создаем объект с данными и timestamp
        const salesData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: new Date().toISOString(),
          sales,
          timestamp: Date.now()
        };
        
        // Сохраняем данные в localStorage
        localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify(salesData));
        
        // Оповещаем другие вкладки
        window.dispatchEvent(new StorageEvent('storage', {
          key: `${SALES_STORAGE_KEY}_${store.id}`,
          newValue: JSON.stringify(salesData)
        }));
        
        return sales;
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  }
  return null;
};

// Получение данных о доходности товаров с проверкой timestamp
export const getProductProfitabilityData = (storeId: string) => {
  try {
    const storedData = localStorage.getItem(`products_detailed_${storeId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // Также пробуем загрузить из аналитики, если специальные данные не найдены
    const analyticsData = localStorage.getItem(`marketplace_analytics_${storeId}`);
    if (analyticsData) {
      const parsedData = JSON.parse(analyticsData);
      return {
        profitableProducts: parsedData.data.topProfitableProducts || [],
        unprofitableProducts: parsedData.data.topUnprofitableProducts || [],
        updateDate: parsedData.dateTo,
        timestamp: parsedData.timestamp || Date.now()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading product profitability data:', error);
    return null;
  }
};

// Улучшенная функция для получения данных аналитики с проверкой timestamp
export const getAnalyticsData = (storeId: string, forceRefresh?: boolean) => {
  try {
    const key = `marketplace_analytics_${storeId}`;
    const storedData = localStorage.getItem(key);
    
    // Если данные отсутствуют или запрошено принудительное обновление, возвращаем пустую структуру
    if (!storedData || forceRefresh) {
      console.log('Analytics data not found or forced refresh requested, returning default structure');
      // Возвращаем базовую структуру с пустыми данными и текущим timestamp
      return {
        data: null,
        penalties: [],
        returns: [],
        deductionsTimeline: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          logistic: 0,
          storage: 0, 
          penalties: 0,
          acceptance: 0,
          advertising: 0
        })),
        productAdvertisingData: [],
        advertisingBreakdown: { search: 0 },
        timestamp: Date.now()
      };
    }
    
    let parsedData = JSON.parse(storedData);
    
    // Добавляем timestamp, если отсутствует
    if (!parsedData.timestamp) {
      parsedData.timestamp = Date.now();
      // Перезаписываем данные с timestamp
      localStorage.setItem(key, JSON.stringify(parsedData));
    }
    
    // Проверяем наличие обязательных полей и устанавливаем значения по умолчанию
    if (!parsedData.deductionsTimeline || !Array.isArray(parsedData.deductionsTimeline) || parsedData.deductionsTimeline.length === 0) {
      console.log("Creating default deductionsTimeline data");
      parsedData.deductionsTimeline = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logistic: 0,
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0
      }));
    } else {
      // Проверяем, что все элементы в deductionsTimeline имеют все необходимые свойства
      parsedData.deductionsTimeline = parsedData.deductionsTimeline.map((item: any) => ({
        date: item.date || new Date().toISOString().split('T')[0],
        logistic: item.logistic || 0,
        storage: item.storage || 0,
        penalties: item.penalties || 0,
        acceptance: item.acceptance || 0,
        advertising: item.advertising || 0
      }));
    }
    
    if (!parsedData.penalties || !Array.isArray(parsedData.penalties)) {
      parsedData.penalties = [];
    }
    
    if (!parsedData.returns || !Array.isArray(parsedData.returns)) {
      parsedData.returns = [];
    }
    
    if (!parsedData.productAdvertisingData || !Array.isArray(parsedData.productAdvertisingData)) {
      parsedData.productAdvertisingData = [];
    }
    
    if (!parsedData.advertisingBreakdown) {
      parsedData.advertisingBreakdown = { search: 0 };
    }
    
    if (parsedData.data && parsedData.data.currentPeriod && parsedData.data.currentPeriod.expenses) {
      // Обеспечиваем наличие всех полей расходов
      parsedData.data.currentPeriod.expenses.advertising = parsedData.data.currentPeriod.expenses.advertising || 0;
      parsedData.data.currentPeriod.expenses.acceptance = parsedData.data.currentPeriod.expenses.acceptance || 0;
      
      // Пересчитываем total, чтобы быть уверенными, что он включает все расходы
      parsedData.data.currentPeriod.expenses.total = 
        parsedData.data.currentPeriod.expenses.logistics +
        parsedData.data.currentPeriod.expenses.storage +
        parsedData.data.currentPeriod.expenses.penalties +
        parsedData.data.currentPeriod.expenses.advertising +
        parsedData.data.currentPeriod.expenses.acceptance;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading analytics data:', error);
    // Возвращаем базовую структуру в случае ошибки
    return {
      data: null,
      penalties: [],
      returns: [],
      deductionsTimeline: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logistic: 0,
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0
      })),
      productAdvertisingData: [],
      advertisingBreakdown: { search: 0 },
      timestamp: Date.now()
    };
  }
};

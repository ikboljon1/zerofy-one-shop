
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
        
        // Генерируем уникальный timestamp для данных, чтобы предотвратить кэширование
        const timestamp = Date.now();
        
        // Сохраняем полные данные статистики, включая топовые продукты с их изображениями
        localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          stats: stats,
          deductionsTimeline: deductionsTimeline,
          timestamp: timestamp
        }));
        
        // Также сохраняем данные для аналитики и раздела товаров с тем же timestamp
        localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify({
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
        }));
        
        // Сохраняем данные о заказах отдельно
        if (stats.orders && stats.orders.length > 0) {
          localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify({
            storeId: store.id,
            dateFrom: from.toISOString(),
            dateTo: to.toISOString(),
            orders: stats.orders,
            warehouseDistribution: stats.warehouseDistribution || [],
            regionDistribution: stats.regionDistribution || [],
            timestamp: timestamp
          }));
        }
        
        // Сохраняем данные о продажах отдельно
        if (stats.sales && stats.sales.length > 0) {
          localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify({
            storeId: store.id,
            dateFrom: from.toISOString(),
            dateTo: to.toISOString(),
            sales: stats.sales,
            timestamp: timestamp
          }));
        }
        
        // Детализированные данные по продуктам для раздела товаров с тем же timestamp
        if (stats.topProfitableProducts || stats.topUnprofitableProducts) {
          localStorage.setItem(`products_detailed_${store.id}`, JSON.stringify({
            profitableProducts: stats.topProfitableProducts || [],
            unprofitableProducts: stats.topUnprofitableProducts || [],
            updateDate: new Date().toISOString(),
            timestamp: timestamp
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

// Получение данных о заказах для конкретного магазина
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

// Получение данных о продажах для конкретного магазина
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

// Загрузка и обновление данных о заказах
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
        
        // Сохраняем данные в localStorage
        localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify({
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: new Date().toISOString(),
          orders,
          warehouseDistribution,
          regionDistribution,
          timestamp: Date.now()
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

// Загрузка и обновление данных о продажах
export const fetchAndUpdateSales = async (store: Store) => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from } = getLastWeekDateRange();
      const sales = await fetchWildberriesSales(store.apiKey, from);
      
      if (sales && sales.length > 0) {
        // Сохраняем данные в localStorage
        localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify({
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: new Date().toISOString(),
          sales,
          timestamp: Date.now()
        }));
        
        return sales;
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  }
  return null;
};

// Получение данных о доходности товаров для конкретного магазина
export const getProductProfitabilityData = (storeId: string) => {
  try {
    const storedData = localStorage.getItem(`products_detailed_${storeId}`);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Ensure we're only returning the top profitable and unprofitable products
      return {
        profitableProducts: parsedData.profitableProducts?.slice(0, 3) || [],
        unprofitableProducts: parsedData.unprofitableProducts?.slice(0, 3) || [],
        updateDate: parsedData.updateDate
      };
    }
    
    // Также пробуем загрузить из аналитики, если специальные данные не найдены
    const analyticsData = localStorage.getItem(`marketplace_analytics_${storeId}`);
    if (analyticsData) {
      const parsedData = JSON.parse(analyticsData);
      return {
        profitableProducts: (parsedData.data.topProfitableProducts || []).slice(0, 3),
        unprofitableProducts: (parsedData.data.topUnprofitableProducts || []).slice(0, 3),
        updateDate: parsedData.dateTo
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading product profitability data:', error);
    return null;
  }
};

// Получение данных аналитики с проверкой обязательных полей и принудительным обновлением при наличии параметра forceRefresh
export const getAnalyticsData = (storeId: string, forceRefresh?: boolean) => {
  try {
    const key = `marketplace_analytics_${storeId}`;
    const storedData = localStorage.getItem(key);
    
    // Если данные отсутствуют или запрошено принудительное обновление, возвращаем пустую структуру
    if (!storedData || forceRefresh) {
      console.log('Analytics data not found or forced refresh requested, returning default structure');
      // Возвращаем базовую структуру с демо-данными
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
        timestamp: Date.now() // Добавляем текущий timestamp
      };
    }
    
    let parsedData = JSON.parse(storedData);
    
    // Добавляем timestamp, если отсутствует
    if (!parsedData.timestamp) {
      parsedData.timestamp = Date.now();
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
      // Ensure all items in deductionsTimeline have all required properties
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
      // Ensure all expense fields exist
      parsedData.data.currentPeriod.expenses.advertising = parsedData.data.currentPeriod.expenses.advertising || 0;
      parsedData.data.currentPeriod.expenses.acceptance = parsedData.data.currentPeriod.expenses.acceptance || 0;
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
      timestamp: Date.now() // Добавляем текущий timestamp
    };
  }
};

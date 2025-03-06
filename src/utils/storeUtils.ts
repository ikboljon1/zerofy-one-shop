import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY } from "@/types/store";
import { fetchWildberriesStats } from "@/services/wildberriesApi";

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
          
          return {
            date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date().toISOString().split('T')[0],
            logistic,
            storage,
            penalties
          };
        }) || [];
        
        // Сохраняем полные данные статистики, включая топовые продукты с их изображениями
        localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          stats: stats,
          deductionsTimeline: deductionsTimeline
        }));
        
        // Также сохраняем данные для аналитики и раздела товаров
        localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify({
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          data: stats,
          deductionsTimeline: deductionsTimeline,
          penalties: [],
          returns: [],
          productAdvertisingData: []
        }));
        
        // Детализированные данные по продуктам для раздела товаров
        if (stats.topProfitableProducts || stats.topUnprofitableProducts) {
          localStorage.setItem(`products_detailed_${store.id}`, JSON.stringify({
            profitableProducts: stats.topProfitableProducts || [],
            unprofitableProducts: stats.topUnprofitableProducts || [],
            updateDate: new Date().toISOString()
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

// Получение данных о доходности товаров для конкретного магазина
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
        updateDate: parsedData.dateTo
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading product profitability data:', error);
    return null;
  }
};

// Получение данных аналитики с проверкой обязательных полей
export const getAnalyticsData = (storeId: string) => {
  try {
    const key = `marketplace_analytics_${storeId}`;
    const storedData = localStorage.getItem(key);
    
    if (!storedData) {
      // If data is missing, return base structure with demo data
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
        productAdvertisingData: []
      };
    }
    
    let parsedData = JSON.parse(storedData);
    
    // Check required fields and set default values
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
      // Ensure each item has all required fields
      parsedData.deductionsTimeline = parsedData.deductionsTimeline.map((item: any) => ({
        date: item.date,
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
    
    return parsedData;
  } catch (error) {
    console.error('Error loading analytics data:', error);
    // Return base structure in case of error
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
      productAdvertisingData: []
    };
  }
};

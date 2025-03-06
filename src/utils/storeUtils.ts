import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY, WildberriesOrder } from "@/types/store";
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
        
        const timestamp = Date.now();
        
        localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          stats: stats,
          deductionsTimeline: deductionsTimeline,
          timestamp: timestamp
        }));
        
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
      return store;
    }
  }
  return store;
};

export const getProductProfitabilityData = (storeId: string) => {
  try {
    const storedData = localStorage.getItem(`products_detailed_${storeId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
    
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

export const getAnalyticsData = (storeId: string, forceRefresh?: boolean) => {
  try {
    const key = `marketplace_analytics_${storeId}`;
    const storedData = localStorage.getItem(key);
    
    if (!storedData || forceRefresh) {
      console.log('Analytics data not found or forced refresh requested, returning default structure');
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
    
    if (!parsedData.timestamp) {
      parsedData.timestamp = Date.now();
    }
    
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
      parsedData.data.currentPeriod.expenses.advertising = parsedData.data.currentPeriod.expenses.advertising || 0;
      parsedData.data.currentPeriod.expenses.acceptance = parsedData.data.currentPeriod.expenses.acceptance || 0;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error loading analytics data:', error);
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

export const calculateWarehouseDistribution = (orders: WildberriesOrder[] = []) => {
  if (!orders || orders.length === 0) return [];
  
  const warehouseCounts: Record<string, number> = {};
  let totalOrders = orders.length;
  
  orders.forEach(order => {
    const warehouse = order.warehouseName || 'Неизвестный склад';
    warehouseCounts[warehouse] = (warehouseCounts[warehouse] || 0) + 1;
  });
  
  const distribution = Object.entries(warehouseCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalOrders) * 100)
  }));
  
  return distribution.sort((a, b) => b.count - a.count).slice(0, 5);
};

export const calculateRegionDistribution = (orders: WildberriesOrder[] = []) => {
  if (!orders || orders.length === 0) return [];
  
  const regionCounts: Record<string, number> = {};
  let totalOrders = orders.length;
  
  orders.forEach(order => {
    const region = order.regionName || 'Неизвестный регион';
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });
  
  const distribution = Object.entries(regionCounts).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalOrders) * 100)
  }));
  
  return distribution.sort((a, b) => b.count - a.count).slice(0, 5);
};

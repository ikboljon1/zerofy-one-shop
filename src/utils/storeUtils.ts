import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY } from "@/types/store";
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
      // We're no longer using dateRange, but fetching current day data
      const stats = await fetchWildberriesStats(store.apiKey);
      if (stats) {
        const updatedStore = { 
          ...store, 
          stats,
          lastFetchDate: new Date().toISOString() 
        };
        
        // Create a timestamp for this data update
        const timestamp = Date.now();
        
        // Save the stats data to localStorage with the timestamp
        localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
          storeId: store.id,
          stats: stats,
          timestamp: timestamp
        }));
        
        // Update the analytics data structure with the new format
        localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify({
          storeId: store.id,
          data: stats,
          ordersByRegion: stats.ordersByRegion || [],
          ordersByWarehouse: stats.ordersByWarehouse || [],
          penalties: [],
          returns: [],
          productAdvertisingData: [],
          advertisingBreakdown: { search: 0 },
          timestamp: timestamp
        }));
        
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

// Updated getAnalyticsData function to match the new data structure
export const getAnalyticsData = (storeId: string, forceRefresh?: boolean) => {
  try {
    const key = `marketplace_analytics_${storeId}`;
    const storedData = localStorage.getItem(key);
    
    // If data is absent or forced refresh is requested, return default structure
    if (!storedData || forceRefresh) {
      console.log('Analytics data not found or forced refresh requested, returning default structure');
      // Return a basic structure with the new format
      return {
        data: {
          currentPeriod: {
            sales: 0,
            orders: 0,
            returns: 0,
            cancellations: 0,
            transferred: 0,
            expenses: {
              total: 0,
              logistics: 0,
              storage: 0,
              penalties: 0,
              advertising: 0,
              acceptance: 0
            },
            netProfit: 0,
            acceptance: 0
          },
          previousPeriod: {
            sales: 0,
            orders: 0,
            returns: 0,
            cancellations: 0
          }
        },
        ordersByRegion: [],
        ordersByWarehouse: [],
        penalties: [],
        returns: [],
        productAdvertisingData: [],
        advertisingBreakdown: { search: 0 },
        timestamp: Date.now()
      };
    }
    
    let parsedData = JSON.parse(storedData);
    
    // Add timestamp if it doesn't exist
    if (!parsedData.timestamp) {
      parsedData.timestamp = Date.now();
    }
    
    // Ensure the data structure matches the expected format
    if (parsedData.data && parsedData.data.currentPeriod) {
      // Make sure all required fields exist in currentPeriod
      parsedData.data.currentPeriod.orders = parsedData.data.currentPeriod.orders || 0;
      parsedData.data.currentPeriod.returns = parsedData.data.currentPeriod.returns || 0;
      parsedData.data.currentPeriod.cancellations = parsedData.data.currentPeriod.cancellations || 0;
      parsedData.data.currentPeriod.sales = parsedData.data.currentPeriod.sales || 0;
    }
    
    // Make sure previousPeriod exists
    if (!parsedData.data.previousPeriod) {
      parsedData.data.previousPeriod = {
        sales: 0,
        orders: 0,
        returns: 0,
        cancellations: 0
      };
    }
    
    // Ensure arrays exist
    parsedData.ordersByRegion = parsedData.ordersByRegion || [];
    parsedData.ordersByWarehouse = parsedData.ordersByWarehouse || [];
    parsedData.penalties = parsedData.penalties || [];
    parsedData.returns = parsedData.returns || [];
    parsedData.productAdvertisingData = parsedData.productAdvertisingData || [];
    
    return parsedData;
  } catch (error) {
    console.error('Error loading analytics data:', error);
    // Return default structure on error
    return {
      data: {
        currentPeriod: {
          sales: 0,
          orders: 0,
          returns: 0,
          cancellations: 0,
          transferred: 0,
          expenses: {
            total: 0,
            logistics: 0,
            storage: 0,
            penalties: 0,
            advertising: 0,
            acceptance: 0
          },
          netProfit: 0,
          acceptance: 0
        },
        previousPeriod: {
          sales: 0,
          orders: 0,
          returns: 0,
          cancellations: 0
        }
      },
      ordersByRegion: [],
      ordersByWarehouse: [],
      penalties: [],
      returns: [],
      productAdvertisingData: [],
      advertisingBreakdown: { search: 0 },
      timestamp: Date.now()
    };
  }
};

// Функция для получения статистики заказов с сервера Wildberries
export const fetchOrdersStatistics = async (apiKey: string, from: Date, to: Date) => {
  try {
    // Получаем данные о заказах
    const orders = await fetchWildberriesOrders(apiKey, from, to);
    
    // Получаем данные о продажах
    const sales = await fetchWildberriesSales(apiKey, from, to);
    
    // Группируем данные по регионам
    const regionMap = new Map<string, number>();
    orders.forEach(order => {
      const region = order.regionName || 'Неизвестный регион';
      const currentCount = regionMap.get(region) || 0;
      regionMap.set(region, currentCount + 1);
    });
    
    const topRegions = Array.from(regionMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([region, count]) => ({ region, count }));
      
    // Группируем данные по складам
    const warehouseMap = new Map<string, number>();
    orders.forEach(order => {
      const warehouse = order.warehouseName || 'Неизвестный склад';
      const currentCount = warehouseMap.get(warehouse) || 0;
      warehouseMap.set(warehouse, currentCount + 1);
    });
    
    const topWarehouses = Array.from(warehouseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([warehouse, count]) => ({ warehouse, count }));
    
    // Группируем данные по категориям
    const categoryMap = new Map<string, number>();
    orders.forEach(order => {
      const category = order.category || 'Неизвестная категория';
      const currentCount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentCount + 1);
    });
    
    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));
    
    return {
      totalOrders: orders.length,
      totalSales: sales.filter(sale => sale.saleID.startsWith('S')).length,
      totalReturns: sales.filter(sale => sale.saleID.startsWith('R')).length,
      totalCancellations: orders.filter(order => order.isCancel).length,
      topRegions,
      topWarehouses,
      topCategories
    };
  } catch (error) {
    console.error('Error fetching orders statistics:', error);
    throw error;
  }
};

import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY, ORDERS_STORAGE_KEY, SALES_STORAGE_KEY, WildberriesOrder, WildberriesSale } from "@/types/store";
import { fetchWildberriesStats, fetchWildberriesOrders, fetchWildberriesSales } from "@/services/wildberriesApi";
import axios from "axios";

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
  const storesWithTimestamp = {
    stores,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  localStorage.setItem(`${STORES_STORAGE_KEY}_timestamp`, Date.now().toString());
  
  const selectedStore = stores.find(s => s.isSelected);
  if (selectedStore) {
    localStorage.setItem('last_selected_store', JSON.stringify({
      storeId: selectedStore.id,
      timestamp: Date.now()
    }));
  }
  
  window.dispatchEvent(new CustomEvent('stores-updated', { 
    detail: { stores, timestamp: Date.now() } 
  }));
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
          const deductions = (stats.currentPeriod.expenses.deductions || 0) / daysCount;
          
          return {
            date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date().toISOString().split('T')[0],
            logistic,
            storage,
            penalties,
            acceptance,
            advertising,
            deductions
          };
        }) || [];
        
        const analyticsData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          data: stats,
          penalties: [],
          returns: [],
          deductions: [],
          deductionsTimeline,
          productAdvertisingData: [],
          advertisingBreakdown: { search: 0 },
          timestamp: Date.now()
        };
        
        try {
          await axios.post('http://localhost:3001/api/store-stats', {
            storeId: store.id,
            dateFrom: from.toISOString(),
            dateTo: to.toISOString(),
            data: stats
          });
          
          await axios.post('http://localhost:3001/api/analytics', analyticsData);
        } catch (error) {
          console.error('Error saving stats to DB:', error);
          localStorage.setItem(`marketplace_analytics_${store.id}`, JSON.stringify(analyticsData));
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

export const getOrdersData = async (storeId: string) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/orders/${storeId}`);
    if (response.data) {
      return {
        orders: response.data.orders,
        warehouseDistribution: response.data.warehouse_distribution,
        regionDistribution: response.data.region_distribution
      };
    }
  } catch (error) {
    console.error('Error fetching orders from DB:', error);
    const storedData = localStorage.getItem(`${ORDERS_STORAGE_KEY}_${storeId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
  }
  return null;
};

export const getSalesData = async (storeId: string) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/sales/${storeId}`);
    if (response.data) {
      return {
        sales: response.data.sales
      };
    }
  } catch (error) {
    console.error('Error fetching sales from DB:', error);
    const storedData = localStorage.getItem(`${SALES_STORAGE_KEY}_${storeId}`);
    if (storedData) {
      return JSON.parse(storedData);
    }
  }
  return null;
};

// Constants for warehouse data caching
const WAREHOUSES_CACHE_KEY = 'wb_warehouses_cache';
const COEFFICIENTS_CACHE_KEY = 'wb_coefficients_cache';
const REMAINS_CACHE_KEY = 'wb_remains_cache';
const PAID_STORAGE_CACHE_KEY = 'wb_paid_storage_cache';
const AVG_SALES_CACHE_KEY = 'wb_avg_sales_cache';
const STORAGE_COSTS_CACHE_KEY = 'wb_storage_costs_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Helper function to check if cache is fresh
const isCacheFresh = (timestamp: number): boolean => {
  if (!timestamp) return false;
  const now = Date.now();
  return (now - timestamp) < CACHE_TTL;
};

/**
 * Saves warehouse data to cache
 */
export const saveWarehousesToCache = (storeId: string, warehouses: any): void => {
  try {
    const cacheKey = `${WAREHOUSES_CACHE_KEY}_${storeId}`;
    const cacheData = {
      data: warehouses,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Cache] Warehouses data saved to cache for store ${storeId}`);
  } catch (error) {
    console.error('[Cache] Error saving warehouses to cache:', error);
  }
};

/**
 * Loads warehouses from cache
 */
export const loadWarehousesFromCache = (storeId: string): { data: any; isFresh: boolean } => {
  try {
    const cacheKey = `${WAREHOUSES_CACHE_KEY}_${storeId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return { data: null, isFresh: false };
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const isFresh = isCacheFresh(timestamp);
    
    console.log(`[Cache] Warehouses loaded from cache for store ${storeId}, fresh: ${isFresh}`);
    return { data, isFresh };
  } catch (error) {
    console.error('[Cache] Error loading warehouses from cache:', error);
    return { data: null, isFresh: false };
  }
};

/**
 * Saves coefficients data to cache
 */
export const saveCoefficientsToCache = (storeId: string, coefficients: any, warehouseId?: number): void => {
  try {
    const cacheKey = warehouseId 
      ? `${COEFFICIENTS_CACHE_KEY}_${storeId}_${warehouseId}` 
      : `${COEFFICIENTS_CACHE_KEY}_${storeId}`;
    
    const cacheData = {
      data: coefficients,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Cache] Coefficients saved to cache for store ${storeId}${warehouseId ? ` and warehouse ${warehouseId}` : ''}`);
  } catch (error) {
    console.error('[Cache] Error saving coefficients to cache:', error);
  }
};

/**
 * Loads coefficients from cache
 */
export const loadCoefficientsFromCache = (storeId: string, warehouseId?: number): { data: any; isFresh: boolean } => {
  try {
    const cacheKey = warehouseId 
      ? `${COEFFICIENTS_CACHE_KEY}_${storeId}_${warehouseId}` 
      : `${COEFFICIENTS_CACHE_KEY}_${storeId}`;
    
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return { data: null, isFresh: false };
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const isFresh = isCacheFresh(timestamp);
    
    console.log(`[Cache] Coefficients loaded from cache for store ${storeId}${warehouseId ? ` and warehouse ${warehouseId}` : ''}, fresh: ${isFresh}`);
    return { data, isFresh };
  } catch (error) {
    console.error('[Cache] Error loading coefficients from cache:', error);
    return { data: null, isFresh: false };
  }
};

/**
 * Saves warehouse remains data to cache
 */
export const saveRemainsToCache = (storeId: string, remains: any): void => {
  try {
    const cacheKey = `${REMAINS_CACHE_KEY}_${storeId}`;
    const cacheData = {
      data: remains,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Cache] Warehouse remains saved to cache for store ${storeId}`);
  } catch (error) {
    console.error('[Cache] Error saving warehouse remains to cache:', error);
  }
};

/**
 * Loads warehouse remains from cache
 */
export const loadRemainsFromCache = (storeId: string): { data: any; isFresh: boolean } => {
  try {
    const cacheKey = `${REMAINS_CACHE_KEY}_${storeId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return { data: null, isFresh: false };
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const isFresh = isCacheFresh(timestamp);
    
    console.log(`[Cache] Warehouse remains loaded from cache for store ${storeId}, fresh: ${isFresh}`);
    return { data, isFresh };
  } catch (error) {
    console.error('[Cache] Error loading warehouse remains from cache:', error);
    return { data: null, isFresh: false };
  }
};

/**
 * Saves paid storage data to cache
 */
export const savePaidStorageToCache = (storeId: string, storageData: any): void => {
  try {
    const cacheKey = `${PAID_STORAGE_CACHE_KEY}_${storeId}`;
    const cacheData = {
      data: storageData,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Cache] Paid storage data saved to cache for store ${storeId}`);
  } catch (error) {
    console.error('[Cache] Error saving paid storage data to cache:', error);
  }
};

/**
 * Loads paid storage data from cache
 */
export const loadPaidStorageFromCache = (storeId: string): { data: any; isFresh: boolean } => {
  try {
    const cacheKey = `${PAID_STORAGE_CACHE_KEY}_${storeId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return { data: null, isFresh: false };
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const isFresh = isCacheFresh(timestamp);
    
    console.log(`[Cache] Paid storage data loaded from cache for store ${storeId}, fresh: ${isFresh}`);
    return { data, isFresh };
  } catch (error) {
    console.error('[Cache] Error loading paid storage data from cache:', error);
    return { data: null, isFresh: false };
  }
};

/**
 * Saves average daily sales data to cache
 */
export const saveAvgSalesToCache = (storeId: string, salesData: any): void => {
  try {
    const cacheKey = `${AVG_SALES_CACHE_KEY}_${storeId}`;
    const cacheData = {
      data: salesData,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Cache] Average daily sales data saved to cache for store ${storeId}`);
  } catch (error) {
    console.error('[Cache] Error saving average daily sales data to cache:', error);
  }
};

/**
 * Loads average daily sales data from cache
 */
export const loadAvgSalesFromCache = (storeId: string): { data: any; isFresh: boolean } => {
  try {
    const cacheKey = `${AVG_SALES_CACHE_KEY}_${storeId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return { data: null, isFresh: false };
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const isFresh = isCacheFresh(timestamp);
    
    console.log(`[Cache] Average daily sales data loaded from cache for store ${storeId}, fresh: ${isFresh}`);
    return { data, isFresh };
  } catch (error) {
    console.error('[Cache] Error loading average daily sales data from cache:', error);
    return { data: null, isFresh: false };
  }
};

/**
 * Saves storage costs data to cache
 */
export const saveStorageCostsToCache = (storeId: string, costsData: any): void => {
  try {
    const cacheKey = `${STORAGE_COSTS_CACHE_KEY}_${storeId}`;
    const cacheData = {
      data: costsData,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Cache] Storage costs data saved to cache for store ${storeId}`);
  } catch (error) {
    console.error('[Cache] Error saving storage costs data to cache:', error);
  }
};

/**
 * Loads storage costs data from cache
 */
export const loadStorageCostsFromCache = (storeId: string): { data: any; isFresh: boolean } => {
  try {
    const cacheKey = `${STORAGE_COSTS_CACHE_KEY}_${storeId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) {
      return { data: null, isFresh: false };
    }
    
    const { data, timestamp } = JSON.parse(cached);
    const isFresh = isCacheFresh(timestamp);
    
    console.log(`[Cache] Storage costs data loaded from cache for store ${storeId}, fresh: ${isFresh}`);
    return { data, isFresh };
  } catch (error) {
    console.error('[Cache] Error loading storage costs data from cache:', error);
    return { data: null, isFresh: false };
  }
};

/**
 * Invalidates all warehouse related caches for a specific store
 */
export const invalidateWarehouseCache = (storeId: string): void => {
  try {
    const cacheKeys = [
      `${WAREHOUSES_CACHE_KEY}_${storeId}`,
      `${COEFFICIENTS_CACHE_KEY}_${storeId}`,
      `${REMAINS_CACHE_KEY}_${storeId}`,
      `${PAID_STORAGE_CACHE_KEY}_${storeId}`,
      `${AVG_SALES_CACHE_KEY}_${storeId}`,
      `${STORAGE_COSTS_CACHE_KEY}_${storeId}`
    ];
    
    cacheKeys.forEach(key => localStorage.removeItem(key));
    
    // Also clear any warehouse-specific coefficient caches
    const allKeys = Object.keys(localStorage);
    const warehouseSpecificKeys = allKeys.filter(key => 
      key.startsWith(`${COEFFICIENTS_CACHE_KEY}_${storeId}_`)
    );
    
    warehouseSpecificKeys.forEach(key => localStorage.removeItem(key));
    
    console.log(`[Cache] All warehouse related caches invalidated for store ${storeId}`);
  } catch (error) {
    console.error('[Cache] Error invalidating warehouse caches:', error);
  }
};

export const fetchAndUpdateOrders = async (store: Store) => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from } = getLastWeekDateRange();
      const orders = await fetchWildberriesOrders(store.apiKey, from);
      
      if (orders && orders.length > 0) {
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
        
        const ordersData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: new Date().toISOString(),
          orders,
          warehouseDistribution,
          regionDistribution,
          timestamp: Date.now()
        };
        
        try {
          await axios.post('http://localhost:3001/api/orders', ordersData);
        } catch (error) {
          console.error('Error saving orders to DB:', error);
          localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify(ordersData));
        }
        
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

export const fetchAndUpdateSales = async (store: Store) => {
  if (store.marketplace === "Wildberries") {
    try {
      const { from } = getLastWeekDateRange();
      const sales = await fetchWildberriesSales(store.apiKey, from);
      
      if (sales && sales.length > 0) {
        const salesData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: new Date().toISOString(),
          sales,
          timestamp: Date.now()
        };
        
        try {
          await axios.post('http://localhost:3001/api/sales', salesData);
        } catch (error) {
          console.error('Error saving sales to DB:', error);
          localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify(salesData));
        }
        
        return sales;
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  }
  return null;
};

export const getProductProfitabilityData = (storeId: string) => {
  try {
    try {
      const storedData = localStorage.getItem(`products_detailed_${storeId}`);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return {
          profitableProducts: parsedData.profitableProducts?.slice(0, 3) || [],
          unprofitableProducts: parsedData.unprofitableProducts?.slice(0, 3) || [],
          updateDate: parsedData.updateDate
        };
      }
      
      const analyticsData = localStorage.getItem(`marketplace_analytics_${storeId}`);
      if (analyticsData) {
        const parsedData = JSON.parse(analyticsData);
        return {
          profitableProducts: (parsedData.data.topProfitableProducts || []).slice(0, 3),
          unprofitableProducts: (parsedData.data.topUnprofitableProducts || []).slice(0, 3),
          updateDate: parsedData.dateTo
        };
      }
    } catch (innerError) {
      console.error('Error parsing local storage data:', innerError);
    }
    
    axios.get(`http://localhost:3001/api/analytics/${storeId}`)
      .then(response => {
        if (response.data && response.data.data) {
          const data = {
            profitableProducts: response.data.data.topProfitableProducts?.slice(0, 3) || [],
            unprofitableProducts: response.data.data.topUnprofitableProducts?.slice(0, 3) || [],
            updateDate: response.data.date_to
          };
          localStorage.setItem(`products_detailed_${storeId}`, JSON.stringify(data));
          return data;
        }
        return null;
      })
      .catch(error => {
        console.error('Error fetching product profitability data from DB:', error);
        return null;
      });
  } catch (error) {
    console.error('Error in getProductProfitabilityData:', error);
  }
  
  return {
    profitableProducts: [],
    unprofitableProducts: [],
    updateDate: null
  };
};

export const getAnalyticsData = (storeId: string, forceRefresh?: boolean) => {
  if (forceRefresh) {
    console.log('Forced refresh requested, returning default structure');
    return {
      data: null,
      penalties: [],
      returns: [],
      deductions: [],
      deductionsTimeline: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logistic: 0,
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0,
        deductions: 0
      })),
      productAdvertisingData: [],
      advertisingBreakdown: { search: 0 },
      timestamp: Date.now()
    };
  }
  
  try {
    try {
      const key = `marketplace_analytics_${storeId}`;
      const storedData = localStorage.getItem(key);
      
      if (storedData) {
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
            advertising: 0,
            deductions: 0
          }));
        } else {
          parsedData.deductionsTimeline = parsedData.deductionsTimeline.map((item: any) => ({
            date: item.date || new Date().toISOString().split('T')[0],
            logistic: item.logistic || 0,
            storage: item.storage || 0,
            penalties: item.penalties || 0,
            acceptance: item.acceptance || 0,
            advertising: item.advertising || 0,
            deductions: item.deductions || 0
          }));
        }
        
        if (!parsedData.penalties || !Array.isArray(parsedData.penalties)) {
          parsedData.penalties = [];
        }
        
        if (!parsedData.returns || !Array.isArray(parsedData.returns)) {
          parsedData.returns = [];
        }
        
        if (!parsedData.deductions || !Array.isArray(parsedData.deductions)) {
          parsedData.deductions = [];
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
          parsedData.data.currentPeriod.expenses.deductions = parsedData.data.currentPeriod.expenses.deductions || 0;
        }
        
        return parsedData;
      }
    } catch (localError) {
      console.error('Error parsing localStorage analytics data:', localError);
    }
    
    axios.get(`http://localhost:3001/api/analytics/${storeId}`)
      .then(response => {
        if (response.data) {
          const parsedData = {
            data: response.data.data,
            penalties: response.data.penalties || [],
            returns: response.data.returns || [],
            deductions: response.data.deductions || [],
            deductionsTimeline: response.data.deductions_timeline || [],
            productAdvertisingData: response.data.product_advertising_data || [],
            advertisingBreakdown: response.data.advertising_breakdown || { search: 0 },
            timestamp: response.data.timestamp
          };
          
          if (!parsedData.deductionsTimeline || !Array.isArray(parsedData.deductionsTimeline) || parsedData.deductionsTimeline.length === 0) {
            parsedData.deductionsTimeline = Array.from({ length: 7 }, (_, i) => ({
              date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              logistic: 0,
              storage: 0, 
              penalties: 0,
              acceptance: 0,
              advertising: 0,
              deductions: 0
            }));
          }
          
          localStorage.setItem(`marketplace_analytics_${storeId}`, JSON.stringify(parsedData));
          return parsedData;
        }
        return null;
      })
      .catch(error => {
        console.error('Error fetching analytics data from DB:', error);
        return null;
      });
  } catch (error) {
    console.error('Error in getAnalyticsData:', error);
  }
  
  return {
    data: null,
    penalties: [],
    returns: [],
    deductions: [],
    deductionsTimeline: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      logistic: 0,
      storage: 0, 
      penalties: 0,
      acceptance: 0,
      advertising: 0,
      deductions: 0
    })),
    productAdvertisingData: [],
    advertisingBreakdown: { search: 0 },
    timestamp: Date.now()
  };
};

export const getStoresLastUpdateTime = (): number => {
  const timestamp = localStorage.getItem(`${STORES_STORAGE_KEY}_timestamp`);
  return timestamp ? parseInt(timestamp, 10) : 0;
};

export const ensureStoreSelectionPersistence = (): Store[] => {
  const stores = loadStores();
  
  const userData = localStorage.getItem('user');
  const currentUserId = userData ? JSON.parse(userData).id : null;
  
  const userStores = currentUserId 
    ? stores.filter(store => store.userId === currentUserId) 
    : stores;
  
  if (!userStores.length) return userStores;
  
  const hasSelectedStore = userStores.some(store => store.isSelected);
  
  if (!hasSelectedStore && userStores.length > 0) {
    const lastSelectedStoreData = localStorage.getItem('last_selected_store');
    
    if (lastSelectedStoreData) {
      try {
        const { storeId } = JSON.parse(lastSelectedStoreData);
        
        const storeExists = userStores.some(store => store.id === storeId);
        
        if (storeExists) {
          const updatedAllStores = stores.map(store => ({
            ...store,
            isSelected: store.id === storeId
          }));
          
          saveStores(updatedAllStores);
          
          return currentUserId 
            ? updatedAllStores.filter(store => store.userId === currentUserId)
            : updatedAllStores;
        }
      } catch (error) {
        console.error('Error restoring store selection:', error);
      }
    }
    
    const updatedAllStores = stores.map(store => {
      if (currentUserId && store.userId === currentUserId) {
        const isFirst = store.id === userStores[0].id;
        return { ...store, isSelected: isFirst };
      }
      return { ...store, isSelected: false };
    });
    
    saveStores(updatedAllStores);
    
    return currentUserId 
      ? updatedAllStores.filter(store => store.userId === currentUserId)
      : updatedAllStores;
  }
  
  return userStores;
};

/**
 * Gets the currently selected store without modifying any selections
 * This is used to prevent unwanted reselection of stores
 */
export const getSelectedStore = (): Store | null => {
  try {
    const userData = localStorage.getItem('user');
    const currentUserId = userData ? JSON.parse(userData).id : null;
    
    const stores = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
    
    const userStores = currentUserId 
      ? stores.filter((store: Store) => store.userId === currentUserId)
      : stores;
    
    return userStores.find((store: Store) => store.isSelected) || 
           (userStores.length > 0 ? userStores[0] : null);
  } catch (error) {
    console.error('Error getting selected store:', error);
    return null;
  }
};

export const validateApiKey = async (apiKey: string): Promise<{ isValid: boolean; errorCode?: number; errorMessage?: string }> => {
  try {
    const { from, to } = getLastWeekDateRange();
    const testFrom = new Date();
    testFrom.setDate(testFrom.getDate() - 1);
    
    const url = "https://statistics-api.wildberries.ru/api/v1/supplier/sales";
    const headers = {
      "Authorization": apiKey,
    };
    const params = {
      "dateFrom": testFrom.toISOString().split('T')[0] + 'T00:00:00'
    };
    
    console.log("Validating API key with test request...");
    const response = await axios.get(url, { headers, params });
    
    if (response.status === 200) {
      console.log("API key validation successful");
      return { isValid: true };
    }
    
    console.log(`API key validation returned non-200 status: ${response.status}`);
    return { isValid: false, errorCode: response.status, errorMessage: "Неожиданный ответ от API" };
    
  } catch (error) {
    console.error('Error validating API key:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      let errorMessage = "Ошибка при проверке API ключа";
      
      if (status === 400) {
        errorMessage = "Неправильный запрос";
      } else if (status === 401) {
        errorMessage = "Неверный API ключ";
      } else if (status === 403) {
        errorMessage = "Доступ запрещен";
      } else if (status === 429) {
        errorMessage = "Слишком много запросов, попробуйте позже";
      } else if (status && status >= 500) {
        errorMessage = "Сервер Wildberries временно недоступен";
      }
      
      return { isValid: false, errorCode: status, errorMessage };
    }
    
    return { isValid: false

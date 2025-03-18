import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY, ORDERS_STORAGE_KEY, SALES_STORAGE_KEY, WildberriesOrder, WildberriesSale } from "@/types/store";
import { fetchWildberriesStats, fetchWildberriesOrders, fetchWildberriesSales } from "@/services/wildberriesApi";
import axios from "axios";

const WAREHOUSES_CACHE_KEY = 'cached_warehouses';
const COEFFICIENTS_CACHE_KEY = 'cached_coefficients';
const WAREHOUSE_REMAINS_CACHE_KEY = 'cached_warehouse_remains';
const PAID_STORAGE_CACHE_KEY = 'cached_paid_storage';
const AVERAGE_SALES_CACHE_KEY = 'cached_average_sales';
const STORAGE_COSTS_CACHE_KEY = 'cached_storage_costs';
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

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
    
    return { isValid: false, errorMessage: "Невозможно соединиться с API Wildberries" };
  }
};

export const saveWarehousesToCache = (storeId: string, warehouses: any[]): void => {
  try {
    const cacheData = {
      warehouses,
      timestamp: Date.now(),
      storeId
    };
    localStorage.setItem(`${WAREHOUSES_CACHE_KEY}_${storeId}`, JSON.stringify(cacheData));
    console.log(`[Cache] Сохранены данные о ${warehouses.length} складах для магазина ${storeId}`);
  } catch (error) {
    console.error('[Cache] Ошибка при сохранении складов в кеш:', error);
  }
};

export const loadWarehousesFromCache = (storeId: string): { warehouses: any[], timestamp: number } | null => {
  try {
    const cachedData = localStorage.getItem(`${WAREHOUSES_CACHE_KEY}_${storeId}`);
    if (!cachedData) {
      console.log('[Cache] Кеш складов не найден');
      return null;
    }
    
    const { warehouses, timestamp } = JSON.parse(cachedData);
    const isCacheValid = Date.now() - timestamp < CACHE_EXPIRY_TIME;
    
    if (!isCacheValid) {
      console.log('[Cache] Кеш складов устарел');
      return { warehouses, timestamp };
    }
    
    console.log(`[Cache] Загружены данные о ${warehouses.length} складах из кеша`);
    return { warehouses, timestamp };
  } catch (error) {
    console.error('[Cache] Ошибка при загрузке складов из кеша:', error);
    return null;
  }
};

export const saveCoefficientsToCache = (storeId: string, coefficients: any[], warehouseId?: number): void => {
  try {
    const cacheKey = warehouseId 
      ? `${COEFFICIENTS_CACHE_KEY}_${storeId}_${warehouseId}` 
      : `${COEFFICIENTS_CACHE_KEY}_${storeId}`;
    
    const cacheData = {
      coefficients,
      timestamp: Date.now(),
      storeId,
      warehouseId
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[Cache] Сохранены данные о ${coefficients.length} коэффициентах для магазина ${storeId}`);
  } catch (error) {
    console.error('[Cache] Ошибка при сохранении коэффициентов в кеш:', error);
  }
};

export const loadCoefficientsFromCache = (storeId: string, warehouseId?: number): { coefficients: any[], timestamp: number } | null => {
  try {
    const cacheKey = warehouseId 
      ? `${COEFFICIENTS_CACHE_KEY}_${storeId}_${warehouseId}` 
      : `${COEFFICIENTS_CACHE_KEY}_${storeId}`;
    
    const cachedData = localStorage.getItem(cacheKey);
    if (!cachedData) {
      console.log('[Cache] Кеш коэффициентов не найден');
      return null;
    }
    
    const { coefficients, timestamp } = JSON.parse(cachedData);
    const isCacheValid = Date.now() - timestamp < CACHE_EXPIRY_TIME;
    
    if (!isCacheValid) {
      console.log('[Cache] Кеш коэффициентов устарел');
      return { coefficients, timestamp };
    }
    
    console.log(`[Cache] Загружены данные о ${coefficients.length} коэффициентах из кеша`);
    return { coefficients, timestamp };
  } catch (error) {
    console.error('[Cache] Ошибка при загрузке коэффициентов из кеша:', error);
    return null;
  }
};

export const saveWarehouseRemainsToCache = (storeId: string, remains: any[]): void => {
  try {
    const cacheData = {
      remains,
      timestamp: Date.now(),
      storeId
    };
    localStorage.setItem(`${WAREHOUSE_REMAINS_CACHE_KEY}_${storeId}`, JSON.stringify(cacheData));
    console.log(`[Cache] Сохранены данные о ${remains.length} остатках на складах для магазина ${storeId}`);
  } catch (error) {
    console.error('[Cache] Ошибка при сохранении остатков в кеш:', error);
  }
};

export const loadWarehouseRemainsFromCache = (storeId: string): { remains: any[], timestamp: number } | null => {
  try {
    const cachedData = localStorage.getItem(`${WAREHOUSE_REMAINS_CACHE_KEY}_${storeId}`);
    if (!cachedData) {
      console.log('[Cache] Кеш остатков на складах не найден');
      return null;
    }
    
    const { remains, timestamp } = JSON.parse(cachedData);
    const isCacheValid = Date.now() - timestamp < CACHE_EXPIRY_TIME;
    
    if (!isCacheValid) {
      console.log('[Cache] Кеш остатков на складах устарел');
      return { remains, timestamp };
    }
    
    console.log(`[Cache] Загружены данные о ${remains.length} остатках на складах из кеша`);
    return { remains, timestamp };
  } catch (error) {
    console.error('[Cache] Ошибка при загрузке остатков из кеша:', error);
    return null;
  }
};

export const savePaidStorageToCache = (storeId: string, paidStorage: any[]): void => {
  try {
    const cacheData = {
      paidStorage,
      timestamp: Date.now(),
      storeId
    };
    localStorage.setItem(`${PAID_STORAGE_CACHE_KEY}_${storeId}`, JSON.stringify(cacheData));
    console.log(`[Cache] Сохранены данные о ${paidStorage.length} записях платного хранения для магазина ${storeId}`);
  } catch (error) {
    console.error('[Cache] Ошибка при сохранении платного хранения в кеш:', error);
  }
};

export const loadPaidStorageFromCache = (storeId: string): { paidStorage: any[], timestamp: number } | null => {
  try {
    const cachedData = localStorage.getItem(`${PAID_STORAGE_CACHE_KEY}_${storeId}`);
    if (!cachedData) {
      console.log('[Cache] Кеш платного хранения не найден');
      return null;
    }
    
    const { paidStorage, timestamp } = JSON.parse(cachedData);
    const isCacheValid = Date.now() - timestamp < CACHE_EXPIRY_TIME;
    
    if (!isCacheValid) {
      console.log('[Cache] Кеш платного хранения устарел');
      return { paidStorage, timestamp };
    }
    
    console.log(`[Cache] Загружены данные о ${paidStorage.length} записях платного хранения из кеша`);
    return { paidStorage, timestamp };
  } catch (error) {
    console.error('[Cache] Ошибка при загрузке платного хранения из кеша:', error);
    return null;
  }
};

export const saveAverageSalesToCache = (storeId: string, averageSales: Record<number, number>): void => {
  try {
    const cacheData = {
      averageSales,
      timestamp: Date.now(),
      storeId
    };
    localStorage.setItem(`${AVERAGE_SALES_CACHE_KEY}_${storeId}`, JSON.stringify(cacheData));
    console.log(`[Cache] Сохранены данные о средних продажах для ${Object.keys(averageSales).length} товаров`);
  } catch (error) {
    console.error('[Cache] Ошибка при сохранении средних продаж в кеш:', error);
  }
};

export const loadAverageSalesFromCache = (storeId: string): { averageSales: Record<number, number>, timestamp: number } | null => {
  try {
    const cachedData = localStorage.getItem(`${AVERAGE_SALES_CACHE_KEY}_${storeId}`);
    if (!cachedData) {
      console.log('[Cache] Кеш средних продаж не найден');
      return null;
    }
    
    const { averageSales, timestamp } = JSON.parse(cachedData);
    const isCacheValid = Date.now() - timestamp < CACHE_EXPIRY_TIME;
    
    if (!isCacheValid) {
      console.log('[Cache] Кеш средних продаж устарел');
      return { averageSales, timestamp };
    }
    
    console.log(`[Cache] Загружены данные о средних продажах для ${Object.keys(averageSales).length} товаров из кеша`);
    return { averageSales, timestamp };
  } catch (error) {
    console.error('[Cache] Ошибка при загрузке средних продаж из кеша:', error);
    return null;
  }
};

export const saveStorageCostsToCache = (storeId: string, storageCosts: Record<number, number>): void => {
  try {
    const cacheData = {
      storageCosts,
      timestamp: Date.now(),
      storeId
    };
    localStorage.setItem(`${STORAGE_COSTS_CACHE_KEY}_${storeId}`, JSON.stringify(cacheData));
    console.log(`[Cache] Сохранены данные о стоимости хранения для ${Object.keys(storageCosts).length} товаров`);
  } catch (error) {
    console.error('[Cache] Ошибка при сохранении стоимости хранения в кеш:', error);
  }
};

export const loadStorageCostsFromCache = (storeId: string): { storageCosts: Record<number, number>, timestamp: number } | null => {
  try {
    const cachedData = localStorage.getItem(`${STORAGE_COSTS_CACHE_KEY}_${storeId}`);
    if (!cachedData) {
      console.log('[Cache] Кеш стоимости хранения не найден');
      return null;
    }
    
    const { storageCosts, timestamp } = JSON.parse(cachedData);
    const isCacheValid = Date.now() - timestamp < CACHE_EXPIRY_TIME;
    
    if (!isCacheValid) {
      console.log('[Cache] Кеш стоимости хранения устарел');
      return { storageCosts, timestamp };
    }
    
    console.log(`[Cache] Загружены данные о стоимости хранения для ${Object.keys(storageCosts).length} товаров из кеша`);
    return { storageCosts, timestamp };
  } catch (error) {
    console.error('[Cache] Ошибка при загрузке стоимости хранения из кеша:', error);
    return null;
  }
};

export const invalidateWarehouseDataCache = (storeId: string, cacheType?: string): void => {
  try {
    if (!cacheType) {
      localStorage.removeItem(`${WAREHOUSES_CACHE_KEY}_${storeId}`);
      localStorage.removeItem(`${COEFFICIENTS_CACHE_KEY}_${storeId}`);
      localStorage.removeItem(`${WAREHOUSE_REMAINS_CACHE_KEY}_${storeId}`);
      localStorage.removeItem(`${PAID_STORAGE_CACHE_KEY}_${storeId}`);
      localStorage.removeItem(`${AVERAGE_SALES_CACHE_KEY}_${storeId}`);
      localStorage.removeItem(`${STORAGE_COSTS_CACHE_KEY}_${storeId}`);
      console.log(`[Cache] Очищен весь кеш данных для магазина ${storeId}`);
      return;
    }
    
    switch (cacheType) {
      case 'warehouses':
        localStorage.removeItem(`${WAREHOUSES_CACHE_KEY}_${storeId}`);
        break;
      case 'coefficients':
        localStorage.removeItem(`${COEFFICIENTS_CACHE_KEY}_${storeId}`);
        break;
      case 'remains':
        localStorage.removeItem(`${WAREHOUSE_REMAINS_CACHE_KEY}_${storeId}`);
        break;
      case 'paidStorage':
        localStorage.removeItem(`${PAID_STORAGE_CACHE_KEY}_${storeId}`);
        break;
      case 'averageSales':
        localStorage.removeItem(`${AVERAGE_SALES_CACHE_KEY}_${storeId}`);
        break;
      case 'storageCosts':
        localStorage.removeItem(`${STORAGE_COSTS_CACHE_KEY}_${storeId}`);
        break;
      default:
        console.warn(`[Cache] Неизвестный тип кеша: ${cacheType}`);
    }
    
    console.log(`[Cache] Очищен кеш ${cacheType} для магазина ${storeId}`);
  } catch (error) {
    console.error('[Cache] Ошибка при инвалидации кеша:', error);
  }
};

export const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_EXPIRY_TIME;
};

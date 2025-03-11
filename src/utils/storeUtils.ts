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

export const getAnalyticsData = (storeId: string): any => {
  try {
    const storedData = localStorage.getItem(`marketplace_analytics_${storeId}`);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    return null;
  } catch (error) {
    console.error('Error loading analytics data:', error);
    return null;
  }
};

export const getProductsCostPrice = (storeId: string): Array<{nmId: string | number; costPrice: number}> => {
  try {
    const storedData = localStorage.getItem(`products_cost_price_${storeId}`);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error loading products cost price:', error);
    return [];
  }
};

export const saveProductCostPrice = (
  storeId: string, 
  nmId: string | number, 
  costPrice: number
): void => {
  try {
    let productsCostPrice = getProductsCostPrice(storeId);
    
    // Проверяем, есть ли уже запись для этого товара
    const existingIndex = productsCostPrice.findIndex(item => item.nmId.toString() === nmId.toString());
    
    if (existingIndex >= 0) {
      // Обновляем существующую запись
      productsCostPrice[existingIndex].costPrice = costPrice;
    } else {
      // Добавляем новую запись
      productsCostPrice.push({ nmId, costPrice });
    }
    
    // Сохраняем обновленный список в localStorage
    localStorage.setItem(`products_cost_price_${storeId}`, JSON.stringify(productsCostPrice));
  } catch (error) {
    console.error('Error saving product cost price:', error);
  }
};

export const calculateTotalCostPrice = (
  productSales: Array<{nmId?: string | number; quantity?: number}>, 
  productsCostPrice: Array<{nmId: string | number; costPrice: number}>
): number => {
  let totalCostPrice = 0;
  
  if (!productSales?.length || !productsCostPrice?.length) {
    return 0;
  }
  
  // Преобразуем массив себестоимости в объект для быстрого доступа
  const costPriceMap: Record<string, number> = {};
  productsCostPrice.forEach(item => {
    costPriceMap[item.nmId.toString()] = item.costPrice;
  });
  
  // Считаем себестоимость по каждому проданному товару
  productSales.forEach(sale => {
    if (sale.nmId && costPriceMap[sale.nmId.toString()]) {
      const quantity = sale.quantity || 1;
      const costPrice = costPriceMap[sale.nmId.toString()] || 0;
      totalCostPrice += quantity * costPrice;
    }
  });
  
  // Округляем до двух знаков после запятой
  return Math.round(totalCostPrice * 100) / 100;
};

export const getStoresLastUpdateTime = (): number => {
  const timestamp = localStorage.getItem(`${STORES_STORAGE_KEY}_timestamp`);
  return timestamp ? parseInt(timestamp, 10) : 0;
};

export const ensureStoreSelectionPersistence = (): Store[] => {
  const stores = loadStores();
  
  const hasSelectedStore = stores.some(store => store.isSelected);
  
  if (!hasSelectedStore && stores.length > 0) {
    const lastSelectedStoreData = localStorage.getItem('last_selected_store');
    
    if (lastSelectedStoreData) {
      try {
        const { storeId } = JSON.parse(lastSelectedStoreData);
        const updatedStores = stores.map(store => ({
          ...store,
          isSelected: store.id === storeId
        }));
        
        saveStores(updatedStores);
        return updatedStores;
      } catch (error) {
        console.error('Error restoring store selection:', error);
      }
    }
    
    if (stores.length > 0) {
      const updatedStores = stores.map((store, index) => ({
        ...store,
        isSelected: index === 0
      }));
      
      saveStores(updatedStores);
      return updatedStores;
    }
  }
  
  return stores;
};

/**
 * Gets the currently selected store without modifying any selections
 * This is used to prevent unwanted reselection of stores
 */
export const getSelectedStore = (): Store | null => {
  try {
    const stores = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
    return stores.find((store: Store) => store.isSelected) || null;
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

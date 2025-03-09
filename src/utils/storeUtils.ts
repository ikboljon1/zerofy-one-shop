
import { STORES_STORAGE_KEY, Store, PRODUCT_EFFICIENCY_KEY, ProductEfficiency, WildberriesOrder, WildberriesSale, ORDERS_STORAGE_KEY, SALES_STORAGE_KEY } from "@/types/store";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { fetchWildberriesOrders, fetchWildberriesSales } from "@/services/wildberriesApi";

// Store management functions
export const getStores = (): Store[] => {
  try {
    const stores = localStorage.getItem(STORES_STORAGE_KEY);
    return stores ? JSON.parse(stores) : [];
  } catch (error) {
    console.error("Error getting stores:", error);
    return [];
  }
};

export const loadStores = (): Store[] => {
  return getStores();
};

export const saveStores = (stores: Store[]): void => {
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  } catch (error) {
    console.error("Error saving stores:", error);
  }
};

export const getSelectedStore = (): Store | null => {
  try {
    const stores = getStores();
    const selectedStore = stores.find((store) => store.isSelected);
    return selectedStore || null;
  } catch (error) {
    console.error("Error getting selected store:", error);
    return null;
  }
};

// Product profitability data functions
export const getProductProfitabilityData = (storeId: string): ProductEfficiency | null => {
  try {
    const efficiencyData = localStorage.getItem(PRODUCT_EFFICIENCY_KEY);
    if (!efficiencyData) return null;
    
    const allData: ProductEfficiency[] = JSON.parse(efficiencyData);
    const storeData = allData.find(data => data.storeId === storeId);
    
    return storeData || null;
  } catch (error) {
    console.error("Error getting product profitability data:", error);
    return null;
  }
};

// Currency formatting functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('₽', '₽');
};

export const parseCurrencyString = (str: string): number => {
  if (!str) return 0;
  // Удаляем все нечисловые символы, кроме точки и минуса
  const numStr = str.replace(/[^\d.-]/g, '');
  return parseFloat(numStr) || 0;
};

// Store statistics functions
export const refreshStoreStats = async (store: Store): Promise<Store | null> => {
  try {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Updated to match the fetchWildberriesStats function signature
    const stats = await fetchWildberriesStats(store.apiKey, {
      dateFrom: weekAgo,
      dateTo: now
    });
    
    if (stats) {
      return {
        ...store,
        stats,
        lastFetchDate: new Date().toISOString()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error refreshing store stats:", error);
    return null;
  }
};

// Orders and sales data management
export const getOrdersData = (storeId: string) => {
  try {
    const ordersData = localStorage.getItem(`${ORDERS_STORAGE_KEY}_${storeId}`);
    return ordersData ? JSON.parse(ordersData) : null;
  } catch (error) {
    console.error("Error getting orders data:", error);
    return null;
  }
};

export const getSalesData = (storeId: string) => {
  try {
    const salesData = localStorage.getItem(`${SALES_STORAGE_KEY}_${storeId}`);
    return salesData ? JSON.parse(salesData) : null;
  } catch (error) {
    console.error("Error getting sales data:", error);
    return null;
  }
};

export const fetchAndUpdateOrders = async (store: Store) => {
  try {
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    // Updated to match the fetchWildberriesOrders function signature
    const orders = await fetchWildberriesOrders(store.apiKey, {
      dateFrom: monthAgo,
      dateTo: now
    });
    
    if (orders && orders.length > 0) {
      const warehouseCounts: Record<string, number> = {};
      const regionCounts: Record<string, number> = {};
      const totalOrders = orders.length;

      orders.forEach(order => {
        if (order.warehouseName) {
          warehouseCounts[order.warehouseName] = (warehouseCounts[order.warehouseName] || 0) + 1;
        }
        if (order.regionName) {
          regionCounts[order.regionName] = (regionCounts[order.regionName] || 0) + 1;
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
        orders,
        warehouseDistribution,
        regionDistribution,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`${ORDERS_STORAGE_KEY}_${store.id}`, JSON.stringify(ordersData));
      
      return {
        orders,
        warehouseDistribution,
        regionDistribution
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching and updating orders:", error);
    return null;
  }
};

export const fetchAndUpdateSales = async (store: Store) => {
  try {
    const now = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    // Updated to match the fetchWildberriesSales function signature
    const sales = await fetchWildberriesSales(store.apiKey, {
      dateFrom: monthAgo,
      dateTo: now
    });
    
    if (sales && sales.length > 0) {
      const salesData = {
        storeId: store.id,
        sales,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`${SALES_STORAGE_KEY}_${store.id}`, JSON.stringify(salesData));
      
      return sales;
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching and updating sales:", error);
    return null;
  }
};

// Analytics data functions
export const getAnalyticsData = (storeId: string) => {
  try {
    const analyticsData = localStorage.getItem(`marketplace_analytics_${storeId}`);
    return analyticsData ? JSON.parse(analyticsData) : null;
  } catch (error) {
    console.error("Error getting analytics data:", error);
    return null;
  }
};

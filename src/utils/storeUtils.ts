
import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY } from "@/types/store";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { format, subDays } from "date-fns";

// Load stores from localStorage
export const loadStores = (): Store[] => {
  try {
    const storesData = localStorage.getItem(STORES_STORAGE_KEY);
    if (storesData) {
      return JSON.parse(storesData);
    }
  } catch (error) {
    console.error("Error loading stores from localStorage:", error);
  }
  return [];
};

// Save stores to localStorage
export const saveStores = (stores: Store[]): void => {
  try {
    localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
  } catch (error) {
    console.error("Error saving stores to localStorage:", error);
  }
};

// Refresh stats for a specific store
export const refreshStoreStats = async (store: Store): Promise<Store | null> => {
  try {
    const dateFrom = subDays(new Date(), 7);
    const dateTo = new Date();
    
    const stats = await fetchWildberriesStats(store.apiKey, dateFrom, dateTo);
    
    if (stats) {
      const updatedStore = {
        ...store,
        stats,
        lastFetchDate: new Date().toISOString()
      };
      
      // Save stats to localStorage
      localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
        stats,
        dateFrom: format(dateFrom, "yyyy-MM-dd'T'HH:mm:ss"),
        dateTo: format(dateTo, "yyyy-MM-dd'T'HH:mm:ss")
      }));
      
      return updatedStore;
    }
  } catch (error) {
    console.error("Error refreshing store stats:", error);
  }
  
  return null;
};

export const getProductProfitabilityData = (storeId: string) => {
  const storageKey = `marketplace_profitability_${storeId}`;
  try {
    const storedData = localStorage.getItem(storageKey);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (e) {
    console.error("Error parsing product profitability data:", e);
  }
  return null;
};

// Get analytics data for a store with potential force refresh
export const getAnalyticsData = (storeId: string, forceRefresh?: boolean) => {
  const storageKey = `marketplace_analytics_${storeId}`;
  
  try {
    const storedData = localStorage.getItem(storageKey);
    
    // If we need to force refresh or there's no stored data, return null to trigger a fresh fetch
    if (forceRefresh || !storedData) {
      return null;
    }
    
    // Parse and return the stored data
    return JSON.parse(storedData);
  } catch (error) {
    console.error("Error getting analytics data:", error);
    return null;
  }
};

// Calculate warehouse distribution data
export const calculateWarehouseDistribution = (orders: any[]) => {
  if (!orders || orders.length === 0) return {};
  
  const warehouseCounts: Record<string, number> = {};
  
  orders.forEach(order => {
    const warehouse = order.warehouseName || "Неизвестный склад";
    if (!warehouseCounts[warehouse]) {
      warehouseCounts[warehouse] = 0;
    }
    warehouseCounts[warehouse]++;
  });
  
  return warehouseCounts;
};

// Calculate region distribution data
export const calculateRegionDistribution = (orders: any[]) => {
  if (!orders || orders.length === 0) return {};
  
  const regionCounts: Record<string, number> = {};
  
  orders.forEach(order => {
    const region = order.regionName || "Неизвестный регион";
    if (!regionCounts[region]) {
      regionCounts[region] = 0;
    }
    regionCounts[region]++;
  });
  
  return regionCounts;
};

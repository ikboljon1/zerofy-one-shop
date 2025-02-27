
import { Store, STORES_STORAGE_KEY, STATS_STORAGE_KEY, ADS_STATS_STORAGE_KEY } from "@/types/store";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { getAdvertisingExpenseStructure } from "@/services/advertisingApi";

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
        
        localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          stats: stats
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

export const refreshStoreAdsStats = async (store: Store): Promise<Store | null> => {
  if (store.marketplace === "Wildberries") {
    try {
      console.log("Обновляем рекламную статистику для магазина:", store.name);
      const adsStats = await getAdvertisingExpenseStructure(store.apiKey);
      
      if (adsStats) {
        const updatedStore = {
          ...store,
          adsStats,
          lastFetchDate: new Date().toISOString()
        };
        
        localStorage.setItem(`${ADS_STATS_STORAGE_KEY}_${store.id}`, JSON.stringify({
          storeId: store.id,
          fetchDate: new Date().toISOString(),
          stats: adsStats
        }));
        
        console.log("Сохранена рекламная статистика для магазина:", store.name, adsStats);
        return updatedStore;
      }
    } catch (error) {
      console.error('Error refreshing ads stats:', error);
      return store;
    }
  }
  return store;
};

export const loadStoreAdsStats = (storeId: string) => {
  const storedStats = localStorage.getItem(`${ADS_STATS_STORAGE_KEY}_${storeId}`);
  if (storedStats) {
    try {
      return JSON.parse(storedStats);
    } catch (error) {
      console.error("Error parsing stored ads stats:", error);
      return null;
    }
  }
  return null;
};

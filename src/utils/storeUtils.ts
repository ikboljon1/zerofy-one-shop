
import { Store, NewStore, STORES_STORAGE_KEY, STATS_STORAGE_KEY } from "@/types/store";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { useStore } from "@/store";

export const getLastWeekDateRange = () => {
  const now = new Date();
  const lastWeek = new Date(now);
  lastWeek.setDate(now.getDate() - 7);
  return { from: lastWeek, to: now };
};

export const loadStores = (): Store[] => {
  try {
    const rawStores = localStorage.getItem(STORES_STORAGE_KEY);
    if (!rawStores) return [];
    
    const stores = JSON.parse(rawStores) as Store[];
    
    // Восстанавливаем выбранный магазин в глобальное состояние
    const selectedStore = stores.find(store => store.isSelected);
    if (selectedStore) {
      const { setSelectedStore } = useStore.getState();
      setSelectedStore(selectedStore);
    }
    
    return stores;
  } catch (error) {
    console.error("Ошибка загрузки магазинов:", error);
    return [];
  }
};

export const saveStores = (stores: Store[]): void => {
  localStorage.setItem(STORES_STORAGE_KEY, JSON.stringify(stores));
};

export const refreshStoreStats = async (store: Store): Promise<Store | null> => {
  if (store.marketplace === "Wildberries") {
    try {
      console.log("Refreshing stats for store:", store.name);
      const { from, to } = getLastWeekDateRange();
      console.log("Date range:", from, to);
      
      const stats = await fetchWildberriesStats(store.apiKey, from, to);
      console.log("Fetched stats:", stats);
      
      if (stats) {
        const updatedStore = { 
          ...store, 
          stats,
          lastFetchDate: new Date().toISOString() 
        };
        
        // Сохраняем статистику в localStorage
        const statsData = {
          storeId: store.id,
          dateFrom: from.toISOString(),
          dateTo: to.toISOString(),
          stats: stats
        };
        
        console.log("Saving stats to localStorage:", statsData);
        localStorage.setItem(`${STATS_STORAGE_KEY}_${store.id}`, JSON.stringify(statsData));
        
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

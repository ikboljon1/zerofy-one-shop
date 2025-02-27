
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
      const { from, to } = getLastWeekDateRange();
      const stats = await fetchWildberriesStats(store.apiKey, from, to);
      if (stats) {
        const updatedStore = { 
          ...store, 
          stats,
          lastFetchDate: new Date().toISOString() 
        };
        
        // Сохраняем статистику в localStorage
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

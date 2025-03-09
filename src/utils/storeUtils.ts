
import { Store, NewStore, STATS_STORAGE_KEY } from "@/types/store";
import { getWildberriesStats } from "@/services/wildberriesApi";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

// Helper function to get user ID from localStorage
const getUserId = (): number | null => {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  try {
    const user = JSON.parse(userData);
    return user.id;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

// Load stores from API or localStorage (fallback)
export const loadStores = async (): Promise<Store[]> => {
  const userId = getUserId();
  
  if (userId) {
    try {
      // Try to get stores from API first
      const response = await axios.get(`${API_BASE_URL}/api/user-stores/${userId}`);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data.map((store: any) => ({
          id: store.store_id,
          name: store.store_name,
          marketplace: store.marketplace,
          apiKey: store.api_key,
          isSelected: store.isSelected,
          lastFetchDate: store.last_fetch_date || new Date().toISOString(),
          stats: loadStoreStatsFromLocalStorage(store.store_id)
        }));
      }
    } catch (error) {
      console.error("Error loading stores from API:", error);
      // Fall back to localStorage if API fails
    }
  }
  
  // Fallback to localStorage
  const stores = localStorage.getItem('stores');
  if (!stores) return [];
  
  try {
    const parsedStores = JSON.parse(stores) as Store[];
    return parsedStores.map(store => ({
      ...store,
      stats: loadStoreStatsFromLocalStorage(store.id)
    }));
  } catch (error) {
    console.error("Error parsing stores from localStorage:", error);
    return [];
  }
};

// Save stores to API and localStorage (for redundancy)
export const saveStores = async (stores: Store[]): Promise<void> => {
  const userId = getUserId();
  
  // Save to localStorage as fallback
  localStorage.setItem('stores', JSON.stringify(stores));
  
  if (!userId) return;
  
  // Process each store individually to save/update on API
  for (const store of stores) {
    try {
      // Check if it's a new store or update to existing store
      const existingResponse = await axios.get(`${API_BASE_URL}/api/user-stores/${userId}`);
      const existingStores = existingResponse.data || [];
      const existingStore = existingStores.find((s: any) => s.store_id === store.id);
      
      if (existingStore) {
        // Update existing store
        await axios.put(`${API_BASE_URL}/api/user-stores/${store.id}`, {
          userId,
          storeName: store.name,
          isSelected: store.isSelected,
          lastFetchDate: store.lastFetchDate
        });
      } else {
        // Add new store
        await axios.post(`${API_BASE_URL}/api/user-stores`, {
          userId,
          storeId: store.id,
          storeName: store.name,
          marketplace: store.marketplace,
          apiKey: store.apiKey,
          isSelected: store.isSelected,
          lastFetchDate: store.lastFetchDate
        });
      }
    } catch (error) {
      console.error(`Error saving store ${store.id} to API:`, error);
    }
  }
};

// Delete store from API and localStorage
export const deleteStore = async (storeId: string): Promise<void> => {
  const userId = getUserId();
  
  if (userId) {
    try {
      await axios.delete(`${API_BASE_URL}/api/user-stores/${storeId}?userId=${userId}`);
    } catch (error) {
      console.error(`Error deleting store ${storeId} from API:`, error);
    }
  }
  
  // Also update localStorage
  const stores = await loadStores();
  const updatedStores = stores.filter(store => store.id !== storeId);
  localStorage.setItem('stores', JSON.stringify(updatedStores));
};

// Helper to load store stats from localStorage
const loadStoreStatsFromLocalStorage = (storeId: string): any => {
  const statsKey = `${STATS_STORAGE_KEY}_${storeId}`;
  const statsData = localStorage.getItem(statsKey);
  if (!statsData) return null;
  
  try {
    return JSON.parse(statsData);
  } catch (error) {
    console.error(`Error parsing stats for store ${storeId}:`, error);
    return null;
  }
};

// Ensure the selected store is persisted across sessions
export const ensureStoreSelectionPersistence = (): Store[] => {
  const stores = localStorage.getItem('stores');
  if (!stores) return [];
  
  try {
    const parsedStores = JSON.parse(stores) as Store[];
    const lastSelectedStore = localStorage.getItem('last_selected_store');
    
    if (lastSelectedStore) {
      const { storeId } = JSON.parse(lastSelectedStore);
      
      // If we have a previously selected store, restore that selection
      if (storeId && parsedStores.some(store => store.id === storeId)) {
        return parsedStores.map(store => ({
          ...store,
          isSelected: store.id === storeId
        }));
      }
    }
    
    return parsedStores;
  } catch (error) {
    console.error("Error ensuring store selection persistence:", error);
    return [];
  }
};

// Refresh store statistics from Wildberries API
export const refreshStoreStats = async (store: Store): Promise<Store | null> => {
  try {
    const stats = await getWildberriesStats(store.apiKey);
    if (!stats) return null;
    
    const updatedStore = {
      ...store,
      lastFetchDate: new Date().toISOString(),
      stats
    };
    
    // Save the updated stats to localStorage
    const statsKey = `${STATS_STORAGE_KEY}_${store.id}`;
    localStorage.setItem(statsKey, JSON.stringify(stats));
    
    // Update the store in API if user is logged in
    const userId = getUserId();
    if (userId) {
      try {
        await axios.put(`${API_BASE_URL}/api/user-stores/${store.id}`, {
          userId,
          lastFetchDate: updatedStore.lastFetchDate
        });
      } catch (error) {
        console.error(`Error updating store ${store.id} lastFetchDate:`, error);
      }
    }
    
    return updatedStore;
  } catch (error) {
    console.error('Error refreshing store stats:', error);
    return null;
  }
};

// Validate API key with Wildberries
export const validateApiKey = async (apiKey: string): Promise<{isValid: boolean; errorMessage?: string}> => {
  try {
    // Attempt to fetch data with the API key
    const stats = await getWildberriesStats(apiKey);
    
    // If we got data back, the key is valid
    if (stats) {
      return { isValid: true };
    }
    
    return { 
      isValid: false, 
      errorMessage: "API ключ не прошел проверку. Нет доступа к данным."
    };
  } catch (error) {
    console.error("Error validating API key:", error);
    
    // Handle specific error messages if available
    let errorMessage = "API ключ не прошел проверку. Пожалуйста, проверьте корректность ключа.";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      isValid: false,
      errorMessage
    };
  }
};

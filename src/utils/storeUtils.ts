
import { Store, NewStore, STATS_STORAGE_KEY, WildberriesOrder, WildberriesSale } from "@/types/store";
import { fetchWildberriesStats, fetchWildberriesOrders, fetchWildberriesSales } from "@/services/wildberriesApi";
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
    const stats = await fetchWildberriesStats(store.apiKey, new Date(new Date().setDate(new Date().getDate() - 7)), new Date());
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
    const stats = await fetchWildberriesStats(apiKey, new Date(new Date().setDate(new Date().getDate() - 7)), new Date());
    
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

// Get analytics data for a store
export const getAnalyticsData = (storeId: string): any => {
  try {
    const analyticsData = localStorage.getItem(`marketplace_analytics_${storeId}`);
    if (!analyticsData) return null;
    
    return JSON.parse(analyticsData);
  } catch (error) {
    console.error(`Error getting analytics data for store ${storeId}:`, error);
    return null;
  }
};

// Get selected store
export const getSelectedStore = (): { id: string; apiKey: string } | null => {
  try {
    const stores = localStorage.getItem('stores');
    if (!stores) return null;
    
    const parsedStores = JSON.parse(stores) as Store[];
    const selectedStore = parsedStores.find(store => store.isSelected);
    
    if (!selectedStore) return null;
    
    return { 
      id: selectedStore.id, 
      apiKey: selectedStore.apiKey 
    };
  } catch (error) {
    console.error("Error getting selected store:", error);
    return null;
  }
};

// Get product profitability data
export const getProductProfitabilityData = (storeId: string): any => {
  try {
    const profitabilityData = localStorage.getItem(`product_profitability_${storeId}`);
    if (!profitabilityData) {
      // Fallback to analytics data to extract profitable products
      const analyticsData = getAnalyticsData(storeId);
      if (!analyticsData || !analyticsData.data) return null;
      
      return {
        profitableProducts: analyticsData.data.topProfitableProducts || [],
        unprofitableProducts: analyticsData.data.topUnprofitableProducts || [],
        updateDate: analyticsData.timestamp ? new Date(analyticsData.timestamp).toISOString() : new Date().toISOString()
      };
    }
    
    return JSON.parse(profitabilityData);
  } catch (error) {
    console.error(`Error getting product profitability data for store ${storeId}:`, error);
    return null;
  }
};

// Get orders data
export const getOrdersData = async (storeId: string): Promise<any> => {
  try {
    const ordersData = localStorage.getItem(`orders_data_${storeId}`);
    if (!ordersData) return null;
    
    return JSON.parse(ordersData);
  } catch (error) {
    console.error(`Error getting orders data for store ${storeId}:`, error);
    return null;
  }
};

// Get sales data
export const getSalesData = async (storeId: string): Promise<any> => {
  try {
    const salesData = localStorage.getItem(`sales_data_${storeId}`);
    if (!salesData) return null;
    
    return JSON.parse(salesData);
  } catch (error) {
    console.error(`Error getting sales data for store ${storeId}:`, error);
    return null;
  }
};

// Fetch and update orders
export const fetchAndUpdateOrders = async (store: { id: string, apiKey: string }): Promise<any> => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Fetch orders from API
    const orders = await fetchWildberriesOrders(store.apiKey, oneMonthAgo);
    
    if (orders && orders.length > 0) {
      // Calculate warehouse and region distributions
      const warehouseCounts: Record<string, number> = {};
      const regionCounts: Record<string, number> = {};
      const totalOrders = orders.length;
      
      orders.forEach((order: WildberriesOrder) => {
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
      
      // Save to localStorage
      const ordersData = {
        orders,
        warehouseDistribution,
        regionDistribution,
        updateDate: new Date().toISOString()
      };
      
      localStorage.setItem(`orders_data_${store.id}`, JSON.stringify(ordersData));
      
      return ordersData;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching and updating orders for store ${store.id}:`, error);
    return null;
  }
};

// Fetch and update sales
export const fetchAndUpdateSales = async (store: { id: string, apiKey: string }): Promise<WildberriesSale[] | null> => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    // Fetch sales from API
    const sales = await fetchWildberriesSales(store.apiKey, oneMonthAgo);
    
    if (sales && sales.length > 0) {
      // Save to localStorage
      const salesData = {
        sales,
        updateDate: new Date().toISOString()
      };
      
      localStorage.setItem(`sales_data_${store.id}`, JSON.stringify(salesData));
      
      return sales;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching and updating sales for store ${store.id}:`, error);
    return null;
  }
};

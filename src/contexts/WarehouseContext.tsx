
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses, 
  fetchFullPaidStorageReport,
  getPreferredWarehouses
} from '@/services/suppliesApi';
import { fetchWarehouseRemains } from '@/services/warehouseRemainsApi';
import { fetchAverageDailySalesFromAPI } from '@/components/analytics/data/demoData';
import { 
  WarehouseCoefficient, 
  Warehouse as WBWarehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { Store as StoreType } from '@/types/store';

// Define cache expiration time (30 minutes)
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000;

// Types for the context
interface WarehouseContextType {
  // Warehouse data
  wbWarehouses: WBWarehouse[];
  coefficients: WarehouseCoefficient[];
  warehouseRemains: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  averageDailySales: Record<string, number>;
  dailyStorageCosts: Record<string, number>;
  preferredWarehouses: number[];
  selectedWarehouseId: number | undefined;
  storageCostsCalculated: boolean;
  
  // Loading states
  loading: {
    warehouses: boolean;
    coefficients: boolean;
    remains: boolean;
    paidStorage: boolean;
    averageSales: boolean;
  };
  
  // Methods
  setSelectedWarehouseId: (warehouseId: number | undefined) => void;
  togglePreferredWarehouse: (storeId: string, warehouseId: number) => number[];
  
  // Data fetching methods
  loadWarehouses: (apiKey: string, force?: boolean) => Promise<void>;
  loadCoefficients: (apiKey: string, warehouseId?: number, force?: boolean) => Promise<void>;
  loadWarehouseRemains: (apiKey: string, force?: boolean) => Promise<void>;
  loadPaidStorageData: (apiKey: string, dateFrom?: string, dateTo?: string, force?: boolean) => Promise<void>;
  loadAverageDailySales: (apiKey: string, force?: boolean) => Promise<void>;
  
  // Cache management
  invalidateCache: (storeId: string) => void;
  resetDataForStore: (storeId: string) => void;
}

// Create context
const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

// Cache storage structure
interface DataCache {
  [storeId: string]: {
    wbWarehouses?: {
      data: WBWarehouse[];
      timestamp: number;
    };
    coefficients?: {
      data: WarehouseCoefficient[];
      timestamp: number;
      warehouseId?: number;  // For filtered coefficients
    };
    warehouseRemains?: {
      data: WarehouseRemainItem[];
      timestamp: number;
    };
    paidStorageData?: {
      data: PaidStorageItem[];
      timestamp: number;
      dateRange?: { from: string; to: string };
    };
    averageDailySales?: {
      data: Record<string, number>;
      timestamp: number;
    };
    dailyStorageCosts?: {
      data: Record<string, number>;
      timestamp: number;
    };
    preferredWarehouses?: {
      data: number[];
      timestamp: number;
    };
  };
}

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Data states
  const [wbWarehouses, setWbWarehouses] = useState<WBWarehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [averageDailySales, setAverageDailySales] = useState<Record<string, number>>({});
  const [dailyStorageCosts, setDailyStorageCosts] = useState<Record<string, number>>({});
  const [storageCostsCalculated, setStorageCostsCalculated] = useState(false);
  const [preferredWarehouses, setPreferredWarehouses] = useState<number[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  
  // Loading states
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });
  
  // Cache state
  const [dataCache, setDataCache] = useState<DataCache>({});
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  
  // Helper function to format dates
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Helper to check if cache is valid
  const isCacheValid = (timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_EXPIRATION_TIME;
  };
  
  // Invalidate cache for a store
  const invalidateCache = useCallback((storeId: string) => {
    setDataCache(prev => {
      const newCache = { ...prev };
      delete newCache[storeId];
      return newCache;
    });
  }, []);
  
  // Reset data for a specific store
  const resetDataForStore = useCallback((storeId: string) => {
    if (currentStoreId === storeId) {
      setWbWarehouses([]);
      setCoefficients([]);
      setWarehouseRemains([]);
      setPaidStorageData([]);
      setAverageDailySales({});
      setDailyStorageCosts({});
      setStorageCostsCalculated(false);
      
      // Ensure we maintain preferred warehouses
      const preferred = getPreferredWarehouses(storeId);
      setPreferredWarehouses(preferred);
    }
    
    invalidateCache(storeId);
  }, [currentStoreId, invalidateCache]);
  
  // Real storage costs calculation
  const calculateRealStorageCostsFromAPI = useCallback(() => {
    console.log('[WarehouseContext] Calculating storage costs from API data');
    
    if (warehouseRemains.length === 0 || paidStorageData.length === 0) {
      console.log('[WarehouseContext] Not enough data to calculate storage costs');
      return;
    }
    
    const storageCosts: Record<string, number> = {};
    
    warehouseRemains.forEach(item => {
      const nmId = item.nmId;
      
      const storageItem = paidStorageData.find(
        storage => storage.nmId === nmId
      );
      
      if (storageItem && storageItem.warehousePrice) {
        const dailyCost = storageItem.warehousePrice / 30;
        
        storageCosts[nmId.toString()] = dailyCost;
        storageItem.dailyStorageCost = dailyCost;
        
        console.log(`[WarehouseContext] Found storage cost for item ${nmId}: ${dailyCost.toFixed(2)}`);
      } else {
        const volume = item.volume || 0.001;
        const baseStorageRate = item.category ? 
          calculateCategoryRate(item.category) : 5;
        
        storageCosts[nmId.toString()] = volume * baseStorageRate;
        console.log(`[WarehouseContext] Calculated fallback storage cost for item ${nmId}: ${storageCosts[nmId.toString()].toFixed(2)}`);
      }
    });
    
    console.log('[WarehouseContext] Storage cost calculation complete for', Object.keys(storageCosts).length, 'items');
    setDailyStorageCosts(storageCosts);
    setStorageCostsCalculated(true);
    
    // Update cache if store is set
    if (currentStoreId) {
      setDataCache(prev => ({
        ...prev,
        [currentStoreId]: {
          ...prev[currentStoreId],
          dailyStorageCosts: {
            data: storageCosts,
            timestamp: Date.now()
          }
        }
      }));
    }
  }, [warehouseRemains, paidStorageData, currentStoreId]);
  
  // Calculate storage rates by category
  const calculateCategoryRate = (category: string): number => {
    switch(category.toLowerCase()) {
      case 'обувь':
        return 6.5;
      case 'одежда':
        return 5.8;
      case 'аксессуары':
        return 4.5;
      case 'электроника':
        return 7.2;
      default:
        return 5;
    }
  };
  
  // Toggle preferred warehouse
  const togglePreferredWarehouse = useCallback((storeId: string, warehouseId: number): number[] => {
    try {
      const key = `preferred_warehouses_${storeId}`;
      const existingString = localStorage.getItem(key) || '[]';
      let preferred: number[] = [];
      
      try {
        preferred = JSON.parse(existingString);
        if (!Array.isArray(preferred)) preferred = [];
      } catch (e) {
        preferred = [];
      }
      
      const index = preferred.indexOf(warehouseId);
      if (index >= 0) {
        preferred.splice(index, 1);
      } else {
        preferred.push(warehouseId);
      }
      
      localStorage.setItem(key, JSON.stringify(preferred));
      setPreferredWarehouses(preferred);
      
      // Update cache
      if (currentStoreId === storeId) {
        setDataCache(prev => ({
          ...prev,
          [storeId]: {
            ...prev[storeId],
            preferredWarehouses: {
              data: preferred,
              timestamp: Date.now()
            }
          }
        }));
      }
      
      return preferred;
    } catch (e) {
      console.error('[WarehouseContext] Error toggling preferred warehouse:', e);
      return [];
    }
  }, [currentStoreId]);
  
  // Load warehouses with caching
  const loadWarehouses = useCallback(async (apiKey: string, force: boolean = false) => {
    if (!apiKey || !currentStoreId) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeCache = dataCache[currentStoreId];
    const warehouseCache = storeCache?.wbWarehouses;
    
    // If cache is valid and not forced refresh, use cached data
    if (!force && warehouseCache && isCacheValid(warehouseCache.timestamp)) {
      console.log('[WarehouseContext] Using cached warehouse data');
      setWbWarehouses(warehouseCache.data);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, warehouses: true }));
      const data = await fetchWarehouses(apiKey);
      setWbWarehouses(data);
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        [currentStoreId]: {
          ...prev[currentStoreId],
          wbWarehouses: {
            data,
            timestamp: Date.now()
          }
        }
      }));
    } catch (error) {
      console.error('[WarehouseContext] Error loading warehouses:', error);
      toast.error('Не удалось загрузить список складов');
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  }, [currentStoreId, dataCache]);
  
  // Load coefficients with caching
  const loadCoefficients = useCallback(async (apiKey: string, warehouseId?: number, force: boolean = false) => {
    if (!apiKey || !currentStoreId) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeCache = dataCache[currentStoreId];
    const coeffCache = storeCache?.coefficients;
    
    // If cache is valid, not forced refresh, and warehouse filter matches (or both are undefined), use cached data
    if (!force && coeffCache && isCacheValid(coeffCache.timestamp) && coeffCache.warehouseId === warehouseId) {
      console.log('[WarehouseContext] Using cached coefficients data');
      setCoefficients(coeffCache.data);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, coefficients: true }));
      const data = await fetchAcceptanceCoefficients(
        apiKey, 
        warehouseId ? [warehouseId] : undefined
      );
      setCoefficients(data);
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        [currentStoreId]: {
          ...prev[currentStoreId],
          coefficients: {
            data,
            timestamp: Date.now(),
            warehouseId
          }
        }
      }));
    } catch (error) {
      console.error('[WarehouseContext] Error loading coefficients:', error);
      toast.error('Не удалось загрузить коэффициенты приемки');
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  }, [currentStoreId, dataCache]);
  
  // Load warehouse remains with caching
  const loadWarehouseRemains = useCallback(async (apiKey: string, force: boolean = false) => {
    if (!apiKey || !currentStoreId) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeCache = dataCache[currentStoreId];
    const remainsCache = storeCache?.warehouseRemains;
    
    // If cache is valid and not forced refresh, use cached data
    if (!force && remainsCache && isCacheValid(remainsCache.timestamp)) {
      console.log('[WarehouseContext] Using cached warehouse remains data');
      setWarehouseRemains(remainsCache.data);
      
      // If we also have storage data cached, calculate costs
      if (storeCache?.paidStorageData && storeCache.dailyStorageCosts) {
        setDailyStorageCosts(storeCache.dailyStorageCosts.data);
        setStorageCostsCalculated(true);
      } else {
        setStorageCostsCalculated(false);
      }
      
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, remains: true }));
      toast.info('Запрос на формирование отчета отправлен. Это может занять некоторое время...');
      
      const data = await fetchWarehouseRemains(apiKey, {
        groupByBrand: true,
        groupBySubject: true,
        groupBySa: true,
        groupBySize: true
      });
      
      setWarehouseRemains(data);
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        [currentStoreId]: {
          ...prev[currentStoreId],
          warehouseRemains: {
            data,
            timestamp: Date.now()
          }
        }
      }));
      
      toast.success('Отчет об остатках на складах успешно загружен');
      
      // If we have storage data, calculate costs
      if (paidStorageData.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
    } catch (error: any) {
      console.error('[WarehouseContext] Error loading warehouse remains:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(prev => ({ ...prev, remains: false }));
    }
  }, [currentStoreId, dataCache, paidStorageData.length, calculateRealStorageCostsFromAPI]);
  
  // Load paid storage data with caching
  const loadPaidStorageData = useCallback(async (
    apiKey: string, 
    dateFrom: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: string = new Date().toISOString().split('T')[0],
    force: boolean = false
  ) => {
    if (!apiKey || !currentStoreId) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeCache = dataCache[currentStoreId];
    const storageCache = storeCache?.paidStorageData;
    
    // If cache is valid, not forced refresh, and date range matches, use cached data
    if (
      !force && 
      storageCache && 
      isCacheValid(storageCache.timestamp) && 
      storageCache.dateRange?.from === dateFrom && 
      storageCache.dateRange?.to === dateTo
    ) {
      console.log('[WarehouseContext] Using cached paid storage data');
      setPaidStorageData(storageCache.data);
      
      // If we have storage costs calculated, use them
      if (storeCache?.dailyStorageCosts) {
        setDailyStorageCosts(storeCache.dailyStorageCosts.data);
        setStorageCostsCalculated(true);
      }
      
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, paidStorage: true }));
      toast.info('Запрос отчета о платном хранении. Это может занять некоторое время...');
      
      const data = await fetchFullPaidStorageReport(apiKey, dateFrom, dateTo);
      console.log(`[WarehouseContext] Fetched ${data.length} paid storage records`);
      
      setPaidStorageData(data);
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        [currentStoreId]: {
          ...prev[currentStoreId],
          paidStorageData: {
            data,
            timestamp: Date.now(),
            dateRange: { from: dateFrom, to: dateTo }
          }
        }
      }));
      
      // If we have warehouse remains, calculate costs
      if (warehouseRemains.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
      
      toast.success('Отчет о платном хранении успешно загружен');
    } catch (error: any) {
      console.error('[WarehouseContext] Error loading paid storage data:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(prev => ({ ...prev, paidStorage: false }));
    }
  }, [currentStoreId, dataCache, warehouseRemains.length, calculateRealStorageCostsFromAPI]);
  
  // Load average daily sales with caching
  const loadAverageDailySales = useCallback(async (apiKey: string, force: boolean = false) => {
    if (!apiKey || !currentStoreId) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeCache = dataCache[currentStoreId];
    const salesCache = storeCache?.averageDailySales;
    
    // If cache is valid and not forced refresh, use cached data
    if (!force && salesCache && isCacheValid(salesCache.timestamp)) {
      console.log('[WarehouseContext] Using cached average daily sales data');
      setAverageDailySales(salesCache.data);
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, averageSales: true }));
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const dateFrom = formatDate(thirtyDaysAgo);
      const dateTo = formatDate(now);
      
      console.log(`[WarehouseContext] Requesting average sales data from ${dateFrom} to ${dateTo}`);
      
      const data = await fetchAverageDailySalesFromAPI(apiKey, dateFrom, dateTo);
      console.log('[WarehouseContext] Received average sales data for', Object.keys(data).length, 'products');
      
      // Convert number keys to strings for consistency
      const stringKeyData: Record<string, number> = {};
      Object.entries(data).forEach(([key, value]) => {
        stringKeyData[key.toString()] = value;
      });
      
      setAverageDailySales(stringKeyData);
      
      // Update cache
      setDataCache(prev => ({
        ...prev,
        [currentStoreId]: {
          ...prev[currentStoreId],
          averageDailySales: {
            data: stringKeyData,
            timestamp: Date.now()
          }
        }
      }));
    } catch (error: any) {
      console.error('[WarehouseContext] Error loading average sales:', error);
      generateMockAverageSales();
    } finally {
      setLoading(prev => ({ ...prev, averageSales: false }));
    }
  }, [currentStoreId, dataCache]);
  
  // Generate mock sales data
  const generateMockAverageSales = useCallback(() => {
    const mockSalesData: Record<string, number> = {};
    warehouseRemains.forEach(item => {
      mockSalesData[item.nmId.toString()] = Math.random() * 2;
    });
    setAverageDailySales(mockSalesData);
    
    // Update cache
    if (currentStoreId) {
      setDataCache(prev => ({
        ...prev,
        [currentStoreId]: {
          ...prev[currentStoreId],
          averageDailySales: {
            data: mockSalesData,
            timestamp: Date.now()
          }
        }
      }));
    }
    
    console.log('[WarehouseContext] Using mock data for average sales:', mockSalesData);
  }, [warehouseRemains, currentStoreId]);
  
  // Update currentStoreId when a valid store is selected
  useEffect(() => {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        const activeStore = user.stores?.find((s: any) => s.isSelected);
        
        if (activeStore?.id) {
          console.log('[WarehouseContext] Setting current store ID:', activeStore.id);
          setCurrentStoreId(activeStore.id);
          
          // Load preferred warehouses
          const preferred = getPreferredWarehouses(activeStore.id);
          setPreferredWarehouses(preferred);
          
          // Update cache with preferred warehouses
          setDataCache(prev => ({
            ...prev,
            [activeStore.id]: {
              ...prev[activeStore.id],
              preferredWarehouses: {
                data: preferred,
                timestamp: Date.now()
              }
            }
          }));
        }
      } catch (e) {
        console.error('[WarehouseContext] Error parsing user data:', e);
      }
    }
  }, []);
  
  // Effect for calculating storage costs when both data sets are available
  useEffect(() => {
    if (paidStorageData.length > 0 && warehouseRemains.length > 0 && !storageCostsCalculated) {
      calculateRealStorageCostsFromAPI();
    }
  }, [paidStorageData, warehouseRemains, storageCostsCalculated, calculateRealStorageCostsFromAPI]);
  
  const contextValue: WarehouseContextType = {
    // Data states
    wbWarehouses,
    coefficients,
    warehouseRemains,
    paidStorageData,
    averageDailySales,
    dailyStorageCosts,
    preferredWarehouses,
    selectedWarehouseId,
    storageCostsCalculated,
    
    // Loading states
    loading,
    
    // Methods
    setSelectedWarehouseId,
    togglePreferredWarehouse,
    
    // Data fetching methods
    loadWarehouses,
    loadCoefficients,
    loadWarehouseRemains,
    loadPaidStorageData,
    loadAverageDailySales,
    
    // Cache management
    invalidateCache,
    resetDataForStore
  };
  
  return (
    <WarehouseContext.Provider value={contextValue}>
      {children}
    </WarehouseContext.Provider>
  );
};

// Custom hook to use the warehouse context
export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

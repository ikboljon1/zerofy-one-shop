import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  WarehouseCoefficient, 
  Warehouse as WBWarehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { Store as StoreType } from '@/types/store';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses, 
  fetchFullPaidStorageReport,
  getPreferredWarehouses
} from '@/services/suppliesApi';
import { fetchWarehouseRemains } from '@/services/warehouseRemainsApi';
import { toast } from 'sonner';
import { fetchAverageDailySalesFromAPI } from '@/components/analytics/data/demoData';

interface WarehouseContextType {
  // Data
  wbWarehouses: WBWarehouse[];
  coefficients: WarehouseCoefficient[];
  warehouseRemains: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  preferredWarehouses: number[];
  averageDailySales: Record<number, number>;
  dailyStorageCosts: Record<number, number>;
  storageCostsCalculated: boolean;
  selectedWarehouseId: number | undefined;
  currentStoreId: string | null;
  
  // Loading states
  loading: {
    warehouses: boolean;
    coefficients: boolean;
    remains: boolean;
    paidStorage: boolean;
    averageSales: boolean;
  };
  
  // Functions
  loadWarehouses: (apiKey: string) => Promise<void>;
  loadCoefficients: (apiKey: string, warehouseId?: number) => Promise<void>;
  loadWarehouseRemains: (apiKey: string) => Promise<void>;
  loadPaidStorageData: (apiKey: string, dateFrom?: string, dateTo?: string) => Promise<void>;
  loadAverageDailySales: (apiKey: string) => Promise<void>;
  calculateRealStorageCostsFromAPI: () => void;
  setSelectedWarehouseId: (id: number | undefined) => void;
  refreshData: (apiKey: string, section: 'inventory' | 'supplies' | 'storage') => Promise<void>;
  togglePreferredWarehouse: (storeId: number, warehouseId: number) => number[];
  resetDataCache: () => void;
  setCurrentStoreId: (storeId: string | null) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

interface WarehouseProviderProps {
  children: ReactNode;
}

export const WarehouseProvider: React.FC<WarehouseProviderProps> = ({ children }) => {
  // States
  const [wbWarehouses, setWbWarehouses] = useState<WBWarehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [preferredWarehouses, setPreferredWarehouses] = useState<number[]>([]);
  const [averageDailySales, setAverageDailySales] = useState<Record<number, number>>({});
  const [dailyStorageCosts, setDailyStorageCosts] = useState<Record<number, number>>({});
  const [storageCostsCalculated, setStorageCostsCalculated] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });
  
  // Cache indicators to prevent redundant API calls
  const [dataFetched, setDataFetched] = useState({
    warehouses: false,
    coefficients: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });

  // Reset data cache when switching stores
  const resetDataCache = () => {
    console.log('[WarehouseContext] Resetting data cache');
    setDataFetched({
      warehouses: false,
      coefficients: false,
      remains: false,
      paidStorage: false,
      averageSales: false
    });
    
    // Optionally clear existing data
    setWbWarehouses([]);
    setCoefficients([]);
    setWarehouseRemains([]);
    setPaidStorageData([]);
    setAverageDailySales({});
    setDailyStorageCosts({});
    setStorageCostsCalculated(false);
    setSelectedWarehouseId(undefined);
  };

  // Function to load warehouses if not already loaded
  const loadWarehouses = async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Skip if data is already loaded
    if (dataFetched.warehouses && wbWarehouses.length > 0) {
      console.log('[WarehouseContext] Using cached warehouses data');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, warehouses: true }));
      console.log('[WarehouseContext] Fetching warehouses data from API');
      const data = await fetchWarehouses(apiKey);
      setWbWarehouses(data);
      setDataFetched(prev => ({ ...prev, warehouses: true }));
    } catch (error) {
      console.error('Ошибка при загрузке складов:', error);
      toast.error('Не удалось загрузить список складов');
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  };

  // Function to load coefficients if not already loaded
  const loadCoefficients = async (apiKey: string, warehouseId?: number) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // If requesting data for a specific warehouse, don't use cache
    const shouldUseCache = !warehouseId && dataFetched.coefficients && coefficients.length > 0;
    
    if (shouldUseCache) {
      console.log('[WarehouseContext] Using cached coefficients data');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, coefficients: true }));
      console.log('[WarehouseContext] Fetching coefficients data from API');
      const data = await fetchAcceptanceCoefficients(
        apiKey, 
        warehouseId ? [warehouseId] : undefined
      );
      setCoefficients(data);
      
      if (!warehouseId) {
        setDataFetched(prev => ({ ...prev, coefficients: true }));
      }
    } catch (error) {
      console.error('Ошибка при загрузке коэффициентов:', error);
      toast.error('Не удалось загрузить коэффициенты приемки');
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  };

  // Function to load warehouse remains if not already loaded
  const loadWarehouseRemains = async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Skip if data is already loaded
    if (dataFetched.remains && warehouseRemains.length > 0) {
      console.log('[WarehouseContext] Using cached warehouse remains data');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, remains: true }));
      console.log('[WarehouseContext] Fetching warehouse remains from API');
      toast.info('Запрос на формирование отчета отправлен. Это может занять некоторое время...');
      
      const data = await fetchWarehouseRemains(apiKey, {
        groupByBrand: true,
        groupBySubject: true,
        groupBySa: true,
        groupBySize: true
      });
      
      setWarehouseRemains(data);
      setDataFetched(prev => ({ ...prev, remains: true }));
      toast.success('Отчет об остатках на складах успешно загружен');
      
      if (paidStorageData.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
      
    } catch (error: any) {
      console.error('Ошибка при загрузке остатков на складах:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(prev => ({ ...prev, remains: false }));
    }
  };

  // Function to load paid storage data if not already loaded
  const loadPaidStorageData = async (
    apiKey: string, 
    dateFrom: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: string = new Date().toISOString().split('T')[0]
  ) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Skip if data is already loaded
    if (dataFetched.paidStorage && paidStorageData.length > 0) {
      console.log('[WarehouseContext] Using cached paid storage data');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, paidStorage: true }));
      console.log('[WarehouseContext] Fetching paid storage data from API');
      toast.info('Запрос отчета о платном хранении. Это может занять некоторое время...');
      
      const data = await fetchFullPaidStorageReport(apiKey, dateFrom, dateTo);
      console.log(`[WarehouseContext] Получено ${data.length} записей данных о платном хранении`);
      
      if (data.length > 0) {
        console.log('[WarehouseContext] Пример данных платного хранения:', {
          nmId: data[0].nmId,
          warehousePrice: data[0].warehousePrice,
          volume: data[0].volume,
          barcode: data[0].barcode,
        });
      }
      
      setPaidStorageData(data);
      setDataFetched(prev => ({ ...prev, paidStorage: true }));
      
      if (warehouseRemains.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
      
      toast.success('Отчет о платном хранении успешно загружен');
    } catch (error: any) {
      console.error('Ошибка при загрузке отчета о платном хранении:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(prev => ({ ...prev, paidStorage: false }));
    }
  };

  // Function to load average daily sales if not already loaded
  const loadAverageDailySales = async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Skip if data is already loaded
    if (dataFetched.averageSales && Object.keys(averageDailySales).length > 0) {
      console.log('[WarehouseContext] Using cached average daily sales data');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, averageSales: true }));
      console.log('[WarehouseContext] Fetching average daily sales from API');
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const dateFrom = formatDate(thirtyDaysAgo);
      const dateTo = formatDate(now);
      
      console.log(`[WarehouseContext] Запрашиваем данные о средних продажах с ${dateFrom} по ${dateTo}`);
      
      const data = await fetchAverageDailySalesFromAPI(apiKey, dateFrom, dateTo);
      console.log('[WarehouseContext] Получены данные о средних продажах:', 
                `${Object.keys(data).length} товаров`);
      
      setAverageDailySales(data);
      setDataFetched(prev => ({ ...prev, averageSales: true }));
      
    } catch (error: any) {
      console.error('[WarehouseContext] Ошибка при загрузке средних продаж:', error);
      generateMockAverageSales();
    } finally {
      setLoading(prev => ({ ...prev, averageSales: false }));
    }
  };
  
  // Helper function to format date
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Generate mock sales data if API fails
  const generateMockAverageSales = () => {
    const mockSalesData: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      mockSalesData[item.nmId] = Math.random() * 2;
    });
    setAverageDailySales(mockSalesData);
    setDataFetched(prev => ({ ...prev, averageSales: true }));
    console.log('[WarehouseContext] Используем моковые данные для средних продаж:', mockSalesData);
  };
  
  // Calculate storage costs from API data
  const calculateRealStorageCostsFromAPI = () => {
    console.log('[WarehouseContext] Расчет стоимости хранения на основе данных API');
    
    if (warehouseRemains.length === 0 || paidStorageData.length === 0) {
      console.log('[WarehouseContext] Недостаточно данных для расчета стоимости хранения');
      return;
    }
    
    const storageCosts: Record<number, number> = {};
    
    warehouseRemains.forEach(item => {
      const nmId = item.nmId;
      
      const storageItem = paidStorageData.find(
        storage => storage.nmId === nmId
      );
      
      if (storageItem && storageItem.warehousePrice) {
        const dailyCost = storageItem.warehousePrice / 30;
        
        storageCosts[nmId] = dailyCost;
        storageItem.dailyStorageCost = dailyCost;
        
        console.log(`[WarehouseContext] Для товара ${nmId} найдена стоимость хранения из API: ${dailyCost.toFixed(2)}`);
      } else {
        const volume = item.volume || 0.001;
        const baseStorageRate = item.category ? 
          calculateCategoryRate(item.category) : 5;
        
        storageCosts[nmId] = volume * baseStorageRate;
        console.log(`[WarehouseContext] Для товара ${nmId} стоимость хранения рассчитана (запасной вариант): ${storageCosts[nmId].toFixed(2)}`);
      }
    });
    
    console.log('[WarehouseContext] Расчет стоимости хранения завершен для', Object.keys(storageCosts).length, 'товаров');
    setDailyStorageCosts(storageCosts);
    setStorageCostsCalculated(true);
  };
  
  // Helper function to calculate storage rate by category
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
  
  // Function to toggle preferred warehouse for a store
  const togglePreferredWarehouse = (storeId: number, warehouseId: number): number[] => {
    // Get the current list of preferred warehouses for the store
    const currentPreferred = getPreferredWarehouses(storeId);
    
    // Toggle the warehouse ID in the preferred list
    let newPreferred = [...currentPreferred];
    
    if (newPreferred.includes(warehouseId)) {
      // Remove from preferred if already included
      newPreferred = newPreferred.filter(id => id !== warehouseId);
    } else {
      // Add to preferred if not included
      newPreferred.push(warehouseId);
    }
    
    // Update local storage with new preferred warehouses
    localStorage.setItem(`preferred_warehouses_${storeId}`, JSON.stringify(newPreferred));
    
    // Update state
    setPreferredWarehouses(newPreferred);
    
    return newPreferred;
  };
  
  // Function to refresh all data for a specific section
  const refreshData = async (apiKey: string, section: 'inventory' | 'supplies' | 'storage') => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Reset data fetched flags for the specified section
    if (section === 'inventory') {
      setDataFetched(prev => ({ 
        ...prev, 
        remains: false, 
        averageSales: false, 
        paidStorage: false 
      }));
      
      // Reload data
      await loadWarehouseRemains(apiKey);
      await loadAverageDailySales(apiKey);
      await loadPaidStorageData(apiKey);
      
    } else if (section === 'supplies') {
      setDataFetched(prev => ({ 
        ...prev, 
        warehouses: false, 
        coefficients: false 
      }));
      
      // Reload data
      await loadWarehouses(apiKey);
      await loadCoefficients(apiKey);
      
    } else if (section === 'storage') {
      setDataFetched(prev => ({ 
        ...prev, 
        paidStorage: false 
      }));
      
      // Reload data
      await loadPaidStorageData(apiKey);
    }
  };

  const value = {
    // Data
    wbWarehouses,
    coefficients,
    warehouseRemains,
    paidStorageData,
    preferredWarehouses,
    averageDailySales,
    dailyStorageCosts,
    storageCostsCalculated,
    selectedWarehouseId,
    currentStoreId,
    
    // Loading states
    loading,
    
    // Functions
    loadWarehouses,
    loadCoefficients,
    loadWarehouseRemains,
    loadPaidStorageData,
    loadAverageDailySales,
    calculateRealStorageCostsFromAPI,
    setSelectedWarehouseId,
    refreshData,
    togglePreferredWarehouse,
    resetDataCache,
    setCurrentStoreId
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
};

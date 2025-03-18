
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses, 
  fetchFullPaidStorageReport,
  getPreferredWarehouses,
  togglePreferredWarehouse as apiTogglePreferredWarehouse
} from '@/services/suppliesApi';
import {
  fetchWarehouseRemains
} from '@/services/warehouseRemainsApi';
import { 
  WarehouseCoefficient, 
  Warehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { Store } from '@/types/store';
import { fetchAverageDailySalesFromAPI } from '@/components/analytics/data/demoData';

// Create interface for the context state
interface WarehouseContextState {
  // Data states
  wbWarehouses: Warehouse[];
  coefficients: WarehouseCoefficient[];
  warehouseRemains: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  averageDailySales: Record<number, number>;
  dailyStorageCosts: Record<number, number>;
  preferredWarehouses: number[];
  
  // UI states
  selectedWarehouseId: number | undefined;
  activeTab: string;
  loading: {
    warehouses: boolean;
    coefficients: boolean;
    options: boolean;
    remains: boolean;
    paidStorage: boolean;
    averageSales: boolean;
  };
  storageCostsCalculated: boolean;
  
  // Methods
  setActiveTab: (tab: string) => void;
  handleWarehouseSelect: (warehouseId: number) => void;
  refreshData: (tab?: string, apiKey?: string) => void;
  handleSavePreferredWarehouse: (warehouseId: number, storeId: string) => void;
  calculateRealStorageCostsFromAPI: () => void;
}

const WarehouseContext = createContext<WarehouseContextState | undefined>(undefined);

export const WarehouseProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Data states
  const [wbWarehouses, setWbWarehouses] = useState<Warehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [averageDailySales, setAverageDailySales] = useState<Record<number, number>>({});
  const [dailyStorageCosts, setDailyStorageCosts] = useState<Record<number, number>>({});
  const [preferredWarehouses, setPreferredWarehouses] = useState<number[]>([]);
  
  // UI states
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    options: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });
  const [storageCostsCalculated, setStorageCostsCalculated] = useState(false);

  // Format date helper
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate category storage rate
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

  // Generate mock sales data
  const generateMockAverageSales = useCallback(() => {
    const mockSalesData: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      mockSalesData[item.nmId] = Math.random() * 2;
    });
    setAverageDailySales(mockSalesData);
    console.log('[Warehouses] Используем моковые данные для средних продаж:', mockSalesData);
  }, [warehouseRemains]);

  // Data loading functions
  const loadWarehouses = useCallback(async (apiKey: string) => {
    if (wbWarehouses.length > 0) {
      console.log('[WarehouseContext] Using cached warehouses data');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, warehouses: true }));
      const data = await fetchWarehouses(apiKey);
      setWbWarehouses(data);
    } catch (error) {
      console.error('Ошибка при загрузке складов:', error);
      toast.error('Не удалось загрузить список складов');
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  }, [wbWarehouses]);

  const loadCoefficients = useCallback(async (apiKey: string, warehouseId?: number) => {
    // If we already have coefficients and no specific warehouse is requested, use cache
    if (coefficients.length > 0 && !warehouseId) {
      console.log('[WarehouseContext] Using cached coefficients data');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, coefficients: true }));
      const data = await fetchAcceptanceCoefficients(
        apiKey, 
        warehouseId ? [warehouseId] : undefined
      );
      setCoefficients(data);
    } catch (error) {
      console.error('Ошибка при загрузке коэффициентов:', error);
      toast.error('Не удалось загрузить коэффициенты приемки');
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  }, [coefficients]);

  const loadAverageDailySales = useCallback(async (apiKey: string) => {
    // Use cache if we already have data
    if (Object.keys(averageDailySales).length > 0) {
      console.log('[WarehouseContext] Using cached average sales data');
      return;
    }
    
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, averageSales: true }));
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const dateFrom = formatDate(thirtyDaysAgo);
      const dateTo = formatDate(now);
      
      console.log(`[Warehouses] Запрашиваем данные о средних продажах с ${dateFrom} по ${dateTo}`);
      
      const data = await fetchAverageDailySalesFromAPI(apiKey, dateFrom, dateTo);
      console.log('[Warehouses] Получены данные о средних продажах:', 
                  `${Object.keys(data).length} товаров`);
      
      setAverageDailySales(data);
      
    } catch (error: any) {
      console.error('[Warehouses] Ошибка при загрузке средних продаж:', error);
      generateMockAverageSales();
    } finally {
      setLoading(prev => ({ ...prev, averageSales: false }));
    }
  }, [averageDailySales, generateMockAverageSales]);

  const loadWarehouseRemains = useCallback(async (apiKey: string) => {
    // Use cache if we already have data
    if (warehouseRemains.length > 0) {
      console.log('[WarehouseContext] Using cached warehouse remains data');
      return;
    }
    
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
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
  }, [warehouseRemains, paidStorageData]);

  const loadPaidStorageData = useCallback(async (
    apiKey: string, 
    dateFrom: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: string = new Date().toISOString().split('T')[0]
  ) => {
    // Use cache if we already have data
    if (paidStorageData.length > 0) {
      console.log('[WarehouseContext] Using cached paid storage data');
      return;
    }
    
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, paidStorage: true }));
      toast.info('Запрос отчета о платном хранении. Это может занять некоторое время...');
      
      const data = await fetchFullPaidStorageReport(apiKey, dateFrom, dateTo);
      console.log(`[Warehouses] Получено ${data.length} записей данных о платном хранении`);
      
      if (data.length > 0) {
        console.log('[Warehouses] Пример данных платного хранения:', {
          nmId: data[0].nmId,
          warehousePrice: data[0].warehousePrice,
          volume: data[0].volume,
          barcode: data[0].barcode,
        });
      }
      
      setPaidStorageData(data);
      
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
  }, [paidStorageData, warehouseRemains]);

  // Handler functions
  const handleWarehouseSelect = useCallback((warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
  }, []);

  const handleSavePreferredWarehouse = useCallback((warehouseId: number, storeId: string) => {
    const newPreferred = apiTogglePreferredWarehouse(storeId, warehouseId);
    setPreferredWarehouses(newPreferred);
  }, []);

  const calculateRealStorageCostsFromAPI = useCallback(() => {
    if (storageCostsCalculated) {
      return;
    }
    
    console.log('[Warehouses] Расчет стоимости хранения на основе данных API');
    
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
        
        console.log(`[Warehouses] Для товара ${nmId} найдена стоимость хранения из API: ${dailyCost.toFixed(2)}`);
      } else {
        const volume = item.volume || 0.001;
        const baseStorageRate = item.category ? 
          calculateCategoryRate(item.category) : 5;
        
        storageCosts[nmId] = volume * baseStorageRate;
        console.log(`[Warehouses] Для товара ${nmId} стоимость хранения рассчитана (запасной вариант): ${storageCosts[nmId].toFixed(2)}`);
      }
    });
    
    console.log('[Warehouses] Расчет стоимости хранения завершен для', Object.keys(storageCosts).length, 'товаров');
    setDailyStorageCosts(storageCosts);
    setStorageCostsCalculated(true);
  }, [warehouseRemains, paidStorageData, storageCostsCalculated]);

  // Main refresh function
  const refreshData = useCallback((tab?: string, apiKey?: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const currentTab = tab || activeTab;
    
    if (currentTab === 'inventory') {
      // Clear cache and reload
      setWarehouseRemains([]);
      setAverageDailySales({});
      setPaidStorageData([]);
      setStorageCostsCalculated(false);
      
      loadWarehouseRemains(apiKey);
      loadAverageDailySales(apiKey);
      loadPaidStorageData(apiKey);
    } else if (currentTab === 'supplies') {
      // Clear cache and reload
      setWbWarehouses([]);
      setCoefficients([]);
      
      loadWarehouses(apiKey);
      loadCoefficients(apiKey);
    } else if (currentTab === 'storage') {
      // Clear cache and reload
      setPaidStorageData([]);
      setStorageCostsCalculated(false);
      
      loadPaidStorageData(apiKey);
    }
  }, [
    activeTab, 
    loadWarehouseRemains, 
    loadAverageDailySales, 
    loadPaidStorageData, 
    loadWarehouses, 
    loadCoefficients
  ]);

  // Load preferences for a store
  const loadPreferences = useCallback((storeId: string) => {
    const preferred = getPreferredWarehouses(storeId);
    setPreferredWarehouses(preferred);
  }, []);

  // Initial data loading for selected store
  const loadDataForStore = useCallback((store: Store) => {
    if (!store) return;
    
    loadPreferences(store.id);
    
    if (activeTab === 'supplies') {
      loadWarehouses(store.apiKey);
      loadCoefficients(store.apiKey);
    } else if (activeTab === 'inventory') {
      loadWarehouseRemains(store.apiKey);
      loadAverageDailySales(store.apiKey);
      loadPaidStorageData(store.apiKey);
    } else if (activeTab === 'storage') {
      loadPaidStorageData(store.apiKey);
    }
  }, [
    activeTab, 
    loadWarehouses, 
    loadCoefficients, 
    loadWarehouseRemains, 
    loadAverageDailySales, 
    loadPaidStorageData,
    loadPreferences
  ]);

  // Effect to calculate storage costs when both remains and storage data are loaded
  useEffect(() => {
    if (paidStorageData.length > 0 && warehouseRemains.length > 0 && !storageCostsCalculated) {
      calculateRealStorageCostsFromAPI();
    }
  }, [paidStorageData, warehouseRemains, storageCostsCalculated, calculateRealStorageCostsFromAPI]);

  const contextValue: WarehouseContextState = {
    // Data states
    wbWarehouses,
    coefficients,
    warehouseRemains,
    paidStorageData,
    averageDailySales,
    dailyStorageCosts,
    preferredWarehouses,
    
    // UI states
    selectedWarehouseId,
    activeTab,
    loading,
    storageCostsCalculated,
    
    // Methods
    setActiveTab,
    handleWarehouseSelect,
    refreshData,
    handleSavePreferredWarehouse,
    calculateRealStorageCostsFromAPI
  };

  return (
    <WarehouseContext.Provider value={contextValue}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = (): WarehouseContextState => {
  const context = useContext(WarehouseContext);
  
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  
  return context;
};

// Export a hook to load data for a specific store
export const useLoadWarehouseData = () => {
  const context = useContext(WarehouseContext);
  
  if (!context) {
    throw new Error('useLoadWarehouseData must be used within a WarehouseProvider');
  }
  
  return useCallback((store: Store) => {
    if (!store) return;
    
    const preferred = getPreferredWarehouses(store.id);
    context.preferredWarehouses = preferred;
    
    if (context.activeTab === 'supplies') {
      if (context.wbWarehouses.length === 0) {
        context.refreshData('supplies', store.apiKey);
      }
    } else if (context.activeTab === 'inventory') {
      if (context.warehouseRemains.length === 0) {
        context.refreshData('inventory', store.apiKey);
      }
    } else if (context.activeTab === 'storage') {
      if (context.paidStorageData.length === 0) {
        context.refreshData('storage', store.apiKey);
      }
    }
  }, [context]);
};

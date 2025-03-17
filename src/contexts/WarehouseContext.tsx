
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses, 
  fetchFullPaidStorageReport,
  getPreferredWarehouses,
} from '@/services/suppliesApi';
import { fetchWarehouseRemains } from '@/services/warehouseRemainsApi';
import { fetchAverageDailySalesFromAPI } from '@/components/analytics/data/demoData';
import { 
  WarehouseCoefficient, 
  Warehouse as WBWarehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { Store } from '@/types/store';

interface WarehouseContextType {
  // Data
  wbWarehouses: WBWarehouse[];
  coefficients: WarehouseCoefficient[];
  warehouseRemains: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  selectedWarehouseId: number | undefined;
  preferredWarehouses: number[];
  averageDailySales: Record<number, number>;
  dailyStorageCosts: Record<number, number>;
  storageCostsCalculated: boolean;
  
  // Loading states
  loading: {
    warehouses: boolean;
    coefficients: boolean;
    options: boolean;
    remains: boolean;
    paidStorage: boolean;
    averageSales: boolean;
  };
  
  // Actions
  setSelectedWarehouseId: (id: number) => void;
  handleSavePreferredWarehouse: (warehouseId: number) => void;
  loadWarehousesData: (apiKey: string) => void;
  loadCoefficientsData: (apiKey: string, warehouseId?: number) => void;
  loadWarehouseRemainsData: (apiKey: string) => void;
  loadPaidStorageData: (apiKey: string, dateFrom?: string, dateTo?: string) => void;
  loadAverageDailySalesData: (apiKey: string) => void;
  calculateRealStorageCostsFromAPI: () => void;
  generateMockAverageSales: () => void;
  refreshStoreData: (store: Store | null, activeTab: string) => void;
  resetAllData: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wbWarehouses, setWbWarehouses] = useState<WBWarehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [preferredWarehouses, setPreferredWarehouses] = useState<number[]>([]);
  const [averageDailySales, setAverageDailySales] = useState<Record<number, number>>({});
  const [dailyStorageCosts, setDailyStorageCosts] = useState<Record<number, number>>({});
  const [storageCostsCalculated, setStorageCostsCalculated] = useState(false);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    options: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const resetAllData = useCallback(() => {
    setWbWarehouses([]);
    setCoefficients([]);
    setWarehouseRemains([]);
    setPaidStorageData([]);
    setAverageDailySales({});
    setDailyStorageCosts({});
    setStorageCostsCalculated(false);
  }, []);

  const loadWarehousesData = useCallback(async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
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
  }, []);

  const loadCoefficientsData = useCallback(async (apiKey: string, warehouseId?: number) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
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
  }, []);

  const loadWarehouseRemainsData = useCallback(async (apiKey: string) => {
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
  }, [paidStorageData]);

  const loadPaidStorageData = useCallback(async (
    apiKey: string, 
    dateFrom: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: string = new Date().toISOString().split('T')[0]
  ) => {
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
  }, [warehouseRemains]);

  const loadAverageDailySalesData = useCallback(async (apiKey: string) => {
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
  }, []);

  const calculateRealStorageCostsFromAPI = useCallback(() => {
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
  }, [warehouseRemains, paidStorageData]);

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

  const generateMockAverageSales = useCallback(() => {
    const mockSalesData: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      mockSalesData[item.nmId] = Math.random() * 2;
    });
    setAverageDailySales(mockSalesData);
    console.log('[Warehouses] Используем моковые данные для средних продаж:', mockSalesData);
  }, [warehouseRemains]);

  const handleSavePreferredWarehouse = useCallback((warehouseId: number) => {
    if (!currentStoreId) return;
    
    const newPreferred = getPreferredWarehouses(currentStoreId);
    const index = newPreferred.indexOf(warehouseId);
    
    if (index === -1) {
      newPreferred.push(warehouseId);
    } else {
      newPreferred.splice(index, 1);
    }
    
    localStorage.setItem(`preferred_warehouses_${currentStoreId}`, JSON.stringify(newPreferred));
    setPreferredWarehouses(newPreferred);
  }, [currentStoreId]);

  const refreshStoreData = useCallback((store: Store | null, activeTab: string) => {
    if (!store) return;
    
    console.log(`[Warehouses] Refreshing data for store: ${store.name}, tab: ${activeTab}`);
    
    // Update the current store ID
    if (store.id !== currentStoreId) {
      console.log(`[Warehouses] Detected store change to: ${store.name} (was: ${currentStoreId})`);
      setCurrentStoreId(store.id);
      
      // Reset data when changing stores
      resetAllData();
      
      // Get preferred warehouses for this store
      const preferred = getPreferredWarehouses(store.id);
      setPreferredWarehouses(preferred);
    }
    
    if (activeTab === 'supplies') {
      loadWarehousesData(store.apiKey);
      loadCoefficientsData(store.apiKey);
    } else if (activeTab === 'inventory') {
      loadWarehouseRemainsData(store.apiKey);
      loadAverageDailySalesData(store.apiKey);
      loadPaidStorageData(store.apiKey);
    } else if (activeTab === 'storage') {
      loadPaidStorageData(store.apiKey);
    }
  }, [
    currentStoreId, 
    loadWarehousesData, 
    loadCoefficientsData, 
    loadWarehouseRemainsData, 
    loadAverageDailySalesData, 
    loadPaidStorageData,
    resetAllData
  ]);

  const value = {
    // Data
    wbWarehouses,
    coefficients,
    warehouseRemains,
    paidStorageData,
    selectedWarehouseId,
    preferredWarehouses,
    averageDailySales,
    dailyStorageCosts,
    storageCostsCalculated,
    
    // Loading states
    loading,
    
    // Actions
    setSelectedWarehouseId,
    handleSavePreferredWarehouse,
    loadWarehousesData,
    loadCoefficientsData,
    loadWarehouseRemainsData,
    loadPaidStorageData,
    loadAverageDailySalesData,
    calculateRealStorageCostsFromAPI,
    generateMockAverageSales,
    refreshStoreData,
    resetAllData
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

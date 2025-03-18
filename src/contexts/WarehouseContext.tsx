
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses, 
  fetchFullPaidStorageReport,
  getPreferredWarehouses,
  togglePreferredWarehouse as apiTogglePreferredWarehouse
} from '@/services/suppliesApi';
import { fetchWarehouseRemains } from '@/services/warehouseRemainsApi';
import { fetchAverageDailySalesFromAPI } from '@/components/analytics/data/demoData';
import { 
  WarehouseCoefficient, 
  Warehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { Store } from '@/types/store';
import { ensureStoreSelectionPersistence } from '@/utils/storeUtils';

interface WarehouseContextProps {
  // Данные
  wbWarehouses: Warehouse[];
  coefficients: WarehouseCoefficient[];
  warehouseRemains: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  preferredWarehouses: number[];
  averageDailySales: Record<number, number>;
  dailyStorageCosts: Record<number, number>;
  selectedWarehouseId: number | undefined;
  selectedStore: Store | null;
  
  // Состояния загрузки
  loading: {
    warehouses: boolean;
    coefficients: boolean;
    remains: boolean;
    paidStorage: boolean;
    averageSales: boolean;
  };
  
  // Флаги
  storageCostsCalculated: boolean;
  
  // Методы
  loadWarehouses: (apiKey: string) => Promise<void>;
  loadCoefficients: (apiKey: string, warehouseId?: number) => Promise<void>;
  loadWarehouseRemains: (apiKey: string) => Promise<void>;
  loadPaidStorageData: (apiKey: string, dateFrom?: string, dateTo?: string) => Promise<void>;
  loadAverageDailySales: (apiKey: string) => Promise<void>;
  handleWarehouseSelect: (warehouseId: number) => void;
  handleSavePreferredWarehouse: (warehouseId: number) => void;
  refreshData: (activeTab: string) => void;
  calculateRealStorageCostsFromAPI: () => void;
}

const WarehouseContext = createContext<WarehouseContextProps | undefined>(undefined);

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
  // Состояния данных
  const [wbWarehouses, setWbWarehouses] = useState<Warehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [preferredWarehouses, setPreferredWarehouses] = useState<number[]>([]);
  const [averageDailySales, setAverageDailySales] = useState<Record<number, number>>({});
  const [dailyStorageCosts, setDailyStorageCosts] = useState<Record<number, number>>({});
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  // Состояния загрузки
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });
  
  // Флаги
  const [storageCostsCalculated, setStorageCostsCalculated] = useState(false);
  
  // Кеширование
  const [cachedData, setCachedData] = useState({
    warehouses: false,
    coefficients: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });

  // Эффект первичной загрузки
  useEffect(() => {
    const stores = ensureStoreSelectionPersistence();
    const selected = stores.find(store => store.isSelected);
    
    if (selected) {
      setSelectedStore(selected);
      const preferred = getPreferredWarehouses(selected.id);
      setPreferredWarehouses(preferred);
    } else if (stores.length > 0) {
      setSelectedStore(stores[0]);
    }
  }, []);

  // Функция расчета стоимости хранения
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

  // Форматирование даты
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Загрузка складов с API
  const loadWarehouses = async (apiKey: string) => {
    // Если данные уже загружены, не делаем повторный запрос
    if (cachedData.warehouses && wbWarehouses.length > 0) {
      console.log('[WarehouseContext] Используем кешированные данные складов');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, warehouses: true }));
      const data = await fetchWarehouses(apiKey);
      setWbWarehouses(data);
      setCachedData(prev => ({ ...prev, warehouses: true }));
    } catch (error) {
      console.error('[WarehouseContext] Ошибка при загрузке складов:', error);
      toast.error('Не удалось загрузить список складов');
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  };

  // Загрузка коэффициентов с API
  const loadCoefficients = async (apiKey: string, warehouseId?: number) => {
    // Если данные уже загружены и не указан конкретный склад, используем кеш
    if (cachedData.coefficients && coefficients.length > 0 && !warehouseId) {
      console.log('[WarehouseContext] Используем кешированные данные коэффициентов');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, coefficients: true }));
      const data = await fetchAcceptanceCoefficients(
        apiKey, 
        warehouseId ? [warehouseId] : undefined
      );
      setCoefficients(data);
      setCachedData(prev => ({ ...prev, coefficients: true }));
    } catch (error) {
      console.error('[WarehouseContext] Ошибка при загрузке коэффициентов:', error);
      toast.error('Не удалось загрузить коэффициенты приемки');
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  };

  // Выбор склада
  const handleWarehouseSelect = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    
    if (selectedStore) {
      loadCoefficients(selectedStore.apiKey, warehouseId);
    }
  };

  // Сохранение предпочтительного склада
  const handleSavePreferredWarehouse = (warehouseId: number) => {
    if (!selectedStore) return;
    
    const newPreferred = apiTogglePreferredWarehouse(selectedStore.id.toString(), warehouseId);
    setPreferredWarehouses(newPreferred);
  };

  // Загрузка остатков на складах
  const loadWarehouseRemains = async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Если данные уже загружены, не делаем повторный запрос
    if (cachedData.remains && warehouseRemains.length > 0) {
      console.log('[WarehouseContext] Используем кешированные данные остатков');
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
      setCachedData(prev => ({ ...prev, remains: true }));
      toast.success('Отчет об остатках на складах успешно загружен');
      
      if (paidStorageData.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
      
    } catch (error: any) {
      console.error('[WarehouseContext] Ошибка при загрузке остатков на складах:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(prev => ({ ...prev, remains: false }));
    }
  };

  // Загрузка данных о платном хранении
  const loadPaidStorageData = async (
    apiKey: string, 
    dateFrom: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: string = new Date().toISOString().split('T')[0]
  ) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Если данные уже загружены, не делаем повторный запрос
    if (cachedData.paidStorage && paidStorageData.length > 0) {
      console.log('[WarehouseContext] Используем кешированные данные платного хранения');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, paidStorage: true }));
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
      setCachedData(prev => ({ ...prev, paidStorage: true }));
      
      if (warehouseRemains.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
      
      toast.success('Отчет о платном хранении успешно загружен');
    } catch (error: any) {
      console.error('[WarehouseContext] Ошибка при загрузке отчета о платном хранении:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(prev => ({ ...prev, paidStorage: false }));
    }
  };

  // Загрузка данных о средних продажах
  const loadAverageDailySales = async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Если данные уже загружены, не делаем повторный запрос
    if (cachedData.averageSales && Object.keys(averageDailySales).length > 0) {
      console.log('[WarehouseContext] Используем кешированные данные средних продаж');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, averageSales: true }));
      
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
      setCachedData(prev => ({ ...prev, averageSales: true }));
      
    } catch (error: any) {
      console.error('[WarehouseContext] Ошибка при загрузке средних продаж:', error);
      generateMockAverageSales();
    } finally {
      setLoading(prev => ({ ...prev, averageSales: false }));
    }
  };

  // Генерация моковых данных о продажах
  const generateMockAverageSales = () => {
    const mockSalesData: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      mockSalesData[item.nmId] = Math.random() * 2;
    });
    setAverageDailySales(mockSalesData);
    setCachedData(prev => ({ ...prev, averageSales: true }));
    console.log('[WarehouseContext] Используем моковые данные для средних продаж:', mockSalesData);
  };

  // Обновление всех данных
  const refreshData = (activeTab: string) => {
    if (!selectedStore) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // При принудительном обновлении сбрасываем статус кеширования
    setCachedData({
      warehouses: false,
      coefficients: false,
      remains: false,
      paidStorage: false,
      averageSales: false
    });
    
    if (activeTab === 'inventory') {
      loadWarehouseRemains(selectedStore.apiKey);
      loadAverageDailySales(selectedStore.apiKey);
      loadPaidStorageData(selectedStore.apiKey);
    } else if (activeTab === 'supplies') {
      loadWarehouses(selectedStore.apiKey);
      loadCoefficients(selectedStore.apiKey);
    } else if (activeTab === 'storage') {
      loadPaidStorageData(selectedStore.apiKey);
    }
  };

  const value = {
    wbWarehouses,
    coefficients,
    warehouseRemains,
    paidStorageData,
    preferredWarehouses,
    averageDailySales,
    dailyStorageCosts,
    selectedWarehouseId,
    selectedStore,
    loading,
    storageCostsCalculated,
    loadWarehouses,
    loadCoefficients,
    loadWarehouseRemains,
    loadPaidStorageData,
    loadAverageDailySales,
    handleWarehouseSelect,
    handleSavePreferredWarehouse,
    refreshData,
    calculateRealStorageCostsFromAPI
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
};

export default WarehouseContext;

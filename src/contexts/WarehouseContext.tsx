import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses, 
  fetchFullPaidStorageReport,
  getPreferredWarehouses,
  togglePreferredWarehouse
} from '@/services/suppliesApi';
import {
  fetchWarehouseRemains
} from '@/services/warehouseRemainsApi';
import { 
  WarehouseCoefficient, 
  Warehouse as WBWarehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { toast } from 'sonner';
import { Store as StoreType } from '@/types/store';
import { fetchAverageDailySalesFromAPI } from '@/components/analytics/data/demoData';

interface WarehouseContextType {
  // Данные
  wbWarehouses: WBWarehouse[];
  coefficients: WarehouseCoefficient[];
  warehouseRemains: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  selectedWarehouseId: number | undefined;
  preferredWarehouses: number[];
  averageDailySales: Record<number, number>;
  dailyStorageCosts: Record<number, number>;
  storageCostsCalculated: boolean;
  
  // Состояние загрузки
  loading: {
    warehouses: boolean;
    coefficients: boolean;
    options: boolean;
    remains: boolean;
    paidStorage: boolean;
    averageSales: boolean;
  };
  
  // Функции
  setSelectedWarehouseId: (id: number | undefined) => void;
  loadWarehouses: (apiKey: string) => Promise<void>;
  loadCoefficients: (apiKey: string, warehouseId?: number) => Promise<void>;
  loadWarehouseRemains: (apiKey: string) => Promise<void>;
  loadPaidStorageData: (apiKey: string, dateFrom?: string, dateTo?: string) => Promise<void>;
  loadAverageDailySales: (apiKey: string) => Promise<void>;
  handleSavePreferredWarehouse: (storeId: number, warehouseId: number) => void;
  clearWarehouseData: () => void;
  generateMockAverageSales: () => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wbWarehouses, setWbWarehouses] = useState<WBWarehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [preferredWarehouses, setPreferredWarehouses] = useState<number[]>([]);
  const [averageDailySales, setAverageDailySales] = useState<Record<number, number>>({});
  const [dailyStorageCosts, setDailyStorageCosts] = useState<Record<number, number>>({});
  const [storageCostsCalculated, setStorageCostsCalculated] = useState(false);
  
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    options: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });

  // Очистка данных склада
  const clearWarehouseData = () => {
    setWbWarehouses([]);
    setCoefficients([]);
    setWarehouseRemains([]);
    setPaidStorageData([]);
    setSelectedWarehouseId(undefined);
    setPreferredWarehouses([]);
    setAverageDailySales({});
    setDailyStorageCosts({});
    setStorageCostsCalculated(false);
  };

  // Эффект для расчета стоимости хранения при изменении данных
  useEffect(() => {
    if (paidStorageData.length > 0 && warehouseRemains.length > 0) {
      console.log('[WarehouseContext] Пересчет стоимости хранения из данных API...');
      console.log(`[WarehouseContext] Имеется ${paidStorageData.length} записей о платном хранении`);
      console.log(`[WarehouseContext] Имеется ${warehouseRemains.length} товаров на складах`);
      calculateRealStorageCostsFromAPI();
    }
  }, [paidStorageData, warehouseRemains]);

  // Расчет реальной стоимости хранения на основе данных API
  const calculateRealStorageCostsFromAPI = () => {
    console.log('[WarehouseContext] Расчет стоимости хранения на основе данных API');
    
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
  
  // Расчет ставки на основе категории
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
  
  // Генерация тестовых данных о продажах
  const generateMockAverageSales = () => {
    const mockSalesData: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      // Генерируем разнообразные значения для более реалистичных данных
      mockSalesData[item.nmId] = Math.random() * 5 + 0.1;
    });
    setAverageDailySales(mockSalesData);
    console.log('[WarehouseContext] Используем моковые данные для средних продаж:', 
                `создано ${Object.keys(mockSalesData).length} записей`);
  };
  
  // Форматирование даты для API
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Загрузка данных о складах
  const loadWarehouses = async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, warehouses: true }));
      const data = await fetchWarehouses(apiKey);
      setWbWarehouses(data);
      
      // Сохраняем данные в localStorage
      localStorage.setItem('warehouse_data', JSON.stringify(data));
      localStorage.setItem('warehouse_data_timestamp', Date.now().toString());
      
    } catch (error) {
      console.error('Ошибка при загрузке складов:', error);
      toast.error('Не удалось загрузить список складов');
      
      // Пробуем загрузить из кеша
      const cachedData = localStorage.getItem('warehouse_data');
      if (cachedData) {
        setWbWarehouses(JSON.parse(cachedData));
        toast.info('Загружены кешированные данные о складах');
      }
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  };

  // Загрузка коэффициентов приемки
  const loadCoefficients = async (apiKey: string, warehouseId?: number) => {
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
      
      // Сохраняем данные в localStorage
      const cacheKey = warehouseId ? `coefficients_${warehouseId}` : 'coefficients_all';
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      
    } catch (error) {
      console.error('Ошибка при загрузке коэффициентов:', error);
      toast.error('Не удалось загрузить коэффициенты приемки');
      
      // Пробуем загрузить из кеша
      const cacheKey = warehouseId ? `coefficients_${warehouseId}` : 'coefficients_all';
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setCoefficients(JSON.parse(cachedData));
        toast.info('Загружены кешированные данные о коэффициентах');
      }
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  };

  // Загрузка данных об остатках на складах
  const loadWarehouseRemains = async (apiKey: string) => {
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
      
      // Сохраняем данные в localStorage
      localStorage.setItem('warehouse_remains', JSON.stringify(data));
      localStorage.setItem('warehouse_remains_timestamp', Date.now().toString());
      
    } catch (error: any) {
      console.error('Ошибка при загрузке остатков на складах:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
      
      // Пробуем загрузить из кеша
      const cachedData = localStorage.getItem('warehouse_remains');
      if (cachedData) {
        setWarehouseRemains(JSON.parse(cachedData));
        toast.info('Загружены кешированные данные об остатках');
      }
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
    
    const cacheKey = `paid_storage_${dateFrom}_${dateTo}`;
    
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
      
      // Сохраняем данные в localStorage
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      
      toast.success('Отчет о платном хранении успешно загружен');
    } catch (error: any) {
      console.error('Ошибка при загрузке отчета о платном хранении:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
      
      // Пробуем загрузить из кеша
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setPaidStorageData(JSON.parse(cachedData));
        toast.info('Загружены кешированные данные о платном хранении');
      }
    } finally {
      setLoading(prev => ({ ...prev, paidStorage: false }));
    }
  };

  // Загрузка средних продаж
  const loadAverageDailySales = async (apiKey: string) => {
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
      const cacheKey = `average_sales_${dateFrom}_${dateTo}`;
      
      console.log(`[WarehouseContext] Запрашиваем данные о средних продажах с ${dateFrom} по ${dateTo}`);
      
      const data = await fetchAverageDailySalesFromAPI(apiKey, dateFrom, dateTo);
      console.log('[WarehouseContext] Получены данные о средних продажах:', 
                  `${Object.keys(data).length} товаров`);
      
      setAverageDailySales(data);
      
      // Сохраняем данные в localStorage
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
      
    } catch (error: any) {
      console.error('[WarehouseContext] Ошибка при загрузке средних продаж:', error);
      
      // Пробуем загрузить из кеша
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const dateFrom = formatDate(thirtyDaysAgo);
      const dateTo = formatDate(now);
      const cacheKey = `average_sales_${dateFrom}_${dateTo}`;
      
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        setAverageDailySales(JSON.parse(cachedData));
        toast.info('Загружены кешированные данные о средних продажах');
      } else {
        generateMockAverageSales();
      }
    } finally {
      setLoading(prev => ({ ...prev, averageSales: false }));
    }
  };

  // Обработчик сохранения предпочтительного склада
  const handleSavePreferredWarehouse = (storeId: number, warehouseId: number) => {
    const newPreferred = togglePreferredWarehouse(storeId, warehouseId.toString());
    setPreferredWarehouses(newPreferred);
  };

  // Загрузка кешированных данных при инициализации
  useEffect(() => {
    // Загрузка данных из localStorage при инициализации
    const loadCachedData = () => {
      try {
        const cachedWarehouses = localStorage.getItem('warehouse_data');
        const cachedRemains = localStorage.getItem('warehouse_remains');
        const cachedCoefficients = localStorage.getItem('coefficients_all');
        
        if (cachedWarehouses) {
          setWbWarehouses(JSON.parse(cachedWarehouses));
        }
        
        if (cachedRemains) {
          setWarehouseRemains(JSON.parse(cachedRemains));
        }
        
        if (cachedCoefficients) {
          setCoefficients(JSON.parse(cachedCoefficients));
        }
        
        // Попытка загрузить данные о продажах
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const dateFrom = formatDate(thirtyDaysAgo);
        const dateTo = formatDate(now);
        const cacheKey = `average_sales_${dateFrom}_${dateTo}`;
        
        const cachedSales = localStorage.getItem(cacheKey);
        if (cachedSales) {
          setAverageDailySales(JSON.parse(cachedSales));
        }
        
        console.log('[WarehouseContext] Загружены кешированные данные из localStorage');
      } catch (error) {
        console.error('[WarehouseContext] Ошибка при загрузке кешированных данных:', error);
      }
    };
    
    loadCachedData();
  }, []);

  const value: WarehouseContextType = {
    wbWarehouses,
    coefficients,
    warehouseRemains,
    paidStorageData,
    selectedWarehouseId,
    preferredWarehouses,
    averageDailySales,
    dailyStorageCosts,
    storageCostsCalculated,
    loading,
    setSelectedWarehouseId,
    loadWarehouses,
    loadCoefficients,
    loadWarehouseRemains,
    loadPaidStorageData,
    loadAverageDailySales,
    handleSavePreferredWarehouse,
    clearWarehouseData,
    generateMockAverageSales
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
};

// Хук для использования контекста в компонентах
export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};

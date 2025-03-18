
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  WarehouseCoefficient, 
  Warehouse as WBWarehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses,
  fetchFullPaidStorageReport,
  getPreferredWarehouses,
  togglePreferredWarehouse as togglePreferredWH
} from '@/services/suppliesApi';
import { fetchWarehouseRemains } from '@/services/warehouseRemainsApi';
import { fetchAverageDailySalesFromAPI } from '@/components/analytics/data/demoData';
import { toast } from 'sonner';
import {
  cacheWarehouseData,
  getCachedWarehouseData,
  clearWarehouseCache,
  WB_WAREHOUSES_STORAGE_KEY,
  WB_COEFFICIENTS_STORAGE_KEY,
  WB_REMAINS_STORAGE_KEY,
  WB_PAID_STORAGE_KEY,
  WB_AVG_SALES_STORAGE_KEY
} from '@/utils/storeUtils';

// Типы для контекста
interface WarehouseContextType {
  wbWarehouses: WBWarehouse[];
  coefficients: WarehouseCoefficient[];
  warehouseRemains: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  averageDailySales: Record<number, number>;
  dailyStorageCosts: Record<number, number>;
  preferredWarehouses: number[];
  selectedWarehouseId: number | undefined;
  storageCostsCalculated: boolean;
  loading: {
    warehouses: boolean;
    coefficients: boolean;
    remains: boolean;
    paidStorage: boolean;
    averageSales: boolean;
  };
  setSelectedWarehouseId: (id: number | undefined) => void;
  togglePreferredWarehouse: (storeId: string, warehouseId: number) => number[];
  loadWarehouses: (apiKey: string, forceRefresh?: boolean) => Promise<void>;
  loadCoefficients: (apiKey: string, warehouseId?: number, forceRefresh?: boolean) => Promise<void>;
  loadWarehouseRemains: (apiKey: string, forceRefresh?: boolean) => Promise<void>;
  loadPaidStorageData: (apiKey: string, dateFrom?: string, dateTo?: string, forceRefresh?: boolean) => Promise<void>;
  loadAverageDailySales: (apiKey: string, forceRefresh?: boolean) => Promise<void>;
  resetDataForStore: (storeId: string) => void;
}

// Создаем контекст
const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

// Провайдер контекста
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
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });

  // Вычисление стоимости хранения на основе данных API
  const calculateRealStorageCostsFromAPI = useCallback(() => {
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
  }, [warehouseRemains, paidStorageData]);
  
  // Вспомогательная функция для расчета ставки по категории
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

  // Эффект для вычисления стоимости хранения при изменении данных
  useEffect(() => {
    if (paidStorageData.length > 0 && warehouseRemains.length > 0) {
      console.log('[WarehouseContext] Пересчет стоимости хранения из данных API...');
      console.log(`[WarehouseContext] Имеется ${paidStorageData.length} записей о платном хранении`);
      console.log(`[WarehouseContext] Имеется ${warehouseRemains.length} товаров на складах`);
      calculateRealStorageCostsFromAPI();
    }
  }, [paidStorageData, warehouseRemains, calculateRealStorageCostsFromAPI]);

  // Форматирование даты
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Загрузка списка складов с кешированием
  const loadWarehouses = async (apiKey: string, forceRefresh: boolean = false) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    // Извлекаем storeId из ключа API - обычно в URL или как часть ключа
    const storeId = extractStoreIdFromApiKey(apiKey);
    
    try {
      setLoading(prev => ({ ...prev, warehouses: true }));
      
      // Проверяем кеш, если не требуется принудительное обновление
      if (!forceRefresh) {
        const cachedData = getCachedWarehouseData(storeId, WB_WAREHOUSES_STORAGE_KEY);
        if (cachedData) {
          console.log('[WarehouseContext] Используем кешированные данные о складах');
          setWbWarehouses(cachedData);
          setLoading(prev => ({ ...prev, warehouses: false }));
          return;
        }
      }
      
      console.log('[WarehouseContext] Загрузка данных о складах с API...');
      const data = await fetchWarehouses(apiKey);
      setWbWarehouses(data);
      
      // Кешируем полученные данные
      cacheWarehouseData(storeId, WB_WAREHOUSES_STORAGE_KEY, data);
      
      console.log('[WarehouseContext] Данные о складах успешно загружены и кешированы');
    } catch (error) {
      console.error('[WarehouseContext] Ошибка при загрузке складов:', error);
      toast.error('Не удалось загрузить список складов');
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  };

  // Загрузка коэффициентов приемки с кешированием
  const loadCoefficients = async (apiKey: string, warehouseId?: number, forceRefresh: boolean = false) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeId = extractStoreIdFromApiKey(apiKey);
    const cacheKey = warehouseId 
      ? `${WB_COEFFICIENTS_STORAGE_KEY}_${warehouseId}` 
      : WB_COEFFICIENTS_STORAGE_KEY;
    
    try {
      setLoading(prev => ({ ...prev, coefficients: true }));
      
      // Проверяем кеш, если не требуется принудительное обновление
      if (!forceRefresh) {
        const cachedData = getCachedWarehouseData(storeId, cacheKey);
        if (cachedData) {
          console.log('[WarehouseContext] Используем кешированные данные о коэффициентах');
          setCoefficients(cachedData);
          setLoading(prev => ({ ...prev, coefficients: false }));
          return;
        }
      }
      
      console.log('[WarehouseContext] Загрузка данных о коэффициентах с API...');
      const data = await fetchAcceptanceCoefficients(
        apiKey, 
        warehouseId ? [warehouseId] : undefined
      );
      setCoefficients(data);
      
      // Кешируем полученные данные
      cacheWarehouseData(storeId, cacheKey, data);
      
      console.log('[WarehouseContext] Данные о коэффициентах успешно загружены и кешированы');
    } catch (error) {
      console.error('[WarehouseContext] Ошибка при загрузке коэффициентов:', error);
      toast.error('Не удалось загрузить коэффициенты приемки');
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  };

  // Загрузка остатков на складах с кешированием
  const loadWarehouseRemains = async (apiKey: string, forceRefresh: boolean = false) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeId = extractStoreIdFromApiKey(apiKey);
    
    try {
      setLoading(prev => ({ ...prev, remains: true }));
      
      // Проверяем кеш, если не требуется принудительное обновление
      if (!forceRefresh) {
        const cachedData = getCachedWarehouseData(storeId, WB_REMAINS_STORAGE_KEY);
        if (cachedData) {
          console.log('[WarehouseContext] Используем кешированные данные об остатках');
          setWarehouseRemains(cachedData);
          setLoading(prev => ({ ...prev, remains: false }));
          
          // Рассчитываем стоимость хранения, если у нас есть данные о платном хранении
          if (paidStorageData.length > 0) {
            calculateRealStorageCostsFromAPI();
          }
          
          return;
        }
      }
      
      console.log('[WarehouseContext] Загрузка данных об остатках с API...');
      toast.info('Запрос на формирование отчета отправлен. Это может занять некоторое время...');
      
      const data = await fetchWarehouseRemains(apiKey, {
        groupByBrand: true,
        groupBySubject: true,
        groupBySa: true,
        groupBySize: true
      });
      
      setWarehouseRemains(data);
      
      // Кешируем полученные данные
      cacheWarehouseData(storeId, WB_REMAINS_STORAGE_KEY, data);
      
      toast.success('Отчет об остатках на складах успешно загружен');
      console.log('[WarehouseContext] Данные об остатках успешно загружены и кешированы');
      
      // Рассчитываем стоимость хранения, если у нас есть данные о платном хранении
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

  // Загрузка данных о платном хранении с кешированием
  const loadPaidStorageData = async (
    apiKey: string, 
    dateFrom: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: string = new Date().toISOString().split('T')[0],
    forceRefresh: boolean = false
  ) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeId = extractStoreIdFromApiKey(apiKey);
    const cacheKey = `${WB_PAID_STORAGE_KEY}_${dateFrom}_${dateTo}`;
    
    try {
      setLoading(prev => ({ ...prev, paidStorage: true }));
      
      // Проверяем кеш, если не требуется принудительное обновление
      if (!forceRefresh) {
        const cachedData = getCachedWarehouseData(storeId, cacheKey);
        if (cachedData) {
          console.log('[WarehouseContext] Используем кешированные данные о платном хранении');
          setPaidStorageData(cachedData);
          setLoading(prev => ({ ...prev, paidStorage: false }));
          
          // Рассчитываем стоимость хранения, если у нас есть данные об остатках
          if (warehouseRemains.length > 0) {
            calculateRealStorageCostsFromAPI();
          }
          
          return;
        }
      }
      
      console.log('[WarehouseContext] Загрузка данных о платном хранении с API...');
      toast.info('Запрос отчета о платном хранении. Это может занять некоторое время...');
      
      const data = await fetchFullPaidStorageReport(apiKey, dateFrom, dateTo);
      console.log(`[WarehouseContext] Получено ${data.length} записей данных о платном хранении`);
      
      setPaidStorageData(data);
      
      // Кешируем полученные данные
      cacheWarehouseData(storeId, cacheKey, data);
      
      // Рассчитываем стоимость хранения, если у нас есть данные об остатках
      if (warehouseRemains.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
      
      toast.success('Отчет о платном хранении успешно загружен');
      console.log('[WarehouseContext] Данные о платном хранении успешно загружены и кешированы');
    } catch (error: any) {
      console.error('[WarehouseContext] Ошибка при загрузке отчета о платном хранении:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(prev => ({ ...prev, paidStorage: false }));
    }
  };

  // Загрузка данных о средних продажах с кешированием
  const loadAverageDailySales = async (apiKey: string, forceRefresh: boolean = false) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    const storeId = extractStoreIdFromApiKey(apiKey);
    
    try {
      setLoading(prev => ({ ...prev, averageSales: true }));
      
      // Проверяем кеш, если не требуется принудительное обновление
      if (!forceRefresh) {
        const cachedData = getCachedWarehouseData(storeId, WB_AVG_SALES_STORAGE_KEY);
        if (cachedData) {
          console.log('[WarehouseContext] Используем кешированные данные о средних продажах');
          setAverageDailySales(cachedData);
          setLoading(prev => ({ ...prev, averageSales: false }));
          return;
        }
      }
      
      console.log('[WarehouseContext] Загрузка данных о средних продажах с API...');
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      const dateFrom = formatDate(thirtyDaysAgo);
      const dateTo = formatDate(now);
      
      const data = await fetchAverageDailySalesFromAPI(apiKey, dateFrom, dateTo);
      console.log('[WarehouseContext] Получены данные о средних продажах:', 
                  `${Object.keys(data).length} товаров`);
      
      setAverageDailySales(data);
      
      // Кешируем полученные данные
      cacheWarehouseData(storeId, WB_AVG_SALES_STORAGE_KEY, data);
      
      console.log('[WarehouseContext] Данные о средних продажах успешно загружены и кешированы');
    } catch (error: any) {
      console.error('[WarehouseContext] Ошибка при загрузке средних продаж:', error);
      generateMockAverageSales();
    } finally {
      setLoading(prev => ({ ...prev, averageSales: false }));
    }
  };

  // Генерация тестовых данных о средних продажах
  const generateMockAverageSales = () => {
    const mockSalesData: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      mockSalesData[item.nmId] = Math.random() * 2;
    });
    setAverageDailySales(mockSalesData);
    console.log('[WarehouseContext] Используем моковые данные для средних продаж:', mockSalesData);
  };

  // Функция для извлечения ID магазина из API ключа
  const extractStoreIdFromApiKey = (apiKey: string): string => {
    // В реальной системе здесь должна быть логика извлечения ID магазина из ключа API
    // Для простоты мы будем использовать хеш ключа API как ID магазина
    return apiKey.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, '');
  };

  // Обработчик выбора предпочтительного склада
  const togglePreferredWarehouse = (storeId: string, warehouseId: number): number[] => {
    const newPreferred = togglePreferredWH(storeId, warehouseId);
    setPreferredWarehouses(newPreferred);
    return newPreferred;
  };

  // Сброс данных для указанного магазина
  const resetDataForStore = (storeId: string) => {
    if (!storeId) return;
    
    // Очищаем кеш для этого магазина
    clearWarehouseCache(storeId);
    
    // Сбрасываем состояние компонентов
    setWbWarehouses([]);
    setCoefficients([]);
    setWarehouseRemains([]);
    setPaidStorageData([]);
    setAverageDailySales({});
    setDailyStorageCosts({});
    setStorageCostsCalculated(false);
    
    console.log(`[WarehouseContext] Сброшены данные для магазина ${storeId}`);
  };

  return (
    <WarehouseContext.Provider
      value={{
        wbWarehouses,
        coefficients,
        warehouseRemains,
        paidStorageData,
        averageDailySales,
        dailyStorageCosts,
        preferredWarehouses,
        selectedWarehouseId,
        storageCostsCalculated,
        loading,
        setSelectedWarehouseId,
        togglePreferredWarehouse,
        loadWarehouses,
        loadCoefficients,
        loadWarehouseRemains,
        loadPaidStorageData,
        loadAverageDailySales,
        resetDataForStore
      }}
    >
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

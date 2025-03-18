
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardListIcon, 
  PackageOpen, 
  RefreshCw, 
  Store, 
  DollarSign,
  Building2,
  HelpCircle,
  Book
} from 'lucide-react';
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
  SupplyForm, 
  WarehouseCoefficientsTable, 
  WarehouseRemains,
  StorageProfitabilityAnalysis,
  PaidStorageCostReport,
  WarehouseCoefficientsCard,
  WarehouseCoefficientsDateCard
} from '@/components/supplies';
import { 
  WarehouseCoefficient, 
  Warehouse as WBWarehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  ensureStoreSelectionPersistence, 
  saveWarehousesToCache, 
  loadWarehousesFromCache, 
  saveCoefficientsToCache, 
  loadCoefficientsFromCache, 
  saveWarehouseRemainsToCache, 
  loadWarehouseRemainsFromCache, 
  savePaidStorageToCache, 
  loadPaidStorageFromCache, 
  saveAverageSalesToCache, 
  loadAverageSalesFromCache, 
  saveStorageCostsToCache, 
  loadStorageCostsFromCache,
  isCacheValid
} from '@/utils/storeUtils';
import { Store as StoreType } from '@/types/store';
import { fetchAverageDailySalesFromAPI } from '@/components/analytics/data/demoData';
import LimitExceededMessage from '@/components/analytics/components/LimitExceededMessage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Warehouses: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [wbWarehouses, setWbWarehouses] = useState<WBWarehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    options: false,
    remains: false,
    paidStorage: false,
    averageSales: false
  });
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [preferredWarehouses, setPreferredWarehouses] = useState<number[]>([]);
  const [averageDailySales, setAverageDailySales] = useState<Record<number, number>>({});
  const [dailyStorageCosts, setDailyStorageCosts] = useState<Record<number, number>>({});
  const [storageCostsCalculated, setStorageCostsCalculated] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(
    localStorage.getItem('warehouses_seen_help') !== 'true'
  );
  const [dataSource, setDataSource] = useState<{
    warehouses: 'api' | 'cache' | 'none';
    coefficients: 'api' | 'cache' | 'none';
    remains: 'api' | 'cache' | 'none';
    paidStorage: 'api' | 'cache' | 'none';
    averageSales: 'api' | 'cache' | 'none';
    storageCosts: 'calculated' | 'cache' | 'none';
  }>({
    warehouses: 'none',
    coefficients: 'none',
    remains: 'none',
    paidStorage: 'none',
    averageSales: 'none',
    storageCosts: 'none'
  });

  useEffect(() => {
    const stores = ensureStoreSelectionPersistence();
    const selected = stores.find(store => store.isSelected);
    
    if (selected) {
      setSelectedStore(selected);
      if (activeTab === 'supplies') {
        loadCachedWarehouses(selected.id);
        loadCachedCoefficients(selected.id);
        const preferred = getPreferredWarehouses(selected.id);
        setPreferredWarehouses(preferred);
      } else if (activeTab === 'inventory') {
        loadCachedWarehouseRemains(selected.id);
        loadCachedAverageDailySales(selected.id);
        loadCachedPaidStorage(selected.id);
        loadCachedStorageCosts(selected.id);
      } else if (activeTab === 'storage') {
        loadCachedPaidStorage(selected.id);
      }
    } else if (stores.length > 0) {
      setSelectedStore(stores[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedStore) {
      if (activeTab === 'supplies') {
        loadCachedWarehouses(selectedStore.id);
        loadCachedCoefficients(selectedStore.id);
        const preferred = getPreferredWarehouses(selectedStore.id);
        setPreferredWarehouses(preferred);
      } else if (activeTab === 'inventory') {
        loadCachedWarehouseRemains(selectedStore.id);
        loadCachedAverageDailySales(selectedStore.id);
        loadCachedPaidStorage(selectedStore.id);
        loadCachedStorageCosts(selectedStore.id);
      } else if (activeTab === 'storage') {
        loadCachedPaidStorage(selectedStore.id);
      }
    }
  }, [activeTab, selectedStore]);

  useEffect(() => {
    if (paidStorageData.length > 0 && warehouseRemains.length > 0) {
      console.log('[Warehouses] Пересчет стоимости хранения из данных API...');
      console.log(`[Warehouses] Имеется ${paidStorageData.length} записей о платном хранении`);
      console.log(`[Warehouses] Имеется ${warehouseRemains.length} товаров на складах`);
      calculateRealStorageCostsFromAPI();
    }
  }, [paidStorageData, warehouseRemains]);

  useEffect(() => {
    if (showHelpGuide) {
      const timer = setTimeout(() => {
        localStorage.setItem('warehouses_seen_help', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHelpGuide]);

  // Функции для загрузки данных из кеша с последующим обновлением из API
  
  const loadCachedWarehouses = (storeId: string) => {
    const cachedData = loadWarehousesFromCache(storeId);
    
    if (cachedData) {
      setWbWarehouses(cachedData.warehouses);
      setDataSource(prev => ({ ...prev, warehouses: 'cache' }));
      
      // Если кеш устарел или пользователь переключился на вкладку, обновим данные
      if (!isCacheValid(cachedData.timestamp) || activeTab === 'supplies') {
        loadWarehouses(selectedStore?.apiKey || '', false);
      }
    } else {
      // Если кеша нет, загружаем с API
      if (selectedStore) {
        loadWarehouses(selectedStore.apiKey, false);
      }
    }
  };
  
  const loadCachedCoefficients = (storeId: string, warehouseId?: number) => {
    const cachedData = loadCoefficientsFromCache(storeId, warehouseId);
    
    if (cachedData) {
      setCoefficients(cachedData.coefficients);
      setDataSource(prev => ({ ...prev, coefficients: 'cache' }));
      
      // Если кеш устарел или пользователь переключился на вкладку, обновим данные
      if (!isCacheValid(cachedData.timestamp) || activeTab === 'supplies') {
        loadCoefficients(selectedStore?.apiKey || '', warehouseId, false);
      }
    } else {
      // Если кеша нет, загружаем с API
      if (selectedStore) {
        loadCoefficients(selectedStore.apiKey, warehouseId, false);
      }
    }
  };
  
  const loadCachedWarehouseRemains = (storeId: string) => {
    const cachedData = loadWarehouseRemainsFromCache(storeId);
    
    if (cachedData) {
      setWarehouseRemains(cachedData.remains);
      setDataSource(prev => ({ ...prev, remains: 'cache' }));
      
      // Если кеш устарел или пользователь переключился на вкладку, обновим данные
      if (!isCacheValid(cachedData.timestamp) || activeTab === 'inventory') {
        loadWarehouseRemains(selectedStore?.apiKey || '', false);
      }
    } else {
      // Если кеша нет, загружаем с API
      if (selectedStore) {
        loadWarehouseRemains(selectedStore.apiKey, false);
      }
    }
  };
  
  const loadCachedPaidStorage = (storeId: string) => {
    const cachedData = loadPaidStorageFromCache(storeId);
    
    if (cachedData) {
      setPaidStorageData(cachedData.paidStorage);
      setDataSource(prev => ({ ...prev, paidStorage: 'cache' }));
      
      // Если кеш устарел или пользователь переключился на вкладку, обновим данные
      if (!isCacheValid(cachedData.timestamp) || 
          activeTab === 'inventory' || 
          activeTab === 'storage') {
        loadPaidStorageData(selectedStore?.apiKey || '', false);
      }
    } else {
      // Если кеша нет, загружаем с API
      if (selectedStore) {
        loadPaidStorageData(selectedStore.apiKey, false);
      }
    }
  };
  
  const loadCachedAverageDailySales = (storeId: string) => {
    const cachedData = loadAverageSalesFromCache(storeId);
    
    if (cachedData) {
      setAverageDailySales(cachedData.averageSales);
      setDataSource(prev => ({ ...prev, averageSales: 'cache' }));
      
      // Если кеш устарел или пользователь переключился на вкладку, обновим данные
      if (!isCacheValid(cachedData.timestamp) || activeTab === 'inventory') {
        loadAverageDailySales(selectedStore?.apiKey || '', false);
      }
    } else {
      // Если кеша нет, загружаем с API
      if (selectedStore) {
        loadAverageDailySales(selectedStore.apiKey, false);
      }
    }
  };
  
  const loadCachedStorageCosts = (storeId: string) => {
    const cachedData = loadStorageCostsFromCache(storeId);
    
    if (cachedData) {
      setDailyStorageCosts(cachedData.storageCosts);
      setStorageCostsCalculated(true);
      setDataSource(prev => ({ ...prev, storageCosts: 'cache' }));
    }
  };

  const loadAverageDailySales = async (apiKey: string, forceRefresh: boolean = true) => {
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
      setDataSource(prev => ({ ...prev, averageSales: 'api' }));
      
      // Сохраняем в кеш только при успешном получении новых данных
      if (selectedStore && Object.keys(data).length > 0) {
        saveAverageSalesToCache(selectedStore.id, data);
      }
      
    } catch (error: any) {
      console.error('[Warehouses] Ошибка при загрузке средних продаж:', error);
      
      // Если принудительное обновление и произошла ошибка, генерируем моковые данные
      if (forceRefresh) {
        generateMockAverageSales();
      } else {
        toast.error('Не удалось обновить данные о средних продажах');
      }
    } finally {
      setLoading(prev => ({ ...prev, averageSales: false }));
    }
  };
  
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
    setDataSource(prev => ({ ...prev, storageCosts: 'calculated' }));
    
    // Сохраняем рассчитанные стоимости в кеш
    if (selectedStore && Object.keys(storageCosts).length > 0) {
      saveStorageCostsToCache(selectedStore.id, storageCosts);
    }
  }, [warehouseRemains, paidStorageData, selectedStore]);
  
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
  
  const generateMockAverageSales = () => {
    const mockSalesData: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      mockSalesData[item.nmId] = Math.random() * 2;
    });
    setAverageDailySales(mockSalesData);
    console.log('[Warehouses] Используем моковые данные для средних продаж:', mockSalesData);
  };
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadWarehouses = async (apiKey: string, forceRefresh: boolean = true) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, warehouses: true }));
      const data = await fetchWarehouses(apiKey);
      setWbWarehouses(data);
      setDataSource(prev => ({ ...prev, warehouses: 'api' }));
      
      // Сохраняем в кеш только при успешном получении новых данных
      if (selectedStore && data.length > 0) {
        saveWarehousesToCache(selectedStore.id, data);
      }
      
      if (forceRefresh) {
        toast.success('Список складов успешно обновлен');
      }
    } catch (error) {
      console.error('Ошибка при загрузке складов:', error);
      
      if (forceRefresh) {
        toast.error('Не удалось загрузить список складов');
      } else {
        // При фоновом обновлении не показываем ошибку пользователю
        console.log('Не удалось обновить список складов в фоновом режиме');
      }
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  };

  const loadCoefficients = async (apiKey: string, warehouseId?: number, forceRefresh: boolean = true) => {
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
      setDataSource(prev => ({ ...prev, coefficients: 'api' }));
      
      // Сохраняем в кеш только при успешном получении новых данных
      if (selectedStore && data.length > 0) {
        saveCoefficientsToCache(selectedStore.id, data, warehouseId);
      }
      
      if (forceRefresh) {
        toast.success('Коэффициенты приемки успешно обновлены');
      }
    } catch (error) {
      console.error('Ошибка при загрузке коэффициентов:', error);
      
      if (forceRefresh) {
        toast.error('Не удалось загрузить коэффициенты приемки');
      } else {
        // При фоновом обновлении не показываем ошибку пользователю
        console.log('Не удалось обновить коэффициенты приемки в фоновом режиме');
      }
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  };

  const handleWarehouseSelect = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    
    if (selectedStore) {
      loadCachedCoefficients(selectedStore.id, warehouseId);
    }
  };

  const handleSavePreferredWarehouse = (warehouseId: number) => {
    if (!selectedStore) return;
    
    const newPreferred = togglePreferredWarehouse(selectedStore.id, warehouseId);
    setPreferredWarehouses(newPreferred);
  };

  const loadWarehouseRemains = async (apiKey: string, forceRefresh: boolean = true) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, remains: true }));
      
      if (forceRefresh) {
        toast.info('Запрос на формирование отчета отправлен. Это может занять некоторое время...');
      }
      
      const data = await fetchWarehouseRemains(apiKey, {
        groupByBrand: true,
        groupBySubject: true,
        groupBySa: true,
        groupBySize: true
      });
      
      setWarehouseRemains(data);
      setDataSource(prev => ({ ...prev, remains: 'api' }));
      
      // Сохраняем в кеш только при успешном получении новых данных
      if (selectedStore && data.length > 0) {
        saveWarehouseRemainsToCache(selectedStore.id, data);
      }
      
      if (forceRefresh) {
        toast.success('Отчет об остатках на складах успешно загружен');
      }
      
      if (paidStorageData.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
      
    } catch (error: any) {
      console.error('Ошибка при загрузке остатков на складах:', error);
      
      if (forceRefresh) {
        toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
      } else {
        // При фоновом обновлении не показываем ошибку пользователю
        console.log('Не удалось обновить отчет об остатках в фоновом режиме');
      }
    } finally {
      setLoading(prev => ({ ...prev, remains: false }));
    }
  };

  const loadPaidStorageData = async (
    apiKey: string, 
    forceRefresh: boolean = true,
    dateFrom: string = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: string = new Date().toISOString().split('T')[0]
  ) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, paidStorage: true }));
      
      if (forceRefresh) {
        toast.info('Запрос отчета о платном хранении. Это может занять некоторое время...');
      }
      
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
      setDataSource(prev => ({ ...prev, paidStorage: 'api' }));
      
      // Сохраняем в кеш только при успешном получении новых данных
      if (selectedStore && data.length > 0) {
        savePaidStorageToCache(selectedStore.id, data);
      }
      
      if (forceRefresh) {
        toast.success('Отчет о платном хранении успешно загружен');
      }
      
      if (warehouseRemains.length > 0) {
        calculateRealStorageCostsFromAPI();
      }
      
    } catch (error: any) {
      console.error('Ошибка при загрузке отчета о платном хранении:', error);
      
      if (forceRefresh) {
        toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
      } else {
        // При фоновом обновлении не показываем ошибку пользователю
        console.log('Не удалось обновить отчет о платном хранении в фоновом режиме');
      }
    } finally {
      setLoading(prev => ({ ...prev, paidStorage: false }));
    }
  };

  const handleRefreshData = () => {
    if (!selectedStore) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    if (activeTab === 'inventory') {
      loadWarehouseRemains(selectedStore.apiKey, true);
      loadAverageDailySales(selectedStore.apiKey, true);
      loadPaidStorageData(selectedStore.apiKey, true);
    } else if (activeTab === 'supplies') {
      loadWarehouses(selectedStore.apiKey, true);
      loadCoefficients(selectedStore.apiKey, undefined, true);
    } else if (activeTab === 'storage') {
      loadPaidStorageData(selectedStore.apiKey, true);
    }
  };

  const renderNoStoreSelected = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Store className="mr-2 h-5 w-5" />
          Выберите магазин
        </CardTitle>
        <CardDescription>
          Для просмотра и управления складами необходимо выбрать магазин в разделе "Магазины"
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <Store className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Для работы с отчетами о складах необходимо выбрать магазин</p>
        <Button 
          className="mt-4"
          variant="outline"
          onClick={() => window.location.href = '/dashboard'}
        >
          Перейти к выбору магазина
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Управление складами и логистикой
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="max-w-xs">
                  Здесь вы управляете запасами, планируете поставки и анализируете затраты на хранение
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h1>
      </div>

      {showHelpGuide && (
        <div className="mb-4">
          <LimitExceededMessage
            title="Руководство по работе со складами"
            message="Здесь вы можете управлять запасами товаров, планировать поставки и анализировать затраты на хранение."
            onRefresh={() => setShowHelpGuide(false)}
            isLoading={false}
          />
        </div>
      )}

      <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="inventory" className="flex items-center justify-center">
            <ClipboardListIcon className="h-4 w-4 mr-2" />
            <span>Инвентарь</span>
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex items-center justify-center">
            <PackageOpen className="h-4 w-4 mr-2" />
            <span>Поставки</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center justify-center">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Хранение</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {!selectedStore ? renderNoStoreSelected() : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div>
                    <h2 className="text-lg font-semibold">Остатки товаров на складах</h2>
                    <p className="text-sm text-muted-foreground">
                      Актуальная информация о количестве товаров
                      {dataSource.remains === 'cache' && !loading.remains && (
                        <span className="text-xs ml-2 text-yellow-500 font-medium">
                          (из кеша)
                        </span>
                      )}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-1">
                          <Book className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-medium">Как работать с разделом "Инвентарь":</p>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>Здесь отображаются все ваши товары на складах Wildberries</li>
                            <li>Таблица показывает количество, стоимость и дневные продажи</li>
                            <li>Анализ рентабельности помогает выявить "залежавшиеся" товары</li>
                            <li>При отсутствии данных API показываются демо-данные</li>
                          </ol>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={loading.remains}
                  className="flex items-center gap-2"
                >
                  {loading.remains ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Обновить данные
                </Button>
              </div>

              {loading.remains && warehouseRemains.length === 0 ? (
                <div className="grid gap-4">
                  <Skeleton className="h-[400px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : (
                <>
                  <WarehouseRemains 
                    data={warehouseRemains} 
                    isLoading={loading.remains} 
                  />
                  
                  <div className="mt-8">
                    {loading.paidStorage && paidStorageData.length === 0 ? (
                      <Skeleton className="h-[400px] w-full" />
                    ) : (
                      <StorageProfitabilityAnalysis 
                        warehouseItems={warehouseRemains}
                        paidStorageData={paidStorageData}
                        averageDailySalesRate={averageDailySales}
                        dailyStorageCost={dailyStorageCosts}
                      />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          {!selectedStore ? renderNoStoreSelected() : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Управление поставками
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Анализ коэффициентов приемки и выбор оптимального склада
                      {dataSource.coefficients === 'cache' && !loading.coefficients && (
                        <span className="text-xs ml-2 text-yellow-500 font-medium">
                          (из кеша)
                        </span>
                      )}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-1">
                          <Book className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-medium">Как работать с разделом "Поставки":</p>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>Используйте форму для ввода параметров планируемой поставки</li>
                            <li>Изучите коэффициенты приемки по дням недели для каждого склада</li>
                            <li>Выбирайте склады с высокими коэффициентами для более быстрой приемки</li>
                            <li>При отсутствии данных API показываются демо-данные</li>
                          </ol>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={loading.warehouses || loading.coefficients}
                  className="flex items-center gap-2"
                >
                  {(loading.warehouses || loading.coefficients) ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Обновить данные
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                  <SupplyForm />
                </div>
                
                <div className="lg:col-span-2">
                  {loading.coefficients && coefficients.length === 0 ? (
                    <Skeleton className="h-[600px] w-full" />
                  ) : (
                    <WarehouseCoefficientsDateCard
                      coefficients={coefficients} 
                      selectedWarehouseId={selectedWarehouseId}
                      title="Коэффициенты приемки по дням"
                      warehouses={wbWarehouses}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          {!selectedStore ? renderNoStoreSelected() : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div>
                    <h2 className="text-lg font-semibold">Отчет о платном хранении</h2>
                    <p className="text-sm text-muted-foreground">
                      Аналитика затрат на хранение товаров
                      {dataSource.paidStorage === 'cache' && !loading.paidStorage && (
                        <span className="text-xs ml-2 text-yellow-500 font-medium">
                          (из кеша)
                        </span>
                      )}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-1">
                          <Book className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-medium">Как работать с разделом "Хранение":</p>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>Здесь отображаются затраты на хранение ваших товаров</li>
                            <li>Анализируйте дневную стоимость хранения каждого товара</li>
                            <li>Сопоставляйте стоимость хранения с прибылью от продаж</li>
                            <li>Выявляйте товары с высокими затратами на хранение</li>
                            <li>При отсутствии данных API показываются демо-данные</li>
                          </ol>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={loading.paidStorage}
                  className="flex items-center gap-2"
                >
                  {loading.paidStorage ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Обновить данные
                </Button>
              </div>

              {loading.paidStorage && paidStorageData.length === 0 ? (
                <Skeleton className="h-[600px] w-full" />
              ) : (
                <PaidStorageCostReport 
                  apiKey={selectedStore.apiKey}
                  storageData={paidStorageData}
                  isLoading={loading.paidStorage}
                  onRefresh={loadPaidStorageData}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Warehouses;

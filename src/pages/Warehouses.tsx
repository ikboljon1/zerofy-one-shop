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
import { ensureStoreSelectionPersistence } from '@/utils/storeUtils';
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

  useEffect(() => {
    const stores = ensureStoreSelectionPersistence();
    const selected = stores.find(store => store.isSelected);
    
    if (selected) {
      setSelectedStore(selected);
      if (activeTab === 'supplies') {
        loadWarehouses(selected.apiKey);
        loadCoefficients(selected.apiKey);
        const preferred = getPreferredWarehouses(selected.id);
        setPreferredWarehouses(preferred);
      } else if (activeTab === 'inventory') {
        loadWarehouseRemains(selected.apiKey);
        loadAverageDailySales(selected.apiKey);
        loadPaidStorageData(selected.apiKey);
      } else if (activeTab === 'storage') {
        loadPaidStorageData(selected.apiKey);
      }
    } else if (stores.length > 0) {
      setSelectedStore(stores[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedStore) {
      if (activeTab === 'supplies') {
        loadWarehouses(selectedStore.apiKey);
        loadCoefficients(selectedStore.apiKey);
        const preferred = getPreferredWarehouses(selectedStore.id);
        setPreferredWarehouses(preferred);
      } else if (activeTab === 'inventory') {
        loadWarehouseRemains(selectedStore.apiKey);
        loadAverageDailySales(selectedStore.apiKey);
        loadPaidStorageData(selectedStore.apiKey);
      } else if (activeTab === 'storage') {
        loadPaidStorageData(selectedStore.apiKey);
      }
    }
  }, [activeTab, selectedStore]);

  // Добавим новый эффект для обработки изменений в выбранном магазине
  useEffect(() => {
    const handleStoreChange = () => {
      const stores = ensureStoreSelectionPersistence();
      const selected = stores.find(store => store.isSelected);
      
      if (selected && (!selectedStore || selected.id !== selectedStore.id)) {
        console.log('[Warehouses] Detected store change to:', selected.name);
        setSelectedStore(selected);
        
        // Сбросим данные при изменении магазина, чтобы не показывать данные от предыдущего магазина
        setWarehouseRemains([]);
        setPaidStorageData([]);
        setAverageDailySales({});
        setDailyStorageCosts({});
        setStorageCostsCalculated(false);
        
        // Загрузим новые данные для выбранного магазина
        if (activeTab === 'inventory') {
          loadWarehouseRemains(selected.apiKey);
          loadAverageDailySales(selected.apiKey);
          loadPaidStorageData(selected.apiKey);
        } else if (activeTab === 'supplies') {
          loadWarehouses(selected.apiKey);
          loadCoefficients(selected.apiKey);
        } else if (activeTab === 'storage') {
          loadPaidStorageData(selected.apiKey);
        }
      }
    };
    
    // Вызываем функцию при монтировании компонента
    handleStoreChange();
    
    // Устанавливаем интервал для проверки изменений в выбранном магазине
    const intervalId = setInterval(handleStoreChange, 2000);
    
    return () => clearInterval(intervalId);
  }, [activeTab]);

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
      
      console.log(`[Warehouses] Запрашиваем данные о средних продажах с ${dateFrom} по ${dateTo} для магазина с API ключом: ${apiKey.substring(0, 5)}...`);
      
      const data = await fetchAverageDailySalesFromAPI(apiKey, dateFrom, dateTo);
      console.log('[Warehouses] Получены данные о средних продажах:', 
                  `${Object.keys(data).length} товаров`);
      
      // Проверяем, что данные были действительно получены
      if (Object.keys(data).length === 0) {
        console.log('[Warehouses] API вернул пустые данные о продажах, используем запасной вариант');
        generateMockAverageSales();
      } else {
        setAverageDailySales(data);
      }
      
    } catch (error: any) {
      console.error('[Warehouses] Ошибка при загрузке средних продаж:', error);
      generateMockAverageSales();
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
  
  const generateMockAverageSales = () => {
    const mockSalesData: Record<number, number> = {};
    
    // Используем более реалистичные значения для моковых данных
    warehouseRemains.forEach(item => {
      // Генерируем число от 0.1 до 5 с одним десятичным знаком
      const randomSales = Math.round((Math.random() * 4.9 + 0.1) * 10) / 10;
      mockSalesData[item.nmId] = randomSales;
      
      console.log(`[Warehouses] Генерируем моковые данные для товара ${item.nmId}: ${randomSales.toFixed(1)} продаж/день`);
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

  const loadWarehouses = async (apiKey: string) => {
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
  };

  const loadCoefficients = async (apiKey: string, warehouseId?: number) => {
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
  };

  const handleWarehouseSelect = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    
    if (selectedStore) {
      loadCoefficients(selectedStore.apiKey, warehouseId);
    }
  };

  const handleSavePreferredWarehouse = (warehouseId: number) => {
    if (!selectedStore) return;
    
    const newPreferred = togglePreferredWarehouse(selectedStore.id, warehouseId);
    setPreferredWarehouses(newPreferred);
  };

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

  const loadPaidStorageData = async (
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
  };

  const handleRefreshData = () => {
    if (!selectedStore) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
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

  // Для StorageProfitabilityAnalysis, добавим обработку случая, когда нет данных о продажах
  const renderAnalysis = () => {
    // Проверим, есть ли данные для анализа
    const hasData = warehouseRemains.length > 0 && 
                   Object.keys(averageDailySales).length > 0;
    
    if (!hasData) {
      return <Card>
        <CardHeader>
          <CardTitle>Анализ рентабельности хранения</CardTitle>
          <CardDescription>Недостаточно данных для анализа</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Дождитесь загрузки данных о товарах и продажах
          </p>
        </CardContent>
      </Card>;
    }
    
    return <StorageProfitabilityAnalysis 
      warehouseItems={warehouseRemains}
      paidStorageData={paidStorageData}
      averageDailySalesRate={averageDailySales}
      dailyStorageCost={dailyStorageCosts}
    />;
  };

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
                    <p className="text-sm text-muted-foreground">Актуальная информация о количестве товаров</p>
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

              {loading.remains ? (
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
                    {loading.paidStorage || loading.averageSales ? (
                      <Skeleton className="h-[400px] w-full" />
                    ) : (
                      renderAnalysis()
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
                  {loading.coefficients ? (
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
                    <p className="text-sm text-muted-foreground">Аналитика затрат на хранение товаров</p>
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

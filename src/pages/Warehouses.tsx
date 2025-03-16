import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardListIcon, 
  PackageOpen, 
  RefreshCw, 
  Store, 
  DollarSign,
  Building2
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
      } else if (activeTab === 'storage') {
        loadPaidStorageData(selectedStore.apiKey);
      }
    }
  }, [activeTab, selectedStore]);

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
      
      console.log(`[Warehouses] Запрашиваем данные о средних продажах с ${dateFrom} по ${dateTo}`);
      
      const data = await fetchAverageDailySalesFromAPI(apiKey, dateFrom, dateTo);
      console.log('[Warehouses] Получены данные о средних продажах:', 
                  `${Object.keys(data).length} товаров`);
      
      setAverageDailySales(data);
      
      calculateRealStorageCosts();
      
    } catch (error: any) {
      console.error('[Warehouses] Ошибка при загрузке средних продаж:', error);
      generateMockAverageSales();
    } finally {
      setLoading(prev => ({ ...prev, averageSales: false }));
    }
  };
  
  const calculateRealStorageCosts = () => {
    const storageCosts: Record<number, number> = {};
    
    warehouseRemains.forEach(item => {
      const volume = item.volume || 0.001;
      const baseStorageRate = 5;
      storageCosts[item.nmId] = volume * baseStorageRate;
    });
    
    setDailyStorageCosts(storageCosts);
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
      
      calculateRealStorageCosts();
      
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
      setPaidStorageData(data);
      
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

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление складами и логистикой</h1>
      </div>

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
                <div>
                  <h2 className="text-lg font-semibold">Остатки товаров на складах</h2>
                  <p className="text-sm text-muted-foreground">Актуальная информация о количестве товаров</p>
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
                    <StorageProfitabilityAnalysis 
                      warehouseItems={warehouseRemains}
                      paidStorageData={paidStorageData}
                      averageDailySalesRate={averageDailySales}
                      dailyStorageCost={dailyStorageCosts}
                      loading={loading.averageSales}
                    />
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
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Управление поставками
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Анализ коэффициентов приемки и выбор оптимального склада
                  </p>
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
                <div>
                  <h2 className="text-lg font-semibold">Отчет о платном хранении</h2>
                  <p className="text-sm text-muted-foreground">Аналитика затрат на хранение товаров</p>
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

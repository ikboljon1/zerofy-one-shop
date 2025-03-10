import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardListIcon, 
  RefreshCw, Store, DollarSign,
  Package, 
  Tag
} from 'lucide-react';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses,
  fetchFullPaidStorageReport
} from '@/services/suppliesApi';
import {
  fetchWarehouseRemains
} from '@/services/warehouseRemainsApi';
import { 
  WarehouseRemains,
  StorageProfitabilityAnalysis,
  PaidStorageCostReport
} from '@/components/supplies';
import { 
  Warehouse as WBWarehouse,
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ensureStoreSelectionPersistence } from '@/utils/storeUtils';
import { Store as StoreType } from '@/types/store';

const Warehouses: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [warehouseActiveTab, setWarehouseActiveTab] = useState('items');
  const [wbWarehouses, setWbWarehouses] = useState<WBWarehouse[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [loading, setLoading] = useState({
    warehouses: false,
    remains: false,
    paidStorage: false
  });
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);

  // Загрузка выбранного магазина из localStorage при монтировании компонента
  useEffect(() => {
    const stores = ensureStoreSelectionPersistence();
    const selected = stores.find(store => store.isSelected);
    
    if (selected) {
      setSelectedStore(selected);
      loadWarehouseRemains(selected.apiKey);
      loadWarehouses(selected.apiKey);
      loadPaidStorageData(selected.apiKey);
    } else if (stores.length > 0) {
      // Если нет выбранного магазина, но есть магазины, выбираем первый
      setSelectedStore(stores[0]);
    }
  }, []);

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

  const loadWarehouseRemains = async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, remains: true }));
      toast.info('Запрос на формирование отчета отправлен. Это может занять некоторое время...');
      
      // Fetch warehouse remains with grouping
      const data = await fetchWarehouseRemains(apiKey, {
        groupByBrand: true,
        groupBySubject: true,
        groupBySa: true,
        groupBySize: true
      });
      
      setWarehouseRemains(data);
      toast.success('Отчет об остатках на складах успешно загружен');
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
    
    loadWarehouseRemains(selectedStore.apiKey);
    loadWarehouses(selectedStore.apiKey);
    loadPaidStorageData(selectedStore.apiKey);
  };

  // Calculate average daily sales rates based on historical data
  const calculateAverageDailySales = () => {
    const result: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      // Mock data - in a real app, this would be calculated from historical sales
      result[item.nmId] = Math.random() * 2; // Random value between 0 and 2
    });
    return result;
  };

  // Calculate daily storage costs
  const calculateDailyStorageCosts = () => {
    const result: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      // Calculate based on item volume and a base rate
      // In a real app, this would come from actual storage costs
      const volume = item.volume || 1;
      result[item.nmId] = volume * 5; // 5 rubles per volume unit per day
    });
    return result;
  };

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление складами и логистикой</h1>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview" className="flex items-center justify-center">
            <ClipboardListIcon className="h-4 w-4 mr-2" />
            <span>Обзор</span>
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center justify-center">
            <Tag className="h-4 w-4 mr-2" />
            <span>Бренды</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center justify-center">
            <Package className="h-4 w-4 mr-2" />
            <span>Категории</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {!selectedStore ? (
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
          ) : (
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

              {/* Inner tabs for inventory section */}
              <Tabs value={warehouseActiveTab} onValueChange={setWarehouseActiveTab} className="space-y-4">
                <TabsList className="w-full max-w-md">
                  <TabsTrigger value="items">Остатки</TabsTrigger>
                  <TabsTrigger value="storage">Хранение</TabsTrigger>
                </TabsList>

                <TabsContent value="items">
                  {loading.remains ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <WarehouseRemains 
                      data={warehouseRemains} 
                      isLoading={loading.remains} 
                    />
                  )}
                </TabsContent>

                <TabsContent value="storage">
                  {loading.paidStorage && paidStorageData.length === 0 ? (
                    <Skeleton className="h-[600px] w-full" />
                  ) : (
                    <>
                      <PaidStorageCostReport 
                        apiKey={selectedStore.apiKey}
                        storageData={paidStorageData}
                        isLoading={loading.paidStorage}
                        onRefresh={() => loadPaidStorageData(selectedStore.apiKey)}
                      />
                      
                      <div className="mt-8">
                        <StorageProfitabilityAnalysis 
                          warehouseItems={warehouseRemains}
                          paidStorageData={paidStorageData}
                          averageDailySalesRate={calculateAverageDailySales()}
                          dailyStorageCost={calculateDailyStorageCosts()}
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </TabsContent>

        <TabsContent value="brands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Распределение по брендам</CardTitle>
              <CardDescription>
                Анализ остатков и продаж в разрезе брендов
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.remains ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <p className="text-muted-foreground text-center py-12">
                  Здесь будет распределение товаров по брендам
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Распределение по категориям</CardTitle>
              <CardDescription>
                Анализ остатков и продаж в разрезе категорий
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading.remains ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <p className="text-muted-foreground text-center py-12">
                  Здесь будет распределение товаров по категориям
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Warehouses;

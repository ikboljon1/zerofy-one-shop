import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardListIcon, 
  Store, 
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchWarehouseRemains } from '@/services/warehouseRemainsApi';
import { fetchFullPaidStorageReport } from '@/services/suppliesApi';
import { 
  WarehouseRemains,
  StorageProfitabilityAnalysis,
  PaidStorageCostReport
} from '@/components/supplies';
import { ensureStoreSelectionPersistence } from '@/utils/storeUtils';
import { Store as StoreType } from '@/types/store';
import { toast } from 'sonner';
import type { WarehouseRemainItem, PaidStorageItem } from '@/types/supplies';

const Warehouses: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [paidStorageData, setPaidStorageData] = useState<PaidStorageItem[]>([]);
  const [loading, setLoading] = useState({
    remains: false,
    paidStorage: false
  });
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);

  useEffect(() => {
    const stores = ensureStoreSelectionPersistence();
    const selected = stores.find(store => store.isSelected);
    
    if (selected) {
      setSelectedStore(selected);
      loadDataForActiveTab(selected.apiKey, activeTab);
    } else if (stores.length > 0) {
      setSelectedStore(stores[0]);
    }
  }, [activeTab]);

  const loadDataForActiveTab = (apiKey: string, tab: string) => {
    if (tab === 'overview') {
      loadWarehouseRemains(apiKey);
    } else if (tab === 'storage') {
      loadPaidStorageData(apiKey);
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

  const loadPaidStorageData = async (apiKey: string) => {
    if (!apiKey) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, paidStorage: true }));
      toast.info('Запрос отчета о платном хранении. Это может занять некоторое время...');
      
      const data = await fetchFullPaidStorageReport(apiKey, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], new Date().toISOString().split('T')[0]);
      setPaidStorageData(data);
      
      toast.success('Отчет о платном хранении успешно загружен');
    } catch (error: any) {
      console.error('Ошибка при загрузке отчета о платном хранении:', error);
      toast.error(`Не удалось загрузить отчет: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(prev => ({ ...prev, paidStorage: false }));
    }
  };

  const calculateAverageDailySales = () => {
    const result: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      result[item.nmId] = Math.random() * 2;
    });
    return result;
  };

  const calculateDailyStorageCosts = () => {
    const result: Record<number, number> = {};
    warehouseRemains.forEach(item => {
      const volume = item.volume || 1;
      result[item.nmId] = volume * 5;
    });
    return result;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (selectedStore) {
      loadDataForActiveTab(selectedStore.apiKey, value);
    }
  };

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление складами и логистикой</h1>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="overview" className="flex items-center justify-center">
            <ClipboardListIcon className="h-4 w-4 mr-2" />
            <span>Обзор</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center justify-center">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Хранение</span>
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
                  onClick={() => loadWarehouseRemains(selectedStore.apiKey)}
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
                      averageDailySalesRate={calculateAverageDailySales()}
                      dailyStorageCost={calculateDailyStorageCosts()}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          {!selectedStore ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Store className="mr-2 h-5 w-5" />
                  Выберите магазин
                </CardTitle>
                <CardDescription>
                  Для просмотра данных о платном хранении необходимо выбрать магазин в разделе "Магазины"
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Store className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Для работы с отчетами о платном хранении необходимо выбрать магазин</p>
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
                  <h2 className="text-lg font-semibold">Отчет о платном хранении</h2>
                  <p className="text-sm text-muted-foreground">Аналитика затрат на хранение товаров</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadPaidStorageData(selectedStore.apiKey)}
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

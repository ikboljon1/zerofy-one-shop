
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardListIcon, 
  PackageOpen, RefreshCw, Store
} from 'lucide-react';
import { 
  fetchAcceptanceCoefficients, 
  fetchWarehouses, 
  fetchAcceptanceOptions,
  fetchStocks,
  processStocksByCategory,
  processStocksByWarehouse
} from '@/services/suppliesApi';
import {
  fetchWarehouseRemains
} from '@/services/warehouseRemainsApi';
import { 
  SupplyForm, 
  WarehouseCoefficientsTable, 
  SupplyOptionsResults,
  WarehouseRemains,
} from '@/components/supplies';
import { 
  SupplyFormData, 
  WarehouseCoefficient, 
  Warehouse as WBWarehouse,
  SupplyOptionsResponse,
  WildberriesStock,
  StocksByCategory,
  StocksByWarehouse,
  WarehouseRemainItem
} from '@/types/supplies';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { loadStores, ensureStoreSelectionPersistence } from '@/utils/storeUtils';
import { Store as StoreType } from '@/types/store';

const Warehouses: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [wbWarehouses, setWbWarehouses] = useState<WBWarehouse[]>([]);
  const [coefficients, setCoefficients] = useState<WarehouseCoefficient[]>([]);
  const [supplyResults, setSupplyResults] = useState<SupplyOptionsResponse | null>(null);
  const [stocks, setStocks] = useState<WildberriesStock[]>([]);
  const [categorySummary, setCategorySummary] = useState<StocksByCategory[]>([]);
  const [warehouseSummary, setWarehouseSummary] = useState<StocksByWarehouse[]>([]);
  const [warehouseRemains, setWarehouseRemains] = useState<WarehouseRemainItem[]>([]);
  const [loading, setLoading] = useState({
    warehouses: false,
    coefficients: false,
    options: false,
    inventory: false,
    remains: false
  });
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);

  // Загрузка выбранного магазина из localStorage при монтировании компонента
  useEffect(() => {
    const stores = ensureStoreSelectionPersistence();
    const selected = stores.find(store => store.isSelected);
    
    if (selected) {
      setSelectedStore(selected);
      // Если есть выбранный магазин, загружаем соответствующие данные
      if (activeTab === 'supplies') {
        loadWarehouses(selected.apiKey);
        loadCoefficients(selected.apiKey);
      } else if (activeTab === 'inventory') {
        loadWarehouseRemains(selected.apiKey);
      }
    } else if (stores.length > 0) {
      // Если нет выбранного магазина, но есть магазины, выбираем первый
      setSelectedStore(stores[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedStore) {
      if (activeTab === 'supplies') {
        loadWarehouses(selectedStore.apiKey);
        loadCoefficients(selectedStore.apiKey);
      } else if (activeTab === 'inventory') {
        loadWarehouseRemains(selectedStore.apiKey);
      }
    }
  }, [activeTab, selectedStore]);

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

  const loadCoefficients = async (apiKey: string) => {
    try {
      setLoading(prev => ({ ...prev, coefficients: true }));
      const data = await fetchAcceptanceCoefficients(apiKey);
      setCoefficients(data);
    } catch (error) {
      console.error('Ошибка при загрузке коэффициентов:', error);
      toast.error('Не удалось загрузить коэффициенты приемки');
    } finally {
      setLoading(prev => ({ ...prev, coefficients: false }));
    }
  };

  const loadInventory = async (apiKey: string) => {
    try {
      setLoading(prev => ({ ...prev, inventory: true }));
      const stocksData = await fetchStocks(apiKey);
      setStocks(stocksData);
      
      // Process the stocks data
      const categoryData = processStocksByCategory(stocksData);
      const warehouseData = processStocksByWarehouse(stocksData);
      
      setCategorySummary(categoryData);
      setWarehouseSummary(warehouseData);
      
      toast.success('Данные об остатках товаров успешно загружены');
    } catch (error) {
      console.error('Ошибка при загрузке остатков:', error);
      toast.error('Не удалось загрузить данные об остатках товаров');
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
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

  const handleSupplySubmit = async (data: SupplyFormData) => {
    if (!selectedStore) {
      toast.error('Выберите магазин для проверки доступности товаров');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, options: true }));
      
      if (!data.selectedWarehouse) {
        toast.error('Выберите склад назначения');
        return;
      }
      
      // Проверка доступности товаров на выбранном складе
      const optionsResponse = await fetchAcceptanceOptions(
        selectedStore.apiKey,
        data.items,
        data.selectedWarehouse
      );
      
      setSupplyResults(optionsResponse);
      
      // Проверка на наличие ошибок
      const hasErrors = optionsResponse.result.some(item => item.isError);
      
      if (hasErrors) {
        toast.warning('Обнаружены проблемы с некоторыми товарами');
      } else {
        toast.success('Все товары доступны для поставки');
      }
    } catch (error) {
      console.error('Ошибка при проверке доступности:', error);
      toast.error('Не удалось проверить доступность товаров');
    } finally {
      setLoading(prev => ({ ...prev, options: false }));
    }
  };

  const handleRefreshData = () => {
    if (!selectedStore) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    if (activeTab === 'inventory') {
      loadWarehouseRemains(selectedStore.apiKey);
    } else if (activeTab === 'supplies') {
      loadWarehouses(selectedStore.apiKey);
      loadCoefficients(selectedStore.apiKey);
    }
  };

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление складами и логистикой</h1>
      </div>

      <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="inventory" className="flex items-center justify-center">
            <ClipboardListIcon className="h-4 w-4 mr-2" />
            <span>Инвентарь</span>
          </TabsTrigger>
          <TabsTrigger value="supplies" className="flex items-center justify-center">
            <PackageOpen className="h-4 w-4 mr-2" />
            <span>Поставки</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
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

              {loading.remains ? (
                <div className="grid gap-4">
                  <Skeleton className="h-[400px] w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </div>
              ) : (
                <WarehouseRemains 
                  data={warehouseRemains} 
                  isLoading={loading.remains} 
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="supplies" className="space-y-4">
          {!selectedStore ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Store className="mr-2 h-5 w-5" />
                  Выберите магазин
                </CardTitle>
                <CardDescription>
                  Для просмотра и управления поставками необходимо выбрать магазин в разделе "Магазины"
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Store className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Для работы с поставками необходимо выбрать магазин</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                {loading.warehouses ? (
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ) : (
                  <SupplyForm 
                    warehouses={wbWarehouses} 
                    onSupplySubmit={handleSupplySubmit} 
                  />
                )}
              </div>
              
              <div className="lg:col-span-2">
                {supplyResults ? (
                  <SupplyOptionsResults 
                    results={supplyResults} 
                    warehouses={wbWarehouses} 
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PackageOpen className="h-5 w-5 mr-2" />
                        Коэффициенты приемки
                      </CardTitle>
                      <CardDescription>
                        Информация о доступности приемки товаров на складах WB
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading.coefficients ? (
                        <div className="space-y-2">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ) : (
                        <WarehouseCoefficientsTable coefficients={coefficients} />
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Warehouses;


import React, { useState, useEffect } from 'react';
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
  SupplyForm, 
  WarehouseCoefficientsTable, 
  WarehouseRemains,
  StorageProfitabilityAnalysis,
  PaidStorageCostReport,
  WarehouseCoefficientsCard,
  WarehouseCoefficientsDateCard
} from '@/components/supplies';
import { Store as StoreType } from '@/types/store';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ensureStoreSelectionPersistence, getSelectedStore } from '@/utils/storeUtils';
import LimitExceededMessage from '@/components/analytics/components/LimitExceededMessage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWarehouse } from '@/contexts/WarehouseContext';

const Warehouses: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [showHelpGuide, setShowHelpGuide] = useState(
    localStorage.getItem('warehouses_seen_help') !== 'true'
  );
  
  // Use our warehouse context
  const {
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
  } = useWarehouse();

  // Combine both loadDataForActiveTab functions into one with an optional forceRefresh parameter
  const loadDataForActiveTab = (store: StoreType, tab: string, forceRefresh: boolean = false) => {
    if (!store || !store.apiKey) {
      console.log("Cannot load data: store or API key is missing", store);
      return;
    }
    
    console.log(`Loading data for ${tab} tab, store: ${store.name} (${store.id}) - force refresh: ${forceRefresh}`);
    
    switch (tab) {
      case 'supplies':
        loadWarehouses(store.apiKey, forceRefresh);
        loadCoefficients(store.apiKey, undefined, forceRefresh);
        break;
      case 'inventory':
        loadWarehouseRemains(store.apiKey, forceRefresh);
        loadAverageDailySales(store.apiKey, forceRefresh);
        loadPaidStorageData(store.apiKey, undefined, undefined, forceRefresh);
        break;
      case 'storage':
        loadPaidStorageData(store.apiKey, undefined, undefined, forceRefresh);
        break;
    }
  };

  // Initialize store and load initial data - running once on component mount
  useEffect(() => {
    console.log("Initializing Warehouses component");
    
    const initializeWithStore = () => {
      // First, try to get the selected store directly using improved getSelectedStore
      const directSelectedStore = getSelectedStore();
      
      if (directSelectedStore) {
        console.log(`Direct selected store found: ${directSelectedStore.name} (${directSelectedStore.id})`);
        setSelectedStore(directSelectedStore);
        
        // Reset data for this store to ensure we don't show stale data
        resetDataForStore(directSelectedStore.id);
        
        // Load data for the current tab
        loadDataForActiveTab(directSelectedStore, activeTab);
        setStoreLoading(false);
        return;
      }
      
      console.log("No direct selected store found, trying fallback method");
      
      // Fallback to the old method if needed
      const stores = ensureStoreSelectionPersistence();
      const selected = stores.find(store => store.isSelected);
      
      if (selected) {
        console.log(`Selected store found from persistence: ${selected.name} (${selected.id})`);
        setSelectedStore(selected);
        
        // Reset data for this store to ensure we don't show stale data
        resetDataForStore(selected.id);
        
        loadDataForActiveTab(selected, activeTab);
      } else if (stores.length > 0) {
        console.log(`No selected store found, using first available: ${stores[0].name}`);
        setSelectedStore(stores[0]);
      } else {
        console.log("No stores found");
      }
      
      setStoreLoading(false);
    };
    
    // Small delay to ensure store data is loaded
    setTimeout(initializeWithStore, 100);
  }, []);

  // Handle tab changes
  useEffect(() => {
    if (selectedStore && !storeLoading) {
      loadDataForActiveTab(selectedStore, activeTab);
    }
  }, [activeTab]);

  // Listen for store selection changes
  useEffect(() => {
    const handleStoreUpdate = () => {
      console.log("Store selection changed, updating Warehouses component");
      const updatedStore = getSelectedStore();
      if (updatedStore && (!selectedStore || updatedStore.id !== selectedStore.id)) {
        console.log(`Updating selected store to: ${updatedStore.name} (${updatedStore.id})`);
        setSelectedStore(updatedStore);
        
        // Reset data for this store to ensure fresh data
        resetDataForStore(updatedStore.id);
        
        // Load data for current tab
        loadDataForActiveTab(updatedStore, activeTab);
      }
    };
    
    // Listen for store-updated event
    window.addEventListener('stores-updated', handleStoreUpdate);
    
    return () => {
      window.removeEventListener('stores-updated', handleStoreUpdate);
    };
  }, [selectedStore, activeTab]);

  // Hide help guide after timeout
  useEffect(() => {
    if (showHelpGuide) {
      const timer = setTimeout(() => {
        localStorage.setItem('warehouses_seen_help', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showHelpGuide]);

  const handleWarehouseSelect = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    
    if (selectedStore) {
      loadCoefficients(selectedStore.apiKey, warehouseId);
    }
  };

  const handleSavePreferredWarehouse = (warehouseId: number) => {
    if (!selectedStore) return;
    
    togglePreferredWarehouse(selectedStore.id, warehouseId);
  };

  const handleRefreshData = () => {
    if (!selectedStore) {
      toast.warning('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    loadDataForActiveTab(selectedStore, activeTab, true);
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

      {storeLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : (
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
                      {loading.paidStorage ? (
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

                <div className="mt-4">
                  {loading.paidStorage ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : (
                    <PaidStorageCostReport
                      data={paidStorageData}
                      isLoading={loading.paidStorage}
                    />
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Warehouses;

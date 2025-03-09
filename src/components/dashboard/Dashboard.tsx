import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  loadStores,
  getOrdersData, 
  getSalesData, 
  fetchAndUpdateOrders, 
  fetchAndUpdateSales,
  ensureStoreSelectionPersistence,
  getSelectedStore
} from "@/utils/storeUtils";
import OrdersTable from "./OrdersTable";
import SalesTable from "./SalesTable";
import GeographySection from "./GeographySection";
import Stats from "@/components/Stats";
import PeriodSelector, { Period } from "./PeriodSelector";
import { WildberriesOrder, WildberriesSale } from "@/types/store";
import OrderMetrics from "./OrderMetrics";
import SalesMetrics from "./SalesMetrics";
import OrdersChart from "./OrdersChart";
import SalesChart from "./SalesChart";
import TipsSection from "./TipsSection";
import AIDashboardSection from "@/components/ai-analysis/AIDashboardSection";

const Dashboard = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState<Period>("today");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<WildberriesOrder[]>([]);
  const [sales, setSales] = useState<WildberriesSale[]>([]);
  const [warehouseDistribution, setWarehouseDistribution] = useState<any[]>([]);
  const [regionDistribution, setRegionDistribution] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const filterDataByPeriod = (date: string, period: Period) => {
    const now = new Date();
    const itemDate = new Date(date);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    switch (period) {
      case "today":
        return itemDate >= todayStart;
      case "yesterday":
        return itemDate >= yesterdayStart && itemDate < todayStart;
      case "week":
        const weekAgo = new Date(todayStart);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      case "2weeks":
        const twoWeeksAgo = new Date(todayStart);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return itemDate >= twoWeeksAgo;
      case "4weeks":
        const fourWeeksAgo = new Date(todayStart);
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        return itemDate >= fourWeeksAgo;
      default:
        return true;
    }
  };

  const getFilteredOrders = (orders: WildberriesOrder[]) => {
    const filteredOrders = orders.filter(order => filterDataByPeriod(order.date, period));

    const warehouseCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const totalOrders = filteredOrders.length;

    filteredOrders.forEach(order => {
      if (order.warehouseName) {
        warehouseCounts[order.warehouseName] = (warehouseCounts[order.warehouseName] || 0) + 1;
      }
      if (order.regionName) {
        regionCounts[order.regionName] = (regionCounts[order.regionName] || 0) + 1;
      }
    });

    const newWarehouseDistribution = Object.entries(warehouseCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalOrders) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const newRegionDistribution = Object.entries(regionCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalOrders) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      orders: filteredOrders,
      warehouseDistribution: newWarehouseDistribution,
      regionDistribution: newRegionDistribution
    };
  };

  const getFilteredSales = (sales: WildberriesSale[]) => {
    return sales.filter(sale => filterDataByPeriod(sale.date, period));
  };

  useEffect(() => {
    if (orders.length > 0) {
      const { orders: filteredOrders, warehouseDistribution: newWarehouseDistribution, regionDistribution: newRegionDistribution } = getFilteredOrders(orders);
      setWarehouseDistribution(newWarehouseDistribution);
      setRegionDistribution(newRegionDistribution);
    }
  }, [period, orders]);

  const fetchData = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setIsFetching(true);
      setError(null);
      
      const selectedStore = getSelectedStore();
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        setError("Не выбран основной магазин");
        setIsLoading(false);
        setIsFetching(false);
        return;
      }

      if (!selectedStore.apiKey) {
        toast({
          title: "Внимание",
          description: "У выбранного магазина не настроен API ключ",
          variant: "destructive"
        });
        setError("Отсутствует API ключ для магазина");
        setIsLoading(false);
        setIsFetching(false);
        return;
      }

      if (selectedStore.id !== selectedStoreId) {
        setSelectedStoreId(selectedStore.id);
      }

      toast({
        title: "Загрузка данных",
        description: "Начата загрузка заказов...",
      });

      const ordersResult = await fetchAndUpdateOrders(selectedStore, forceRefresh);
      let hasNewOrdersData = false;
      
      if (ordersResult) {
        setOrders(ordersResult.orders);
        setWarehouseDistribution(ordersResult.warehouseDistribution);
        setRegionDistribution(ordersResult.regionDistribution);
        hasNewOrdersData = true;
        console.log(`Успешно загружено ${ordersResult.orders.length} заказов`);
      } else {
        const savedOrdersData = await getOrdersData(selectedStore.id);
        if (savedOrdersData) {
          setOrders(savedOrdersData.orders || []);
          setWarehouseDistribution(savedOrdersData.warehouseDistribution || []);
          setRegionDistribution(savedOrdersData.regionDistribution || []);
          console.log(`Загружено ${savedOrdersData.orders?.length || 0} заказов из кэша`);
        }
      }

      toast({
        title: "Загрузка данных",
        description: "Начата загрузка продаж...",
      });

      const salesResult = await fetchAndUpdateSales(selectedStore, forceRefresh);
      let hasNewSalesData = false;
      
      if (salesResult) {
        setSales(salesResult);
        hasNewSalesData = true;
        console.log(`Успешно загружено ${salesResult.length} продаж`);
      } else {
        const savedSalesData = await getSalesData(selectedStore.id);
        if (savedSalesData) {
          setSales(savedSalesData.sales || []);
          console.log(`Загружено ${savedSalesData.sales?.length || 0} продаж из кэша`);
        }
      }

      console.log(`Данные загружены: ${orders.length} заказов, ${sales.length} продаж`);
      setLastUpdateTime(new Date());

      if (hasNewOrdersData || hasNewSalesData) {
        toast({
          title: "Успех",
          description: `Данные успешно обновлены (${hasNewOrdersData ? 'заказы' : ''}${hasNewOrdersData && hasNewSalesData ? ', ' : ''}${hasNewSalesData ? 'продажи' : ''})`,
        });
        setError(null);
      } else if (orders.length === 0 && sales.length === 0) {
        toast({
          title: "Внимание",
          description: "Не удалось загрузить данные. Проверьте API ключ и подключение к сервисам маркетплейса",
          variant: "destructive"
        });
        setError("Не удалось загрузить данные");
      } else {
        toast({
          title: "Информация",
          description: "Загружены данные из кэша. Для получения свежих данных нажмите 'Обновить данные'",
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Ошибка загрузки: ${(error as Error).message}`);
      toast({
        title: "Ошибка",
        description: `Не удалось загрузить данные: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const selectedStore = getSelectedStore();
    
    if (selectedStore) {
      if (selectedStore.id !== selectedStoreId) {
        setSelectedStoreId(selectedStore.id);
      }
      
      fetchData();
    }

    const handleStoreSelectionChange = () => {
      console.log('Store selection changed, refreshing data...');
      fetchData();
    };

    window.addEventListener('store-selection-changed', handleStoreSelectionChange);

    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing data...');
      fetchData(true);
    }, 30 * 60 * 1000);

    return () => {
      window.removeEventListener('store-selection-changed', handleStoreSelectionChange);
      clearInterval(refreshInterval);
    };
  }, []);

  const filteredOrders = orders.length > 0 ? getFilteredOrders(orders).orders : [];
  const filteredSales = sales.length > 0 ? getFilteredSales(sales) : [];

  const hasOrdersData = filteredOrders.length > 0;
  const hasSalesData = filteredSales.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>Дашборд</h2>
        <div className="flex items-center gap-2">
          {lastUpdateTime && (
            <div className="text-xs text-muted-foreground hidden md:block">
              Последнее обновление: {lastUpdateTime.toLocaleTimeString()}
            </div>
          )}
          {isLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Обновление данных...
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${isMobile ? 'w-full grid grid-cols-5 gap-1' : ''}`}>
          <TabsTrigger value="overview" className={isMobile ? 'text-xs py-1 px-1' : ''}>Обзор</TabsTrigger>
          <TabsTrigger value="orders" className={isMobile ? 'text-xs py-1 px-1' : ''}>Заказы</TabsTrigger>
          <TabsTrigger value="sales" className={isMobile ? 'text-xs py-1 px-1' : ''}>Продажи</TabsTrigger>
          <TabsTrigger value="geography" className={isMobile ? 'text-xs py-1 px-1' : ''}>География</TabsTrigger>
          <TabsTrigger value="ai" className={isMobile ? 'text-xs py-1 px-1' : ''}>AI Анализ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Stats />
          <TipsSection />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
            <Button 
              variant="outline" 
              onClick={() => fetchData(true)} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Обновление...' : 'Обновить данные'}
            </Button>
          </div>
          
          {hasOrdersData && (
            <>
              <OrderMetrics orders={filteredOrders} />
              <OrdersChart 
                orders={filteredOrders} 
                sales={filteredSales}
              />
            </>
          )}
          
          <OrdersTable 
            orders={filteredOrders} 
            isLoading={isLoading}
            onRefresh={() => fetchData(true)}
          />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
            <Button 
              variant="outline" 
              onClick={() => fetchData(true)} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Обновление...' : 'Обновить данные'}
            </Button>
          </div>
          
          {hasSalesData && (
            <>
              <SalesMetrics sales={filteredSales} />
              <SalesChart sales={filteredSales} />
            </>
          )}
          
          <SalesTable 
            sales={filteredSales} 
            isLoading={isLoading}
            onRefresh={() => fetchData(true)}
          />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
            <Button 
              variant="outline" 
              onClick={() => fetchData(true)} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Обновление...' : 'Обновить данные'}
            </Button>
          </div>
          <GeographySection 
            warehouseDistribution={warehouseDistribution} 
            regionDistribution={regionDistribution}
            sales={filteredSales}
          />
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-4">
          <AIDashboardSection 
            salesData={sales}
            ordersData={orders}
            returnsData={[]}
            expensesData={{
              logistics: 0,
              storage: 0,
              penalties: 0,
              advertising: 0
            }}
            period={period}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  loadStores,
  getOrdersData, 
  getSalesData, 
  fetchAndUpdateOrders, 
  fetchAndUpdateSales 
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const Dashboard = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState<Period>("today");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<WildberriesOrder[]>([]);
  const [sales, setSales] = useState<WildberriesSale[]>([]);
  const [warehouseDistribution, setWarehouseDistribution] = useState<any[]>([]);
  const [regionDistribution, setRegionDistribution] = useState<any[]>([]);

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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stores = loadStores();
      const selectedStore = stores.find(s => s.isSelected);
      
      if (!selectedStore) {
        setError("Выберите основной магазин в разделе 'Магазины'");
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        return;
      }

      // Проверяем, изменился ли выбранный магазин
      if (selectedStore.id !== selectedStoreId) {
        setSelectedStoreId(selectedStore.id);
      }

      try {
        // Заказы
        const ordersResult = await fetchAndUpdateOrders(selectedStore);
        if (ordersResult && ordersResult.orders) {
          setOrders(ordersResult.orders);
          setWarehouseDistribution(ordersResult.warehouseDistribution || []);
          setRegionDistribution(ordersResult.regionDistribution || []);
        } else {
          setOrders([]);
          setWarehouseDistribution([]);
          setRegionDistribution([]);
          console.error('No orders data returned');
        }

        // Продажи
        const salesResult = await fetchAndUpdateSales(selectedStore);
        if (salesResult) {
          setSales(salesResult);
        } else {
          setSales([]);
          console.error('No sales data returned');
        }
        
        toast({
          title: "Успех",
          description: "Данные успешно обновлены",
        });
      } catch (apiError: any) {
        console.error('API error:', apiError);
        setError(apiError.message || "Ошибка при получении данных от API");
        
        if (apiError.response?.status === 429) {
          toast({
            title: "Превышен лимит запросов",
            description: "Слишком много запросов к API. Пожалуйста, повторите попытку позже.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить данные о заказах и продажах",
            variant: "destructive"
          });
        }
        
        // Очищаем данные при ошибке
        setOrders([]);
        setSales([]);
        setWarehouseDistribution([]);
        setRegionDistribution([]);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || "Произошла ошибка при загрузке данных");
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive"
      });
      
      // Очищаем данные при ошибке
      setOrders([]);
      setSales([]);
      setWarehouseDistribution([]);
      setRegionDistribution([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const stores = loadStores();
    const selectedStore = stores.find(s => s.isSelected);
    
    if (selectedStore) {
      // Устанавливаем ID выбранного магазина
      if (selectedStore.id !== selectedStoreId) {
        setSelectedStoreId(selectedStore.id);
      }
      
      // Запрашиваем данные при первой загрузке
      fetchData();
    } else {
      setError("Выберите основной магазин в разделе 'Магазины'");
      setIsLoading(false);
    }

    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing data...');
      fetchData();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  // При изменении ID выбранного магазина обновляем данные
  useEffect(() => {
    if (selectedStoreId) {
      fetchData();
    }
  }, [selectedStoreId]);

  const filteredOrders = orders.length > 0 ? getFilteredOrders(orders).orders : [];
  const filteredSales = sales.length > 0 ? getFilteredSales(sales) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>Дашборд</h2>
        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Обновление данных...
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertOctagon className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${isMobile ? 'w-full grid grid-cols-4 gap-1' : ''}`}>
          <TabsTrigger value="overview" className={isMobile ? 'text-xs py-1 px-1' : ''}>Обзор</TabsTrigger>
          <TabsTrigger value="orders" className={isMobile ? 'text-xs py-1 px-1' : ''}>Заказы</TabsTrigger>
          <TabsTrigger value="sales" className={isMobile ? 'text-xs py-1 px-1' : ''}>Продажи</TabsTrigger>
          <TabsTrigger value="geography" className={isMobile ? 'text-xs py-1 px-1' : ''}>География</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Stats />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {filteredOrders.length > 0 ? (
            <>
              <OrderMetrics orders={filteredOrders} />
              <OrdersChart 
                orders={filteredOrders} 
                sales={filteredSales}
              />
              <OrdersTable orders={filteredOrders} />
            </>
          ) : (
            <Alert>
              <AlertTitle>Нет данных о заказах</AlertTitle>
              <AlertDescription>
                За выбранный период нет информации о заказах или возникла ошибка при получении данных.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {filteredSales.length > 0 ? (
            <>
              <SalesMetrics sales={filteredSales} />
              <SalesChart sales={filteredSales} />
              <SalesTable sales={filteredSales} />
            </>
          ) : (
            <Alert>
              <AlertTitle>Нет данных о продажах</AlertTitle>
              <AlertDescription>
                За выбранный период нет информации о продажах или возникла ошибка при получении данных.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {warehouseDistribution.length > 0 || regionDistribution.length > 0 ? (
            <GeographySection 
              warehouseDistribution={warehouseDistribution} 
              regionDistribution={regionDistribution}
              sales={filteredSales}
            />
          ) : (
            <Alert>
              <AlertTitle>Нет данных о географическом распределении</AlertTitle>
              <AlertDescription>
                За выбранный период нет информации о географии заказов или возникла ошибка при получении данных.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

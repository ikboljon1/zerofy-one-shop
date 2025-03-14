import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
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
import OrdersChart from "./OrdersChart";
import GeographySection from "./GeographySection";
import Stats from "@/components/Stats";
import PeriodSelector, { Period } from "./PeriodSelector";
import { WildberriesOrder, WildberriesSale } from "@/types/store";
import OrderMetrics from "./OrderMetrics";
import SalesMetrics from "./SalesMetrics";
import SalesChart from "./SalesChart";
import TipsSection from "./TipsSection";
import AIAnalysisSection from "@/components/ai/AIAnalysisSection";
import SalesTable from "./SalesTable";

const Dashboard = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState<Period>("today");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<WildberriesOrder[]>([]);
  const [sales, setSales] = useState<WildberriesSale[]>([]);
  const [warehouseDistribution, setWarehouseDistribution] = useState<any[]>([]);
  const [regionDistribution, setRegionDistribution] = useState<any[]>([]);
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date()
  });

  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const filterDataByPeriod = useCallback((date: string, period: Period) => {
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
  }, []);

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

  const filteredOrdersData = useMemo(() => {
    return getFilteredOrders(orders);
  }, [orders, period]);

  const filteredSalesData = useMemo(() => {
    return getFilteredSales(sales);
  }, [sales, period]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const userData = localStorage.getItem('user');
      const currentUserId = userData ? JSON.parse(userData).id : null;
      
      const allStores = loadStores();
      const userStores = currentUserId 
        ? allStores.filter(store => store.userId === currentUserId)
        : allStores;
      
      const selectedStore = userStores.find(store => store.isSelected) || (userStores.length > 0 ? userStores[0] : null);
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        return;
      }

      if (selectedStore.id !== selectedStoreId) {
        setSelectedStoreId(selectedStore.id);
      }

      const [ordersResult, salesResult] = await Promise.all([
        fetchAndUpdateOrders(selectedStore),
        fetchAndUpdateSales(selectedStore)
      ]);

      if (ordersResult) {
        setOrders(ordersResult.orders);
        setWarehouseDistribution(ordersResult.warehouseDistribution);
        setRegionDistribution(ordersResult.regionDistribution);
      } else {
        const savedOrdersData = await getOrdersData(selectedStore.id);
        if (savedOrdersData) {
          setOrders(savedOrdersData.orders || []);
          setWarehouseDistribution(savedOrdersData.warehouseDistribution || []);
          setRegionDistribution(savedOrdersData.regionDistribution || []);
        }
      }

      if (salesResult) {
        setSales(salesResult);
      } else {
        const savedSalesData = await getSalesData(selectedStore.id);
        if (savedSalesData) {
          setSales(savedSalesData.sales || []);
        }
      }

      toast({
        title: "Успех",
        description: "Данные успешно обновлены",
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedStoreId, toast]);

  useEffect(() => {
    const selectedStore = getSelectedStore();
    
    if (selectedStore && selectedStore.id !== selectedStoreId) {
      setSelectedStoreId(selectedStore.id);
      fetchData();
    }
  }, [selectedStoreId, fetchData]);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    const handleStoreSelectionChange = () => {
      console.log('Store selection changed, refreshing data...');
      fetchData();
    };

    if (selectedStoreId) {
      window.addEventListener('store-selection-changed', handleStoreSelectionChange);
      refreshInterval = setInterval(fetchData, 60000);
    }

    return () => {
      window.removeEventListener('store-selection-changed', handleStoreSelectionChange);
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [selectedStoreId, fetchData]);

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

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${isMobile ? 'w-full grid grid-cols-5 gap-1' : ''}`}>
          <TabsTrigger value="overview" className={isMobile ? 'text-xs py-1 px-1' : ''}>Обзор</TabsTrigger>
          <TabsTrigger value="orders" className={isMobile ? 'text-xs py-1 px-1' : ''}>Заказы</TabsTrigger>
          <TabsTrigger value="sales" className={isMobile ? 'text-xs py-1 px-1' : ''}>Продажи</TabsTrigger>
          <TabsTrigger value="geography" className={isMobile ? 'text-xs py-1 px-1' : ''}>География</TabsTrigger>
          <TabsTrigger value="ai-analysis" className={isMobile ? 'text-xs py-1 px-1' : ''}>AI-анализ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Stats />
          <TipsSection />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {orders.length > 0 && (
            <OrderMetrics orders={filteredOrdersData.orders} />
          )}
          
          {orders.length > 0 && (
            <OrdersChart 
              orders={filteredOrdersData.orders} 
              sales={filteredSalesData}
            />
          )}
          
          <OrdersTable orders={filteredOrdersData.orders} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {sales.length > 0 && (
            <SalesMetrics sales={filteredSalesData} />
          )}
          
          <SalesTable sales={filteredSalesData} />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          <GeographySection 
            warehouseDistribution={warehouseDistribution} 
            regionDistribution={regionDistribution}
            sales={filteredSalesData}
          />
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          <AIAnalysisSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default React.memo(Dashboard);

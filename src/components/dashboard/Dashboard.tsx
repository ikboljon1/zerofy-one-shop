
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { 
  loadStores,
  getOrdersData, 
  getSalesData, 
  ensureStoreSelectionPersistence,
  getSelectedStore,
  getStoresLastUpdateTime
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
import AIAnalysisSection from "@/components/ai/AIAnalysisSection";

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
  
  // Date range for AI Analysis
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date()
  });

  // Analytics data for AI analysis
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
      const selectedStore = getSelectedStore();
      
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

      // Get data from localStorage without API calls
      const savedOrdersData = await getOrdersData(selectedStore.id);
      if (savedOrdersData) {
        setOrders(savedOrdersData.orders || []);
        setWarehouseDistribution(savedOrdersData.warehouseDistribution || []);
        setRegionDistribution(savedOrdersData.regionDistribution || []);
      }

      const savedSalesData = await getSalesData(selectedStore.id);
      if (savedSalesData) {
        setSales(savedSalesData.sales || []);
      }

      // Prepare analytics data for AI analysis (simplified)
      const simpleAnalyticsData = {
        currentPeriod: {
          sales: orders.length * 1200, // Simple simulation of sales data
          expenses: {
            total: orders.length * 700,
            logistics: orders.length * 300,
            storage: orders.length * 150,
            penalties: orders.length * 50,
            advertising: orders.length * 150,
            acceptance: orders.length * 50
          }
        },
        previousPeriod: {
          sales: orders.length * 1100,
          expenses: {
            total: orders.length * 650
          }
        },
        // Sample data structure for AI analysis
        topProfitableProducts: orders.slice(0, 5).map((order, index) => ({
          name: order.subject || `Product ${index + 1}`,
          profit: (Math.random() * 5000 + 1000).toFixed(2),
          margin: Math.round(Math.random() * 40 + 20),
          quantitySold: Math.round(Math.random() * 50 + 10)
        })),
        topUnprofitableProducts: orders.slice(5, 10).map((order, index) => ({
          name: order.subject || `Product ${index + 1}`,
          profit: (-Math.random() * 2000 - 500).toFixed(2),
          margin: Math.round(Math.random() * 10 - 20),
          quantitySold: Math.round(Math.random() * 5 + 1)
        }))
      };

      setAnalyticsData(simpleAnalyticsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  };

  useEffect(() => {
    const selectedStore = getSelectedStore();
    
    if (selectedStore) {
      if (selectedStore.id !== selectedStoreId) {
        setSelectedStoreId(selectedStore.id);
      }
      
      // Initial fetch without API calls
      fetchData();

      const handleStoreSelectionChange = () => {
        console.log('Store selection changed, refreshing data...');
        fetchData();
      };

      window.addEventListener('store-selection-changed', handleStoreSelectionChange);

      // Only set refresh interval if auto-refresh is needed
      // No automatic API requests anymore
      const checkForUpdates = setInterval(() => {
        const lastUpdateTime = getStoresLastUpdateTime();
        const now = Date.now();
        // Only refresh data if it's been more than 30 minutes since last update
        if (now - lastUpdateTime > 30 * 60 * 1000) {
          console.log('Checking for updates...');
          // Not making actual API calls here, just checking if update needed
        }
      }, 60000);

      return () => {
        window.removeEventListener('store-selection-changed', handleStoreSelectionChange);
        clearInterval(checkForUpdates);
      };
    }
  }, []);

  // Only fetch new data when store ID changes, but don't make API calls
  useEffect(() => {
    if (selectedStoreId && !initialLoadComplete) {
      fetchData();
    }
  }, [selectedStoreId]);

  // Create immediate UI content for all tabs without waiting for API response
  const getTabContent = () => {
    const filteredOrders = orders.length > 0 ? getFilteredOrders(orders).orders : [];
    const filteredSales = sales.length > 0 ? getFilteredSales(sales) : [];

    return {
      orders: (
        <>
          {orders.length > 0 && (
            <>
              <OrderMetrics orders={filteredOrders} />
              <OrdersChart 
                orders={filteredOrders} 
                sales={filteredSales}
              />
            </>
          )}
          
          <OrdersTable orders={filteredOrders} />
        </>
      ),
      sales: (
        <>
          {sales.length > 0 && (
            <>
              <SalesMetrics sales={filteredSales} />
              <SalesChart sales={filteredSales} />
            </>
          )}
          
          <SalesTable sales={filteredSales} />
        </>
      ),
      geography: (
        <GeographySection 
          warehouseDistribution={warehouseDistribution} 
          regionDistribution={regionDistribution}
          sales={filteredSales}
        />
      ),
      overview: (
        <>
          <Stats />
          <TipsSection />
        </>
      ),
      aiAnalysis: (
        <AIAnalysisSection />
      )
    };
  };

  const tabContent = getTabContent();

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
          {tabContent.overview}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {tabContent.orders}
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {tabContent.sales}
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          {tabContent.geography}
        </TabsContent>

        <TabsContent value="ai-analysis" className="space-y-4">
          {tabContent.aiAnalysis}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

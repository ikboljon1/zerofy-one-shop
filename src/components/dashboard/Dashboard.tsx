import { useState, useEffect } from "react";
import { Grid, GridItem, Divider } from "@tremor/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { refreshStoreStats, fetchAndUpdateOrders, fetchAndUpdateSales, getAnalyticsData } from "@/utils/storeUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PeriodSelector from "./PeriodSelector";
import SalesMetrics from "./SalesMetrics";
import OrderMetrics from "./OrderMetrics";
import SalesChart from "./SalesChart";
import OrdersChart from "./OrdersChart";
import TipsSection from "./TipsSection";
import GeographySection from "./GeographySection";
import SalesTable from "./SalesTable";
import OrdersTable from "./OrdersTable";
import WarehouseEfficiencyChart from "./WarehouseEfficiencyChart";
import { useIsMobile } from "@/hooks/use-mobile";
import AIAnalysisSection from "../ai/AIAnalysisSection";

const Dashboard = ({ store }: { store: any }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [salesData, setSalesData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (store) {
      loadData();
    }
  }, [store]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const sales = await fetchAndUpdateSales(store);
      const orders = await fetchAndUpdateOrders(store);
      setSalesData(sales);
      setOrdersData(orders);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Ошибка загрузки данных",
        description: "Не удалось загрузить данные о продажах и заказах",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange);
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      const updatedStore = await refreshStoreStats(store);
      if (updatedStore) {
        toast({
          title: "Данные обновлены",
          description: "Статистика магазина успешно обновлена",
        });
      }
      await loadData();
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Ошибка обновления данных",
        description: "Не удалось обновить статистику магазина",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <CardTitle>Загрузка...</CardTitle>
        </div>
        <Grid numItemsSm={1} numItemsLg={3} className="gap-6">
          <GridItem>
            <Card><CardContent><Skeleton className="w-full h-32" /></CardContent></Card>
          </GridItem>
          <GridItem>
            <Card><CardContent><Skeleton className="w-full h-32" /></CardContent></Card>
          </GridItem>
          <GridItem>
            <Card><CardContent><Skeleton className="w-full h-32" /></CardContent></Card>
          </GridItem>
        </Grid>
        <Card><CardContent><Skeleton className="w-full h-64" /></CardContent></Card>
        <Card><CardContent><Skeleton className="w-full h-64" /></CardContent></Card>
      </div>
    );
  }

  const analyticsData = getAnalyticsData(store.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CardTitle>Панель управления</CardTitle>
        <Button onClick={handleRefreshData} disabled={refreshing}>
          {refreshing ? "Обновление..." : "Обновить данные"}
        </Button>
      </div>
      
      <PeriodSelector onDateRangeChange={handleDateRangeChange} />
      
      <SalesMetrics store={store} analyticsData={analyticsData.data} dateRange={dateRange} />
      
      <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
        <GridItem>
          <SalesChart store={store} analyticsData={analyticsData.data} dateRange={dateRange} />
        </GridItem>
        <GridItem>
          <OrdersChart store={store} ordersData={ordersData} dateRange={dateRange} />
        </GridItem>
      </Grid>
      
      <AIAnalysisSection 
        storeId={store.id} 
        analyticsData={analyticsData.data} 
        dateFrom={dateRange.from} 
        dateTo={dateRange.to} 
      />
      
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <SalesTable store={store} salesData={salesData} dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTable store={store} ordersData={ordersData} dateRange={dateRange} />
        </TabsContent>
      </Tabs>
      
      <WarehouseEfficiencyChart store={store} ordersData={ordersData} />
      
      <GeographySection store={store} ordersData={ordersData} />
      
      <TipsSection />
    </div>
  );
};

export default Dashboard;

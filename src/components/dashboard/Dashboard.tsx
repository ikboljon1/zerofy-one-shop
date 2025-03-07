import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
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
import FinancialPeriodSelector, { FinancialPeriod } from "./FinancialPeriodSelector";
import { WildberriesOrder, WildberriesSale } from "@/types/store";
import OrderMetrics from "./OrderMetrics";
import SalesMetrics from "./SalesMetrics";
import OrdersChart from "./OrdersChart";
import SalesChart from "./SalesChart";
import FinancialReport from "./FinancialReport";
import { fetchReportDetailByPeriod } from "@/services/wildberriesApi";

const Dashboard = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState<Period>("today");
  const [financialPeriod, setFinancialPeriod] = useState<FinancialPeriod>("week");
  const [isLoading, setIsLoading] = useState(false);
  
  const [orders, setOrders] = useState<WildberriesOrder[]>([]);
  const [sales, setSales] = useState<WildberriesSale[]>([]);
  const [reportDetails, setReportDetails] = useState<any[]>([]);
  const [warehouseDistribution, setWarehouseDistribution] = useState<any[]>([]);
  const [regionDistribution, setRegionDistribution] = useState<any[]>([]);

  const getPeriodLabel = (period: Period): string => {
    switch (period) {
      case "today": return "Сегодня";
      case "yesterday": return "Вчера";
      case "week": return "Неделя";
      case "2weeks": return "2 недели";
      case "4weeks": return "4 недели";
      default: return "";
    }
  };

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

  const getFinancialPeriodDates = (period: FinancialPeriod): { startDate: Date, endDate: Date } => {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case "2weeks":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "quarter":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }
    
    return { startDate, endDate: now };
  };

  const getFinancialPeriodLabel = (period: FinancialPeriod): string => {
    switch (period) {
      case "week": return "Неделя";
      case "2weeks": return "2 недели";
      case "month": return "Месяц";
      case "quarter": return "Квартал";
      case "year": return "Год";
      default: return "";
    }
  };

  const fetchFinancialReportDetails = async (selectedStore: any) => {
    try {
      const { startDate, endDate } = getFinancialPeriodDates(financialPeriod);
      
      const reportData = await fetchReportDetailByPeriod(selectedStore.apiKey, startDate, endDate);
      setReportDetails(reportData);
    } catch (error) {
      console.error('Error fetching financial report details:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные финансового отчета",
        variant: "destructive"
      });
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const stores = loadStores();
      const selectedStore = stores.find(s => s.isSelected);
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        return;
      }

      const ordersResult = await fetchAndUpdateOrders(selectedStore);
      if (ordersResult) {
        setOrders(ordersResult.orders);
        setWarehouseDistribution(ordersResult.warehouseDistribution);
        setRegionDistribution(ordersResult.regionDistribution);
      } else {
        const savedOrdersData = getOrdersData(selectedStore.id);
        if (savedOrdersData) {
          setOrders(savedOrdersData.orders || []);
          setWarehouseDistribution(savedOrdersData.warehouseDistribution || []);
          setRegionDistribution(savedOrdersData.regionDistribution || []);
        }
      }

      const salesResult = await fetchAndUpdateSales(selectedStore);
      if (salesResult) {
        setSales(salesResult);
      } else {
        const savedSalesData = getSalesData(selectedStore.id);
        if (savedSalesData) {
          setSales(savedSalesData.sales || []);
        }
      }

      await fetchFinancialReportDetails(selectedStore);

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
  };

  useEffect(() => {
    const stores = loadStores();
    const selectedStore = stores.find(s => s.isSelected);
    
    if (selectedStore) {
      const savedOrdersData = getOrdersData(selectedStore.id);
      if (savedOrdersData) {
        setOrders(savedOrdersData.orders || []);
        setWarehouseDistribution(savedOrdersData.warehouseDistribution || []);
        setRegionDistribution(savedOrdersData.regionDistribution || []);
      }

      const savedSalesData = getSalesData(selectedStore.id);
      if (savedSalesData) {
        setSales(savedSalesData.sales || []);
      }

      if (!savedOrdersData || !savedSalesData) {
        fetchData();
      } else {
        fetchFinancialReportDetails(selectedStore);
      }
    }

    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing data...');
      fetchData();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    const stores = loadStores();
    const selectedStore = stores.find(s => s.isSelected);
    
    if (selectedStore) {
      fetchFinancialReportDetails(selectedStore);
    }
  }, [financialPeriod]);

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
          <TabsTrigger value="finance" className={isMobile ? 'text-xs py-1 px-1' : ''}>Финансы</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Stats />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {orders.length > 0 && (
            <>
              <OrderMetrics orders={getFilteredOrders(orders).orders} />
              <OrdersChart 
                orders={getFilteredOrders(orders).orders} 
                sales={getFilteredSales(sales)}
              />
            </>
          )}
          
          <OrdersTable orders={getFilteredOrders(orders).orders} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          
          {sales.length > 0 && (
            <>
              <SalesMetrics sales={getFilteredSales(sales)} />
              <SalesChart sales={getFilteredSales(sales)} />
            </>
          )}
          
          <SalesTable sales={getFilteredSales(sales)} />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <PeriodSelector value={period} onChange={setPeriod} />
            <div className="flex-grow"></div>
          </div>
          <GeographySection 
            warehouseDistribution={warehouseDistribution} 
            regionDistribution={regionDistribution}
            sales={getFilteredSales(sales)}
          />
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <div className={`mb-4 ${isMobile ? 'w-full' : 'flex items-center gap-4'}`}>
            <FinancialPeriodSelector value={financialPeriod} onChange={setFinancialPeriod} />
            <div className="flex-grow"></div>
          </div>
          <FinancialReport 
            data={reportDetails} 
            isLoading={isLoading} 
            period={getFinancialPeriodLabel(financialPeriod)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

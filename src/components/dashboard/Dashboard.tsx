
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Title } from "@tremor/react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ShoppingBag, Package, Calculator, TrendingUp, ArrowUp,
  BarChart3, ArrowDown, Percent, AlertCircle
} from "lucide-react";
import OrdersChart from "./OrdersChart";
import SalesChart from "./SalesChart";
import SalesMetrics from "./SalesMetrics";
import OrderMetrics from "./OrderMetrics";
import SalesTable from "./SalesTable";
import OrdersTable from "./OrdersTable";
import GeographySection from "./GeographySection";
import TipsSection from "./TipsSection";
import PeriodSelector from "./PeriodSelector";
import Products from "@/components/Products";
import { WildberriesOrder, WildberriesSale, Store } from "@/types/store";
import { getOrdersData, getSalesData, getProductProfitabilityData, getAnalyticsData, getSelectedStore } from "@/utils/storeUtils";
import { formatCurrency } from "@/utils/formatCurrency";

interface DashboardProps {
  selectedStore?: Store | null;
}

// Define custom chart configuration type
interface ChartConfigType {
  [key: string]: {
    name: string;
    color: string;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ selectedStore }) => {
  console.log("Dashboard render with selectedStore:", selectedStore);
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [orders, setOrders] = useState<WildberriesOrder[]>([]);
  const [sales, setSales] = useState<WildberriesSale[]>([]);
  const [profitableProducts, setProfitableProducts] = useState<any[]>([]);
  const [unprofitableProducts, setUnprofitableProducts] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      console.log("Fetching dashboard data...");
      setIsLoading(true);
      try {
        // Определяем текущий магазин
        const store = selectedStore || getSelectedStore();
        
        if (!store) {
          console.error("No store selected");
          setIsLoading(false);
          return;
        }
        
        console.log("Fetching data for store:", store.id);
        
        // Fetch orders data
        const ordersData = await getOrdersData(store.id);
        if (ordersData && ordersData.orders) {
          setOrders(ordersData.orders);
        } else {
          setOrders([]);
        }
        
        // Fetch sales data
        const salesData = await getSalesData(store.id);
        if (salesData && salesData.sales) {
          setSales(salesData.sales);
        } else {
          setSales([]);
        }
        
        // Fetch product profitability data
        const profitabilityData = getProductProfitabilityData(store.id);
        if (profitabilityData) {
          setProfitableProducts(profitabilityData.profitableProducts || []);
          setUnprofitableProducts(profitabilityData.unprofitableProducts || []);
        } else {
          setProfitableProducts([]);
          setUnprofitableProducts([]);
        }
        
        // Fetch analytics data
        const analytics = getAnalyticsData(store.id);
        setAnalyticsData(analytics);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedStore, period]);
  
  const totalSales = analyticsData?.data?.currentPeriod?.sales || 0;
  const totalExpenses = analyticsData?.data?.currentPeriod?.expenses?.total || 0;
  const totalProfit = analyticsData?.data?.currentPeriod?.netProfit || 0;
  
  const chartData = analyticsData?.deductionsTimeline?.map((item: any) => ({
    date: item.date,
    Логистика: item.logistic,
    Хранение: item.storage,
    Штрафы: item.penalties,
    Приемка: item.acceptance,
    Реклама: item.advertising,
    Удержания: item.deductions
  })) || [];
  
  const chartConfig: ChartConfigType = {
    "Логистика": { name: "Логистика", color: "emerald" },
    "Хранение": { name: "Хранение", color: "violet" },
    "Штрафы": { name: "Штрафы", color: "rose" },
    "Приемка": { name: "Приемка", color: "amber" },
    "Реклама": { name: "Реклама", color: "blue" },
    "Удержания": { name: "Удержания", color: "orange" }
  };
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-xl text-muted-foreground animate-pulse">
            Загрузка данных...
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!analyticsData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 flex items-center justify-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          <div className="text-xl text-muted-foreground">
            Нет данных для отображения.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full space-y-4">
      <Card className="p-3">
        <CardContent>
          <PeriodSelector value={period} onChange={setPeriod} />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>Обзор</TabsTrigger>
          <TabsTrigger value="products" onClick={() => setActiveTab("products")}>Товары</TabsTrigger>
          <TabsTrigger value="orders" onClick={() => setActiveTab("orders")}>Заказы</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <SalesMetrics sales={sales} storeId={selectedStore?.id} />
          <OrderMetrics orders={orders} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesChart sales={sales} />
            <OrdersChart orders={orders} sales={sales} />
          </div>
          
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-gray-50 to-stone-100 dark:from-gray-900/70 dark:to-stone-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calculator className="h-4 w-4" />
                Расходы по категориям
              </CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Анализ расходов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AreaChart
                className="mt-4"
                data={chartData}
                index="date"
                categories={Object.keys(chartConfig)}
                colors={Object.values(chartConfig).map((c) => c.color as any)}
                showLegend
                valueFormatter={(value: number) => formatCurrency(value).replace(' ', ' ')}
              />
            </CardContent>
          </Card>
          
          <GeographySection data={orders} />
          <TipsSection />
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <Products
            topProfitableProducts={profitableProducts}
            topUnprofitableProducts={unprofitableProducts}
          />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <SalesTable sales={sales} />
          <OrdersTable orders={orders} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

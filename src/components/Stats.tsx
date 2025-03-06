import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, subDays } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Loader2,
  DollarSign,
  CreditCard,
  Wallet,
  PieChart,
  Package,
  PackageCheck,
  Receipt,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Truck,
  MapPin,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Chart from "@/components/Chart";
import { formatCurrency } from "@/utils/formatCurrency";

const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return '0%';
  const change = ((current - previous) / previous) * 100;
  return `${Math.abs(change).toFixed(1)}%`;
};

interface Store {
  id: string;
  marketplace: string;
  name: string;
  apiKey: string;
  isSelected?: boolean;
}

const STORES_STORAGE_KEY = 'marketplace_stores';
const STATS_STORAGE_KEY = 'marketplace_stats';

const Stats = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const getSelectedStore = (): Store | null => {
    const stores = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
    return stores.find((store: Store) => store.isSelected) || null;
  };

  const loadStoredStats = (storeId: string) => {
    const storedStats = localStorage.getItem(`${STATS_STORAGE_KEY}_${storeId}`);
    if (storedStats) {
      const data = JSON.parse(storedStats);
      setStatsData(data.stats);
      setDateFrom(new Date(data.dateFrom));
      setDateTo(new Date(data.dateTo));
      return true;
    }
    return false;
  };

  const fetchStats = async () => {
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

      const data = await fetchWildberriesStats(selectedStore.apiKey, dateFrom, dateTo);
      
      const statsData = {
        storeId: selectedStore.id,
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
        stats: data
      };
      localStorage.setItem(`${STATS_STORAGE_KEY}_${selectedStore.id}`, JSON.stringify(statsData));
      
      setStatsData(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selectedStore = getSelectedStore();
    if (selectedStore) {
      const hasStoredStats = loadStoredStats(selectedStore.id);
      if (!hasStoredStats) {
        fetchStats();
      }
    }
  }, []);

  const prepareSalesTrendData = (data: any) => {
    if (!data || !data.dailySales) return [];
    return data.dailySales;
  };

  const prepareProductSalesData = (data: any) => {
    if (!data || !data.productSales) return [];
    return data.productSales;
  };

  const stats = statsData ? [
    {
      title: "Продажи",
      value: statsData.currentPeriod.sales.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.sales, 0),
      isPositive: true,
      description: "За выбранный период",
      icon: DollarSign,
      gradient: "from-[#8B5CF6] to-[#6366F1]",
      iconColor: "text-white",
      bgColor: "bg-gradient-to-br from-[#8B5CF6] to-[#6366F1]"
    },
    {
      title: "Заказы",
      value: statsData.currentPeriod.orders.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.orders, 0),
      isPositive: true,
      description: "За выбранный период",
      icon: ShoppingBag,
      gradient: "from-[#3B82F6] to-[#2563EB]",
      iconColor: "text-white",
      bgColor: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB]"
    },
    {
      title: "Перечислено",
      value: statsData.currentPeriod.transferred.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.transferred, 0),
      isPositive: true,
      description: "За выбранный период",
      icon: CreditCard,
      gradient: "from-[#10B981] to-[#059669]",
      iconColor: "text-white",
      bgColor: "bg-gradient-to-br from-[#10B981] to-[#059669]"
    },
    {
      title: "Чистая прибыль",
      value: statsData.currentPeriod.netProfit.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.netProfit, 0),
      isPositive: true,
      description: "За выбранный период",
      icon: PieChart,
      gradient: "from-[#F59E0B] to-[#D97706]",
      iconColor: "text-white",
      bgColor: "bg-gradient-to-br from-[#F59E0B] to-[#D97706]"
    }
  ] : [];

  const additionalStats = statsData ? [
    {
      title: "Расходы",
      value: statsData.currentPeriod.expenses.total.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.total, 0),
      isPositive: false,
      description: "За выбранный период",
      icon: Wallet,
      gradient: "from-[#EF4444] to-[#DC2626]",
      iconColor: "text-white",
      bgColor: "bg-gradient-to-br from-[#EF4444] to-[#DC2626]"
    },
    {
      title: "Логистика",
      value: statsData.currentPeriod.expenses.logistics.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.logistics, 0),
      isPositive: false,
      description: "За выбранный период",
      icon: Truck,
      gradient: "from-[#EC4899] to-[#DB2777]",
      iconColor: "text-white",
      bgColor: "bg-gradient-to-br from-[#EC4899] to-[#DB2777]"
    },
    {
      title: "Хранение",
      value: statsData.currentPeriod.expenses.storage.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.storage, 0),
      isPositive: false,
      description: "За выбранный период",
      icon: PackageCheck,
      gradient: "from-[#14B8A6] to-[#0D9488]",
      iconColor: "text-white",
      bgColor: "bg-gradient-to-br from-[#14B8A6] to-[#0D9488]"
    },
    {
      title: "Возвраты",
      value: statsData.currentPeriod.returns.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.returns, 0),
      isPositive: false,
      description: "За выбранный период",
      icon: RotateCcw,
      gradient: "from-[#8B5CF6] to-[#7C3AED]",
      iconColor: "text-white",
      bgColor: "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]"
    }
  ] : [];

  const renderDatePicker = (date: Date, onChange: (date: Date) => void, label: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  const renderStatsRow = (statsData: typeof stats, start: number, end: number) => (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
      {statsData.slice(start, end).map((stat, index) => (
        <Card 
          key={index} 
          className="overflow-hidden border-0 shadow-md"
        >
          <div className={`p-1 ${stat.bgColor}`}>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-t-md">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-sm ${
                      stat.isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                  {stat.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} mt-1`}>
                  ₽ {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderWarehouseStats = () => {
    if (!statsData || !statsData.ordersByWarehouse) return null;
    
    const warehouses = Object.entries(statsData.ordersByWarehouse)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => Number(b.count) - Number(a.count))
      .slice(0, 5);
    
    const totalOrders = warehouses.reduce((sum, { count }) => sum + Number(count), 0);
    
    return (
      <Card className="p-5 border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="text-purple-500" />
            Распределение заказов по складам
          </h3>
          <Badge variant="outline" className="ml-auto">
            Всего: {totalOrders}
          </Badge>
        </div>
        
        <ScrollArea className="h-48 w-full pr-4">
          {warehouses.map((warehouse, index) => {
            const percentage = Math.round((Number(warehouse.count) / totalOrders) * 100);
            
            return (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{warehouse.name}</span>
                  <span className="text-sm text-muted-foreground">{String(warehouse.count)} заказов ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </Card>
    );
  };

  const renderRegionStats = () => {
    if (!statsData || !statsData.ordersByRegion) return null;
    
    const regions = Object.entries(statsData.ordersByRegion)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => Number(b.count) - Number(a.count))
      .slice(0, 5);
    
    const totalOrders = regions.reduce((sum, { count }) => sum + Number(count), 0);
    
    return (
      <Card className="p-5 border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="text-blue-500" />
            Распределение заказов по регионам
          </h3>
          <Badge variant="outline" className="ml-auto">
            Всего: {totalOrders}
          </Badge>
        </div>
        
        <ScrollArea className="h-48 w-full pr-4">
          {regions.map((region, index) => {
            const percentage = Math.round((Number(region.count) / totalOrders) * 100);
            
            return (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{region.name}</span>
                  <span className="text-sm text-muted-foreground">{String(region.count)} заказов ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </Card>
    );
  };

  const renderReturnStats = () => {
    if (!statsData || !statsData.productReturns || statsData.productReturns.length === 0) return null;
    
    return (
      <Card className="p-5 border-0 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Топ возвратов
          </h3>
          {statsData.returnsData && (
            <Badge variant="outline" className="ml-auto">
              Всего: {statsData.returnsData.count} шт. / ₽{formatCurrency(statsData.returnsData.amount)}
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-48 w-full pr-4">
          {statsData.productReturns.map((item: any, index: number) => (
            <div key={index} className="mb-4 pb-4 border-b last:border-0">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-red-500 font-medium">₽{formatCurrency(item.value)}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Возвращено: {item.count} шт.</span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </Card>
    );
  };

  const selectedStore = getSelectedStore();

  return (
    <div className="space-y-6">
      <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Дашборд продавца</h2>
            <p className="text-muted-foreground">
              Статистика и аналитика продаж на маркетплейсе Wildberries
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {renderDatePicker(dateFrom, setDateFrom, "Выберите начальную дату")}
            {renderDatePicker(dateTo, setDateTo, "Выберите конечную дату")}
            <Button 
              onClick={fetchStats} 
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                "Обновить данные"
              )}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="text-sm">Обзор</TabsTrigger>
            <TabsTrigger value="geography" className="text-sm">География</TabsTrigger>
            <TabsTrigger value="returns" className="text-sm">Возвраты</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {!selectedStore ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-muted-foreground">
                  Выберите основной магазин в разделе "Магазины"
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            ) : statsData ? (
              <>
                <div className="grid gap-6">
                  {isMobile ? (
                    <>
                      {renderStatsRow(stats, 0, 2)}
                      {renderStatsRow(stats, 2, 4)}
                    </>
                  ) : (
                    renderStatsRow(stats, 0, 4)
                  )}
                  
                  <Chart 
                    salesTrend={prepareSalesTrendData(statsData)} 
                    productSales={prepareProductSalesData(statsData)}
                  />
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="text-purple-600" />
                      Дополнительная статистика
                    </h3>
                    {isMobile ? (
                      <>
                        {renderStatsRow(additionalStats, 0, 2)}
                        {renderStatsRow(additionalStats, 2, 4)}
                      </>
                    ) : (
                      renderStatsRow(additionalStats, 0, 4)
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-muted-foreground">
                  Выберите период для просмотра статистики
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="geography" className="space-y-6">
            {!selectedStore || !statsData ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-muted-foreground">
                  {!selectedStore 
                    ? "Выберите основной магазин в разделе \"Магазины\""
                    : "Загрузите данные для просмотра географии заказов"}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {renderWarehouseStats()}
                {renderRegionStats()}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="returns" className="space-y-6">
            {!selectedStore || !statsData ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                <RotateCcw className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-muted-foreground">
                  {!selectedStore 
                    ? "Выберите основной магазин в разделе \"Магазины\""
                    : "Загрузите данные для просмотра информации о возвратах"}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1">
                {renderReturnStats()}
                
                <Card className="p-5 border-0 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="text-orange-500" />
                      Динамика возвратов
                    </h3>
                  </div>
                  
                  <div className="h-48 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-muted-foreground text-sm">
                      График статистики возвратов по дням
                    </p>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Stats;

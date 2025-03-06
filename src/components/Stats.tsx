
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Loader2,
  ShoppingBag,
  ShoppingCart,
  RefreshCw,
  XSquare,
  PieChart,
  Package,
  Map,
  Store,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Chart from "@/components/Chart";
import { getAnalyticsData } from "@/utils/storeUtils";

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
      
      // Save new stats to localStorage
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

  // Use the new property names for the main metrics
  const stats = statsData ? [
    {
      title: "Заказы",
      value: statsData.currentPeriod.orders?.toLocaleString() || "0",
      change: calculatePercentageChange(
        statsData.currentPeriod.orders || 0, 
        statsData.previousPeriod?.orders || 0
      ),
      isPositive: (statsData.currentPeriod.orders || 0) >= (statsData.previousPeriod?.orders || 0),
      description: "За выбранный период",
      icon: ShoppingBag,
      gradient: "from-[#fdfcfb] to-[#e2d1c3]",
      iconColor: "text-blue-600"
    },
    {
      title: "Продажи",
      value: (statsData.currentPeriod.sales || 0).toLocaleString(),
      change: calculatePercentageChange(
        statsData.currentPeriod.sales || 0, 
        statsData.previousPeriod?.sales || 0
      ),
      isPositive: (statsData.currentPeriod.sales || 0) >= (statsData.previousPeriod?.sales || 0),
      description: "За выбранный период",
      icon: ShoppingCart,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-purple-600"
    },
    {
      title: "Возвраты",
      value: (statsData.currentPeriod.returns || 0).toLocaleString(),
      change: calculatePercentageChange(
        statsData.currentPeriod.returns || 0, 
        statsData.previousPeriod?.returns || 0
      ),
      isPositive: (statsData.currentPeriod.returns || 0) <= (statsData.previousPeriod?.returns || 0),
      description: "За выбранный период",
      icon: RefreshCw,
      gradient: "from-[#ee9ca7] to-[#ffdde1]",
      iconColor: "text-amber-600"
    },
    {
      title: "Отмены заказов",
      value: (statsData.currentPeriod.cancellations || 0).toLocaleString(),
      change: calculatePercentageChange(
        statsData.currentPeriod.cancellations || 0, 
        statsData.previousPeriod?.cancellations || 0
      ),
      isPositive: (statsData.currentPeriod.cancellations || 0) <= (statsData.previousPeriod?.cancellations || 0),
      description: "За выбранный период",
      icon: XSquare,
      gradient: "from-[#d299c2] to-[#fef9d7]",
      iconColor: "text-red-600"
    }
  ] : [];

  // Use the regional and warehouse data for additional stats
  const additionalStats = statsData ? [
    {
      title: "Доход",
      value: statsData.currentPeriod.netProfit?.toLocaleString() || "0",
      change: calculatePercentageChange(
        statsData.currentPeriod.netProfit || 0, 
        statsData.previousPeriod?.netProfit || 0
      ),
      isPositive: (statsData.currentPeriod.netProfit || 0) >= (statsData.previousPeriod?.netProfit || 0),
      description: "За выбранный период",
      icon: PieChart,
      gradient: "from-[#243949] to-[#517fa4]",
      iconColor: "text-green-500"
    },
    {
      title: "Популярная категория",
      value: statsData.productSales?.[0]?.subject_name || "Нет данных",
      change: "",
      isPositive: true,
      description: "Самая продаваемая",
      icon: Package,
      gradient: "from-[#c1c161] to-[#d4d4b1]",
      iconColor: "text-violet-500"
    },
    {
      title: "Популярный регион",
      value: statsData.ordersByRegion?.[0]?.region || "Нет данных",
      change: "",
      isPositive: true,
      description: "Наибольшее число заказов",
      icon: Map,
      gradient: "from-[#e6b980] to-[#eacda3]",
      iconColor: "text-cyan-500"
    },
    {
      title: "Основной склад",
      value: statsData.ordersByWarehouse?.[0]?.warehouse || "Нет данных",
      change: "",
      isPositive: true,
      description: "Наибольшее число отгрузок",
      icon: Store,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-indigo-500"
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
          className={`stat-card bg-gradient-to-br ${stat.gradient} dark:from-gray-800 dark:to-gray-700 border-2 border-opacity-20 dark:border-gray-600`}
        >
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
              {stat.change && (
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
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <p className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );

  const selectedStore = getSelectedStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {renderDatePicker(dateFrom, setDateFrom, "Выберите начальную дату")}
        {renderDatePicker(dateTo, setDateTo, "Выберите конечную дату")}
        <Button 
          onClick={fetchStats} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            "Обновить"
          )}
        </Button>
      </div>
      
      {!selectedStore ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Выберите основной магазин в разделе "Магазины"
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
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
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Дополнительная информация</h3>
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
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Выберите период для просмотра статистики
          </p>
        </div>
      )}
    </div>
  );
};

export default Stats;

import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Chart from "@/components/Chart";

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

  // Use the correct property names based on API response
  const stats = statsData ? [
    {
      title: "Продажа",
      value: statsData.currentPeriod.sales.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.sales, statsData.previousPeriod?.sales || 0),
      isPositive: statsData.currentPeriod.sales >= (statsData.previousPeriod?.sales || 0),
      description: "За выбранный период",
      icon: DollarSign,
      gradient: "from-[#fdfcfb] to-[#e2d1c3]",
      iconColor: "text-green-600"
    },
    {
      title: "Перечислено",
      value: statsData.currentPeriod.transferred.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.transferred, statsData.previousPeriod?.transferred || 0),
      isPositive: statsData.currentPeriod.transferred >= (statsData.previousPeriod?.transferred || 0),
      description: "За выбранный период",
      icon: CreditCard,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-blue-600"
    },
    {
      title: "Расходы",
      value: statsData.currentPeriod.expenses.total.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.total, statsData.previousPeriod?.expenses?.total || 0),
      isPositive: statsData.currentPeriod.expenses.total <= (statsData.previousPeriod?.expenses?.total || 0),
      description: "За выбранный период",
      icon: Wallet,
      gradient: "from-[#ee9ca7] to-[#ffdde1]",
      iconColor: "text-red-600"
    },
    {
      title: "Чистая прибыль",
      value: statsData.currentPeriod.netProfit.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.netProfit, statsData.previousPeriod?.netProfit || 0),
      isPositive: statsData.currentPeriod.netProfit >= (statsData.previousPeriod?.netProfit || 0),
      description: "За выбранный период",
      icon: PieChart,
      gradient: "from-[#d299c2] to-[#fef9d7]",
      iconColor: "text-purple-600"
    }
  ] : [];

  const additionalStats = statsData ? [
    {
      title: "Логистика",
      value: statsData.currentPeriod.expenses.logistics.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.logistics, statsData.previousPeriod?.expenses?.logistics || 0),
      isPositive: statsData.currentPeriod.expenses.logistics <= (statsData.previousPeriod?.expenses?.logistics || 0),
      description: "За выбранный период",
      icon: Package,
      gradient: "from-[#243949] to-[#517fa4]",
      iconColor: "text-blue-500"
    },
    {
      title: "Хранение",
      value: statsData.currentPeriod.expenses.storage.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.storage, statsData.previousPeriod?.expenses?.storage || 0),
      isPositive: statsData.currentPeriod.expenses.storage <= (statsData.previousPeriod?.expenses?.storage || 0),
      description: "За выбранный период",
      icon: PackageCheck,
      gradient: "from-[#c1c161] to-[#d4d4b1]",
      iconColor: "text-green-500"
    },
    {
      title: "Штрафы",
      value: statsData.currentPeriod.expenses.penalties.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.penalties, statsData.previousPeriod?.expenses?.penalties || 0),
      isPositive: statsData.currentPeriod.expenses.penalties <= (statsData.previousPeriod?.expenses?.penalties || 0),
      description: "За выбранный период",
      icon: Receipt,
      gradient: "from-[#e6b980] to-[#eacda3]",
      iconColor: "text-red-500"
    },
    {
      title: "Приемка",
      value: statsData.currentPeriod.acceptance.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.acceptance, statsData.previousPeriod?.acceptance || 0),
      isPositive: statsData.currentPeriod.acceptance >= (statsData.previousPeriod?.acceptance || 0),
      description: "За выбранный период",
      icon: CheckSquare,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-teal-500"
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
              <h3 className="text-lg font-semibold mb-4">Дополнительная статистика</h3>
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

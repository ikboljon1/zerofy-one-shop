import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Wallet,
  PieChart,
  Package,
  PackageCheck,
  Receipt,
  CheckSquare,
  Loader2
} from "lucide-react";
import Chart from "@/components/Chart";

interface Store {
  id: string;
  marketplace: string;
  name: string;
  apiKey: string;
  isSelected?: boolean;
}

const Stats = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  const getSelectedStore = (): Store | null => {
    const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
    return stores.find((store: Store) => store.isSelected) || null;
  };

  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return "+0%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
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
      fetchStats();
    }
  }, [dateFrom, dateTo]);

  const prepareSalesTrendData = (data: any) => {
    if (!data || !data.dailySales) return [];
    
    return data.dailySales.map((item: any) => ({
      date: item.date,
      currentValue: item.sales,
      previousValue: item.previousSales
    }));
  };

  const prepareProductSalesData = (data: any) => {
    if (!data || !data.productSales) return [];
    
    return data.productSales.map((item: any) => ({
      name: item.subject_name,
      quantity: item.quantity
    }));
  };

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
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
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
          {renderStatsRow(stats, 0, 2)}
          {renderStatsRow(stats, 2, 4)}
          <Chart 
            salesTrend={prepareSalesTrendData(statsData)} 
            productSales={prepareProductSalesData(statsData)}
          />
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Дополнительная статистика</h3>
            {renderStatsRow(additionalStats, 0, 2)}
            {renderStatsRow(additionalStats, 2, 4)}
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

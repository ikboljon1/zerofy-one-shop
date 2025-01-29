import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, startOfWeek, endOfWeek } from "date-fns";
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
  CheckSquare
} from "lucide-react";

const Stats = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(startOfWeek(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const stores = JSON.parse(localStorage.getItem('stores') || '[]');
      if (stores.length === 0) {
        toast({
          title: "Внимание",
          description: "Добавьте магазин для получения статистики",
          variant: "destructive"
        });
        return;
      }
      const apiKey = stores[0].apiKey;
      const data = await fetchWildberriesStats(apiKey, dateFrom, dateTo);
      setStatsData(data);
    } catch (error) {
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
    fetchStats();
  }, [dateFrom, dateTo]);

  const stats = statsData ? [
    {
      title: "Продажа",
      value: statsData.sales.toLocaleString(),
      change: "+8.35%",
      isPositive: true,
      description: "За выбранный период",
      icon: DollarSign,
      gradient: "from-[#fdfcfb] to-[#e2d1c3]",
      iconColor: "text-green-600"
    },
    {
      title: "Перечислено",
      value: statsData.transferred.toLocaleString(),
      change: "+7.87%",
      isPositive: true,
      description: "За выбранный период",
      icon: CreditCard,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-blue-600"
    },
    {
      title: "Расходы",
      value: statsData.expenses.total.toLocaleString(),
      change: "-5.35%",
      isPositive: false,
      description: "За выбранный период",
      icon: Wallet,
      gradient: "from-[#ee9ca7] to-[#ffdde1]",
      iconColor: "text-red-600"
    },
    {
      title: "Чистая прибыль",
      value: statsData.netProfit.toLocaleString(),
      change: "+4.87%",
      isPositive: true,
      description: "За выбранный период",
      icon: PieChart,
      gradient: "from-[#d299c2] to-[#fef9d7]",
      iconColor: "text-purple-600"
    }
  ] : [];

  const additionalStats = statsData ? [
    {
      title: "Логистика",
      value: statsData.expenses.logistics.toLocaleString(),
      change: "-2.35%",
      isPositive: false,
      description: "За выбранный период",
      icon: Package,
      gradient: "from-[#243949] to-[#517fa4]",
      iconColor: "text-blue-500"
    },
    {
      title: "Хранение",
      value: statsData.expenses.storage.toLocaleString(),
      change: "+1.87%",
      isPositive: true,
      description: "За выбранный период",
      icon: PackageCheck,
      gradient: "from-[#c1c161] to-[#d4d4b1]",
      iconColor: "text-green-500"
    },
    {
      title: "Штрафы",
      value: statsData.expenses.penalties.toLocaleString(),
      change: "-3.35%",
      isPositive: false,
      description: "За выбранный период",
      icon: Receipt,
      gradient: "from-[#e6b980] to-[#eacda3]",
      iconColor: "text-red-500"
    },
    {
      title: "Приемка",
      value: statsData.acceptance.toLocaleString(),
      change: "+5.87%",
      isPositive: true,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {renderDatePicker(dateFrom, setDateFrom, "Выберите начальную дату")}
        {renderDatePicker(dateTo, setDateTo, "Выберите конечную дату")}
        <Button 
          onClick={fetchStats} 
          disabled={isLoading}
        >
          Обновить
        </Button>
      </div>
      
      {statsData ? (
        <>
          {renderStatsRow(stats, 0, 2)}
          {renderStatsRow(stats, 2, 4)}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Дополнительная статистика</h3>
            {renderStatsRow(additionalStats, 0, 2)}
            {renderStatsRow(additionalStats, 2, 4)}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isLoading ? "Загрузка данных..." : "Выберите период для просмотра статистики"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Stats;

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const INITIAL_OVERVIEW_DATA = {
  totalSales: 124850,
  totalCustomers: 1893,
  totalOrders: 3942,
  conversionRate: 3.2,
  previousPeriod: {
    totalSales: 98650,
    totalCustomers: 1745,
    totalOrders: 3568,
    conversionRate: 2.8
  },
  dailySales: [
    { date: '01/03', sales: 5200 },
    { date: '02/03', sales: 4800 },
    { date: '03/03', sales: 5900 },
    { date: '04/03', sales: 6100 },
    { date: '05/03', sales: 5500 },
    { date: '06/03', sales: 4900 },
    { date: '07/03', sales: 5800 }
  ],
  topSources: [
    { source: 'Прямой переход', visitors: 456, conversion: 5.2 },
    { source: 'Поиск', visitors: 892, conversion: 3.7 },
    { source: 'Социальные сети', visitors: 348, conversion: 2.9 },
    { source: 'Реклама', visitors: 621, conversion: 4.1 }
  ]
};

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

const AnalyticsOverview = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(INITIAL_OVERVIEW_DATA);
  
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // В будущем здесь будет запрос к API
      // const response = await fetch(`/api/analytics/overview?from=${from}&to=${to}`);
      // const data = await response.json();
      
      // Имитация задержки запроса
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Обновляем случайные данные для демонстрации
      const randomMultiplier = 0.8 + Math.random() * 0.4; // 80-120% от исходных данных
      
      setData({
        ...data,
        totalSales: Math.round(data.totalSales * randomMultiplier),
        totalCustomers: Math.round(data.totalCustomers * randomMultiplier),
        totalOrders: Math.round(data.totalOrders * randomMultiplier),
        conversionRate: Number((data.conversionRate * randomMultiplier).toFixed(1))
      });
      
      toast({
        title: "Данные обновлены",
        description: `Период: ${format(dateFrom, 'dd.MM.yyyy')} - ${format(dateTo, 'dd.MM.yyyy')}`,
      });
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные аналитики",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const stats = [
    {
      title: "Общие продажи",
      value: `${data.totalSales.toLocaleString('ru-RU')} ₽`,
      change: calculateChange(data.totalSales, data.previousPeriod.totalSales),
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: "Клиенты",
      value: data.totalCustomers.toLocaleString('ru-RU'),
      change: calculateChange(data.totalCustomers, data.previousPeriod.totalCustomers),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Заказы",
      value: data.totalOrders.toLocaleString('ru-RU'),
      change: calculateChange(data.totalOrders, data.previousPeriod.totalOrders),
      icon: ShoppingCart,
      color: "bg-purple-500",
    },
    {
      title: "Конверсия",
      value: `${data.conversionRate}%`,
      change: calculateChange(data.conversionRate, data.previousPeriod.conversionRate),
      icon: TrendingUp,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "PPP") : <span>Выберите дату</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={(date) => date && setDateFrom(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "PPP") : <span>Выберите дату</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={(date) => date && setDateTo(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <Button 
          onClick={fetchData} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-full ${stat.color} text-white`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className={`flex items-center ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{Math.abs(stat.change).toFixed(1)}%</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
            <p className="text-2xl font-bold">{stat.value}</p>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Продажи за период</h3>
          <div className="h-[300px]">
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground">График продаж за выбранный период</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Источники трафика</h3>
          <div className="space-y-4">
            {data.topSources.map((source, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{source.source}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">{source.visitors} посетителей</span>
                  <span className={`px-2 py-1 rounded ${source.conversion > 4 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {source.conversion}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsOverview;

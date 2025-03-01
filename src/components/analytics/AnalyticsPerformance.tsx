
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MOCK_PERFORMANCE_DATA = {
  dailyMetrics: [
    { date: "01/03", orders: 142, revenue: 45600, visitors: 1280, conversion: 11.1 },
    { date: "02/03", orders: 156, revenue: 52300, visitors: 1350, conversion: 11.6 },
    { date: "03/03", orders: 129, revenue: 41200, visitors: 1180, conversion: 10.9 },
    { date: "04/03", orders: 145, revenue: 47800, visitors: 1420, conversion: 10.2 },
    { date: "05/03", orders: 163, revenue: 55100, visitors: 1540, conversion: 10.6 },
    { date: "06/03", orders: 172, revenue: 58900, visitors: 1620, conversion: 10.6 },
    { date: "07/03", orders: 138, revenue: 43500, visitors: 1290, conversion: 10.7 },
  ],
  deviceMetrics: [
    { device: "Десктоп", visitors: 5250, orders: 612, conversion: 11.7 },
    { device: "Мобильный", visitors: 3890, orders: 403, conversion: 10.4 },
    { device: "Планшет", visitors: 540, orders: 50, conversion: 9.3 },
  ],
  locationMetrics: [
    { city: "Москва", visitors: 3250, orders: 382, conversion: 11.8 },
    { city: "Санкт-Петербург", visitors: 1890, orders: 213, conversion: 11.3 },
    { city: "Екатеринбург", visitors: 940, orders: 98, conversion: 10.4 },
    { city: "Новосибирск", visitors: 780, orders: 79, conversion: 10.1 },
    { city: "Казань", visitors: 650, orders: 68, conversion: 10.5 },
    { city: "Другие", visitors: 2170, orders: 225, conversion: 10.4 },
  ]
};

const AnalyticsPerformance = () => {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState(MOCK_PERFORMANCE_DATA);

  const fetchData = async () => {
    setIsLoading(true);
    console.log("Fetching performance for period:", dateFrom, "to", dateTo);
    
    try {
      // В будущем здесь будет запрос к API
      // const response = await fetch(`/api/analytics/performance?from=${from}&to=${to}`);
      // const data = await response.json();
      
      // Имитация задержки запроса
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Обновляем случайные данные для демонстрации
      const randomFactor = 0.8 + Math.random() * 0.4; // 80-120% от исходных данных
      
      const updatedDailyMetrics = performanceData.dailyMetrics.map(day => ({
        ...day,
        orders: Math.round(day.orders * randomFactor),
        revenue: Math.round(day.revenue * randomFactor),
        visitors: Math.round(day.visitors * randomFactor),
        conversion: Number((day.conversion * randomFactor).toFixed(1))
      }));
      
      const updatedDeviceMetrics = performanceData.deviceMetrics.map(device => ({
        ...device,
        visitors: Math.round(device.visitors * randomFactor),
        orders: Math.round(device.orders * randomFactor),
        conversion: Number((device.conversion * randomFactor).toFixed(1))
      }));
      
      const updatedLocationMetrics = performanceData.locationMetrics.map(location => ({
        ...location,
        visitors: Math.round(location.visitors * randomFactor),
        orders: Math.round(location.orders * randomFactor),
        conversion: Number((location.conversion * randomFactor).toFixed(1))
      }));
      
      setPerformanceData({
        dailyMetrics: updatedDailyMetrics,
        deviceMetrics: updatedDeviceMetrics,
        locationMetrics: updatedLocationMetrics
      });
      
      toast({
        title: "Данные обновлены",
        description: `Период: ${format(dateFrom, 'dd.MM.yyyy')} - ${format(dateTo, 'dd.MM.yyyy')}`,
      });
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные эффективности",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

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
              onSelect={(date) => {
                console.log("Selected performance date from:", date);
                if (date) setDateFrom(date);
              }}
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
              onSelect={(date) => {
                console.log("Selected performance date to:", date);
                if (date) setDateTo(date);
              }}
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
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ежедневные показатели</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3">Дата</th>
                  <th className="text-right pb-3">Посетители</th>
                  <th className="text-right pb-3">Заказы</th>
                  <th className="text-right pb-3">Конверсия</th>
                  <th className="text-right pb-3">Выручка</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.dailyMetrics.map((day, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3">{day.date}</td>
                    <td className="py-3 text-right">{day.visitors}</td>
                    <td className="py-3 text-right">{day.orders}</td>
                    <td className="py-3 text-right">{day.conversion}%</td>
                    <td className="py-3 text-right">{day.revenue.toLocaleString('ru-RU')} ₽</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-3">Всего</td>
                  <td className="py-3 text-right">
                    {performanceData.dailyMetrics.reduce((sum, day) => sum + day.visitors, 0)}
                  </td>
                  <td className="py-3 text-right">
                    {performanceData.dailyMetrics.reduce((sum, day) => sum + day.orders, 0)}
                  </td>
                  <td className="py-3 text-right">
                    {(performanceData.dailyMetrics.reduce((sum, day) => sum + day.orders, 0) / 
                      performanceData.dailyMetrics.reduce((sum, day) => sum + day.visitors, 0) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 text-right">
                    {performanceData.dailyMetrics.reduce((sum, day) => sum + day.revenue, 0).toLocaleString('ru-RU')} ₽
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">По устройствам</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3">Устройство</th>
                    <th className="text-right pb-3">Посетители</th>
                    <th className="text-right pb-3">Заказы</th>
                    <th className="text-right pb-3">Конверсия</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.deviceMetrics.map((device, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3">{device.device}</td>
                      <td className="py-3 text-right">{device.visitors}</td>
                      <td className="py-3 text-right">{device.orders}</td>
                      <td className="py-3 text-right">{device.conversion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">По городам</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3">Город</th>
                    <th className="text-right pb-3">Посетители</th>
                    <th className="text-right pb-3">Заказы</th>
                    <th className="text-right pb-3">Конверсия</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.locationMetrics.map((location, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3">{location.city}</td>
                      <td className="py-3 text-right">{location.visitors}</td>
                      <td className="py-3 text-right">{location.orders}</td>
                      <td className="py-3 text-right">{location.conversion}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPerformance;

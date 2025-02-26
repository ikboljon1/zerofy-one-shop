import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { fetchWildberriesStats } from "@/services/wildberriesApi";

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

const Analytics = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);

  const getSelectedStore = () => {
    const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
    return stores.find((store: any) => store.isSelected) || null;
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

  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return '0%';
    const change = ((current - previous) / previous) * 100;
    return `${Math.abs(change).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {renderDatePicker(dateFrom, setDateFrom, "Выберите начальную дату")}
        {renderDatePicker(dateTo, setDateTo, "Выберите конечную дату")}
        <Button onClick={fetchStats} disabled={isLoading}>
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

      {!statsData ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Выберите период для просмотра аналитики
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Анализ продаж</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Общая сумма продаж:</span>
                  <span className="font-semibold">{statsData.currentPeriod.sales.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Средний чек:</span>
                  <span className="font-semibold">
                    {(statsData.currentPeriod.sales / statsData.productSales.reduce((acc: number, curr: any) => acc + curr.quantity, 0)).toLocaleString()} ₽
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Анализ возвратов</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Сумма возвратов:</span>
                  <span className="font-semibold text-red-500">
                    {statsData.currentPeriod.expenses.total.toLocaleString()} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Процент возвратов:</span>
                  <span className="font-semibold text-red-500">
                    {((statsData.currentPeriod.expenses.total / statsData.currentPeriod.sales) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Прибыльность</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Чистая прибыль:</span>
                  <span className="font-semibold text-green-500">
                    {statsData.currentPeriod.netProfit.toLocaleString()} ₽
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Рентабельность:</span>
                  <span className="font-semibold">
                    {((statsData.currentPeriod.netProfit / statsData.currentPeriod.sales) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Динамика продаж</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={statsData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}.${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Продажи']}
                      labelFormatter={(label) => {
                        const date = new Date(label);
                        return format(date, 'dd.MM.yyyy');
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#8B5CF6"
                      fill="#8B5CF680"
                      name="Продажи"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Структура продаж по товарам</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsData.productSales}
                      dataKey="quantity"
                      nameKey="subject_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      label
                    >
                      {statsData.productSales.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Детальный анализ расходов</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="text-sm font-medium text-muted-foreground">Логистика</h4>
                  <p className="text-2xl font-bold mt-2">
                    {statsData.currentPeriod.expenses.logistics.toLocaleString()} ₽
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="text-sm font-medium text-muted-foreground">Хранение</h4>
                  <p className="text-2xl font-bold mt-2">
                    {statsData.currentPeriod.expenses.storage.toLocaleString()} ₽
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="text-sm font-medium text-muted-foreground">Штрафы</h4>
                  <p className="text-2xl font-bold mt-2">
                    {statsData.currentPeriod.expenses.penalties.toLocaleString()} ₽
                  </p>
                </div>
                <div className="p-4 bg-background rounded-lg border">
                  <h4 className="text-sm font-medium text-muted-foreground">Приемка</h4>
                  <p className="text-2xl font-bold mt-2">
                    {statsData.currentPeriod.acceptance.toLocaleString()} ₽
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { CalendarIcon, Loader2, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

const AnalyticsPerformance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const [data, setData] = useState({
    advertisingData: [
      { name: "Реклама в поиске", value: 12500 },
      { name: "Баннерная реклама", value: 8700 },
      { name: "Реклама в карточках", value: 7300 },
      { name: "Автоматическая реклама", value: 5200 },
      { name: "Другие форматы", value: 4100 }
    ],
    advertisingEfficiency: [
      { date: "01.05", costs: 1200, revenue: 5800 },
      { date: "02.05", costs: 1300, revenue: 6200 },
      { date: "03.05", costs: 1100, revenue: 5400 },
      { date: "04.05", costs: 1400, revenue: 6800 },
      { date: "05.05", costs: 1500, revenue: 7200 },
      { date: "06.05", costs: 1250, revenue: 6100 },
      { date: "07.05", costs: 1350, revenue: 6500 }
    ],
    conversionRate: [
      { date: "01.05", rate: 2.5 },
      { date: "02.05", rate: 2.7 },
      { date: "03.05", rate: 2.2 },
      { date: "04.05", rate: 3.1 },
      { date: "05.05", rate: 3.4 },
      { date: "06.05", rate: 2.9 },
      { date: "07.05", rate: 3.2 }
    ],
    categoryPerformance: [
      { name: "Одежда", sales: 45000, profit: 15000, aov: 2500 },
      { name: "Обувь", sales: 38000, profit: 12000, aov: 3200 },
      { name: "Аксессуары", sales: 22000, profit: 8000, aov: 1800 },
      { name: "Косметика", sales: 18000, profit: 6000, aov: 1500 },
      { name: "Другое", sales: 12000, profit: 4000, aov: 1200 }
    ]
  });

  const fetchData = () => {
    console.log("Обновление данных эффективности для периода:", { от: dateFrom, до: dateTo });
    setIsLoading(true);
    
    setTimeout(() => {
      const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24)) + 1;
      const efficiencyData = [];
      const rateData = [];
      
      for (let i = 0; i < Math.min(7, daysDiff); i++) {
        const currentDate = format(subDays(dateTo, Math.min(7, daysDiff) - 1 - i), 'dd.MM');
        efficiencyData.push({
          date: currentDate,
          costs: Math.floor(Math.random() * 800) + 800,
          revenue: Math.floor(Math.random() * 3000) + 4000
        });
        rateData.push({
          date: currentDate,
          rate: parseFloat((Math.random() * 2 + 1.5).toFixed(1))
        });
      }
      
      setData({
        advertisingData: data.advertisingData.map(item => ({
          name: item.name,
          value: Math.floor(Math.random() * 8000) + 4000
        })),
        advertisingEfficiency: efficiencyData,
        conversionRate: rateData,
        categoryPerformance: data.categoryPerformance.map(item => ({
          name: item.name,
          sales: Math.floor(Math.random() * 30000) + 10000,
          profit: Math.floor(Math.random() * 10000) + 4000,
          aov: Math.floor(Math.random() * 2000) + 1000
        }))
      });
      setIsLoading(false);
    }, 1500);
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const handleDateChange = (fromDate: Date | undefined, toDate: Date | undefined) => {
    if (fromDate) setDateFrom(fromDate);
    if (toDate) setDateTo(toDate);
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
          {date ? format(date, "dd.MM.yyyy") : <span>{label}</span>}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {renderDatePicker(dateFrom, (date) => handleDateChange(date, undefined), "Выберите начальную дату")}
        {renderDatePicker(dateTo, (date) => handleDateChange(undefined, date), "Выберите конечную дату")}
        <Button 
          onClick={fetchData} 
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

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Структура расходов на рекламу</h3>
          <div className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-md">
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.advertisingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.advertisingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
                  contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {data.advertisingData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="font-medium">{item.value.toLocaleString()} ₽</span>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Общая сумма:</span>
                <span className="font-bold">
                  {data.advertisingData.reduce((sum, item) => sum + item.value, 0).toLocaleString()} ₽
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Эффективность рекламы</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.advertisingEfficiency}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
                contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="costs" name="Затраты" fill="#EC4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Выручка" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Конверсия</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.conversionRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis 
                stroke="#9ca3af"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: any) => [`${value}%`, 'Конверсия']}
                contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Эффективность категорий</h3>
          <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-md">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Категория</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Продажи</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Прибыль</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Средний чек</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Маржа</th>
              </tr>
            </thead>
            <tbody>
              {data.categoryPerformance.map((item, index) => (
                <tr key={index} className="border-b dark:border-gray-700">
                  <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-right text-sm">{item.sales.toLocaleString()} ₽</td>
                  <td className="px-4 py-3 text-right text-sm">{item.profit.toLocaleString()} ₽</td>
                  <td className="px-4 py-3 text-right text-sm">{item.aov.toLocaleString()} ₽</td>
                  <td className="px-4 py-3 text-right text-sm">
                    {((item.profit / item.sales) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50">
                <td className="px-4 py-3 font-medium">Итого</td>
                <td className="px-4 py-3 text-right font-medium">
                  {data.categoryPerformance.reduce((sum, item) => sum + item.sales, 0).toLocaleString()} ₽
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {data.categoryPerformance.reduce((sum, item) => sum + item.profit, 0).toLocaleString()} ₽
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {(data.categoryPerformance.reduce((sum, item) => sum + item.aov, 0) / data.categoryPerformance.length).toFixed(0)} ₽
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {((data.categoryPerformance.reduce((sum, item) => sum + item.profit, 0) / 
                    data.categoryPerformance.reduce((sum, item) => sum + item.sales, 0)) * 100).toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPerformance;

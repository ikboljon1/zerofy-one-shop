import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { CalendarIcon, Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, PackageX, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

const AnalyticsOverview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const [data, setData] = useState({
    summary: {
      totalSales: 1250000,
      orderCount: 500,
      totalDeductions: 125000,
      netProfit: 875000
    },
    dailySales: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
      sales: Math.floor(Math.random() * 50000) + 20000
    })),
    categories: [
      { name: "Одежда", value: 45 },
      { name: "Обувь", value: 25 },
      { name: "Аксессуары", value: 15 },
      { name: "Косметика", value: 10 },
      { name: "Другое", value: 5 }
    ],
    orders: [
      { date: "Пн", count: 65 },
      { date: "Вт", count: 75 },
      { date: "Ср", count: 85 },
      { date: "Чт", count: 70 },
      { date: "Пт", count: 90 },
      { date: "Сб", count: 100 },
      { date: "Вс", count: 80 }
    ]
  });

  const fetchData = () => {
    console.log("Обновление данных для периода:", { от: dateFrom, до: dateTo });
    setIsLoading(true);
    
    setTimeout(() => {
      const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24)) + 1;
      
      setData({
        summary: {
          totalSales: Math.floor(Math.random() * 500000) + 1000000,
          orderCount: Math.floor(Math.random() * 200) + 400,
          totalDeductions: Math.floor(Math.random() * 50000) + 100000,
          netProfit: Math.floor(Math.random() * 300000) + 700000
        },
        dailySales: Array.from({ length: daysDiff }, (_, i) => ({
          date: format(subDays(dateTo, daysDiff - 1 - i), 'yyyy-MM-dd'),
          sales: Math.floor(Math.random() * 50000) + 20000
        })),
        categories: [
          { name: "Одежда", value: Math.floor(Math.random() * 20) + 40 },
          { name: "Обувь", value: Math.floor(Math.random() * 10) + 20 },
          { name: "Аксессуары", value: Math.floor(Math.random() * 5) + 10 },
          { name: "Косметика", value: Math.floor(Math.random() * 5) + 5 },
          { name: "Другое", value: Math.floor(Math.random() * 5) + 5 }
        ],
        orders: [
          { date: "Пн", count: Math.floor(Math.random() * 30) + 60 },
          { date: "Вт", count: Math.floor(Math.random() * 30) + 60 },
          { date: "Ср", count: Math.floor(Math.random() * 30) + 60 },
          { date: "Чт", count: Math.floor(Math.random() * 30) + 60 },
          { date: "Пт", count: Math.floor(Math.random() * 30) + 60 },
          { date: "Сб", count: Math.floor(Math.random() * 30) + 60 },
          { date: "Вс", count: Math.floor(Math.random() * 30) + 60 }
        ]
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Общая сумма продаж</p>
              <h3 className="text-2xl font-bold">{data.summary.totalSales.toLocaleString()} ₽</h3>
              <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12.5% с прошлого периода</span>
              </div>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/60 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Количество заказов</p>
              <h3 className="text-2xl font-bold">{data.summary.orderCount}</h3>
              <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+8.2% с прошлого периода</span>
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/60 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-200 dark:border-red-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Общие удержания</p>
              <h3 className="text-2xl font-bold">{data.summary.totalDeductions.toLocaleString()} ₽</h3>
              <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span>+3.7% с прошлого периода</span>
              </div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/60 p-3 rounded-full">
              <PackageX className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-200 dark:border-green-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Чистая прибыль</p>
              <h3 className="text-2xl font-bold">{data.summary.netProfit.toLocaleString()} ₽</h3>
              <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+15.3% с прошлого периода</span>
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/60 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Динамика продаж</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailySales}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const parts = value.split('-');
                    return `${parts[2]}.${parts[1]}`;
                  }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  stroke="#9ca3af"
                  tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Продажи']}
                  labelFormatter={(label) => {
                    const parts = label.split('-');
                    return `${parts[2]}.${parts[1]}.${parts[0]}`;
                  }}
                  contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                  name="Продажи"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Распределение по категориям</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, '']}
                  contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Количество заказов по дням недели</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.orders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                formatter={(value: any) => [`${value} заказов`, '']}
                contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="count" name="Заказы" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { CalendarIcon, Loader2, PackageX, AlertCircle, Truck, WarehouseIcon } from "lucide-react";
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
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

const AnalyticsDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const [data, setData] = useState({
    deductionsTimeline: [
      { date: "01.05", logistic: 1200, storage: 800, penalties: 500 },
      { date: "02.05", logistic: 1100, storage: 900, penalties: 300 },
      { date: "03.05", logistic: 1500, storage: 750, penalties: 800 },
      { date: "04.05", logistic: 1300, storage: 850, penalties: 200 },
      { date: "05.05", logistic: 1400, storage: 950, penalties: 600 },
      { date: "06.05", logistic: 1250, storage: 700, penalties: 400 },
      { date: "07.05", logistic: 1600, storage: 800, penalties: 350 }
    ],
    penalties: [
      { name: "Брак товара", value: 5000 },
      { name: "Недопоставка", value: 3500 },
      { name: "Нарушение упаковки", value: 2800 },
      { name: "Нарушение маркировки", value: 1200 },
      { name: "Другие причины", value: 2500 }
    ],
    returns: [
      { name: "Не подошел размер", value: 12000 },
      { name: "Не соответствует описанию", value: 8500 },
      { name: "Брак", value: 6300 },
      { name: "Передумал", value: 4200 },
      { name: "Другие причины", value: 3000 }
    ],
    expenses: {
      logistics: 45000,
      storage: 35000,
      penalties: 15000
    }
  });

  const fetchData = () => {
    console.log("Обновление детальных данных для периода:", { от: dateFrom, до: dateTo });
    setIsLoading(true);
    
    setTimeout(() => {
      const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24)) + 1;
      const timelineData = [];
      
      for (let i = 0; i < Math.min(7, daysDiff); i++) {
        const currentDate = format(subDays(dateTo, Math.min(7, daysDiff) - 1 - i), 'dd.MM');
        timelineData.push({
          date: currentDate,
          logistic: Math.floor(Math.random() * 800) + 800,
          storage: Math.floor(Math.random() * 400) + 600,
          penalties: Math.floor(Math.random() * 600) + 200
        });
      }
      
      setData({
        deductionsTimeline: timelineData,
        penalties: data.penalties.map(item => ({
          name: item.name,
          value: Math.floor(Math.random() * 4000) + 1000
        })),
        returns: data.returns.map(item => ({
          name: item.name,
          value: Math.floor(Math.random() * 8000) + 3000
        })),
        expenses: {
          logistics: Math.floor(Math.random() * 20000) + 35000,
          storage: Math.floor(Math.random() * 15000) + 25000,
          penalties: Math.floor(Math.random() * 10000) + 10000
        }
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
        <h3 className="text-lg font-semibold mb-6">Структура расходов</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border border-purple-200 dark:border-purple-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-medium">Логистика</h4>
              <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-md">
                <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{data.expenses.logistics.toLocaleString()} ₽</p>
            <span className="text-xs text-muted-foreground mt-1">
              {((data.expenses.logistics / (data.expenses.logistics + data.expenses.storage + data.expenses.penalties)) * 100).toFixed(1)}% от общих расходов
            </span>
            <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800/50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Доставка до клиента</span>
                  <span className="font-medium">{(data.expenses.logistics * 0.65).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Доставка на склад</span>
                  <span className="font-medium">{(data.expenses.logistics * 0.35).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-medium">Хранение</h4>
              <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-md">
                <WarehouseIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{data.expenses.storage.toLocaleString()} ₽</p>
            <span className="text-xs text-muted-foreground mt-1">
              {((data.expenses.storage / (data.expenses.logistics + data.expenses.storage + data.expenses.penalties)) * 100).toFixed(1)}% от общих расходов
            </span>
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800/50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Хранение на складах</span>
                  <span className="font-medium">{(data.expenses.storage * 0.8).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Обработка товаров</span>
                  <span className="font-medium">{(data.expenses.storage * 0.2).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-medium">Штрафы</h4>
              <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold">{data.expenses.penalties.toLocaleString()} ₽</p>
            <span className="text-xs text-muted-foreground mt-1">
              {((data.expenses.penalties / (data.expenses.logistics + data.expenses.storage + data.expenses.penalties)) * 100).toFixed(1)}% от общих расходов
            </span>
            <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800/50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Брак и повреждения</span>
                  <span className="font-medium">{(data.expenses.penalties * 0.45).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Нарушение правил</span>
                  <span className="font-medium">{(data.expenses.penalties * 0.55).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Структура удержаний по дням</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.deductionsTimeline} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
              <Tooltip
                formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
                contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="logistic" name="Логистика" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="storage" name="Хранение" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="penalties" name="Штрафы" fill="#EC4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Детализация по штрафам</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.penalties}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.penalties.map((entry, index) => (
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
              {data.penalties.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Причины возвратов</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.returns}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.returns.map((entry, index) => (
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
              {data.returns.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDetails;


import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface SalesChartProps {
  data: {
    dailySales: Array<{
      date: string;
      sales: number;
    }>;
  };
}

// Добавим компонент для обработки данных из продаж Wildberries
interface SalesProps {
  sales: Array<{
    date: string;
    orderNumber: string;
    productName: string;
    price: number;
    commission: number;
    status: string;
  }>;
}

const SalesChart = ({ data, sales }: SalesChartProps & Partial<SalesProps>) => {
  const isMobile = useIsMobile();
  
  // Преобразуем данные продаж Wildberries в формат для графика, если они переданы
  const processWildberriesSales = () => {
    if (sales && sales.length > 0) {
      // Группируем продажи по датам и суммируем
      const salesByDate: Record<string, number> = {};
      
      sales.forEach(sale => {
        const dateKey = sale.date.split('T')[0]; // Получаем только дату
        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = 0;
        }
        salesByDate[dateKey] += sale.price;
      });
      
      // Преобразуем в массив для графика
      const dailySales = Object.keys(salesByDate).map(date => ({
        date,
        sales: salesByDate[date]
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return { dailySales };
    }
    return null;
  };
  
  // Используем данные из props или преобразованные данные продаж
  const chartData = data || processWildberriesSales();
  
  // Check if data is valid and has sales data
  const hasSalesData = chartData && chartData.dailySales && chartData.dailySales.length > 0;
  
  // Calculate average sales
  const avgSales = hasSalesData 
    ? chartData.dailySales.reduce((sum, item) => sum + item.sales, 0) / chartData.dailySales.length
    : 0;
  
  if (!hasSalesData) {
    return (
      <Card className="p-6 shadow-xl border-purple-100/30 dark:border-purple-800/20 rounded-xl overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">Динамика продаж</h3>
          <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-full shadow-inner">
            <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Нет данных о продажах за выбранный период</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6 shadow-xl border-purple-100/30 dark:border-purple-800/20 rounded-xl overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
          Динамика продаж
        </h3>
        <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-full shadow-inner">
          <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData.dailySales} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#8B5CF6" floodOpacity="0.3"/>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}.${date.getMonth() + 1}`;
              }}
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              stroke="#9ca3af"
              tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip 
              formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Продажи']}
              labelFormatter={(label) => {
                try {
                  const date = new Date(label);
                  return format(date, 'dd.MM.yyyy');
                } catch (e) {
                  return label;
                }
              }}
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            {!isMobile && (
              <ReferenceLine 
                y={avgSales} 
                stroke="#8B5CF6" 
                strokeDasharray="3 3"
                label={{
                  value: "Средние продажи",
                  position: "insideTopLeft",
                  fill: "#8B5CF6",
                  fontSize: 12
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#8B5CF6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Продажи"
              activeDot={{ 
                r: 6, 
                strokeWidth: 0, 
                fill: "#8B5CF6",
                filter: "url(#shadow)" 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesChart;

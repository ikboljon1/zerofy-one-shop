import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WildberriesOrder } from "@/types/store";
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay, eachHourOfInterval, addHours, isSameDay, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  BarChart, 
  Bar,
  RadialBarChart,
  RadialBar,
  LabelList
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShoppingBag, TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface OrdersChartProps {
  orders: WildberriesOrder[];
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', 
  '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#ff0000'
];

const OrdersChart: React.FC<OrdersChartProps> = ({ orders }) => {
  const isMobile = useIsMobile();
  
  const shouldDisplayHourly = useMemo(() => {
    if (orders.length === 0) return false;
    
    const firstOrderDate = new Date(orders[0].date);
    return isToday(firstOrderDate) || isYesterday(firstOrderDate);
  }, [orders]);

  const dailyOrdersData = useMemo(() => {
    if (orders.length === 0) return [];
    
    if (shouldDisplayHourly) {
      const orderDate = new Date(orders[0].date);
      const dayStart = startOfDay(orderDate);
      const dayEnd = endOfDay(orderDate);
      
      const hoursInterval = eachHourOfInterval({
        start: dayStart,
        end: dayEnd,
      });
      
      return hoursInterval.map(hour => {
        const hourEnd = addHours(hour, 1);
        
        const ordersInHour = orders.filter(order => {
          const orderTime = new Date(order.date);
          return orderTime >= hour && orderTime < hourEnd;
        });
        
        const activeOrders = ordersInHour.filter(order => !order.isCancel).length;
        const cancelledOrders = ordersInHour.filter(order => order.isCancel).length;
        const returnedOrders = ordersInHour.filter(order => order.isReturn).length;
        
        return {
          date: format(hour, 'HH:00', { locale: ru }),
          active: activeOrders,
          cancelled: cancelledOrders,
          returned: returnedOrders,
          total: activeOrders + cancelledOrders + returnedOrders,
        };
      });
    } else {
      const today = new Date();
      const sevenDaysAgo = subDays(today, 6);
      
      const daysInterval = eachDayOfInterval({
        start: sevenDaysAgo,
        end: today,
      });
      
      return daysInterval.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        
        const ordersOnDay = orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= dayStart && orderDate <= dayEnd;
        });
        
        const activeOrders = ordersOnDay.filter(order => !order.isCancel).length;
        const cancelledOrders = ordersOnDay.filter(order => order.isCancel).length;
        const returnedOrders = ordersOnDay.filter(order => order.isReturn).length;
        
        return {
          date: format(day, 'dd.MM', { locale: ru }),
          active: activeOrders,
          cancelled: cancelledOrders,
          returned: returnedOrders,
          total: activeOrders + cancelledOrders + returnedOrders,
        };
      });
    }
  }, [orders, shouldDisplayHourly]);

  const cancelledVsActiveData = useMemo(() => {
    const active = orders.filter(order => !order.isCancel && !order.isReturn).length;
    const cancelled = orders.filter(order => order.isCancel).length;
    const returned = orders.filter(order => order.isReturn).length;
    
    return [
      { name: 'Активные', value: active, fill: '#10b981' },
      { name: 'Отменённые', value: cancelled, fill: '#ef4444' },
      { name: 'Возвраты', value: returned, fill: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [orders]);

  const warehouseData = useMemo(() => {
    if (orders.length === 0) return [];
    
    const warehouseCounts: Record<string, number> = {};
    
    orders.forEach(order => {
      if (!order.warehouseName) return;
      warehouseCounts[order.warehouseName] = (warehouseCounts[order.warehouseName] || 0) + 1;
    });
    
    return Object.entries(warehouseCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [orders]);

  const orderConfig = {
    active: {
      label: "Активные заказы",
      theme: {
        light: "#10b981",
        dark: "#059669",
      },
    },
    cancelled: {
      label: "Отмененные заказы",
      theme: {
        light: "#ef4444",
        dark: "#dc2626",
      },
    },
    returned: {
      label: "Возвраты",
      theme: {
        light: "#f59e0b",
        dark: "#d97706",
      },
    },
    total: {
      label: "Всего заказов",
      theme: {
        light: "#6366f1",
        dark: "#4f46e5",
      },
    },
  };

  const totalOrders = cancelledVsActiveData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2 border-b border-indigo-100/50 dark:border-indigo-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                {shouldDisplayHourly ? 'Заказы по часам' : 'Заказы по дням'}
              </span>
            </CardTitle>
            <div className="text-xs text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-2 py-1 rounded-full shadow-sm">
              {shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px]">
            <ChartContainer 
              config={orderConfig}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyOrdersData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-active)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--color-active)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-cancelled)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--color-cancelled)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-returned)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--color-returned)" stopOpacity={0.1}/>
                    </linearGradient>
                    <filter id="shadow" x="-2" y="-2" width="104%" height="104%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    tickLine={{ stroke: 'var(--border)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => value === 0 ? '0' : value}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                    tickLine={{ stroke: 'var(--border)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="active" 
                    stroke="var(--color-active)" 
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    activeDot={{ r: 7, strokeWidth: 1, stroke: "#fff", fill: "var(--color-active)", filter: "url(#shadow)" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cancelled" 
                    stroke="var(--color-cancelled)" 
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCancelled)"
                    activeDot={{ r: 7, strokeWidth: 1, stroke: "#fff", fill: "var(--color-cancelled)", filter: "url(#shadow)" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="returned" 
                    stroke="var(--color-returned)" 
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReturned)"
                    activeDot={{ r: 7, strokeWidth: 1, stroke: "#fff", fill: "var(--color-returned)", filter: "url(#shadow)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2 border-b border-indigo-100/50 dark:border-indigo-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                Распределение заказов
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                innerRadius="30%" 
                outerRadius="90%" 
                data={cancelledVsActiveData} 
                startAngle={90} 
                endAngle={-270}
                cx="50%"
                cy="50%"
              >
                <RadialBar
                  background={{ fill: 'rgba(0,0,0,0.05)' }}
                  label={{ 
                    position: 'insideStart', 
                    fill: '#fff', 
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                  cornerRadius={12}
                  dataKey="value"
                >
                  <LabelList 
                    dataKey="name" 
                    position="outside" 
                    fill="#888" 
                    fontSize={12} 
                    offset={15}
                    formatter={(value: string) => {
                      const item = cancelledVsActiveData.find(item => item.name === value);
                      const percentage = item && totalOrders > 0 ? 
                        `${Math.round((item.value / totalOrders) * 100)}%` : '';
                      return `${value} ${percentage}`;
                    }}
                  />
                </RadialBar>
                <Tooltip
                  formatter={(value) => [`${value} заказов`, ""]}
                  contentStyle={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.97)", 
                    borderRadius: "8px", 
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex flex-col items-center justify-center shadow-lg border border-indigo-200/50 dark:border-indigo-800/50 animate-pulse-slow">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                  {totalOrders}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">заказов</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground bg-background/80 dark:bg-gray-800/80 p-2 rounded border border-border">
            <h4 className="font-medium mb-1">Как рассчитываются данные</h4>
            <ul className="list-disc pl-4 space-y-1 text-[10px]">
              <li>Данные собираются из ваших заказов Wildberries с помощью API</li>
              <li>Для складов мы группируем заказы по полю warehouseName из ответа API</li>
              <li>Для регионов мы группируем заказы по полю regionName из ответа API</li>
              <li>Мы подсчитываем вхождения каждого склада/региона и расчитываем проценты</li>
              <li>Диаграммы отображают 5 лучших складов и регионов по количеству заказов</li>
              <li>Эти географические данные предоставляют ценную информацию о том, где хранятся ваши продукты и где находятся ваши клиенты, помогая вам оптимизировать ваши логистические и маркетинговые стратегии.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersChart;

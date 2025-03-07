
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
  Legend
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShoppingBag, TrendingUp } from "lucide-react";

interface OrdersChartProps {
  orders: WildberriesOrder[];
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];

const OrdersChart: React.FC<OrdersChartProps> = ({ orders }) => {
  const isMobile = useIsMobile();
  
  const shouldDisplayHourly = useMemo(() => {
    if (orders.length === 0) return false;
    
    // Check if all orders are from today or yesterday
    const firstOrderDate = new Date(orders[0].date);
    return isToday(firstOrderDate) || isYesterday(firstOrderDate);
  }, [orders]);

  const dailyOrdersData = useMemo(() => {
    if (orders.length === 0) return [];
    
    if (shouldDisplayHourly) {
      // Get the date of the first order (assuming all orders are from the same day - today or yesterday)
      const orderDate = new Date(orders[0].date);
      const dayStart = startOfDay(orderDate);
      const dayEnd = endOfDay(orderDate);
      
      // Generate array of all hours in the day
      const hoursInterval = eachHourOfInterval({
        start: dayStart,
        end: dayEnd,
      });
      
      // Count orders per hour
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
      // Get date range for the last 7 days
      const today = new Date();
      const sevenDaysAgo = subDays(today, 6); // 7 days including today
      
      // Generate array of all days
      const daysInterval = eachDayOfInterval({
        start: sevenDaysAgo,
        end: today,
      });
      
      // Count orders per day
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
      { name: 'Активные', value: active },
      { name: 'Отменённые', value: cancelled },
      { name: 'Возвраты', value: returned },
    ];
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

  const totalOrders = cancelledVsActiveData.reduce((sum, type) => sum + type.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                {shouldDisplayHourly ? 'Заказы по часам' : 'Заказы по дням'}
              </span>
            </CardTitle>
            <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-900/50 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800/60 shadow-sm">
              {shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                      <stop offset="5%" stopColor="var(--color-active)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-active)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-cancelled)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-cancelled)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-returned)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-returned)" stopOpacity={0.1}/>
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: 'var(--border)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => value === 0 ? '0' : value}
                    tick={{ fontSize: 12 }}
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
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    activeDot={{ r: 8, strokeWidth: 0, style: { filter: 'drop-shadow(0 0 4px var(--color-active))' } }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cancelled" 
                    stroke="var(--color-cancelled)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCancelled)"
                    activeDot={{ r: 8, strokeWidth: 0, style: { filter: 'drop-shadow(0 0 4px var(--color-cancelled))' } }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="returned" 
                    stroke="var(--color-returned)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReturned)"
                    activeDot={{ r: 8, strokeWidth: 0, style: { filter: 'drop-shadow(0 0 4px var(--color-returned))' } }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                Распределение заказов
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {cancelledVsActiveData.map((entry, index) => (
                    <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS[index]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={COLORS[index]} stopOpacity={0.7}/>
                    </linearGradient>
                    ))}
                  <filter id="orderGlow">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <Pie
                  data={cancelledVsActiveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => {
                    if (typeof percent !== 'number' || percent < 0.05) return null;
                    return `${name}: ${(percent * 100).toFixed(0)}%`;
                  }}
                >
                  {cancelledVsActiveData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient-${index})`} 
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth={2}
                      style={{ filter: 'url(#orderGlow)' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} заказов (${((value / totalOrders) * 100).toFixed(1)}%)`, 
                    name
                  ]}
                  contentStyle={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.97)", 
                    borderRadius: "8px", 
                    border: "1px solid var(--border)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-sm font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
              <div className="w-[140px] h-[140px] rounded-full flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-indigo-300/60 dark:border-indigo-600/40 shadow-lg">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400">
                    {totalOrders}
                  </div>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    всего заказов
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersChart;

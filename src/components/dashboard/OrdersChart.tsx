import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WildberriesOrder } from "@/types/store";
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay, eachHourOfInterval, addHours, isToday, isYesterday } from "date-fns";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { ShoppingBag, TrendingUp } from "lucide-react";

interface OrdersChartProps {
  orders: WildberriesOrder[];
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EF4444', '#14B8A6', '#8B5CF6', '#D946EF'];

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
                {shouldDisplayHourly ? 'Заказы по часам' : 'Заказы по дням'}
              </span>
            </CardTitle>
            <div className="text-xs text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
              {shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyOrdersData}
                margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tickFormatter={(value) => value === 0 ? '0' : value}
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                  tickLine={{ stroke: '#e5e7eb' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    const labels = {
                      active: 'Активные',
                      cancelled: 'Отменённые',
                      returned: 'Возвраты',
                      total: 'Всего'
                    };
                    return [value, labels[name as keyof typeof labels] || name];
                  }}
                  contentStyle={{ 
                    background: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cancelled" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCancelled)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#ef4444" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="returned" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReturned)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: "#f59e0b" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
                Распределение заказов
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {cancelledVsActiveData.map((entry, index) => (
                    <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
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
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {cancelledVsActiveData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient-${index})`} 
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} заказов`, ""]}
                  contentStyle={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.97)", 
                    borderRadius: "8px", 
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}
                />
                <Legend 
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={10}
                  formatter={(value, entry) => (
                    <span className="text-sm font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersChart;

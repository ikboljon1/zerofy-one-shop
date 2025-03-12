import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WildberriesOrder, WildberriesSale } from "@/types/store";
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
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
  Line
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShoppingBag, TrendingUp, BarChart3 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface OrdersChartProps {
  orders: WildberriesOrder[];
  sales?: WildberriesSale[];
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F97316', '#0EA5E9', '#D946EF'];
const PRODUCT_COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#F97316", "#0EA5E9"];

const OrdersChart: React.FC<OrdersChartProps> = ({ orders, sales = [] }) => {
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

  const productSalesDistribution = useMemo(() => {
    if (!sales || sales.length === 0) return [];

    const productCounts: Record<string, number> = {};
    
    const validSales = sales.filter(sale => !sale.isReturn && sale.priceWithDisc > 0);
    let totalProducts = validSales.length;

    validSales.forEach(sale => {
      const productName = sale.subject || "Неизвестный товар";
      productCounts[productName] = (productCounts[productName] || 0) + 1;
    });

    const productsData = Object.entries(productCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: totalProducts > 0 ? (count / totalProducts) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
    
    return productsData;
  }, [sales]);

  const orderConfig = {
    active: {
      label: "Активные заказы",
      theme: {
        light: "#10b981",
        dark: "#059669",
      },
    },
    cancelled: {
      label: "Отменённые заказы",
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

  const monthlyOrderTrends = useMemo(() => {
    if (orders.length === 0) return [];
    
    const ordersByMonth = orders.reduce((acc, order) => {
      const date = new Date(order.date);
      const monthKey = format(date, 'MM.yyyy', { locale: ru });
      
      if (!acc[monthKey]) {
        acc[monthKey] = { 
          month: format(date, 'MMMM', { locale: ru }), 
          active: 0, 
          cancelled: 0,
          total: 0,
          revenue: 0
        };
      }
      
      acc[monthKey].total += 1;
      
      if (order.isCancel) {
        acc[monthKey].cancelled += 1;
      } else {
        acc[monthKey].active += 1;
        acc[monthKey].revenue += order.priceWithDisc;
      }
      
      return acc;
    }, {} as Record<string, { month: string; active: number; cancelled: number; total: number; revenue: number }>);
    
    return Object.values(ordersByMonth).slice(-5);
  }, [orders]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-indigo-50/40 dark:from-gray-900 dark:to-indigo-950/30 backdrop-blur-sm">
        <CardHeader className="pb-2 border-b border-indigo-100/40 dark:border-indigo-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100/80 dark:bg-indigo-900/50 shadow-inner">
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700 dark:from-indigo-400 dark:to-violet-400 font-bold">
                {shouldDisplayHourly ? 'Заказы по часам' : 'Динамика заказов'}
              </span>
            </CardTitle>
            <div className="text-xs font-medium text-indigo-700/70 dark:text-indigo-300/70 bg-indigo-50/80 dark:bg-indigo-900/50 px-3 py-1 rounded-full border border-indigo-100/50 dark:border-indigo-800/30 shadow-sm">
              {shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[320px]">
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
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#8B5CF6" floodOpacity="0.3"/>
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
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    activeDot={{ r: 6, strokeWidth: 0, filter: "url(#shadow)" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cancelled" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCancelled)"
                    activeDot={{ r: 6, strokeWidth: 0, filter: "url(#shadow)" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="returned" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReturned)"
                    activeDot={{ r: 6, strokeWidth: 0, filter: "url(#shadow)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-fuchsia-50/40 dark:from-gray-900 dark:to-fuchsia-950/30 backdrop-blur-sm">
        <CardHeader className="pb-2 border-b border-fuchsia-100/40 dark:border-fuchsia-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-100/80 dark:bg-fuchsia-900/50 shadow-inner">
                <ShoppingBag className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-700 to-purple-700 dark:from-fuchsia-400 dark:to-purple-400 font-bold">
                Продажи по товарам
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[320px]">
            {productSalesDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {productSalesDistribution.map((entry, index) => (
                      <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                    <filter id="pieGlow" height="300%" width="300%" x="-100%" y="-100%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -5" result="glow" />
                      <feComposite in="SourceGraphic" in2="glow" operator="over" />
                    </filter>
                  </defs>
                  <Pie
                    data={productSalesDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ name, percentage }) => 
                      percentage >= 5 ? `${name.substring(0, 15)}${name.length > 15 ? '...' : ''}: ${percentage.toFixed(1)}%` : ''
                    }
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {productSalesDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#pieGradient-${index % PRODUCT_COLORS.length})`} 
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth={3}
                        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name) => [`${value} шт. (${(productSalesDistribution.find(p => p.name === name)?.percentage || 0).toFixed(1)}%)`, name]}
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.97)", 
                      borderRadius: "8px", 
                      border: "1px solid var(--border)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    animationDuration={300}
                  />
                  <Legend 
                    layout={isMobile ? "horizontal" : "vertical"}
                    align={isMobile ? "center" : "right"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={isMobile ? { paddingTop: "10px" } : { paddingRight: "10px" }}
                    formatter={(value, entry) => {
                      const item = productSalesDistribution.find(p => p.name === value);
                      return (
                        <span className="text-sm font-medium text-ellipsis overflow-hidden" style={{ maxWidth: isMobile ? '80px' : '120px', display: 'inline-block' }}>
                          {value.length > (isMobile ? 10 : 20) ? value.substring(0, isMobile ? 10 : 20) + '...' : value}
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Нет данных о продажах за выбранный период</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-orange-50/40 dark:from-gray-900 dark:to-orange-950/30 backdrop-blur-sm lg:col-span-2">
        <CardHeader className="pb-2 border-b border-orange-100/40 dark:border-orange-800/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100/80 dark:bg-orange-900/50 shadow-inner">
                <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-500 dark:from-orange-400 dark:to-amber-300 font-bold">
                Статистика продаж по месяцам
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px]">
            {monthlyOrderTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyOrderTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  barSize={40}
                  barGap={8}
                >
                  <defs>
                    <linearGradient id="barActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="barCancelled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#EF4444" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="barRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#F97316" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 13, fontWeight: 500 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    orientation="left"
                    tickFormatter={(value) => value}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Заказы (шт)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--muted-foreground)', fontSize: 12 } }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Выручка (₽)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: 'var(--muted-foreground)', fontSize: 12 } }}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "revenue") return [`${formatCurrency(value as number)} ₽`, "Выручка"];
                      if (name === "active") return [`${value} шт.`, "Активные заказы"];
                      if (name === "cancelled") return [`${value} шт.`, "Отмененные заказы"];
                      return [value, name];
                    }}
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.97)", 
                      borderRadius: "8px", 
                      border: "1px solid var(--border)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                    animationDuration={300}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === "active") return "Активные заказы";
                      if (value === "cancelled") return "Отмененные заказы";
                      if (value === "revenue") return "Выручка";
                      return value;
                    }}
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="active" 
                    name="active"
                    fill="url(#barActive)" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="cancelled" 
                    name="cancelled"
                    fill="url(#barCancelled)" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    animationBegin={300}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="revenue"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#F97316", strokeWidth: 1, stroke: "white" }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    animationBegin={600}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">Нет данных за выбранный период</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersChart;

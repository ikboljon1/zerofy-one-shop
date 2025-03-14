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
  Legend 
} from 'recharts';
import { formatCurrency } from "@/utils/formatCurrency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreditCard, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

interface OrdersChartProps {
  orders: WildberriesOrder[];
  sales: WildberriesSale[];
}

// Updated professional color palette
const COLORS = ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#7C3AED', '#DB2777', '#064E3B', '#1E40AF', '#9333EA', '#DC2626'];

const OrdersChart: React.FC<OrdersChartProps> = React.memo(({ orders, sales }) => {
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
        
        const totalOrders = ordersInHour.length;
        const totalAmount = ordersInHour.reduce((sum, order) => sum + (order.finishedPrice || 0), 0);
        const canceledOrders = ordersInHour.filter(order => order.isCancel).length;
        
        return {
          date: format(hour, 'HH:00', { locale: ru }),
          orders: totalOrders,
          amount: totalAmount,
          canceled: canceledOrders,
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
        
        const totalOrders = ordersOnDay.length;
        const totalAmount = ordersOnDay.reduce((sum, order) => sum + (order.finishedPrice || 0), 0);
        const canceledOrders = ordersOnDay.filter(order => order.isCancel).length;
        
        return {
          date: format(day, 'dd.MM', { locale: ru }),
          orders: totalOrders,
          amount: totalAmount,
          canceled: canceledOrders,
        };
      });
    }
  }, [orders, shouldDisplayHourly]);

  const categoryOrdersData = useMemo(() => {
    if (orders.length === 0) return [];
    
    const categoryCounts: Record<string, { count: number, amount: number }> = {};
    orders.forEach(order => {
      if (!order.subject) return;
      if (!categoryCounts[order.subject]) {
        categoryCounts[order.subject] = { count: 0, amount: 0 };
      }
      categoryCounts[order.subject].count += 1;
      categoryCounts[order.subject].amount += (order.finishedPrice || 0);
    });
    
    return Object.entries(categoryCounts)
      .map(([name, data]) => ({ 
        name, 
        value: data.count,
        amount: data.amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [orders]);

  const totalOrdersAmount = useMemo(() => 
    categoryOrdersData.reduce((sum, category) => sum + category.amount, 0),
    [categoryOrdersData]
  );

  // Updated color themes for better professional look
  const ordersConfig = {
    orders: {
      label: "Заказы",
      theme: {
        light: "#4F46E5", // Indigo-600
        dark: "#4338CA", // Indigo-700
      },
    },
    amount: {
      label: "Сумма",
      theme: {
        light: "#0EA5E9", // Sky-500
        dark: "#0284C7", // Sky-600
      },
    },
    canceled: {
      label: "Отмены",
      theme: {
        light: "#F43F5E", // Rose-500
        dark: "#E11D48", // Rose-600
      },
    },
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2
          }
        }
      }}
    >
      <motion.div variants={chartVariants} transition={{ duration: 0.5 }}>
        <Card className="overflow-hidden border-0 shadow-2xl rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-indigo-950/20 border-blue-100/30 dark:border-blue-900/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100/80 dark:bg-blue-900/30 shadow-inner">
                  <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
                  {shouldDisplayHourly ? 'Заказы по часам' : 'Динамика заказов'}
                </span>
              </CardTitle>
              <div className="text-xs text-white bg-blue-500/90 dark:bg-blue-600/50 px-3 py-1 rounded-full shadow-md">
                {shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] mt-2">
              <ChartContainer
                config={ordersConfig}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyOrdersData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCanceled" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-canceled)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-canceled)" stopOpacity={0.1}/>
                      </linearGradient>
                      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4F46E5" floodOpacity="0.15"/>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.15} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      stroke="#64748B"
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      stroke="#64748B"
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => `${formatCurrency(value)}`}
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                      stroke="#64748B"
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="orders" 
                      name="Заказы"
                      yAxisId="left"
                      stroke="var(--color-orders)" 
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorOrders)"
                      activeDot={{ r: 7, strokeWidth: 1, filter: "url(#shadow)" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      name="Сумма"
                      yAxisId="right"
                      stroke="var(--color-amount)" 
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      activeDot={{ r: 7, strokeWidth: 1, filter: "url(#shadow)" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="canceled" 
                      name="Отмены"
                      yAxisId="left"
                      stroke="var(--color-canceled)" 
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorCanceled)"
                      activeDot={{ r: 7, strokeWidth: 1, filter: "url(#shadow)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={chartVariants} transition={{ duration: 0.5, delay: 0.2 }}>
        <Card className="overflow-hidden border-0 shadow-2xl rounded-xl bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20 border-purple-100/30 dark:border-purple-900/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-100/80 dark:bg-purple-900/30 shadow-inner">
                  <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-600 dark:from-purple-400 dark:to-indigo-300">
                  Заказы по категориям
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[320px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {categoryOrdersData.map((entry, index) => (
                      <linearGradient key={`catGradient-${index}`} id={`catGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                    <filter id="dropShadow" height="130%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>
                      <feOffset dx="1" dy="1" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.2"/>
                      </feComponentTransfer>
                      <feMerge> 
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/> 
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    data={categoryOrdersData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="amount"
                    nameKey="name"
                    labelLine={false}
                    filter="url(#dropShadow)"
                    label={({ name, percent }) => {
                      if (typeof percent === 'number' && percent > 0.10) {
                        return name.length > 12 
                          ? `${name.slice(0, 12)}...: ${(percent * 100).toFixed(0)}%` 
                          : `${name}: ${(percent * 100).toFixed(0)}%`;
                      }
                      return '';
                    }}
                  >
                    {categoryOrdersData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#catGradient-${index})`} 
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth={2}
                        className="hover:opacity-90 transition-opacity duration-300"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => {
                      const numValue = typeof value === 'number' ? value : 0;
                      const percentage = totalOrdersAmount > 0 ? ((numValue / totalOrdersAmount) * 100).toFixed(1) : '0';
                      return [
                        `${formatCurrency(numValue)} ₽ (${percentage}%)`,
                        name
                      ];
                    }}
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.97)", 
                      borderRadius: "10px", 
                      border: "1px solid var(--border)",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-sm font-medium">{value}</span>
                    )}
                    wrapperStyle={{ paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});

OrdersChart.displayName = 'OrdersChart';

export default OrdersChart;

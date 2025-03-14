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
import BarChartCard from "@/components/analytics/components/BarChartCard";

interface OrdersChartProps {
  orders: WildberriesOrder[];
  sales: WildberriesSale[];
}

const COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#F59E0B', '#10B981', '#3B82F6', '#E5DEFF', '#14B8A6', '#0EA5E9', '#9B87F5'];

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

  const ordersConfig = {
    amount: {
      label: "Сумма",
      theme: {
        light: "#06B6D4", // Cyan-500
        dark: "#0891B2", // Cyan-600
      },
    },
    canceled: {
      label: "Отмены",
      theme: {
        light: "#9333EA", // Purple-600
        dark: "#7E22CE", // Purple-700
      },
    },
  };

  const maxCanceledValue = useMemo(() => {
    if (dailyOrdersData.length === 0) return 9;
    const max = Math.max(...dailyOrdersData.map(d => d.canceled || 0));
    return Math.max(9, Math.ceil(max)); // Always show up to at least 9
  }, [dailyOrdersData]);

  const customLeftAxisTicks = useMemo(() => {
    const ticks = [];
    
    const effectiveMax = Math.max(9, maxCanceledValue);
    for (let i = 0; i <= effectiveMax; i++) {
      if (i % 1 === 0) {
        ticks.push(i);
      }
    }
    
    return ticks;
  }, [maxCanceledValue]);

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
      <BarChartCard 
        title={shouldDisplayHourly ? 'Заказы по часам' : 'Динамика заказов'}
        subtitle={shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'}
        icon={CreditCard}
      >
        <ChartContainer
          config={ordersConfig}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyOrdersData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.1} />
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
                ticks={customLeftAxisTicks}
                domain={[0, Math.max(9, maxCanceledValue)]}
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
                dataKey="amount" 
                name="Сумма"
                yAxisId="right"
                stroke="var(--color-amount)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
              <Area 
                type="monotone" 
                dataKey="canceled" 
                name="Отмены"
                yAxisId="left"
                stroke="var(--color-canceled)" 
                strokeWidth={2}
                fill="url(#canceledGradient)"
                activeDot={{ r: 5, strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="canceledGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9333EA" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </BarChartCard>

      <BarChartCard 
        title="Заказы по категориям"
        icon={ShoppingCart}
        iconColor="text-purple-600 dark:text-purple-400"
        iconBgColor="bg-purple-100 dark:bg-purple-900/30"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryOrdersData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={115}
              paddingAngle={4}
              dataKey="amount"
              nameKey="name"
              labelLine={false}
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
                  fill={COLORS[index % COLORS.length]} 
                  stroke="#fff"
                  strokeWidth={1}
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
                border: "none",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
              }}
              wrapperStyle={{
                outline: "none"
              }}
            />
            <Legend 
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-sm font-medium">{value}</span>
              )}
              wrapperStyle={{ paddingTop: "15px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </BarChartCard>
    </motion.div>
  );
});

OrdersChart.displayName = 'OrdersChart';

export default OrdersChart;

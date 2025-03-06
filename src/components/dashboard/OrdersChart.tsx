
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WildberriesOrder } from "@/types/store";
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { formatCurrency } from "@/utils/formatCurrency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface OrdersChartProps {
  orders: WildberriesOrder[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#ff0000'];

const OrdersChart: React.FC<OrdersChartProps> = ({ orders }) => {
  const cancelledVsActiveData = useMemo(() => {
    const active = orders.filter(order => !order.isCancel).length;
    const cancelled = orders.filter(order => order.isCancel).length;
    
    return [
      { name: 'Активные', value: active },
      { name: 'Отменённые', value: cancelled },
    ];
  }, [orders]);

  const dailyOrdersData = useMemo(() => {
    if (orders.length === 0) return [];
    
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
      
      return {
        date: format(day, 'dd.MM', { locale: ru }),
        active: activeOrders,
        cancelled: cancelledOrders,
        total: activeOrders + cancelledOrders,
      };
    });
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
    total: {
      label: "Всего заказов",
      theme: {
        light: "#6366f1",
        dark: "#4f46e5",
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Заказы по дням</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer 
              config={orderConfig}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyOrdersData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent />
                    }
                  />
                  <Bar dataKey="active" fill="var(--color-active)" name="Активные" />
                  <Bar dataKey="cancelled" fill="var(--color-cancelled)" name="Отмененные" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Распределение заказов</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cancelledVsActiveData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cancelledVsActiveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} заказов`, ""]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersChart;

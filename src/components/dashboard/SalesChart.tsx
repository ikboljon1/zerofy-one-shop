
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WildberriesSale } from "@/types/store";
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { formatCurrency } from "@/utils/formatCurrency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SalesChartProps {
  sales: WildberriesSale[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const SalesChart: React.FC<SalesChartProps> = ({ sales }) => {
  const dailySalesData = useMemo(() => {
    if (sales.length === 0) return [];
    
    // Get date range for the last 7 days
    const today = new Date();
    const sevenDaysAgo = subDays(today, 6); // 7 days including today
    
    // Generate array of all days
    const daysInterval = eachDayOfInterval({
      start: sevenDaysAgo,
      end: today,
    });
    
    // Sum sales per day
    return daysInterval.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const salesOnDay = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= dayStart && saleDate <= dayEnd;
      });
      
      const totalRevenue = salesOnDay.reduce((sum, sale) => sum + sale.priceWithDisc, 0);
      const totalProfit = salesOnDay.reduce((sum, sale) => sum + sale.forPay, 0);
      
      return {
        date: format(day, 'dd.MM', { locale: ru }),
        revenue: totalRevenue,
        profit: totalProfit,
      };
    });
  }, [sales]);

  const categorySalesData = useMemo(() => {
    if (sales.length === 0) return [];
    
    const categoryCounts: Record<string, { count: number, amount: number }> = {};
    
    sales.forEach(sale => {
      if (!sale.category) return;
      if (!categoryCounts[sale.category]) {
        categoryCounts[sale.category] = { count: 0, amount: 0 };
      }
      categoryCounts[sale.category].count += 1;
      categoryCounts[sale.category].amount += sale.priceWithDisc;
    });
    
    return Object.entries(categoryCounts)
      .map(([name, data]) => ({ 
        name, 
        value: data.count,
        amount: data.amount,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [sales]);

  const customPieLabel = ({ name, percent }: { name: string, percent: number }) => {
    return name.length > 12 ? `${name.slice(0, 12)}...: ${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  const salesConfig = {
    revenue: {
      label: "Выручка",
      theme: {
        light: "#6366f1",
        dark: "#4f46e5",
      },
    },
    profit: {
      label: "К получению",
      theme: {
        light: "#10b981",
        dark: "#059669",
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Динамика продаж</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={salesConfig}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySalesData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${formatCurrency(value)}`} />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent />
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Выручка"
                    stroke="var(--color-revenue)" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    name="К получению"
                    stroke="var(--color-profit)" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Продажи по категориям</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySalesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={customPieLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const item = categorySalesData.find(item => item.name === name);
                    return [
                      `${value} шт. (${formatCurrency(item?.amount || 0)} ₽)`,
                      name
                    ];
                  }}
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

export default SalesChart;

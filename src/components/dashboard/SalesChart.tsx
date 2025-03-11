import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WildberriesSale } from "@/types/store";
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
  ReferenceLine 
} from 'recharts';
import { formatCurrency } from "@/utils/formatCurrency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreditCard, ShoppingCart } from "lucide-react";

interface SalesChartProps {
  sales: WildberriesSale[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const SalesChart: React.FC<SalesChartProps> = React.memo(({ sales }) => {
  const isMobile = useIsMobile();
  
  const shouldDisplayHourly = useMemo(() => {
    if (sales.length === 0) return false;
    const firstSaleDate = new Date(sales[0].date);
    return isToday(firstSaleDate) || isYesterday(firstSaleDate);
  }, [sales]);

  const dailySalesData = useMemo(() => {
    if (sales.length === 0) return [];
    
    if (shouldDisplayHourly) {
      const saleDate = new Date(sales[0].date);
      const dayStart = startOfDay(saleDate);
      const dayEnd = endOfDay(saleDate);
      
      const hoursInterval = eachHourOfInterval({
        start: dayStart,
        end: dayEnd,
      });
      
      return hoursInterval.map(hour => {
        const hourEnd = addHours(hour, 1);
        
        const salesInHour = sales.filter(sale => {
          const saleTime = new Date(sale.date);
          return saleTime >= hour && saleTime < hourEnd;
        });
        
        const totalRevenue = salesInHour.reduce((sum, sale) => sum + sale.priceWithDisc, 0);
        const totalProfit = salesInHour.reduce((sum, sale) => sum + sale.forPay, 0);
        const totalReturns = salesInHour.filter(sale => sale.isReturn).reduce((sum, sale) => sum + sale.priceWithDisc, 0);
        
        return {
          date: format(hour, 'HH:00', { locale: ru }),
          revenue: totalRevenue,
          profit: totalProfit,
          returns: totalReturns,
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
        
        const salesOnDay = sales.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= dayStart && saleDate <= dayEnd;
        });
        
        const totalRevenue = salesOnDay.reduce((sum, sale) => sum + sale.priceWithDisc, 0);
        const totalProfit = salesOnDay.reduce((sum, sale) => sum + sale.forPay, 0);
        const totalReturns = salesOnDay.filter(sale => sale.isReturn).reduce((sum, sale) => sum + sale.priceWithDisc, 0);
        
        return {
          date: format(day, 'dd.MM', { locale: ru }),
          revenue: totalRevenue,
          profit: totalProfit,
          returns: totalReturns,
        };
      });
    }
  }, [sales, shouldDisplayHourly]);

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
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [sales]);

  const totalRevenue = useMemo(() => 
    categorySalesData.reduce((sum, category) => sum + category.amount, 0),
    [categorySalesData]
  );

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
    returns: {
      label: "Возвраты",
      theme: {
        light: "#ef4444",
        dark: "#dc2626",
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                {shouldDisplayHourly ? 'Продажи по часам' : 'Динамика продаж'}
              </span>
            </CardTitle>
            <div className="text-xs text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
              {shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={salesConfig}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailySalesData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-returns)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-returns)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: 'var(--border)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${formatCurrency(value)}`}
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: 'var(--border)' }}
                    axisLine={{ stroke: 'var(--border)' }}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    name="Выручка"
                    stroke="var(--color-revenue)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    name="К получению"
                    stroke="var(--color-profit)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="returns" 
                    name="Возвраты"
                    stroke="var(--color-returns)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReturns)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  {!isMobile && !shouldDisplayHourly && (
                    <ReferenceLine
                      y={dailySalesData.reduce((sum, day) => sum + day.revenue, 0) / dailySalesData.length}
                      stroke="var(--color-revenue)"
                      strokeDasharray="3 3"
                      label={{ 
                        value: "Средняя выручка", 
                        position: "insideTopLeft",
                        fill: "var(--color-revenue)",
                        fontSize: 12
                      }}
                    />
                  )}
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
              <ShoppingCart className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                Продажи по категориям
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {categorySalesData.map((entry, index) => (
                    <linearGradient key={`catGradient-${index}`} id={`catGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={categorySalesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="amount"
                  nameKey="name"
                  labelLine={false}
                  label={({ name, percent }) => {
                    if (typeof percent === 'number') {
                      return name.length > 12 
                        ? `${name.slice(0, 12)}...: ${(percent * 100).toFixed(0)}%` 
                        : `${name}: ${(percent * 100).toFixed(0)}%`;
                    }
                    return '';
                  }}
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#catGradient-${index})`} 
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    const numValue = typeof value === 'number' ? value : 0;
                    const percentage = totalRevenue > 0 ? ((numValue / totalRevenue) * 100).toFixed(1) : '0';
                    return [
                      `${formatCurrency(numValue)} ₽ (${percentage}%)`,
                      name
                    ];
                  }}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

SalesChart.displayName = 'SalesChart';

export default SalesChart;

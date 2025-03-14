
import React, { useMemo, useState } from "react";
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
  ReferenceLine,
  Sector
} from 'recharts';
import { formatCurrency } from "@/utils/formatCurrency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreditCard, ShoppingCart, TrendingUp, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

interface SalesChartProps {
  sales: WildberriesSale[];
}

const COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#F59E0B', '#10B981', '#3B82F6', '#E5DEFF', '#14B8A6', '#0EA5E9', '#9B87F5'];
const RADIAN = Math.PI / 180;

const SalesChart: React.FC<SalesChartProps> = React.memo(({ sales }) => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  
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
  
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={2}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={2} />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs font-medium">{`${payload.name}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`${formatCurrency(value)} ₽ (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
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
      <motion.div variants={chartVariants} className="h-full">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30 h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100/80 dark:bg-indigo-900/50 shadow-inner">
                  <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400 font-bold">
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
                        <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-returns)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="var(--color-returns)" stopOpacity={0.1}/>
                      </linearGradient>
                      <filter id="shadow" height="200%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.1)"/>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fontWeight: 500 }}
                      tickLine={{ stroke: 'var(--border)' }}
                      axisLine={{ stroke: 'var(--border)' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${formatCurrency(value)}`}
                      tick={{ fontSize: 12, fontWeight: 500 }}
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
                      activeDot={{ r: 6, strokeWidth: 2, filter: "url(#shadow)" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      name="К получению"
                      stroke="var(--color-profit)" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                      activeDot={{ r: 6, strokeWidth: 2, filter: "url(#shadow)" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="returns" 
                      name="Возвраты"
                      stroke="var(--color-returns)" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorReturns)"
                      activeDot={{ r: 6, strokeWidth: 2, filter: "url(#shadow)" }}
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
      </motion.div>

      <motion.div variants={chartVariants} className="h-full">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30 h-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100/80 dark:bg-blue-900/50 shadow-inner">
                  <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 font-bold">
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
                    {categorySalesData.map((_, index) => (
                      <linearGradient key={`catGradient-${index}`} id={`saleGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                      </linearGradient>
                    ))}
                    <filter id="pieGlow" height="300%" width="300%" x="-100%" y="-100%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feFlood floodColor="rgba(59, 130, 246, 0.2)" floodOpacity="1" result="glow-color" />
                      <feComposite operator="in" in="glow-color" in2="blur" result="glow-blur" />
                      <feMerge>
                        <feMergeNode in="glow-blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={categorySalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="amount"
                    nameKey="name"
                    onMouseEnter={onPieEnter}
                    filter="url(#pieGlow)"
                  >
                    {categorySalesData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#saleGradient-${index})`} 
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});

SalesChart.displayName = 'SalesChart';

export default SalesChart;

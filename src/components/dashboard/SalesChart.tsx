
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
  ReferenceLine,
  Customized,
  Sector,
  LabelList
} from 'recharts';
import { formatCurrency } from "@/utils/formatCurrency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreditCard, ShoppingCart, LineChart, PieChart as PieChartIcon } from "lucide-react";

interface SalesChartProps {
  sales: WildberriesSale[];
}

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', 
  '#0088fe', '#00C49F', '#FFBB28', '#FF8042'
];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { 
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, name 
  } = props;
  
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
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12} fontWeight={500}>
        {name.length > 15 ? `${name.substring(0, 15)}...` : name}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#666" fontSize={12}>
        {`${formatCurrency(value)} ₽ (${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

const SalesChart: React.FC<SalesChartProps> = ({ sales }) => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const shouldDisplayHourly = useMemo(() => {
    if (sales.length === 0) return false;
    
    // Check if all sales are from today or yesterday
    const firstSaleDate = new Date(sales[0].date);
    return isToday(firstSaleDate) || isYesterday(firstSaleDate);
  }, [sales]);

  const dailySalesData = useMemo(() => {
    if (sales.length === 0) return [];
    
    if (shouldDisplayHourly) {
      // Get the date of the first sale (assuming all sales are from the same day - today or yesterday)
      const saleDate = new Date(sales[0].date);
      const dayStart = startOfDay(saleDate);
      const dayEnd = endOfDay(saleDate);
      
      // Generate array of all hours in the day
      const hoursInterval = eachHourOfInterval({
        start: dayStart,
        end: dayEnd,
      });
      
      // Sum sales per hour
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

  // Calculate average revenue for reference line
  const avgRevenue = dailySalesData.length > 0 
    ? dailySalesData.reduce((sum, item) => sum + item.revenue, 0) / dailySalesData.length 
    : 0;

  // Calculate total revenue for the pie chart percentage
  const totalRevenue = categorySalesData.reduce((sum, category) => sum + category.amount, 0);

  // Calculate total items sold
  const totalItemsSold = categorySalesData.reduce((sum, category) => sum + category.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2 border-b border-indigo-100/50 dark:border-indigo-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChart className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                {shouldDisplayHourly ? 'Продажи по часам' : 'Динамика продаж'}
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
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-returns)" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="var(--color-returns)" stopOpacity={0.1}/>
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
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
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 7, strokeWidth: 1, stroke: "#fff", strokeOpacity: 0.8, fill: "var(--color-revenue)" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    name="К получению"
                    stroke="var(--color-profit)" 
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                    activeDot={{ r: 7, strokeWidth: 1, stroke: "#fff", strokeOpacity: 0.8, fill: "var(--color-profit)" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="returns" 
                    name="Возвраты"
                    stroke="var(--color-returns)" 
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReturns)"
                    activeDot={{ r: 7, strokeWidth: 1, stroke: "#fff", strokeOpacity: 0.8, fill: "var(--color-returns)" }}
                  />
                  {!isMobile && !shouldDisplayHourly && avgRevenue > 0 && (
                    <ReferenceLine
                      y={avgRevenue}
                      stroke="var(--color-revenue)"
                      strokeDasharray="5 5"
                      label={{ 
                        value: "Средняя выручка", 
                        position: "insideTopLeft",
                        fill: "var(--color-revenue)",
                        fontSize: 12,
                        fontWeight: 500
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
        <CardHeader className="pb-2 border-b border-indigo-100/50 dark:border-indigo-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                Продажи по категориям
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
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
                  <filter id="catShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={categorySalesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={isMobile ? 90 : 100}
                  paddingAngle={4}
                  dataKey="amount"
                  nameKey="name"
                  onMouseEnter={onPieEnter}
                  filter="url(#catShadow)"
                >
                  {categorySalesData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#catGradient-${index})`} 
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => {
                    // Make sure value is treated as a number
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
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center statistics */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-28 h-28 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex flex-col items-center justify-center shadow-lg border border-indigo-200/50 dark:border-indigo-800/50 animate-pulse-slow">
                <span className="text-xs text-gray-500 dark:text-gray-400">Продано</span>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                  {totalItemsSold}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">товаров</span>
                <div className="h-px w-16 bg-gray-200 dark:bg-gray-700 my-1"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">На сумму</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formatCurrency(totalRevenue)} ₽
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesChart;

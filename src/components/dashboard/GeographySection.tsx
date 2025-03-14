
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, ShoppingBag, MapPin, TrendingUp, Award } from "lucide-react";
import { WildberriesSale, WildberriesOrder } from "@/types/store";
import { Period } from "./PeriodSelector";
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
  Sector
} from 'recharts';
import { format, subDays, eachDayOfInterval, startOfDay, endOfDay, eachHourOfInterval, addHours, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatCurrency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface GeographySectionProps {
  warehouseDistribution: any[];
  regionDistribution: any[];
  sales?: WildberriesSale[];
  orders?: WildberriesOrder[];
  period?: Period;
  apiKey?: string;
}

const COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#F59E0B', '#10B981', '#3B82F6', '#E5DEFF', '#14B8A6', '#0EA5E9', '#9B87F5'];
const RADIAN = Math.PI / 180;

const GeographySection: React.FC<GeographySectionProps> = ({
  warehouseDistribution,
  regionDistribution,
  sales = [],
  orders = [],
  period = "week",
  apiKey
}) => {
  // Check if we should display hourly data based on order dates
  const shouldDisplayHourly = React.useMemo(() => {
    if (orders.length === 0) return false;
    const firstOrderDate = new Date(orders[0].date);
    return isToday(firstOrderDate) || isYesterday(firstOrderDate);
  }, [orders]);

  // Calculate daily/hourly orders data
  const dailyOrdersData = React.useMemo(() => {
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

  // Calculate category orders data
  const categoryOrdersData = React.useMemo(() => {
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

  // For rendering the active shape in the pie chart
  const [activeIndex, setActiveIndex] = React.useState(0);
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

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

  // Calculate max value for Y-axis
  const maxCanceledValue = React.useMemo(() => {
    if (dailyOrdersData.length === 0) return 5;
    const max = Math.max(...dailyOrdersData.map(d => d.canceled || 0));
    return Math.max(5, Math.ceil(max)); // Always show up to at least 5
  }, [dailyOrdersData]);

  // Create custom left axis ticks
  const customLeftAxisTicks = React.useMemo(() => {
    const ticks = [];
    
    const effectiveMax = Math.max(5, maxCanceledValue);
    for (let i = 0; i <= effectiveMax; i++) {
      if (i % 1 === 0) {
        ticks.push(i);
      }
    }
    
    return ticks;
  }, [maxCanceledValue]);

  // For rendering the active shape in the pie chart
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/60 dark:from-gray-900 dark:to-blue-950/40 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-blue-100/30 dark:border-blue-800/20">
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100/80 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 text-2xl font-bold">
                {shouldDisplayHourly ? 'Заказы по часам' : 'Динамика заказов'}
              </span>
            </CardTitle>
            <CardDescription className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70">
              {shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'} заказов и отмен
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-sm rounded-lg p-4 border border-blue-100/40 dark:border-blue-800/30 shadow-inner">
              <ChartContainer
                config={ordersConfig}
                className="h-[290px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyOrdersData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="amountGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="canceledGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9333EA" stopOpacity={0.05}/>
                      </linearGradient>
                      <filter id="shadow" height="200%">
                        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.1)"/>
                      </filter>
                    </defs>
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
                      domain={[0, Math.max(5, maxCanceledValue)]}
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
                      fill="url(#amountGradient)"
                      activeDot={{ r: 6, strokeWidth: 2, filter: "url(#shadow)" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="canceled" 
                      name="Отмены"
                      yAxisId="left"
                      stroke="var(--color-canceled)" 
                      strokeWidth={2}
                      fill="url(#canceledGradient)"
                      activeDot={{ r: 6, strokeWidth: 2, filter: "url(#shadow)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/60 dark:from-gray-900 dark:to-purple-950/40 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-purple-100/30 dark:border-purple-800/20">
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100/80 dark:bg-purple-900/30">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400 text-2xl font-bold">
                Заказы по категориям
              </span>
            </CardTitle>
            <CardDescription className="text-sm font-medium text-purple-600/70 dark:text-purple-400/70">
              Распределение заказов по категориям товаров
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-sm rounded-lg p-4 border border-purple-100/40 dark:border-purple-800/30 shadow-inner">
              <div className="h-[290px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {categoryOrdersData.map((_, index) => (
                        <linearGradient key={`catGradient-${index}`} id={`catGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                          <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7}/>
                        </linearGradient>
                      ))}
                      <filter id="glow" height="300%" width="300%" x="-100%" y="-100%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feFlood floodColor="rgba(99, 102, 241, 0.2)" floodOpacity="1" result="glow-color" />
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
                      data={categoryOrdersData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="amount"
                      nameKey="name"
                      onMouseEnter={onPieEnter}
                      filter="url(#glow)"
                    >
                      {categoryOrdersData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#catGradient-${index})`} 
                          stroke="#fff"
                          strokeWidth={1.5}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/60 dark:from-gray-900 dark:to-gray-800/40 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100/80 dark:bg-blue-900/30">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100">
              Как рассчитываются данные
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p>Данные собираются из ваших заказов Wildberries с помощью API:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Для динамики заказов мы анализируем каждый заказ по дате/времени создания</li>
            <li>Для категорий мы группируем заказы по названиям товаров из ответа API</li>
            <li>Мы подсчитываем количество и суммы заказов, а также число отмененных заказов</li>
            <li>Диаграммы обновляются в реальном времени при получении новых данных</li>
          </ul>
          <div className="py-2 px-4 mt-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/30 dark:border-blue-800/30">
            <p className="text-blue-700 dark:text-blue-300">
              Эти данные предоставляют ценную информацию о динамике заказов во времени и о том, 
              какие категории товаров наиболее популярны у ваших клиентов, что помогает 
              оптимизировать ваш ассортимент и стратегию продаж.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographySection;

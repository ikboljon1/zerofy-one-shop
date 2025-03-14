import React, { useMemo, useState } from "react";
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
  Sector
} from 'recharts';
import { formatCurrency } from "@/utils/formatCurrency";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreditCard, ShoppingCart, TrendingUp, Award, Trophy, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";
import BarChartCard from "@/components/analytics/components/BarChartCard";

interface OrdersChartProps {
  orders: WildberriesOrder[];
  sales: WildberriesSale[];
}

const COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#F59E0B', '#10B981', '#3B82F6', '#E5DEFF', '#14B8A6', '#0EA5E9', '#9B87F5'];
const RADIAN = Math.PI / 180;

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
    if (dailyOrdersData.length === 0) return 5;
    const max = Math.max(...dailyOrdersData.map(d => d.canceled || 0));
    return Math.max(5, Math.ceil(max)); // Always show up to at least 5
  }, [dailyOrdersData]);

  const customLeftAxisTicks = useMemo(() => {
    const ticks = [];
    
    const effectiveMax = Math.max(5, maxCanceledValue);
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

  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <motion.div 
      className="space-y-6"
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
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
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
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/40 dark:from-gray-900 dark:to-blue-950/30 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100/80 dark:bg-cyan-900/50 shadow-inner">
                    <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400 font-bold">
                    {shouldDisplayHourly ? 'Заказы по часам' : 'Динамика заказов'}
                  </span>
                </CardTitle>
                <div className="text-xs text-muted-foreground bg-background/80 dark:bg-gray-800/80 px-2 py-1 rounded-full">
                  {shouldDisplayHourly ? 'Почасовая статистика' : 'Ежедневная статистика'}
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={chartVariants} className="h-full">
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/40 dark:from-gray-900 dark:to-purple-950/30 h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100/80 dark:bg-purple-900/50 shadow-inner">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400 font-bold">
                    Заказы по категориям
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={chartVariants}>
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-900 dark:to-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100/80 dark:bg-amber-900/50 shadow-inner">
                <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-yellow-600 dark:from-amber-400 dark:to-yellow-300 font-bold">
                Рейтинг товаров по популярности
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.length > 0 && useMemo(() => {
                const productDetails: Record<string, {
                  name: string,
                  article: string,
                  count: number,
                  revenue: number,
                  avgPrice: number,
                  rank: number
                }> = {};
                
                orders.forEach(order => {
                  const name = order.subject || "Неизвестный товар";
                  const article = order.supplierArticle || "";
                  const key = `${name} (${article})`;
                  
                  if (!productDetails[key]) {
                    productDetails[key] = {
                      name,
                      article,
                      count: 0,
                      revenue: 0,
                      avgPrice: 0,
                      rank: 0
                    };
                  }
                  
                  productDetails[key].count += 1;
                  productDetails[key].revenue += Number(order.priceWithDisc || 0);
                });
                
                Object.values(productDetails).forEach(product => {
                  product.avgPrice = product.revenue / product.count;
                });
                
                return Object.values(productDetails)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 10)
                  .map((product, index) => ({
                    ...product,
                    rank: index + 1
                  }));
              }, [orders]).map((product) => (
                <div 
                  key={product.article} 
                  className={`relative flex items-start gap-3 p-3 rounded-lg overflow-hidden border ${
                    product.rank <= 3 
                      ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-800/30' 
                      : 'border-gray-200 bg-white/80 dark:bg-gray-800/30 dark:border-gray-700/30'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 ${
                    product.rank <= 3 ? 'opacity-10' : 'opacity-5'
                  }`}>
                    {product.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> :
                     product.rank === 2 ? <Trophy className="h-5 w-5 text-gray-400" /> :
                     product.rank === 3 ? <Award className="h-5 w-5 text-amber-700" /> :
                     <Star className="h-5 w-5 text-blue-400" />}
                  </div>
                  
                  <div className={`flex items-center justify-center w-8 h-8 mt-1 rounded-full ${
                    product.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/50' :
                    product.rank === 2 ? 'bg-gray-100 dark:bg-gray-800/50' :
                    product.rank === 3 ? 'bg-amber-100 dark:bg-amber-900/50' :
                    'bg-blue-50 dark:bg-blue-900/30'
                  }`}>
                    {product.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> :
                     product.rank === 2 ? <Trophy className="h-5 w-5 text-gray-400" /> :
                     product.rank === 3 ? <Award className="h-5 w-5 text-amber-700" /> :
                     <Star className="h-5 w-5 text-blue-400" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm line-clamp-2 pr-4">{product.name}</h4>
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                        product.rank === 1 ? 'bg-yellow-500 text-white' :
                        product.rank === 2 ? 'bg-gray-400 text-white' :
                        product.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                      } text-xs font-bold`}>
                        {product.rank}
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">Артикул: {product.article}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-white/80 dark:bg-gray-800/50 rounded p-1 text-center">
                        <p className="text-xs text-muted-foreground">Заказов</p>
                        <p className="font-semibold">{product.count}</p>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/50 rounded p-1 text-center">
                        <p className="text-xs text-muted-foreground">Доход</p>
                        <p className="font-semibold">{formatCurrency(product.revenue)} ₽</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
});

OrdersChart.displayName = 'OrdersChart';

export default OrdersChart;

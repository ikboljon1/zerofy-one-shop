
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShoppingBag, TrendingUp } from "lucide-react";

interface OrdersChartProps {
  orders: WildberriesOrder[];
  sales?: WildberriesSale[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#ff0000'];
const PRODUCT_COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#FF8042", "#A86EE7"];

const OrdersChart: React.FC<OrdersChartProps> = ({ orders, sales = [] }) => {
  const isMobile = useIsMobile();
  
  const shouldDisplayHourly = useMemo(() => {
    if (orders.length === 0) return false;
    
    // Check if all orders are from today or yesterday
    const firstOrderDate = new Date(orders[0].date);
    return isToday(firstOrderDate) || isYesterday(firstOrderDate);
  }, [orders]);

  const dailyOrdersData = useMemo(() => {
    if (orders.length === 0) return [];
    
    if (shouldDisplayHourly) {
      // Get the date of the first order (assuming all orders are from the same day - today or yesterday)
      const orderDate = new Date(orders[0].date);
      const dayStart = startOfDay(orderDate);
      const dayEnd = endOfDay(orderDate);
      
      // Generate array of all hours in the day
      const hoursInterval = eachHourOfInterval({
        start: dayStart,
        end: dayEnd,
      });
      
      // Count orders per hour
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

    // Группируем продажи по названию товара и подсчитываем количество
    const productCounts: Record<string, number> = {};
    
    // Учитываем только положительные продажи (исключаем возвраты)
    const validSales = sales.filter(sale => !sale.isReturn && sale.priceWithDisc > 0);
    let totalProducts = validSales.length;

    validSales.forEach(sale => {
      const productName = sale.subject || "Неизвестный товар";
      productCounts[productName] = (productCounts[productName] || 0) + 1;
    });

    // Преобразуем в формат для диаграммы и сортируем по количеству (больше сверху)
    const productsData = Object.entries(productCounts)
      .map(([name, count]) => ({
        name,
        value: count,
        percentage: totalProducts > 0 ? (count / totalProducts) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
    
    return productsData; // Возвращаем все товары, без ограничения топ-5
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                {shouldDisplayHourly ? 'Заказы по часам' : 'Заказы по дням'}
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
                      <stop offset="5%" stopColor="var(--color-active)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-active)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-cancelled)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-cancelled)" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-returned)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-returned)" stopOpacity={0.1}/>
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
                    stroke="var(--color-active)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActive)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="cancelled" 
                    stroke="var(--color-cancelled)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCancelled)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="returned" 
                    stroke="var(--color-returned)" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorReturned)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
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
              <ShoppingBag className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                Количество проданных товаров
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[300px] w-full">
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
                  </defs>
                  <Pie
                    data={productSalesDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ name, percentage }) => 
                      percentage >= 3 ? `${name.substring(0, 15)}${name.length > 15 ? '...' : ''}: ${percentage.toFixed(1)}%` : ''
                    }
                  >
                    {productSalesDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#pieGradient-${index % PRODUCT_COLORS.length})`} 
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} шт. (${(productSalesDistribution.find(p => p.name === name)?.percentage || 0).toFixed(1)}%)`, name]}
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.97)", 
                      borderRadius: "8px", 
                      border: "1px solid var(--border)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Legend 
                    layout={isMobile ? "horizontal" : "vertical"}
                    align={isMobile ? "center" : "right"}
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    iconSize={10}
                    wrapperStyle={isMobile ? { paddingTop: "10px" } : {}}
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
    </div>
  );
};

export default OrdersChart;

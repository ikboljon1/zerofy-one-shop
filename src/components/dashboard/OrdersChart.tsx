
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WildberriesOrder, WildberriesSale } from "@/types/store";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, isToday } from "date-fns";
import { ru } from "date-fns/locale";

interface OrdersChartProps {
  orders: WildberriesOrder[];
  sales: WildberriesSale[];
}

const OrdersChart: React.FC<OrdersChartProps> = ({ orders, sales }) => {
  const chartData = useMemo(() => {
    const dailyData: { [key: string]: { date: string; orders: number; sales: number } } = {};
    
    orders.forEach(order => {
      const date = format(new Date(order.date), 'dd.MM');
      if (!dailyData[date]) {
        dailyData[date] = { date, orders: 0, sales: 0 };
      }
      dailyData[date].orders += order.priceWithDisc;
    });

    sales.forEach(sale => {
      const date = format(new Date(sale.date), 'dd.MM');
      if (!dailyData[date]) {
        dailyData[date] = { date, orders: 0, sales: 0 };
      }
      dailyData[date].sales += sale.forPay;
    });

    return Object.values(dailyData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [orders, sales]);

  return (
    <Card className="border-0 shadow-2xl bg-[#1A1F2C] overflow-hidden">
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-base font-medium flex items-center text-gray-200">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/20 mr-3">
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </div>
          Динамика продаж
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="orderLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="saleLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#718096" 
                tick={{ fill: '#718096', fontSize: 12 }}
              />
              <YAxis 
                stroke="#718096"
                tick={{ fill: '#718096', fontSize: 12 }}
                tickFormatter={(value) => `${formatCurrency(value)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#2D3748',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                itemStyle={{ color: '#E2E8F0' }}
                labelStyle={{ color: '#A0AEC0' }}
                formatter={(value: number) => [`${formatCurrency(value)} ₽`]}
              />
              <Line
                type="monotone"
                dataKey="orders"
                name="Заказы"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                name="Продажи"
                stroke="#0EA5E9"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersChart;

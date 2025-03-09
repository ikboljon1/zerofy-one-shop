
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface OrderData {
  date: string;
  orderCount: number;
  profit: number;
}

interface OrdersChartProps {
  ordersData: OrderData[];
  period: string;
}

export const OrdersChart = ({ ordersData, period }: OrdersChartProps) => {
  // Format data for the chart
  const data = ordersData.map(item => ({
    name: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    Заказы: item.orderCount,
    Доход: item.profit
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="Заказы" 
          stroke="#8884d8" 
          fillOpacity={1} 
          fill="url(#colorOrders)" 
        />
        <Area 
          type="monotone" 
          dataKey="Доход" 
          stroke="#82ca9d" 
          fillOpacity={1} 
          fill="url(#colorIncome)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

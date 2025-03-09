
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Loader2 } from 'lucide-react';

export interface SalesChartProps {
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales?: number;
  }>;
  isLoading?: boolean;
}

const SalesChart = ({ dailySales, isLoading = false }: SalesChartProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
            <span>Динамика продаж</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 space-y-4">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка данных о продажах...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
          <span>Динамика продаж</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailySales}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Convert YYYY-MM-DD to DD.MM
                  const parts = value.split('-');
                  if (parts.length === 3) {
                    return `${parts[2]}.${parts[1]}`;
                  }
                  return value;
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value;
                }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  const nameMap: {[key: string]: string} = {
                    sales: 'Продажи',
                    previousSales: 'Предыдущий период'
                  };
                  
                  return [`${value} ₽`, nameMap[name] || name];
                }}
                labelFormatter={(label) => {
                  // Convert YYYY-MM-DD to DD.MM.YYYY
                  const parts = label.split('-');
                  if (parts.length === 3) {
                    return `${parts[2]}.${parts[1]}.${parts[0]}`;
                  }
                  return label;
                }}
              />
              <Legend 
                formatter={(value) => {
                  const nameMap: {[key: string]: string} = {
                    sales: 'Продажи',
                    previousSales: 'Предыдущий период'
                  };
                  
                  return nameMap[value] || value;
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                activeDot={{ r: 8 }}
              />
              {dailySales[0]?.previousSales !== undefined && (
                <Area
                  type="monotone"
                  dataKey="previousSales"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;

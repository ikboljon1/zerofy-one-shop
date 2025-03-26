
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from "recharts";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface SalesChartProps {
  data: any;
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const dailySales = data.dailySales || [];
  
  // Форматируем данные для графика
  const chartData = dailySales.map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
    Продажи: item.sales,
    "Прошлый период": item.previousSales || 0,
    "Количество заказов": item.orderCount || 0
  }));
  
  return (
    <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-blue-900/10 border-blue-100 dark:border-blue-800/30">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100/80 dark:bg-blue-800/40 flex items-center justify-center mr-3 shadow-inner">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <CardTitle className="text-base font-medium text-blue-700 dark:text-blue-400">
              Продажи и заказы по дням
            </CardTitle>
            <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
              Динамика продаж и заказов в выбранном периоде
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis 
                yAxisId="left"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                domain={[0, 'auto']}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "Количество заказов") return [value, name];
                  return [formatCurrency(value as number), name];
                }} 
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Продажи"
                stroke="#3b82f6"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Прошлый период"
                stroke="#94a3b8"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Количество заказов"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;

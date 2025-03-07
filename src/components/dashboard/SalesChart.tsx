
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SalesChartProps {
  data: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
}

const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
              Динамика продаж
            </span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  try {
                    const date = new Date(value);
                    return format(date, 'dd.MM', { locale: ru });
                  } catch (e) {
                    return value;
                  }
                }}
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                stroke="#9ca3af"
                tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#e5e7eb' }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Продажи']}
                labelFormatter={(label) => {
                  try {
                    const date = new Date(label);
                    return format(date, 'dd.MM.yyyy', { locale: ru });
                  } catch (e) {
                    return label;
                  }
                }}
                contentStyle={{ 
                  background: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '8px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSales)"
                name="Продажи"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#8B5CF6" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesChart;

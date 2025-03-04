
import { Card } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { format } from "date-fns";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface SalesChartProps {
  data: {
    dailySales: Array<{
      date: string;
      sales: number;
    }>;
  };
}

const SalesChart = ({ data }: SalesChartProps) => {
  return (
    <Card className="p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">Динамика продаж</h3>
        <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-full shadow-inner">
          <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.dailySales}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}.${date.getMonth() + 1}`;
              }}
              stroke="#9ca3af"
            />
            <YAxis 
              stroke="#9ca3af"
              tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
            />
            <Tooltip 
              formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Продажи']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return format(date, 'dd.MM.yyyy');
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
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesChart;

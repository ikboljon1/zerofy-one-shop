
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
  Tooltip,
  ReferenceLine
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface SalesChartProps {
  data: {
    dailySales: Array<{
      date: string;
      sales: number;
    }>;
  };
}

const SalesChart = ({ data }: SalesChartProps) => {
  const isMobile = useIsMobile();
  // Check if data is valid and has sales data
  const hasSalesData = data && data.dailySales && data.dailySales.length > 0;
  
  // Calculate average sales
  const avgSales = hasSalesData 
    ? data.dailySales.reduce((sum, item) => sum + item.sales, 0) / data.dailySales.length
    : 0;
  
  if (!hasSalesData) {
    return (
      <Card className="p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">Динамика продаж</h3>
          <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-full shadow-inner">
            <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Нет данных о продажах за выбранный период</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950/30 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">Динамика продаж</h3>
        <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-full shadow-inner animate-pulse">
          <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <div className="h-[300px] relative">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-400/5 to-transparent rounded-lg opacity-50"></div>
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.dailySales} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
              {/* Add glowing effect */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}.${date.getMonth() + 1}`;
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
                  return format(date, 'dd.MM.yyyy');
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
              cursor={{ stroke: '#8B5CF6', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            {!isMobile && (
              <ReferenceLine 
                y={avgSales} 
                stroke="#8B5CF6" 
                strokeDasharray="3 3"
                label={{
                  value: "Средние продажи",
                  position: "insideTopLeft",
                  fill: "#8B5CF6",
                  fontSize: 12,
                  fontWeight: 600
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#8B5CF6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSales)"
              name="Продажи"
              activeDot={{ 
                r: 8, 
                strokeWidth: 2, 
                stroke: "#ffffff", 
                fill: "#8B5CF6", 
                filter: "url(#glow)"
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesChart;

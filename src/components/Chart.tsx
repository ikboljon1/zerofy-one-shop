
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface SalesByDay {
  date: string;
  currentValue: number;
  previousValue: number;
}

interface ProductSales {
  name: string;
  quantity: number;
}

interface ChartProps {
  salesTrend?: SalesByDay[];
  productSales?: ProductSales[];
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

const Chart = ({ salesTrend, productSales }: ChartProps) => {
  const isMobile = useIsMobile();

  if (!salesTrend || !productSales) {
    return null;
  }

  const totalSales = productSales.reduce((sum, item) => sum + item.quantity, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-semibold drop-shadow-md"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const customLegendFormatter = (value: string, entry: any) => {
    const item = productSales.find(p => p.name === value);
    if (!item) return value;
    const percentage = ((item.quantity / totalSales) * 100).toFixed(0);
    return `${value} (${percentage}%)`;
  };

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Динамика продаж по дням</h3>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}.${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value.toLocaleString(), '']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="currentValue"
                name="Текущий период"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="previousValue"
                name="Предыдущий период"
                stroke="#EC4899"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Количество проданных товаров</h3>
        </div>
        <div className="h-[400px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                  </linearGradient>
                ))}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                </filter>
              </defs>
              <Pie
                data={productSales}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                innerRadius={70}
                outerRadius={120}
                fill="#8884d8"
                dataKey="quantity"
                nameKey="name"
                animationBegin={0}
                animationDuration={1500}
              >
                {productSales.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#colorGradient-${index % COLORS.length})`} 
                    stroke="rgba(255,255,255,0.3)" 
                    strokeWidth={2} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
                formatter={(value: number) => [value.toLocaleString(), 'шт.']}
              />
              <Legend formatter={customLegendFormatter} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="relative w-36 h-36 rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center shadow-lg border-2 border-indigo-100 dark:border-indigo-900 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white/30 dark:from-indigo-900/30 dark:to-gray-800/10"></div>
              <div className="relative">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">{totalSales.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Всего продано</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chart;

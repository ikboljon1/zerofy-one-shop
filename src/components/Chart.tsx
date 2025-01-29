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

  const renderCustomizedLabel = ({ name }: any) => {
    return (
      <text 
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {name}
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

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Количество проданных товаров</h3>
        </div>
        <div className="h-[400px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={productSales}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                innerRadius={100}
                outerRadius={130}
                fill="#8884d8"
                dataKey="quantity"
                nameKey="name"
                animationBegin={0}
                animationDuration={1500}
              >
                {productSales.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [value.toLocaleString(), 'шт.']}
              />
              <Legend formatter={customLegendFormatter} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Всего продано</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chart;
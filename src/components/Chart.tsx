
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
  Cell,
  Sector
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Package, ShoppingCart, TrendingUp, ShoppingBag } from "lucide-react";

interface SalesByDay {
  date: string;
  sales: number;
  previousSales: number;
}

interface ProductSales {
  subject_name: string;
  quantity: number;
}

interface ChartProps {
  salesTrend?: SalesByDay[];
  productSales?: ProductSales[];
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1', '#EF4444', '#14B8A6', '#8B5CF6', '#D946EF'];

const Chart = ({ salesTrend, productSales }: ChartProps) => {
  const isMobile = useIsMobile();

  if (!salesTrend || !productSales) {
    return null;
  }

  const totalSales = productSales.reduce((sum, item) => sum + item.quantity, 0);
  
  // Filter to only show top 5 products by quantity
  const topProducts = [...productSales]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
  
  // Calculate "Other" category if needed
  if (productSales.length > 5) {
    const otherQuantity = productSales
      .slice(5)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    if (otherQuantity > 0) {
      topProducts.push({
        subject_name: "Другие товары",
        quantity: otherQuantity
      });
    }
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#888" className="text-sm">
          {payload.subject_name}
        </text>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" className="text-lg font-bold">
          {value} шт.
        </text>
        <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#888" className="text-xs">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.9}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 5}
          outerRadius={innerRadius - 2}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
      <Card className="p-4 shadow-md border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-white/80 to-indigo-50/50 dark:from-gray-900/90 dark:to-indigo-950/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={20} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
              Динамика продаж по дням
            </span>
          </h3>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrend}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPrevSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}.${date.getMonth() + 1}`;
                }}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.97)",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value: number) => [value.toLocaleString() + " ₽", '']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                name="Текущий период"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#8B5CF6" }}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
              <Line
                type="monotone"
                dataKey="previousSales"
                name="Предыдущий период"
                stroke="#EC4899"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#EC4899" }}
                fillOpacity={1}
                fill="url(#colorPrevSales)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 shadow-md border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-white/80 to-indigo-50/50 dark:from-gray-900/90 dark:to-indigo-950/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="text-indigo-500" size={20} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
              Количество проданных товаров
            </span>
          </h3>
        </div>
        
        <div className="h-[400px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {COLORS.map((color, index) => (
                  <linearGradient key={`colorUniqueGradient-${index}`} id={`colorUniqueGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.95}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.75}/>
                  </linearGradient>
                ))}
                <filter id="dropShadow" height="130%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                  <feOffset dx="2" dy="2" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge> 
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/> 
                  </feMerge>
                </filter>
              </defs>
              
              <Pie
                activeIndex={0}
                activeShape={renderActiveShape}
                data={topProducts}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 70 : 90}
                outerRadius={isMobile ? 100 : 120}
                fill="#8884d8"
                dataKey="quantity"
                nameKey="subject_name"
                paddingAngle={4}
                filter="url(#dropShadow)"
              >
                {topProducts.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#colorUniqueGradient-${index % COLORS.length})`} 
                    stroke="rgba(255,255,255,0.6)" 
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              
              <Legend
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                formatter={(value, entry, index) => {
                  const item = topProducts[index as number];
                  const percentage = ((item.quantity / totalSales) * 100).toFixed(1);
                  return (
                    <span className="text-sm font-medium">
                      {value} - {item.quantity} шт. ({percentage}%)
                    </span>
                  );
                }}
                wrapperStyle={{ 
                  paddingLeft: "10px",
                  maxHeight: "300px", 
                  overflowY: "auto" 
                }}
              />
              
              <Tooltip
                formatter={(value, name) => {
                  const percentage = ((Number(value) / totalSales) * 100).toFixed(1);
                  return [`${value} шт. (${percentage}%)`, name];
                }}
                contentStyle={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.97)", 
                  borderRadius: "8px", 
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90 border-2 border-indigo-300/60 dark:border-indigo-600/40 shadow-lg">
              <ShoppingCart className="text-indigo-500 h-8 w-8 mb-2" />
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {totalSales.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                товаров
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chart;

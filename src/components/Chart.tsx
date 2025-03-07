
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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-bold drop-shadow-md"
        style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const customLegendFormatter = (value: string) => {
    const item = productSales.find(p => p.subject_name === value);
    if (!item) return value;
    const percentage = ((item.quantity / totalSales) * 100).toFixed(0);
    return (
      <span className="flex items-center gap-1 text-sm">
        <span className="font-medium">{value}</span>
        <span className="text-muted-foreground">({item.quantity} шт. • {percentage}%)</span>
      </span>
    );
  };

  return (
    <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-4'}`}>
      <Card className="p-4 overflow-hidden relative border-indigo-200/40 dark:border-indigo-800/40 bg-gradient-to-br from-white/80 to-indigo-50/50 dark:from-gray-900/90 dark:to-indigo-950/50 backdrop-blur-[1px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200/20 via-transparent to-transparent dark:from-indigo-900/20 pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="text-indigo-500" size={20} />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
              Динамика продаж по дням
            </span>
          </h3>
        </div>
        
        <div className="h-[400px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCurrentSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorPreviousSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
                </filter>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280" 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
                tickLine={{ stroke: 'rgba(107, 114, 128, 0.3)' }}
                axisLine={{ stroke: 'rgba(107, 114, 128, 0.3)' }}
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tick={{ fill: '#6B7280' }}
                tickFormatter={(value) => value.toLocaleString()}
                tickLine={{ stroke: 'rgba(107, 114, 128, 0.3)' }}
                axisLine={{ stroke: 'rgba(107, 114, 128, 0.3)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.98)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                  color: "#F9FAFB"
                }}
                formatter={(value: number) => [value.toLocaleString() + " ₽", '']}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
                }}
                itemStyle={{ color: "#F9FAFB" }}
              />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => {
                  return <span className="text-sm font-medium">{
                    value === "sales" ? "Текущий период" : "Предыдущий период"
                  }</span>
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                name="Текущий период"
                stroke="#6366F1"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8, strokeWidth: 0, fill: "#6366F1", style: { filter: 'url(#shadow)' } }}
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(99, 102, 241, 0.4))' }}
              />
              <Line
                type="monotone"
                dataKey="previousSales"
                name="Предыдущий период"
                stroke="#EC4899"
                strokeWidth={3}
                dot={false}
                strokeDasharray="5 5"
                activeDot={{ r: 8, strokeWidth: 0, fill: "#EC4899", style: { filter: 'url(#shadow)' } }}
                style={{ filter: 'drop-shadow(0px 1px 2px rgba(236, 72, 153, 0.4))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 overflow-hidden relative border-indigo-200/40 dark:border-indigo-800/40 bg-gradient-to-br from-white/80 to-indigo-50/50 dark:from-gray-900/90 dark:to-indigo-950/50 backdrop-blur-[1px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200/20 via-transparent to-transparent dark:from-indigo-900/20 pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-4 relative z-10">
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
                  <linearGradient key={`colorGradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.95}/>
                    <stop offset="100%" stopColor={color} stopOpacity={0.75}/>
                  </linearGradient>
                ))}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              <Pie
                data={productSales}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                innerRadius={95}
                outerRadius={140}
                fill="#8884d8"
                dataKey="quantity"
                nameKey="subject_name"
                animationBegin={0}
                animationDuration={1500}
                paddingAngle={3}
              >
                {productSales.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#colorGradient-${index % COLORS.length})`} 
                    stroke="rgba(255,255,255,0.6)" 
                    strokeWidth={2} 
                    style={{ filter: 'url(#shadow)' }}
                  />
                ))}
              </Pie>
              
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(31, 41, 55, 0.98)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px -1px rgba(0, 0, 0, 0.3), 0 2px 6px -1px rgba(0, 0, 0, 0.2)",
                  color: "#F9FAFB"
                }}
                formatter={(value: number, name: string) => {
                  return [`${value.toLocaleString()} шт.`, name];
                }}
                itemStyle={{ padding: "4px 0", color: "#F9FAFB" }}
              />
              
              <Legend 
                formatter={customLegendFormatter} 
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ paddingLeft: "20px", fontSize: "12px", maxHeight: "300px", overflowY: "auto" }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'translateX(-21%)' }}>
            <div className="w-[180px] h-[180px] rounded-full flex flex-col items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-indigo-300/60 dark:border-indigo-600/40 shadow-lg">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full">
                  <Package className="text-white h-6 w-6" />
                </div>
                
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-400 dark:to-purple-400">
                  {totalSales.toLocaleString()}
                </div>
                
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  товаров продано
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chart;

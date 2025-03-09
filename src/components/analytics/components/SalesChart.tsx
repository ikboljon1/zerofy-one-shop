
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface SalesData {
  date: string;
  sales: number;
  previousSales?: number;
}

interface SalesChartProps {
  data: {
    dailySales: SalesData[];
  };
  isDemoData?: boolean;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return `${date.getDate()}.${date.getMonth() + 1}`;
  } catch (e) {
    console.error('Invalid date:', dateStr);
    return dateStr;
  }
};

const SalesChart = ({ data, isDemoData = false }: SalesChartProps) => {
  const chartData = data.dailySales?.map(item => ({
    date: formatDate(item.date),
    sales: item.sales,
    previousSales: item.previousSales || 0
  })) || [];

  return (
    <Card className={isDemoData ? "border-gray-300 dark:border-gray-700" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-row items-center space-x-2">
          <CardTitle className="text-base font-semibold">Динамика продаж</CardTitle>
          
          {isDemoData && (
            <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">
              <Info className="h-3 w-3 mr-1" />
              Демо данные
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[250px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPrevSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDemoData ? "#9F9EA1" : undefined} opacity={isDemoData ? 0.6 : 1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  stroke={isDemoData ? "#8E9196" : undefined}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value, 0)}
                  tick={{ fontSize: 12 }}
                  width={60}
                  stroke={isDemoData ? "#8E9196" : undefined}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Дата: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorSales)"
                  strokeWidth={2}
                  name="Текущий период"
                  opacity={isDemoData ? 0.8 : 1}
                />
                {chartData.some(item => item.previousSales > 0) && (
                  <Area 
                    type="monotone" 
                    dataKey="previousSales" 
                    stroke="#82ca9d" 
                    fillOpacity={1} 
                    fill="url(#colorPrevSales)"
                    strokeWidth={2}
                    name="Предыдущий период"
                    opacity={isDemoData ? 0.8 : 1}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">Нет данных по продажам</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground justify-between">
        <div>Динамика продаж по дням</div>
        {isDemoData && <div className="text-gray-500">Демонстрационные данные</div>}
      </CardFooter>
    </Card>
  );
};

export default SalesChart;

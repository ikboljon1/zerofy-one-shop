
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface ExpenseBreakdownProps {
  data: any;
  advertisingBreakdown: {
    search: number;
  };
  isDemoData?: boolean;
}

const ExpenseBreakdown = ({ data, advertisingBreakdown, isDemoData = false }: ExpenseBreakdownProps) => {
  const expenses = data?.currentPeriod?.expenses || {};
  
  const chartData = [
    {
      name: "Логистика",
      value: expenses.logistics || 0,
    },
    {
      name: "Хранение",
      value: expenses.storage || 0,
    },
    {
      name: "Штрафы",
      value: expenses.penalties || 0,
    },
    {
      name: "Приемка",
      value: expenses.acceptance || 0,
    },
    {
      name: "Реклама",
      value: expenses.advertising || 0,
    },
  ];

  if (expenses.deductions && expenses.deductions > 0) {
    chartData.push({
      name: "Прочие удержания",
      value: expenses.deductions,
    });
  }

  // Сортируем данные по убыванию значения
  chartData.sort((a, b) => b.value - a.value);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];

  const renderCustomizedLabel = ({ x, y, width, height, value, index }: any) => {
    return (
      <text 
        x={x + width + 5} 
        y={y + height / 2} 
        fill="#666" 
        textAnchor="start"
        dominantBaseline="middle"
        className={`${isDemoData ? "fill-gray-500" : ""}`}
      >
        {formatCurrency(value)}
      </text>
    );
  };

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={isDemoData ? "border-gray-300 dark:border-gray-700" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-row items-center space-x-2">
          <CardTitle className="text-base font-semibold">Структура расходов</CardTitle>
          
          {isDemoData && (
            <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">
              <Info className="h-3 w-3 mr-1" />
              Демо данные
            </Badge>
          )}
        </div>
        <CardDescription className="text-right">
          {totalExpenses > 0 ? 
            formatCurrency(totalExpenses) : 
            "Нет данных"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {totalExpenses > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{
                  top: 5, right: 80, left: 5, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontalPoints={chartData.map((_, i) => i)} />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => formatCurrency(value, 0)}
                  stroke={isDemoData ? "#8E9196" : undefined}
                />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  width={120}
                  stroke={isDemoData ? "#8E9196" : undefined}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar 
                  dataKey="value" 
                  background={{ fill: isDemoData ? "#F1F0FB" : "#f5f5f5" }}
                  label={renderCustomizedLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      opacity={isDemoData ? 0.8 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">Нет данных о расходах</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdown;

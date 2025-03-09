
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface DeductionsData {
  date: string;
  logistic: number;
  storage: number;
  penalties: number;
  acceptance: number;
  advertising: number;
  deductions?: number;
}

interface DeductionsChartProps {
  data: DeductionsData[];
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

const colors = {
  logistic: "#8884d8",
  storage: "#82ca9d",
  penalties: "#ff7300",
  acceptance: "#0088fe",
  advertising: "#ff8042",
  deductions: "#8a2be2"
};

const DeductionsChart = ({ data = [], isDemoData = false }: DeductionsChartProps) => {
  const chartData = data.map(item => ({
    date: formatDate(item.date),
    logistic: item.logistic,
    storage: item.storage,
    penalties: item.penalties,
    acceptance: item.acceptance,
    advertising: item.advertising,
    deductions: item.deductions || 0,
  }));

  return (
    <Card className={isDemoData ? "border-gray-300 dark:border-gray-700" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-row items-center space-x-2">
          <CardTitle className="text-base font-semibold">Расходы по дням</CardTitle>
          
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
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === 'logistic' ? 'Логистика' :
                    name === 'storage' ? 'Хранение' :
                    name === 'penalties' ? 'Штрафы' :
                    name === 'acceptance' ? 'Приемка' :
                    name === 'advertising' ? 'Реклама' :
                    name === 'deductions' ? 'Прочие удержания' : name
                  ]}
                  labelFormatter={(label) => `Дата: ${label}`}
                />
                <Legend 
                  formatter={(value, entry) => {
                    const valueMap: { [key: string]: string } = {
                      'logistic': 'Логистика',
                      'storage': 'Хранение',
                      'penalties': 'Штрафы',
                      'acceptance': 'Приемка',
                      'advertising': 'Реклама',
                      'deductions': 'Прочие удержания'
                    };
                    return <span className={isDemoData ? "text-gray-600 dark:text-gray-400" : ""}>{valueMap[value] || value}</span>;
                  }}
                />
                <Bar 
                  dataKey="logistic" 
                  stackId="a" 
                  fill={colors.logistic}
                  name="logistic"
                  opacity={isDemoData ? 0.8 : 1}
                />
                <Bar 
                  dataKey="storage" 
                  stackId="a" 
                  fill={colors.storage}
                  name="storage"
                  opacity={isDemoData ? 0.8 : 1}
                />
                <Bar 
                  dataKey="penalties" 
                  stackId="a" 
                  fill={colors.penalties}
                  name="penalties"
                  opacity={isDemoData ? 0.8 : 1}
                />
                <Bar 
                  dataKey="acceptance" 
                  stackId="a" 
                  fill={colors.acceptance}
                  name="acceptance"
                  opacity={isDemoData ? 0.8 : 1}
                />
                <Bar 
                  dataKey="advertising" 
                  stackId="a" 
                  fill={colors.advertising}
                  name="advertising"
                  opacity={isDemoData ? 0.8 : 1}
                />
                {chartData.some(item => item.deductions > 0) && (
                  <Bar 
                    dataKey="deductions" 
                    stackId="a" 
                    fill={colors.deductions}
                    name="deductions"
                    opacity={isDemoData ? 0.8 : 1}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-muted-foreground">Нет данных о расходах</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground justify-between">
        <div>Распределение расходов по дням</div>
        {isDemoData && <div className="text-gray-500">Демонстрационные данные</div>}
      </CardFooter>
    </Card>
  );
};

export default DeductionsChart;

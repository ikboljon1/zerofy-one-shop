
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { formatCurrency } from "@/utils/formatCurrency";
import { CoinsIcon } from "@/components/analytics/icons";

interface DeductionsTimelineItem {
  date: string;
  logistic: number;
  storage: number;
  penalties: number;
  acceptance: number;
  advertising: number;
  deductions?: number;
}

interface DeductionsChartProps {
  data: DeductionsTimelineItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalDeductions = payload.reduce((sum: number, entry: any) => {
      // Для компенсаций (отрицательные значения) вычитаем из суммы
      if (entry.name === "Компенсации" && entry.value < 0) {
        return sum - Math.abs(entry.value);
      }
      return sum + (entry.value || 0);
    }, 0);

    return (
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{`${label}`}</p>
        {payload.map((entry: any, index: number) => {
          // Пропускаем отображение нулевых значений
          if (entry.value === 0) return null;
          
          // Определяем, является ли значение компенсацией (отрицательное)
          const isCompensation = entry.name === "Компенсации" && entry.value < 0;
          
          return (
            <p key={`item-${index}`} style={{ color: entry.color }} className="flex justify-between items-center gap-3">
              <span>{isCompensation ? "Компенсации" : entry.name}:</span>
              <span className="font-medium">
                {isCompensation 
                  ? `-${formatCurrency(Math.abs(entry.value))} ₽` 
                  : `${formatCurrency(entry.value)} ₽`}
              </span>
            </p>
          );
        })}
        <div className="border-t mt-2 pt-2 font-medium flex justify-between">
          <span>Итого:</span>
          <span>{formatCurrency(totalDeductions)} ₽</span>
        </div>
      </div>
    );
  }

  return null;
};

const DeductionsChart: React.FC<DeductionsChartProps> = ({ data }) => {
  // Преобразуем данные для отображения, разделяя удержания и компенсации
  const chartData = data.map(item => {
    // Определяем, является ли deductions отрицательным (компенсация)
    const deductionsValue = item.deductions || 0;
    
    return {
      date: item.date.split('T')[0],
      "Логистика": item.logistic,
      "Хранение": item.storage,
      "Штрафы": item.penalties,
      "Приемка": item.acceptance,
      "Реклама": item.advertising,
      // Если deductions отрицательный, ставим его как "Компенсации", иначе как "Удержания"
      "Удержания": deductionsValue > 0 ? deductionsValue : 0,
      "Компенсации": deductionsValue < 0 ? deductionsValue : 0,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <CoinsIcon className="mr-2 h-5 w-5 text-amber-500" />
          Динамика расходов
        </CardTitle>
        <CardDescription>
          Распределение расходов и удержаний по дням
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="#888" strokeDasharray="3 3" />
              <Bar dataKey="Логистика" stackId="a" fill="#8B5CF6" />
              <Bar dataKey="Хранение" stackId="a" fill="#3B82F6" />
              <Bar dataKey="Штрафы" stackId="a" fill="#EF4444" />
              <Bar dataKey="Приемка" stackId="a" fill="#10B981" />
              <Bar dataKey="Реклама" stackId="a" fill="#F59E0B" />
              <Bar dataKey="Удержания" stackId="a" fill="#FB923C" />
              <Bar dataKey="Компенсации" stackId="a" fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeductionsChart;

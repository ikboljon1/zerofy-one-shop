
import { Card } from "@/components/ui/card";
import { TrendingDown } from "../icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface DeductionsChartProps {
  data: Array<{
    date: string;
    logistic: number;
    storage: number;
    penalties: number;
  }>;
}

const DeductionsChart = ({ data }: DeductionsChartProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Структура удержаний по дням</h3>
        <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-md">
          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} />
            <Tooltip
              formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
              contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Bar dataKey="logistic" name="Логистика" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="storage" name="Хранение" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="penalties" name="Штрафы" fill="#EC4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DeductionsChart;

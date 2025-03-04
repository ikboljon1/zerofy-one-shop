
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
  Legend,
  ReferenceLine,
  Label
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
  // Calculate totals for each category
  const totals = data.reduce(
    (acc, item) => {
      acc.logistic += item.logistic;
      acc.storage += item.storage;
      acc.penalties += item.penalties;
      return acc;
    },
    { logistic: 0, storage: 0, penalties: 0 }
  );

  // Calculate average per day for reference line
  const days = data.length;
  const avgLogistic = totals.logistic / days;
  const avgStorage = totals.storage / days;
  const avgPenalties = totals.penalties / days;

  return (
    <Card className="p-6 shadow-xl border-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
            Структура удержаний по дням
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Детализация удержаний за выбранный период
          </p>
        </div>
        <div className="bg-red-100 dark:bg-red-900/60 p-3 rounded-full shadow-inner">
          <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Логистика</span>
            <span className="text-md font-semibold text-violet-600 dark:text-violet-400">
              {totals.logistic.toLocaleString()} ₽
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-violet-600 dark:bg-violet-500 h-2.5 rounded-full" 
              style={{ width: `${(totals.logistic / (totals.logistic + totals.storage + totals.penalties)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Хранение</span>
            <span className="text-md font-semibold text-emerald-600 dark:text-emerald-400">
              {totals.storage.toLocaleString()} ₽
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full" 
              style={{ width: `${(totals.storage / (totals.logistic + totals.storage + totals.penalties)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Штрафы</span>
            <span className="text-md font-semibold text-pink-600 dark:text-pink-400">
              {totals.penalties.toLocaleString()} ₽
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-pink-600 dark:bg-pink-500 h-2.5 rounded-full" 
              style={{ width: `${(totals.penalties / (totals.logistic + totals.storage + totals.penalties)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            barSize={24}
            barGap={2}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 30,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af" 
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af" 
              tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.97)', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                padding: '10px 14px'
              }}
              cursor={{ fill: 'rgba(224, 231, 255, 0.2)' }}
            />
            <Legend 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{
                paddingTop: '20px'
              }}
            />
            <ReferenceLine y={avgLogistic} stroke="#8B5CF6" strokeDasharray="3 3">
              <Label value="Средняя логистика" position="insideTopRight" fill="#8B5CF6" fontSize={10} />
            </ReferenceLine>
            <ReferenceLine y={avgStorage} stroke="#10B981" strokeDasharray="3 3">
              <Label value="Среднее хранение" position="insideTopLeft" fill="#10B981" fontSize={10} />
            </ReferenceLine>
            <Bar 
              dataKey="logistic" 
              name="Логистика" 
              fill="#8B5CF6" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
            <Bar 
              dataKey="storage" 
              name="Хранение" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
              animationEasing="ease-in-out"
              animationBegin={300}
            />
            <Bar 
              dataKey="penalties" 
              name="Штрафы" 
              fill="#EC4899" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
              animationEasing="ease-in-out"
              animationBegin={600}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default DeductionsChart;

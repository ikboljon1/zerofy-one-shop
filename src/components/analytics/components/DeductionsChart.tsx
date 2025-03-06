
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  
  // Check if data is valid and not empty
  const isValidData = data && Array.isArray(data) && data.length > 0;
  
  // Calculate totals for each category only if data is valid
  const totals = isValidData ? data.reduce(
    (acc, item) => {
      acc.logistic += item.logistic;
      acc.storage += item.storage;
      acc.penalties += item.penalties;
      return acc;
    },
    { logistic: 0, storage: 0, penalties: 0 }
  ) : { logistic: 0, storage: 0, penalties: 0 };

  // Calculate average per day for reference line
  const days = isValidData ? data.length : 1;
  const avgLogistic = totals.logistic / days;
  const avgStorage = totals.storage / days;
  const avgPenalties = totals.penalties / days;

  // Calculate totals for percentage calculations
  const grandTotal = totals.logistic + totals.storage + totals.penalties;

  if (!isValidData) {
    return (
      <Card className="p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
            Структура удержаний по дням
          </h3>
          <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-full shadow-inner">
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Нет данных за выбранный период
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 shadow-xl border-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/30">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400`}>
            Структура удержаний по дням
          </h3>
          {!isMobile && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Детализация удержаний за выбранный период
            </p>
          )}
        </div>
        <div className="bg-red-100 dark:bg-red-900/60 p-2 sm:p-3 rounded-full shadow-inner">
          <TrendingDown className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-red-600 dark:text-red-400`} />
        </div>
      </div>

      {/* Summary cards - stacked in mobile view, grid in desktop */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 lg:grid-cols-3 gap-4'} mb-4 sm:mb-6`}>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Логистика</span>
            <span className={`${isMobile ? 'text-sm' : 'text-md'} font-semibold text-violet-600 dark:text-violet-400`}>
              {totals.logistic.toLocaleString()} ₽
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-violet-600 dark:bg-violet-500 h-2.5 rounded-full" 
              style={{ width: `${grandTotal > 0 ? (totals.logistic / grandTotal) * 100 : 0}%` }}
            ></div>
          </div>
          {isMobile && (
            <div className="mt-1 text-xs text-gray-500">
              {grandTotal > 0 ? ((totals.logistic / grandTotal) * 100).toFixed(1) : '0'}% от общей суммы
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Хранение</span>
            <span className={`${isMobile ? 'text-sm' : 'text-md'} font-semibold text-emerald-600 dark:text-emerald-400`}>
              {totals.storage.toLocaleString()} ₽
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full" 
              style={{ width: `${grandTotal > 0 ? (totals.storage / grandTotal) * 100 : 0}%` }}
            ></div>
          </div>
          {isMobile && (
            <div className="mt-1 text-xs text-gray-500">
              {grandTotal > 0 ? ((totals.storage / grandTotal) * 100).toFixed(1) : '0'}% от общей суммы
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Штрафы</span>
            <span className={`${isMobile ? 'text-sm' : 'text-md'} font-semibold text-pink-600 dark:text-pink-400`}>
              {totals.penalties.toLocaleString()} ₽
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-pink-600 dark:bg-pink-500 h-2.5 rounded-full" 
              style={{ width: `${grandTotal > 0 ? (totals.penalties / grandTotal) * 100 : 0}%` }}
            ></div>
          </div>
          {isMobile && (
            <div className="mt-1 text-xs text-gray-500">
              {grandTotal > 0 ? ((totals.penalties / grandTotal) * 100).toFixed(1) : '0'}% от общей суммы
            </div>
          )}
        </div>
      </div>

      <div className={`h-[${isMobile ? '250px' : '350px'}]`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            barSize={isMobile ? 16 : 24}
            barGap={isMobile ? 0 : 2}
            margin={{
              top: 20,
              right: isMobile ? 10 : 30,
              left: isMobile ? 0 : 20,
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
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={isMobile ? (value) => value.split('.').pop() || value : undefined} // Only show day in mobile
            />
            <YAxis 
              stroke="#9ca3af" 
              tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              width={isMobile ? 30 : 40}
            />
            <Tooltip
              formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
              contentStyle={{ 
                background: 'rgba(255, 255, 255, 0.97)', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                padding: isMobile ? '8px 10px' : '10px 14px',
                fontSize: isMobile ? '12px' : '14px'
              }}
              cursor={{ fill: 'rgba(224, 231, 255, 0.2)' }}
            />
            {!isMobile && (
              <Legend 
                iconType="circle" 
                iconSize={8}
                wrapperStyle={{
                  paddingTop: '20px'
                }}
              />
            )}
            {/* Hide reference lines on mobile to avoid clutter */}
            {!isMobile && (
              <>
                <ReferenceLine y={avgLogistic} stroke="#8B5CF6" strokeDasharray="3 3">
                  <Label value="Средняя логистика" position="insideTopRight" fill="#8B5CF6" fontSize={10} />
                </ReferenceLine>
                <ReferenceLine y={avgStorage} stroke="#10B981" strokeDasharray="3 3">
                  <Label value="Среднее хранение" position="insideTopLeft" fill="#10B981" fontSize={10} />
                </ReferenceLine>
              </>
            )}
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
      
      {/* Mobile-only legend */}
      {isMobile && (
        <div className="flex justify-center space-x-4 mt-3">
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-violet-600 mr-1"></span>
            <span className="text-xs">Логистика</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-emerald-600 mr-1"></span>
            <span className="text-xs">Хранение</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-pink-600 mr-1"></span>
            <span className="text-xs">Штрафы</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DeductionsChart;

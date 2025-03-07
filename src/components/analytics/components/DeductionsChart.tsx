
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { TrendingDown, CoinsIcon } from "../icons";
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
import { formatCurrency } from "@/utils/formatCurrency";

interface DeductionsData {
  date: string;
  logistic: number;
  storage: number;
  penalties: number;
  acceptance?: number;
  advertising?: number;
  deductions?: number; // Add deductions
}

interface DeductionsChartProps {
  data: DeductionsData[];
}

const DeductionsChart = ({ data }: DeductionsChartProps) => {
  const isMobile = useIsMobile();
  
  // Calculate totals for each category including acceptance and advertising
  const totals = data.reduce(
    (acc, item) => {
      acc.logistic += item.logistic || 0;
      acc.storage += item.storage || 0;
      acc.penalties += item.penalties || 0;
      acc.acceptance += item.acceptance || 0;
      acc.advertising += item.advertising || 0;
      acc.deductions += item.deductions || 0;
      return acc;
    },
    { logistic: 0, storage: 0, penalties: 0, acceptance: 0, advertising: 0, deductions: 0 }
  );

  // Calculate average per day for reference line
  const days = data.length || 1;
  const avgLogistic = totals.logistic / days;
  const avgStorage = totals.storage / days;
  const avgPenalties = totals.penalties / days;
  const avgDeductions = totals.deductions / days;

  // Calculate totals for percentage calculations
  const grandTotal = Math.abs(totals.logistic) + Math.abs(totals.storage) + Math.abs(totals.penalties) + 
                     Math.abs(totals.acceptance) + Math.abs(totals.advertising) + Math.abs(totals.deductions);

  // Determine if deductions are mostly positive or negative for UI representation
  const deductionsLabel = totals.deductions >= 0 ? "Удержания" : "Компенсации";
  const deductionsColor = totals.deductions >= 0 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400";
  const deductionsBarColor = totals.deductions >= 0 ? "#F59E0B" : "#10B981";

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
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 lg:grid-cols-4 gap-4'} mb-4 sm:mb-6`}>
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Логистика</span>
            <span className={`${isMobile ? 'text-sm' : 'text-md'} font-semibold text-violet-600 dark:text-violet-400`}>
              {formatCurrency(totals.logistic)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-violet-600 dark:bg-violet-500 h-2.5 rounded-full" 
              style={{ width: `${grandTotal > 0 ? (Math.abs(totals.logistic) / grandTotal) * 100 : 0}%` }}
            ></div>
          </div>
          {isMobile && (
            <div className="mt-1 text-xs text-gray-500">
              {grandTotal > 0 ? ((Math.abs(totals.logistic) / grandTotal) * 100).toFixed(1) : '0'}% от общей суммы
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Хранение</span>
            <span className={`${isMobile ? 'text-sm' : 'text-md'} font-semibold text-emerald-600 dark:text-emerald-400`}>
              {formatCurrency(totals.storage)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-emerald-600 dark:bg-emerald-500 h-2.5 rounded-full" 
              style={{ width: `${grandTotal > 0 ? (Math.abs(totals.storage) / grandTotal) * 100 : 0}%` }}
            ></div>
          </div>
          {isMobile && (
            <div className="mt-1 text-xs text-gray-500">
              {grandTotal > 0 ? ((Math.abs(totals.storage) / grandTotal) * 100).toFixed(1) : '0'}% от общей суммы
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">Штрафы</span>
            <span className={`${isMobile ? 'text-sm' : 'text-md'} font-semibold text-pink-600 dark:text-pink-400`}>
              {formatCurrency(totals.penalties)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-pink-600 dark:bg-pink-500 h-2.5 rounded-full" 
              style={{ width: `${grandTotal > 0 ? (Math.abs(totals.penalties) / grandTotal) * 100 : 0}%` }}
            ></div>
          </div>
          {isMobile && (
            <div className="mt-1 text-xs text-gray-500">
              {grandTotal > 0 ? ((Math.abs(totals.penalties) / grandTotal) * 100).toFixed(1) : '0'}% от общей суммы
            </div>
          )}
        </div>

        {/* New card for deductions */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">{deductionsLabel}</span>
            <span className={`${isMobile ? 'text-sm' : 'text-md'} font-semibold ${deductionsColor}`}>
              {formatCurrency(totals.deductions)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className={totals.deductions >= 0 ? "bg-orange-500 dark:bg-orange-600 h-2.5 rounded-full" : "bg-green-500 dark:bg-green-600 h-2.5 rounded-full"} 
              style={{ width: `${grandTotal > 0 ? (Math.abs(totals.deductions) / grandTotal) * 100 : 0}%` }}
            ></div>
          </div>
          {isMobile && (
            <div className="mt-1 text-xs text-gray-500">
              {grandTotal > 0 ? ((Math.abs(totals.deductions) / grandTotal) * 100).toFixed(1) : '0'}% от общей суммы
            </div>
          )}
        </div>
      </div>

      <div className={`h-[${isMobile ? '250px' : '350px'}]`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            barSize={isMobile ? 16 : 20}
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
              formatter={(value: any) => [`${formatCurrency(value)}`, '']}
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
                {Math.abs(avgDeductions) > 0 && (
                  <ReferenceLine y={avgDeductions} stroke={deductionsBarColor} strokeDasharray="3 3">
                    <Label value={`Средние ${deductionsLabel.toLowerCase()}`} position="insideBottomRight" fill={deductionsBarColor} fontSize={10} />
                  </ReferenceLine>
                )}
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
            {/* Add bars for acceptance and advertising if they exist in the data */}
            <Bar 
              dataKey="acceptance" 
              name="Приемка" 
              fill="#F59E0B" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
              animationEasing="ease-in-out"
              animationBegin={900}
            />
            <Bar 
              dataKey="advertising" 
              name="Реклама" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
              animationEasing="ease-in-out"
              animationBegin={1200}
            />
            {/* Add bar for deductions with dynamic color based on value */}
            <Bar 
              dataKey="deductions" 
              name={deductionsLabel} 
              fill={deductionsBarColor}
              radius={[4, 4, 0, 0]} 
              animationDuration={1500}
              animationEasing="ease-in-out"
              animationBegin={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Mobile-only legend */}
      {isMobile && (
        <div className="flex flex-wrap justify-center gap-3 mt-3">
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
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-amber-500 mr-1"></span>
            <span className="text-xs">Приемка</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-blue-500 mr-1"></span>
            <span className="text-xs">Реклама</span>
          </div>
          <div className="flex items-center">
            <span className={`h-3 w-3 rounded-full ${totals.deductions >= 0 ? "bg-orange-500" : "bg-green-500"} mr-1`}></span>
            <span className="text-xs">{deductionsLabel}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DeductionsChart;

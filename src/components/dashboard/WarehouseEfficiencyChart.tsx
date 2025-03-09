
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WarehouseEfficiency } from "@/types/supplies";
import { formatCurrency } from "@/utils/formatCurrency";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Building2, BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, ArrowUp } from "lucide-react";

interface WarehouseEfficiencyChartProps {
  data: WarehouseEfficiency[];
}

// Professional color palette
const COLORS = [
  "#9b87f5", "#7E69AB", "#10B981", "#F59E0B", "#EC4899", 
  "#3B82F6", "#6366F1", "#EF4444", "#D6BCFA", "#8E9196"
];

const WarehouseEfficiencyChart: React.FC<WarehouseEfficiencyChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  // Sort data by rank for the ranking chart
  const sortedData = [...data].sort((a, b) => a.rank - b.rank);
  
  // Format data for radar chart with better scaling for visualization
  const radarData = data.map(warehouse => ({
    warehouse: warehouse.warehouseName,
    turnoverRate: warehouse.turnoverRate * 12, // Scale for better visualization
    utilization: warehouse.utilizationPercent,
    processingSpeed: warehouse.processingSpeed / 8, // Scale for better visualization
    totalItems: warehouse.totalItems / 80, // Scale for better visualization
  }));
  
  // Format data for distribution pie chart
  const totalItems = data.reduce((sum, w) => sum + w.totalItems, 0);
  const pieData = data.map(warehouse => ({
    name: warehouse.warehouseName,
    value: warehouse.totalItems,
    percentage: (warehouse.totalItems / totalItems) * 100
  }));
  
  // Prepare data for comparison chart
  const comparisonData = data.map(warehouse => ({
    name: warehouse.warehouseName,
    turnover: warehouse.turnoverRate,
    utilization: warehouse.utilizationPercent,
    processing: warehouse.processingSpeed / 100, // Normalize for better visualization
  }));

  // Prepare data for line chart
  const lineChartData = sortedData.map(warehouse => ({
    name: warehouse.warehouseName,
    turnover: warehouse.turnoverRate,
    utilization: warehouse.utilizationPercent / 100, // Normalize to 0-1 scale
    processing: warehouse.processingSpeed / 500, // Normalize to 0-1 scale for visual comparison
  }));
  
  // Chart configuration for the efficiency metrics
  const efficiencyConfig = {
    turnover: {
      label: "Оборачиваемость (дни)",
      theme: {
        light: "#9b87f5",
        dark: "#7E69AB",
      },
    },
    utilization: {
      label: "Использование (%)",
      theme: {
        light: "#10B981",
        dark: "#34D399",
      },
    },
    processing: {
      label: "Скорость обработки (шт/день)",
      theme: {
        light: "#F59E0B",
        dark: "#FBBF24",
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Top efficiency warehouses with improved design */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                Рейтинг эффективности складов
              </span>
            </CardTitle>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
              Топ {sortedData.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4 space-y-4">
            {sortedData.map((warehouse, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index === 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' :
                  index === 1 ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white' :
                  index === 2 ? 'bg-gradient-to-r from-indigo-400 to-blue-500 text-white' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                } font-bold`}>
                  {warehouse.rank}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm flex items-center">
                      {warehouse.warehouseName}
                      {index === 0 && (
                        <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 border-none">
                          <ArrowUp className="h-3 w-3 mr-1" /> Лидер
                        </Badge>
                      )}
                    </span>
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">{formatCurrency(warehouse.totalValue)} ₽</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${
                        index === 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 
                        index === 1 ? 'bg-gradient-to-r from-purple-400 to-indigo-500' :
                        index === 2 ? 'bg-gradient-to-r from-indigo-400 to-blue-500' :
                        'bg-indigo-600 dark:bg-indigo-500'
                      }`}
                      style={{ 
                        width: `${100 - (index * (100 / sortedData.length))}%`,
                        opacity: index === 0 ? 1 : Math.max(0.4, 1 - (index * 0.15))
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-700 dark:text-gray-300 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
                      Оборот: {warehouse.turnoverRate.toFixed(1)}x
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                      Утил.: {warehouse.utilizationPercent}%
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                      Скорость: {warehouse.processingSpeed}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics comparison line chart - NEW CHART */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
                Сравнение ключевых показателей по складам
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="turnoverGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9b87f5" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="processingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 12 }}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                  tickLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 12 }}
                  axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                  tickLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.97)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === 'turnover') return [`${value.toFixed(1)} дней`, 'Оборачиваемость'];
                    if (name === 'utilization') return [`${(value * 100).toFixed(0)}%`, 'Использование'];
                    if (name === 'processing') return [`${(value * 500).toFixed(0)} шт/день`, 'Скорость обработки'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Склад: ${label}`}
                />
                <Legend
                  formatter={(value, entry) => {
                    const color = entry.color;
                    if (value === 'turnover') return <span style={{color}}>Оборачиваемость (дни)</span>;
                    if (value === 'utilization') return <span style={{color}}>Использование (%)</span>;
                    if (value === 'processing') return <span style={{color}}>Скорость обработки (шт/день)</span>;
                    return value;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="turnover"
                  stroke="#9b87f5"
                  strokeWidth={3}
                  dot={{ fill: '#9b87f5', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="utilization"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: '#10B981', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="processing"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', r: 5, strokeWidth: 0 }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                />
                <ReferenceLine 
                  y={data.reduce((sum, w) => sum + w.turnoverRate, 0) / data.length} 
                  stroke="#9b87f5" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: 'Ср. обор.', 
                    position: 'right', 
                    fill: '#9b87f5',
                    fontSize: 12
                  }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart for Multi-metric Comparison with improved design */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
                  Показатели эффективности
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                  <PolarAngleAxis 
                    dataKey="warehouse" 
                    tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 12 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                  />
                  <PolarRadiusAxis 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickCount={5}
                    domain={[0, 'auto']}
                    axisLine={false}
                    stroke="rgba(148, 163, 184, 0.3)"
                  />
                  <Radar
                    name="Оборачиваемость (дни)"
                    dataKey="turnoverRate"
                    stroke="#9b87f5"
                    fill="#9b87f5"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Использование (%)"
                    dataKey="utilization"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Скорость обработки (шт/день)"
                    dataKey="processingSpeed"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.5}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={(value) => (
                      <span className="text-sm font-medium">{value}</span>
                    )}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      name === "Оборачиваемость (дни)" ? (value / 12).toFixed(1) + " дней" : 
                      name === "Использование (%)" ? value + "%" : 
                      (value * 8).toFixed(0) + " шт/день",
                      name
                    ]}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.97)',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                    labelStyle={{
                      fontWeight: 'bold',
                      marginBottom: '6px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart with improved design */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-indigo-500" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                  Распределение товаров
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`pieGradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                    label={({ name, percentage }) => {
                      return percentage > 5 ? `${name.length > 12 ? name.substring(0, 12) + '...' : name} (${percentage.toFixed(1)}%)` : '';
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#pieGradient-${index % COLORS.length})`}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => {
                      // Find the original data item to get the percentage
                      const item = pieData.find(p => p.name === name);
                      const percentage = item ? item.percentage.toFixed(1) : '0';
                      return [`${value.toLocaleString()} шт. (${percentage}%)`, name];
                    }}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.97)',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                    itemStyle={{
                      fontWeight: 'medium'
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconSize={10}
                    wrapperStyle={{
                      fontSize: isMobile ? '10px' : '12px',
                      fontWeight: 'medium'
                    }}
                    formatter={(value, entry, index) => {
                      // Truncate long warehouse names
                      return value.length > 15 ? value.substring(0, 15) + '...' : value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Metrics Bar Chart with improved design */}
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                Сравнение метрик эффективности
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ChartContainer
              config={efficiencyConfig}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={comparisonData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20
                  }}
                  barSize={30}
                  barGap={8}
                >
                  <defs>
                    <linearGradient id="barTurnover" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-turnover)" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="var(--color-turnover)" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="barUtilization" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-utilization)" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="var(--color-utilization)" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="barProcessing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-processing)" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="var(--color-processing)" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    scale="band" 
                    axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                    tickLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                    tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                    tickLine={{ stroke: 'rgba(148, 163, 184, 0.3)' }}
                    tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'rgba(236, 240, 243, 0.3)' }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '15px',
                    }}
                    iconSize={10}
                    iconType="circle"
                  />
                  <Bar 
                    dataKey="turnover" 
                    name="Оборачиваемость (дни)" 
                    fill="url(#barTurnover)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="utilization" 
                    name="Использование (%)" 
                    fill="url(#barUtilization)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="processing" 
                    name="Скорость обработки (шт/день)" 
                    fill="url(#barProcessing)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseEfficiencyChart;

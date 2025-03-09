
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WarehouseEfficiency } from "@/types/supplies";
import { formatCurrency } from "@/utils/formatCurrency";
import { useIsMobile } from "@/hooks/use-mobile";
import { BarList, Bold, Flex, Grid, Metric, Text } from "@tremor/react";
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
  PolarRadiusAxis
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Building2, BarChart3, PieChart as PieChartIcon, Activity, TrendingUp } from "lucide-react";

interface WarehouseEfficiencyChartProps {
  data: WarehouseEfficiency[];
}

const COLORS = [
  "#8B5CF6", "#10B981", "#F59E0B", "#EC4899", "#3B82F6", 
  "#6366F1", "#EF4444", "#14B8A6", "#8B5CF6", "#D946EF"
];

const WarehouseEfficiencyChart: React.FC<WarehouseEfficiencyChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  // Sort data by rank for the ranking chart
  const sortedData = [...data].sort((a, b) => a.rank - b.rank);
  
  // Format data for radar chart
  const radarData = data.map(warehouse => ({
    warehouse: warehouse.warehouseName,
    turnoverRate: warehouse.turnoverRate * 10, // Scale for better visualization
    utilization: warehouse.utilizationPercent,
    processingSpeed: warehouse.processingSpeed / 10, // Scale for better visualization
    totalItems: warehouse.totalItems / 100, // Scale for better visualization
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
  
  // Chart configuration for the efficiency metrics
  const efficiencyConfig = {
    turnover: {
      label: "Оборачиваемость",
      theme: {
        light: "#8B5CF6",
        dark: "#A78BFA",
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
      label: "Скорость обработки",
      theme: {
        light: "#F59E0B",
        dark: "#FBBF24",
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Top efficiency warehouses */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
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
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index < 3 ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'} font-bold`}>
                  {warehouse.rank}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{warehouse.warehouseName}</span>
                    <span className="text-sm text-indigo-700 dark:text-indigo-400">{formatCurrency(warehouse.totalValue)} ₽</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${index === 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-indigo-600 dark:bg-indigo-500'}`}
                      style={{ 
                        width: `${100 - (index * (100 / sortedData.length))}%`,
                        opacity: index === 0 ? 1 : Math.max(0.4, 1 - (index * 0.15))
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>Оборот: {warehouse.turnoverRate.toFixed(1)}x</span>
                    <span>Утил.: {warehouse.utilizationPercent}%</span>
                    <span>Скорость: {warehouse.processingSpeed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart for Multi-metric Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
                  Сравнение показателей по складам
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                  <PolarAngleAxis 
                    dataKey="warehouse" 
                    tick={{ fill: '#64748b', fontSize: isMobile ? 10 : 12 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickCount={5}
                    domain={[0, 'auto']}
                    axisLine={false}
                  />
                  <Radar
                    name="Оборачиваемость"
                    dataKey="turnoverRate"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Использование"
                    dataKey="utilization"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Скорость обработки"
                    dataKey="processingSpeed"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.5}
                  />
                  <Legend />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      name === "Оборачиваемость" ? (value / 10).toFixed(1) + "x" : 
                      name === "Использование" ? value + "%" : 
                      (value * 10).toFixed(0),
                      name
                    ]}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart */}
        <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-indigo-500" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                  Распределение товаров по складам
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
                    formatter={(value, name, props) => {
                      // Find the original data item to get the percentage
                      const item = pieData.find(p => p.name === name);
                      const percentage = item ? item.percentage.toFixed(1) : '0';
                      return [`${value.toLocaleString()} шт. (${percentage}%)`, name];
                    }}
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconSize={10}
                    wrapperStyle={{
                      fontSize: isMobile ? '10px' : '12px'
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

      {/* Efficiency Metrics */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                Сравнение ключевых метрик эффективности
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
                  <XAxis 
                    dataKey="name" 
                    scale="band" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: isMobile ? 10 : 12, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={<ChartTooltipContent />}
                  />
                  <Legend />
                  <Bar 
                    dataKey="turnover" 
                    name="Оборачиваемость" 
                    fill="var(--color-turnover)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="utilization" 
                    name="Использование (%)" 
                    fill="var(--color-utilization)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="processing" 
                    name="Скорость обработки" 
                    fill="var(--color-processing)"
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

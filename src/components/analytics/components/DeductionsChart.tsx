
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label, ReferenceLine } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  isLoading?: boolean;
}

const DeductionsChart = ({ data, isLoading = false }: DeductionsChartProps) => {
  const isMobile = useIsMobile();
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
            <span>Структура расходов по дням</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 flex flex-col items-center justify-center h-80">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md h-full w-full"></div>
        </CardContent>
      </Card>
    );
  }

  const getTotal = (item: DeductionsTimelineItem) => {
    return item.logistic + item.storage + item.penalties + item.acceptance + item.advertising + (item.deductions || 0);
  };

  const getAverageTotal = () => {
    const totalSum = data.reduce((sum, item) => sum + getTotal(item), 0);
    return totalSum / data.length;
  };

  const getMaxTotal = () => {
    return Math.max(...data.map(item => getTotal(item)));
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
          <span>Структура расходов по дням</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // Convert YYYY-MM-DD to DD.MM
                  const parts = value.split('-');
                  if (parts.length === 3) {
                    return `${parts[2]}.${parts[1]}`;
                  }
                  return value;
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value;
                }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  const nameMap: {[key: string]: string} = {
                    logistic: 'Логистика',
                    storage: 'Хранение',
                    penalties: 'Штрафы',
                    acceptance: 'Приемка',
                    advertising: 'Реклама',
                    deductions: 'Вычеты'
                  };
                  
                  return [`${value} ₽`, nameMap[name] || name];
                }}
                labelFormatter={(label) => {
                  // Convert YYYY-MM-DD to DD.MM.YYYY
                  const parts = label.split('-');
                  if (parts.length === 3) {
                    return `${parts[2]}.${parts[1]}.${parts[0]}`;
                  }
                  return label;
                }}
              />
              <Legend 
                formatter={(value) => {
                  const nameMap: {[key: string]: string} = {
                    logistic: 'Логистика',
                    storage: 'Хранение',
                    penalties: 'Штрафы',
                    acceptance: 'Приемка',
                    advertising: 'Реклама',
                    deductions: 'Вычеты'
                  };
                  
                  return nameMap[value] || value;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="logistic" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="storage" 
                stackId="1" 
                stroke="#82ca9d" 
                fill="#82ca9d"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="penalties" 
                stackId="1" 
                stroke="#ffc658" 
                fill="#ffc658"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="acceptance" 
                stackId="1" 
                stroke="#ff7300" 
                fill="#ff7300"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="advertising" 
                stackId="1" 
                stroke="#0088fe" 
                fill="#0088fe"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="deductions" 
                stackId="1" 
                stroke="#FF5733" 
                fill="#FF5733"
                fillOpacity={0.6}
              />
              <ReferenceLine y={getAverageTotal()} stroke="#888" strokeDasharray="3 3">
                <Label value="Среднее" position="right" fill="#888" fontSize={12} />
              </ReferenceLine>
              <ReferenceLine y={getMaxTotal()} stroke="#ff0000" strokeDasharray="3 3">
                <Label value="Макс." position="right" fill="#ff0000" fontSize={12} />
              </ReferenceLine>
              <ReferenceLine y={0} stroke="#000" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeductionsChart;

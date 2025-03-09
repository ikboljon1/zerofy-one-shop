
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

interface PieChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  nameKey: string;
  colors: string[];
  isLoading?: boolean;
  icon?: React.ReactNode;
  emptyText?: string;
  valueLabel?: string;
  emptyMessage?: string;
}

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const PieChartCard = ({ 
  title, 
  data, 
  dataKey, 
  nameKey, 
  colors, 
  isLoading = false,
  icon,
  emptyText = "Нет данных для отображения",
  valueLabel,
  emptyMessage
}: PieChartCardProps) => {
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 space-y-4">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка данных...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="text-sm text-muted-foreground">{emptyMessage || emptyText}</p>
        </CardContent>
      </Card>
    );
  }

  // Format data for the tooltip
  const formatTooltip = (value: number) => {
    return `${value.toLocaleString('ru-RU')} ${valueLabel || '₽'}`;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChartCard;

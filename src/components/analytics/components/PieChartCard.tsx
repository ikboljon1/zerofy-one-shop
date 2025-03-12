
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/utils/formatCurrency';

// Массив цветов для секторов диаграммы
const COLORS = [
  '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', 
  '#eab308', '#84cc16', '#10b981', '#06b6d4', '#3b82f6'
];

interface PieChartCardProps {
  title: string;
  icon?: React.ReactNode;
  data: Array<{ name: string; value: number; count?: number }>;
  showCount?: boolean;
  emptyMessage?: string;
  noFallbackData?: boolean; // Добавляем опцию для запрета использования fallback данных
}

const PieChartCard: React.FC<PieChartCardProps> = ({ 
  title, 
  icon, 
  data, 
  showCount = false,
  emptyMessage = "Нет данных",
  noFallbackData = true // По умолчанию не показываем fallback данные
}) => {
  const isMobile = useIsMobile();
  
  // Проверяем, есть ли данные
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);
  
  // Сумма всех значений для процентов
  const total = hasData ? data.reduce((sum, item) => sum + item.value, 0) : 0;
  
  // Вычисляем высоту карточки в зависимости от размера экрана
  const cardHeight = isMobile ? 'min-h-[300px]' : 'min-h-[350px]';

  return (
    <Card className={`${cardHeight} shadow-md border-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950/30`}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {icon && <div>{icon}</div>}
        </div>
        
        {!hasData && (
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        )}
        
        {hasData && (
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={isMobile ? 40 : 50}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => 
                    isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {!isMobile && <Legend layout="vertical" verticalAlign="middle" align="right" />}
                <Tooltip 
                  formatter={(value: number) => [
                    showCount && data[0].count !== undefined
                      ? `${formatCurrency(value)} (${Math.round(value / total * 100)}%)`
                      : `${formatCurrency(value)} (${Math.round(value / total * 100)}%)`
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {isMobile && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium truncate max-w-[120px]">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(item.value)} 
                        {showCount && item.count !== undefined && ` (${item.count})`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChartCard;


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";
import React, { ReactNode } from "react";

interface PieChartCardProps {
  title: string;
  data: Array<{ name: string; value: number; count?: number; }>;
  icon?: ReactNode;
  emptyMessage?: string;
  showCount?: boolean;
}

const COLORS = [
  "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#3B82F6", "#6366F1", 
  "#D97706", "#059669", "#DC2626", "#7C3AED", "#2563EB", "#4F46E5"
];

const PieChartCard: React.FC<PieChartCardProps> = ({ 
  title, 
  data = [], 
  icon,
  emptyMessage = "Нет данных",
  showCount = false
}) => {
  // Обработаем данные для правильного отображения отрицательных значений
  const processedData = data.map(item => ({
    ...item,
    displayValue: Math.abs(item.value),
    isNegative: item.value < 0
  }));

  const totalValue = processedData.reduce((sum, item) => sum + Math.abs(item.value), 0);
  const totalCount = processedData.reduce((sum, item) => sum + (item.count || 0), 0);

  const formatTooltip = (value: number, name: string, props: any) => {
    const item = processedData.find(d => d.name === name);
    if (item && item.isNegative) {
      return [`${formatCurrency(value)} ₽ (компенсация)`, name];
    }
    return [`${formatCurrency(value)} ₽`, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </CardTitle>
        <CardDescription>
          {totalValue > 0 
            ? `Всего: ${formatCurrency(totalValue)} ₽${showCount && totalCount > 0 ? ` (${totalCount} шт.)` : ''}` 
            : emptyMessage}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {processedData.length > 0 && totalValue > 0 ? (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={processedData}
                  dataKey="displayValue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, value, percent }) => {
                    const displayText = `${name}: ${(percent * 100).toFixed(0)}%`;
                    return displayText.length > 20 ? `${displayText.slice(0, 17)}...` : displayText;
                  }}
                >
                  {processedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isNegative ? "#10B981" : COLORS[index % COLORS.length]} 
                      className={entry.isNegative ? "opacity-70" : ""}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry, index) => {
                    const item = processedData[index];
                    let displayName = value;
                    
                    if (displayName.length > 20) {
                      displayName = `${displayName.slice(0, 17)}...`;
                    }
                    
                    if (item && item.isNegative) {
                      return <span style={{ color: '#10B981' }}>{displayName} (компенсация)</span>;
                    }
                    
                    return displayName;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-60 text-muted-foreground">
            {emptyMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChartCard;

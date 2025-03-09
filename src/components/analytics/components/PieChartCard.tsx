
import { Card } from "@/components/ui/card";
import { COLORS } from "../data/demoData";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import { formatCurrency, roundToTwoDecimals } from "@/utils/formatCurrency";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PieChartCardProps {
  title: string;
  icon: React.ReactNode;
  data: Array<{
    name: string;
    value: number;
    count?: number;
    isNegative?: boolean;
  }>;
  valueLabel?: string;
  showCount?: boolean;
  emptyMessage?: string;
}

const PieChartCard = ({ 
  title, 
  icon, 
  data, 
  valueLabel = "", 
  showCount = false,
  emptyMessage = "Нет данных за выбранный период" 
}: PieChartCardProps) => {
  // Отфильтровываем данные с нулевыми значениями
  const filteredData = data && data.filter(item => item.value !== 0);
  
  // Проверяем, что данные не пустые и содержат значения
  const hasData = filteredData && filteredData.length > 0;

  // Преобразуем данные для корректного отображения в диаграмме
  // Для диаграммы используем абсолютные значения, чтобы все сегменты были положительными
  const chartData = hasData ? filteredData.map(item => ({
    ...item,
    value: Math.abs(item.value)
  })) : [];

  // Определяем, нужно ли делать список скроллируемым (если больше 5 элементов)
  const needScroll = filteredData && filteredData.length > 5;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-md">
          {icon}
        </div>
      </div>
      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${formatCurrency(value)} ${valueLabel}`, '']}
                  contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={needScroll ? "relative" : "space-y-4"}>
            {needScroll ? (
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4 pr-2">
                  {filteredData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-medium ${item.isNegative || item.value < 0 ? 'text-red-500' : ''}`}>
                          {item.isNegative || item.value < 0 ? '-' : ''}{formatCurrency(roundToTwoDecimals(Math.abs(item.value)))} {valueLabel}
                        </span>
                        {showCount && item.count !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            Кол-во: {item.count}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <>
                {filteredData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-medium ${item.isNegative || item.value < 0 ? 'text-red-500' : ''}`}>
                        {item.isNegative || item.value < 0 ? '-' : ''}{formatCurrency(roundToTwoDecimals(Math.abs(item.value)))} {valueLabel}
                      </span>
                      {showCount && item.count !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Кол-во: {item.count}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      )}
    </Card>
  );
};

export default PieChartCard;

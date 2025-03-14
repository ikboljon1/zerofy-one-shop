import { Card } from "@/components/ui/card";
import { COLORS } from "../data/demoData";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency, roundToTwoDecimals } from "@/utils/formatCurrency";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PieChartCardProps {
  title: string;
  icon: React.ReactNode;
  data: Array<{
    name: string;
    value: number;
    count?: number; // Поле для количества
    isNegative?: boolean; // Флаг для отрицательных значений
  }>;
  valueLabel?: string;
  showCount?: boolean; // Флаг для отображения количества
  emptyMessage?: string; // Сообщение при отсутствии данных
  noFallbackData?: boolean; // Флаг для отключения демо-данных
}

const PieChartCard = ({
  title,
  icon,
  data,
  valueLabel = "",
  showCount = false,
  emptyMessage = "Нет данных за выбранный период",
  noFallbackData = false
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
  return <Card className="p-3">
      <div className="flex items-center justify-between mb-3 rounded-none">
        <h3 className="text-base font-medium">{title}</h3>
        <div className="bg-primary/10 dark:bg-primary/20 p-1 rounded-md">
          {icon}
        </div>
      </div>
      {hasData ? <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={25} outerRadius={55} paddingAngle={2} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: any) => [`${formatCurrency(value)} ${valueLabel}`, '']} contentStyle={{
              background: '#ffffff',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className={needScroll ? "relative" : "space-y-2"}>
            {needScroll ? <ScrollArea className="h-[150px] pr-2">
                <div className="space-y-2 pr-2">
                  {filteredData.map((item, index) => <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-1.5" style={{
                  backgroundColor: COLORS[index % COLORS.length]
                }}></div>
                        <span className="text-[12px]">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-medium text-[12px] ${item.isNegative || item.value < 0 ? 'text-red-500' : ''}`}>
                          {item.isNegative || item.value < 0 ? '-' : ''}{formatCurrency(roundToTwoDecimals(Math.abs(item.value)))} {valueLabel}
                        </span>
                        {showCount && item.count !== undefined && <div className="text-[12px] text-muted-foreground">
                            Кол-во: {item.count}
                          </div>}
                      </div>
                    </div>)}
                </div>
              </ScrollArea> : <>
                {filteredData.map((item, index) => <div key={index} className="flex items-center justify-between my-0 mx-0 px-0 rounded-none py-[3px]">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1.5" style={{
                backgroundColor: COLORS[index % COLORS.length]
              }}></div>
                      <span className="mx-0 my-0 py-0 px-0 text-sm font-light text-left">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-medium text-[12px] ${item.isNegative || item.value < 0 ? 'text-red-500' : ''}`}>
                        {item.isNegative || item.value < 0 ? '-' : ''}{formatCurrency(roundToTwoDecimals(Math.abs(item.value)))} {valueLabel}
                      </span>
                      {showCount && item.count !== undefined && <div className="text-[12px] text-muted-foreground">
                          Кол-во: {item.count}
                        </div>}
                    </div>
                  </div>)}
              </>}
          </div>
        </div> : <div className="py-4 text-center text-muted-foreground">
          <p className="text-xs">{emptyMessage}</p>
        </div>}
    </Card>;
};

export default PieChartCard;

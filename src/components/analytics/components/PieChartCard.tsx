
import { Card } from "@/components/ui/card";
import { COLORS } from "../data/demoData";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

interface PieChartCardProps {
  title: string;
  icon: React.ReactNode;
  data: Array<{
    name: string;
    value: number;
    count?: number; // Добавляем опциональное поле для количества
  }>;
  valueLabel?: string;
  showCount?: boolean; // Флаг для отображения количества
}

const PieChartCard = ({ 
  title, 
  icon, 
  data, 
  valueLabel = "₽", 
  showCount = false 
}: PieChartCardProps) => {
  // Проверяем, что данные не пустые и содержат значения больше нуля
  const hasData = data && data.length > 0 && data.some(item => item.value > 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-md">
          {icon}
        </div>
      </div>
      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value.toLocaleString()} ${valueLabel}`, '']}
                  contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{item.value.toLocaleString()} {valueLabel}</span>
                  {showCount && item.count !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      Кол-во: {item.count}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          <p>Нет данных за выбранный период</p>
        </div>
      )}
    </Card>
  );
};

export default PieChartCard;

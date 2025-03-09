
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

interface PieChartCardProps {
  title: string;
  icon: React.ReactNode;
  data?: Array<{ name: string; value: number; count?: number }>;
  showCount?: boolean;
  emptyMessage?: string;
  isDemoData?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F', '#EC7063'];

const PieChartCard = ({ title, icon, data = [], showCount = false, emptyMessage = "Нет данных", isDemoData = false }: PieChartCardProps) => {
  const isEmpty = !data || data.length === 0;

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
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
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className={cn("overflow-hidden", isDemoData && "border-gray-300 dark:border-gray-700")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          
          {isDemoData && (
            <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">
              <Info className="h-3 w-3 mr-1" />
              Демо данные
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex justify-center items-center h-48 bg-muted/5 rounded-md">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={renderLabel}
                  className={isDemoData ? "opacity-80" : ""}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className={isDemoData ? "opacity-90" : ""}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => 
                    [showCount && data[0]?.count 
                      ? `${value} (${data.find(item => item.name === name)?.count || 0})`
                      : formatCurrency(value), name]
                  }
                />
                <Legend 
                  className={`${isDemoData ? "text-gray-500" : ""}`}
                  formatter={(value, entry, index) => (
                    <span className={`${isDemoData ? "text-gray-600 dark:text-gray-400" : ""}`}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PieChartCard;

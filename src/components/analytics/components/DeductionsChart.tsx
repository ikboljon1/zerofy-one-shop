
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";

interface DeductionsData {
  date: string;
  logistic: number;
  storage: number;
  penalties: number;
  acceptance: number;
  advertising: number;
}

interface DeductionsChartProps {
  data: DeductionsData[];
}

const DeductionsChart = ({ data }: DeductionsChartProps) => {
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
          Структура удержаний
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}.${date.getMonth() + 1}`;
              }}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              stroke={isDark ? "#64748b" : "#94a3b8"}
            />
            <YAxis 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              stroke={isDark ? "#64748b" : "#94a3b8"}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
              formatter={(value: number) => [`${value.toFixed(2)} ₽`]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
              }}
            />
            <Legend />
            <Bar 
              name="Логистика" 
              dataKey="logistic" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              name="Хранение" 
              dataKey="storage" 
              fill="#ec4899"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              name="Штрафы" 
              dataKey="penalties" 
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              name="Приемка" 
              dataKey="acceptance" 
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              name="Реклама" 
              dataKey="advertising" 
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DeductionsChart;

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const Chart = ({ salesTrend }: { salesTrend?: Array<{ date: string; currentValue: number; previousValue: number }> }) => {
  const isMobile = useIsMobile();

  if (!salesTrend) {
    return null;
  }

  return (
    <Card className="p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Сравнение продаж</h3>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280" 
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}.${date.getMonth() + 1}`;
              }}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [value.toLocaleString(), '']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="currentValue"
              name="Текущий период"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="previousValue"
              name="Предыдущий период"
              stroke="#EC4899"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default Chart;
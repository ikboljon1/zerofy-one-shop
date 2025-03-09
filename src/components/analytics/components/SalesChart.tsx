import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";

interface SalesChartProps {
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
  }>;
}

const SalesChart = ({ dailySales }: SalesChartProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Динамика продаж</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dailySales} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
          <Tooltip formatter={(value: any) => [`${formatCurrency(value)}`, '']} />
          <Legend />
          <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="#8884d8" name="Текущие продажи" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default SalesChart;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgePercent, BarChart3 } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
import { formatCurrency } from "@/utils/formatCurrency";

interface ExpenseBreakdownProps {
  data: any;
  advertisingBreakdown: any;
}

const ExpenseBreakdown = ({ data, advertisingBreakdown }: ExpenseBreakdownProps) => {
  const expenses = data?.currentPeriod?.expenses;

  if (!expenses) {
    return (
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle>Разбивка расходов</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Нет данных о расходах</p>
        </CardContent>
      </Card>
    );
  }

  const totalExpenses = expenses.total;
  const logistics = expenses.logistics;
  const storage = expenses.storage;
  const penalties = expenses.penalties;
  const advertising = advertisingBreakdown?.search || 0;
  const acceptance = expenses.acceptance || 0;
  const deductions = expenses.deductions || 0;

  const chartData = [
    { name: 'Логистика', value: logistics },
    { name: 'Хранение', value: storage },
    { name: 'Штрафы', value: penalties },
    { name: 'Реклама', value: advertising },
    { name: 'Приемка', value: acceptance },
    { name: 'Удержания', value: deductions },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const radius = width / 2;

    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 10}
          fill="black"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {formatCurrency(value)}
        </text>
      </g>
    );
  };
  
  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle>Разбивка расходов</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`} />
              <Tooltip formatter={(value) => [`${formatCurrency(value)} ₽`, '']} />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" label={renderCustomLabel}>
                {
                  chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdown;

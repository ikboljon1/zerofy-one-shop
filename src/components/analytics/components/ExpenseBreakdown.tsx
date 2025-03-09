
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Banknote, Loader2 } from 'lucide-react';

interface ExpenseData {
  currentPeriod: {
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
      deductions?: number;
    };
  };
}

interface ExpenseBreakdownProps {
  data: ExpenseData;
  isLoading?: boolean;
}

const ExpenseBreakdown = ({ data, isLoading = false }: ExpenseBreakdownProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Banknote className="mr-2 h-5 w-5 text-blue-500" />
            <span>Структура расходов</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 space-y-4">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка данных о расходах...</p>
        </CardContent>
      </Card>
    );
  }

  const formatExpenses = () => {
    const { logistics, storage, penalties, advertising, acceptance, deductions } = data.currentPeriod.expenses;
    
    const expensesData = [
      { name: 'Логистика', value: logistics },
      { name: 'Хранение', value: storage },
      { name: 'Штрафы', value: penalties },
      { name: 'Реклама', value: advertising },
      { name: 'Приемка', value: acceptance }
    ];
    
    if (deductions) {
      expensesData.push({ name: 'Прочие вычеты', value: deductions });
    }
    
    return expensesData.sort((a, b) => b.value - a.value);
  };

  const expensesData = formatExpenses();
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF5733'];

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Banknote className="mr-2 h-5 w-5 text-blue-500" />
          <span>Структура расходов</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={expensesData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 80,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}k`;
                  }
                  return value;
                }}
              />
              <YAxis type="category" dataKey="name" />
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
              />
              <Legend />
              <Bar dataKey="value" name="Сумма (₽)">
                {expensesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdown;

import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format } from "date-fns";

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];

interface AnalyticsSectionProps {
  statsData: any;
}

const AnalyticsSection = ({ statsData }: AnalyticsSectionProps) => {
  const isMobile = useIsMobile();

  if (!statsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Выберите период для просмотра аналитики
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Анализ продаж</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Общая сумма продаж:</span>
              <span className="font-semibold">{statsData.currentPeriod.sales.toLocaleString()} ₽</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Средний чек:</span>
              <span className="font-semibold">
                {(statsData.currentPeriod.sales / statsData.productSales.reduce((acc: number, curr: any) => acc + curr.quantity, 0)).toLocaleString()} ₽
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Анализ возвратов</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Сумма возвратов:</span>
              <span className="font-semibold text-red-500">
                {statsData.currentPeriod.expenses.total.toLocaleString()} ₽
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Процент возвратов:</span>
              <span className="font-semibold text-red-500">
                {((statsData.currentPeriod.expenses.total / statsData.currentPeriod.sales) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Прибыльность</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Чистая прибыль:</span>
              <span className="font-semibold text-green-500">
                {statsData.currentPeriod.netProfit.toLocaleString()} ₽
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Рентабельность:</span>
              <span className="font-semibold">
                {((statsData.currentPeriod.netProfit / statsData.currentPeriod.sales) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Динамика продаж</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statsData.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}.${date.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString()} ₽`, 'Продажи']}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return format(date, 'dd.MM.yyyy');
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8B5CF6"
                  fill="#8B5CF680"
                  name="Продажи"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Структура продаж по товарам</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statsData.productSales}
                  dataKey="quantity"
                  nameKey="subject_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  label
                >
                  {statsData.productSales.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Анализ продаж по товарам</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Название товара</th>
                <th className="text-right p-2">Количество проданных</th>
                <th className="text-right p-2">Сумма продаж</th>
                <th className="text-right p-2">Средняя цена</th>
                <th className="text-right p-2">Прибыль</th>
                <th className="text-right p-2">Рентабельность</th>
              </tr>
            </thead>
            <tbody>
              {statsData.productSales.map((item: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.subject_name}</td>
                  <td className="text-right p-2">{item.quantity}</td>
                  <td className="text-right p-2">{(item.quantity * item.price).toLocaleString()} ₽</td>
                  <td className="text-right p-2">{item.price?.toLocaleString()} ₽</td>
                  <td className="text-right p-2">{item.profit?.toLocaleString()} ₽</td>
                  <td className="text-right p-2">
                    {item.profit && item.price ? ((item.profit / (item.price * item.quantity)) * 100).toFixed(2) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Детальный анализ расходов</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="text-sm font-medium text-muted-foreground">Логистика</h4>
              <p className="text-2xl font-bold mt-2">
                {statsData.currentPeriod.expenses.logistics.toLocaleString()} ₽
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="text-sm font-medium text-muted-foreground">Хранение</h4>
              <p className="text-2xl font-bold mt-2">
                {statsData.currentPeriod.expenses.storage.toLocaleString()} ₽
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="text-sm font-medium text-muted-foreground">Штрафы</h4>
              <p className="text-2xl font-bold mt-2">
                {statsData.currentPeriod.expenses.penalties.toLocaleString()} ₽
              </p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="text-sm font-medium text-muted-foreground">Приемка</h4>
              <p className="text-2xl font-bold mt-2">
                {statsData.currentPeriod.acceptance.toLocaleString()} ₽
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
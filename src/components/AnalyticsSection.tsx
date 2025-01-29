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
  Area
} from "recharts";
import { ProcessedAnalytics } from "@/utils/analyticsProcessor";
import { usePeriod } from "@/hooks/use-period";

interface AnalyticsSectionProps {
  data: ProcessedAnalytics;
}

const AnalyticsSection = ({ data }: AnalyticsSectionProps) => {
  const isMobile = useIsMobile();
  const { period } = usePeriod();

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value);

  const formatPercent = (value: number) => 
    `${value.toFixed(2)}%`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Общий анализ продаж</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-green-500">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Общий объем продаж
            </h3>
            <p className="text-2xl font-bold">
              {formatCurrency(data.generalSalesAnalytics.totalSalesVolume)}
            </p>
          </Card>

          <Card className="p-4 border-l-4 border-l-blue-500">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Количество заказов
            </h3>
            <p className="text-2xl font-bold">
              {data.generalSalesAnalytics.totalOrdersCount}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-red-500">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Количество возвратов
            </h3>
            <p className="text-2xl font-bold">
              {data.generalSalesAnalytics.totalReturnsCount}
            </p>
          </Card>

          <Card className="p-4 border-l-4 border-l-purple-500">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Процент возврата
            </h3>
            <p className="text-2xl font-bold">
              {formatPercent(data.generalSalesAnalytics.returnRate)}
            </p>
          </Card>
        </div>
      </div>

      <Card className="p-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Анализ продаж по товарам</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Название товара</th>
                <th className="text-right p-2">Количество</th>
                <th className="text-right p-2">Сумма продаж</th>
                <th className="text-right p-2">Средняя цена</th>
                <th className="text-right p-2">Прибыль</th>
                <th className="text-right p-2">Рентабельность</th>
                <th className="text-right p-2">Заказы</th>
                <th className="text-right p-2">Возвраты</th>
                <th className="text-right p-2">% возврата</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.productSalesAnalysis).map(([id, product]) => (
                <tr key={id} className="border-b">
                  <td className="p-2">{product.productName}</td>
                  <td className="text-right p-2">{product.quantitySold}</td>
                  <td className="text-right p-2">{formatCurrency(product.salesAmount)}</td>
                  <td className="text-right p-2">{formatCurrency(product.averagePrice)}</td>
                  <td className="text-right p-2">{formatCurrency(product.profit)}</td>
                  <td className="text-right p-2">{formatPercent(product.profitability)}</td>
                  <td className="text-right p-2">{product.ordersCount}</td>
                  <td className="text-right p-2">{product.returnsCount}</td>
                  <td className="text-right p-2">{formatPercent(product.returnRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 mt-6">
        <h3 className="text-lg font-semibold mb-4">Анализ возвратов по товарам</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Название товара</th>
                <th className="text-right p-2">Количество заказов</th>
                <th className="text-right p-2">Количество возвратов</th>
                <th className="text-right p-2">Процент возврата</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.returnsAnalysis).map(([id, product]) => (
                <tr key={id} className="border-b">
                  <td className="p-2">{product.productName}</td>
                  <td className="text-right p-2">{product.ordersCount}</td>
                  <td className="text-right p-2">{product.returnsCount}</td>
                  <td className="text-right p-2">{formatPercent(product.returnRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Динамика продаж</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Object.values(data.productSalesAnalysis)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Area
                  type="monotone"
                  dataKey="salesAmount"
                  name="Сумма продаж"
                  stroke="#8B5CF6"
                  fill="#8B5CF680"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Прибыльность товаров</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={Object.values(data.profitabilityAnalysis)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Прибыль"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSection;

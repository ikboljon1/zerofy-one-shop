
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Warehouse, MapPin, Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

interface GeographySectionProps {
  warehouseDistribution: DistributionItem[];
  regionDistribution: DistributionItem[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A86EE7"];

const GeographySection: React.FC<GeographySectionProps> = ({
  warehouseDistribution,
  regionDistribution,
}) => {
  const renderPieChart = (data: DistributionItem[], dataKey: string) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map(item => ({
      name: item.name,
      value: item.count,
      percentage: item.percentage.toFixed(1)
    }));

    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percentage }) => `${name}: ${percentage}%`}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} заказов`, name]}
            contentStyle={{ borderRadius: "8px" }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderDistributionList = (items: DistributionItem[]) => {
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground text-center py-4">Нет данных</p>;
    }

    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.count} заказов</div>
            </div>
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
              {item.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Warehouse className="mr-2 h-5 w-5" />
              Распределение заказов по складам
            </CardTitle>
            <CardDescription>
              Топ 5 складов Wildberries, обрабатывающих ваши заказы
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {renderPieChart(warehouseDistribution, "count")}
            <div className="mt-4 px-4">
              {renderDistributionList(warehouseDistribution)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Распределение заказов по регионам
            </CardTitle>
            <CardDescription>
              Топ 5 регионов, откуда поступают ваши заказы
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {renderPieChart(regionDistribution, "count")}
            <div className="mt-4 px-4">
              {renderDistributionList(regionDistribution)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-muted/50 border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Info className="mr-2 h-4 w-4 text-blue-500" />
            Как рассчитываются данные
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Данные собираются из ваших заказов Wildberries с помощью API:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Для складов мы группируем заказы по полю warehouseName из ответа API</li>
            <li>Для регионов мы группируем заказы по полю regionName из ответа API</li>
            <li>Мы подсчитываем вхождения каждого склада/региона и расчитываем проценты</li>
            <li>Диаграммы отображают 5 лучших складов и регионов по количеству заказов</li>
          </ul>
          <p className="pt-2">
            Эти географические данные предоставляют ценную информацию о том, где хранятся ваши продукты и где находятся ваши клиенты, 
            помогая вам оптимизировать ваши логистические и маркетинговые стратегии.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographySection;

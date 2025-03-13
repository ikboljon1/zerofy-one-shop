
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Package, Info, ShoppingBag, MapPin } from "lucide-react";
import { WildberriesSale } from "@/types/store";
import { Period } from "./PeriodSelector";

interface ProductSalesDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface GeographySectionProps {
  warehouseDistribution: any[];
  regionDistribution: any[];
  sales?: WildberriesSale[];
  period?: Period;
  apiKey?: string;
}

const COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#6366F1", "#F59E0B"];

const GeographySection: React.FC<GeographySectionProps> = ({
  warehouseDistribution,
  regionDistribution,
  sales = [],
  period = "week",
  apiKey
}) => {
  // Process sales data to get product quantity distribution
  const getProductSalesDistribution = (): ProductSalesDistribution[] => {
    if (!sales || sales.length === 0) return [];

    const productCounts: Record<string, number> = {};
    let totalProducts = 0;

    sales.forEach(sale => {
      const productName = sale.subject || "Неизвестный товар";
      productCounts[productName] = (productCounts[productName] || 0) + 1;
      totalProducts += 1;
    });

    return Object.entries(productCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalProducts) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const productSalesDistribution = getProductSalesDistribution();

  const renderPieChart = (data: ProductSalesDistribution[], dataKey: string) => {
    if (!data || data.length === 0) return null;

    const chartData = data.map((item: any, index) => ({
      name: item.name,
      value: item.count,
      percentage: item.percentage.toFixed(1),
      fill: COLORS[index % COLORS.length]
    }));

    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
              </linearGradient>
            ))}
          </defs>
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
            label={({ name, percentage }) => `${name && name.length > 15 ? name.substring(0, 15) + '...' : name}: ${percentage}%`}
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#colorGradient-${index % COLORS.length})`} 
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} ${dataKey === "count" ? "шт." : "₽"}`, name]}
            contentStyle={{ 
              borderRadius: "8px", 
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              background: "rgba(255, 255, 255, 0.95)"
            }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right" 
            wrapperStyle={{ paddingLeft: "10px" }}
            formatter={(value, entry) => (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {value && value.length > 20 ? value.substring(0, 20) + '...' : value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderDistributionList = (items: ProductSalesDistribution[], valueKey: "count" = "count") => {
    if (!items || items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <MapPin className="h-10 w-10 text-purple-300/50 dark:text-purple-700/50" />
          <p className="mt-2">Нет данных</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((item: any, index) => {
          const value = item.count;
          const percentage = item.percentage.toFixed(1);
          const color = COLORS[index % COLORS.length];
          
          return (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/60 dark:hover:bg-gray-800/40 transition-all">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: color }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate" title={item.name}>{item.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {value} {valueKey === "count" ? "шт." : "₽"}
                </div>
              </div>
              <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100/80 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/30">
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/60 dark:from-gray-900 dark:to-blue-950/40 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-blue-100/30 dark:border-blue-800/20">
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100/80 dark:bg-blue-900/30">
                <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 text-2xl font-bold">
                Количество проданных товаров
              </span>
            </CardTitle>
            <CardDescription className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70">
              Топ 5 самых продаваемых товаров по количеству
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-sm rounded-lg p-4 border border-blue-100/40 dark:border-blue-800/30 shadow-inner">
              {renderPieChart(productSalesDistribution, "count")}
              <div className="mt-4 px-2">
                {renderDistributionList(productSalesDistribution)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/60 dark:from-gray-900 dark:to-purple-950/40 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-purple-100/30 dark:border-purple-800/20">
            <CardTitle className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100/80 dark:bg-purple-900/30">
                <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400 text-2xl font-bold">
                Распределение по складам
              </span>
            </CardTitle>
            <CardDescription className="text-sm font-medium text-purple-600/70 dark:text-purple-400/70">
              Топ 5 складов по количеству отправленных товаров
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="bg-white/70 dark:bg-gray-950/60 backdrop-blur-sm rounded-lg p-4 border border-purple-100/40 dark:border-purple-800/30 shadow-inner">
              {renderPieChart(warehouseDistribution, "count")}
              <div className="mt-4 px-2">
                {renderDistributionList(warehouseDistribution)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/60 dark:from-gray-900 dark:to-gray-800/40 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100/80 dark:bg-blue-900/30">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100">
              Как рассчитываются данные
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p>Данные собираются из ваших продаж Wildberries с помощью API:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Для проданных товаров мы группируем продажи по названию товара из ответа API</li>
            <li>Для складов мы используем данные о физическом местоположении складов Wildberries</li>
            <li>Мы подсчитываем количество каждого товара/склада и расчитываем проценты</li>
            <li>Диаграммы отображают 5 лучших товаров и 5 наиболее активных складов</li>
          </ul>
          <div className="py-2 px-4 mt-2 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/30 dark:border-blue-800/30">
            <p className="text-blue-700 dark:text-blue-300">
              Эти данные предоставляют ценную информацию о том, какие товары наиболее популярны у ваших клиентов
              и из каких складов чаще всего отправляются ваши товары, что помогает оптимизировать логистику.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographySection;

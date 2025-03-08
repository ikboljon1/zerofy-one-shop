
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Package, Info, ShoppingBag, MapPin, DollarSign } from "lucide-react";
import { WildberriesSale } from "@/types/store";
import { format, subDays } from "date-fns";
import { productAdvertisingData } from "@/components/analytics/data/productAdvertisingData";

interface ProductSalesDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface GeographySectionProps {
  warehouseDistribution: any[];
  regionDistribution: any[];
  sales?: WildberriesSale[];
}

const COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#FF8042", "#A86EE7"];

// Sample advertising data by date
const advertisingExpensesByDate = [
  { date: format(subDays(new Date(), 6), 'dd.MM'), value: 2100 },
  { date: format(subDays(new Date(), 5), 'dd.MM'), value: 2500 },
  { date: format(subDays(new Date(), 4), 'dd.MM'), value: 2300 },
  { date: format(subDays(new Date(), 3), 'dd.MM'), value: 3100 },
  { date: format(subDays(new Date(), 2), 'dd.MM'), value: 3800 },
  { date: format(subDays(new Date(), 1), 'dd.MM'), value: 4200 },
  { date: format(new Date(), 'dd.MM'), value: 3900 }
];

const GeographySection: React.FC<GeographySectionProps> = ({
  warehouseDistribution,
  regionDistribution,
  sales = []
}) => {
  const [activeView, setActiveView] = useState<'cabinets' | 'dates'>('cabinets');

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
            formatter={(value, name) => [`${value} шт.`, name]}
            contentStyle={{ borderRadius: "8px" }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render advertising expenses by cabinet as pie chart
  const renderAdvertisingExpensesByCabinet = () => {
    if (!productAdvertisingData || productAdvertisingData.length === 0) {
      return <p className="text-muted-foreground text-center py-4">Нет данных</p>;
    }

    // Include color property explicitly when mapping the data
    const cabinetData = productAdvertisingData.map(item => ({
      name: item.name,
      value: item.value,
      color: item.color // Now TypeScript knows this exists because we're specifically mapping it
    }));

    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={cabinetData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${name}: ${value} ₽`}
          >
            {cabinetData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value} ₽`, name]}
            contentStyle={{ borderRadius: "8px" }}
          />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render advertising expenses by date as bar chart
  const renderAdvertisingExpensesByDate = () => {
    if (!advertisingExpensesByDate || advertisingExpensesByDate.length === 0) {
      return <p className="text-muted-foreground text-center py-4">Нет данных</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={advertisingExpensesByDate}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} ₽`, 'Расходы']} />
          <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderDistributionList = (items: ProductSalesDistribution[]) => {
    if (!items || items.length === 0) {
      return <p className="text-muted-foreground text-center py-4">Нет данных</p>;
    }

    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.count} шт.</div>
            </div>
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
              {item.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render advertising expenses distribution list
  const renderAdvertisingExpensesList = () => {
    if (!productAdvertisingData || productAdvertisingData.length === 0) {
      return <p className="text-muted-foreground text-center py-4">Нет данных</p>;
    }

    const totalValue = productAdvertisingData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="space-y-4">
        {productAdvertisingData.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex-1">
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.value} ₽</div>
            </div>
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
              {((item.value / totalValue) * 100).toFixed(1)}%
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
              <ShoppingBag className="mr-2 h-5 w-5" />
              Количество проданных товаров
            </CardTitle>
            <CardDescription>
              Топ 5 самых продаваемых товаров по количеству
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {renderPieChart(productSalesDistribution, "count")}
            <div className="mt-4 px-4">
              {renderDistributionList(productSalesDistribution)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Расходы на рекламу по кабинетам
            </CardTitle>
            <CardDescription>
              <div className="flex justify-between items-center">
                <span>Анализ рекламных затрат</span>
                <div className="flex space-x-2 mt-2">
                  <button 
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${activeView === 'cabinets' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => setActiveView('cabinets')}
                  >
                    По кабинетам
                  </button>
                  <button 
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${activeView === 'dates' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                    onClick={() => setActiveView('dates')}
                  >
                    По датам
                  </button>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {activeView === 'cabinets' ? (
              <>
                {renderAdvertisingExpensesByCabinet()}
                <div className="mt-4 px-4">
                  {renderAdvertisingExpensesList()}
                </div>
              </>
            ) : (
              renderAdvertisingExpensesByDate()
            )}
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
          <p>Данные собираются из ваших продаж Wildberries с помощью API:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Для проданных товаров мы группируем продажи по названию товара из ответа API</li>
            <li>Для складов мы используем данные о физическом местоположении складов Wildberries</li>
            <li>Для рекламы мы анализируем расходы по рекламным кабинетам и временным периодам</li>
            <li>Мы подсчитываем количество каждого товара/склада и расчитываем проценты</li>
            <li>Диаграммы отображают 5 лучших товаров и 5 наиболее активных складов</li>
          </ul>
          <p className="pt-2">
            Эти данные предоставляют ценную информацию о том, какие товары наиболее популярны у ваших клиентов
            и из каких складов чаще всего отправляются ваши товары, что помогает оптимизировать логистику.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographySection;

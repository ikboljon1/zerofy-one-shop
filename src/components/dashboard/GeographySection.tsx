
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Package, Info, ShoppingBag, MapPin } from "lucide-react";
import { WildberriesSale } from "@/types/store";
import { getAdvertCosts } from "@/services/advertisingApi";

interface ProductSalesDistribution {
  name: string;
  count: number;
  percentage: number;
}

interface GeographySectionProps {
  warehouseDistribution: any[];
  regionDistribution: any[];
  sales?: WildberriesSale[];
  period?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#FF8042", "#A86EE7"];

const GeographySection: React.FC<GeographySectionProps> = ({
  warehouseDistribution,
  regionDistribution,
  sales = [],
  period,
  dateFrom,
  dateTo
}) => {
  const [productAdvertisingData, setProductAdvertisingData] = useState<ProductSalesDistribution[]>([]);

  // Загрузка данных по рекламным расходам за выбранный период
  useEffect(() => {
    const fetchAdvertisingData = async () => {
      try {
        // Используем текущие даты, если не указаны
        const startDate = dateFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const endDate = dateTo || new Date();
        
        const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
        const selectedStore = stores.find((store: any) => store.isSelected);
        
        if (!selectedStore) return;
        
        const advertCosts = await getAdvertCosts(startDate, endDate, selectedStore.apiKey);
        
        if (advertCosts && advertCosts.length > 0) {
          const campaignCosts: Record<string, number> = {};
          
          advertCosts.forEach(cost => {
            if (!campaignCosts[cost.campName]) {
              campaignCosts[cost.campName] = 0;
            }
            campaignCosts[cost.campName] += cost.updSum;
          });
          
          const advertisingData = Object.entries(campaignCosts)
            .map(([name, value]) => ({
              name,
              count: Math.round(value),
              percentage: 0 // Сначала инициализируем нулем
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
          
          // Рассчитаем общую сумму и проценты
          const totalAdvertising = advertisingData.reduce((sum, item) => sum + item.count, 0);
          
          // Обновляем проценты
          advertisingData.forEach(item => {
            item.percentage = (item.count / totalAdvertising) * 100;
          });
          
          setProductAdvertisingData(advertisingData);
        } else {
          setProductAdvertisingData([]);
        }
      } catch (error) {
        console.error('Error fetching advertising data:', error);
        setProductAdvertisingData([]);
      }
    };
    
    fetchAdvertisingData();
  }, [dateFrom, dateTo, period]);

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
              <MapPin className="mr-2 h-5 w-5" />
              Распределение по складам
            </CardTitle>
            <CardDescription>
              Топ 5 складов по количеству отправленных товаров
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {renderPieChart(warehouseDistribution, "count")}
            <div className="mt-4 px-4">
              {renderDistributionList(warehouseDistribution)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {productAdvertisingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5" />
              Расходы на рекламу по товарам
            </CardTitle>
            <CardDescription>
              Распределение рекламных расходов за выбранный период
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {renderPieChart(productAdvertisingData, "count")}
            <div className="mt-4 px-4">
              {renderDistributionList(productAdvertisingData)}
            </div>
          </CardContent>
        </Card>
      )}
      
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
            <li>Для рекламных расходов мы получаем данные из рекламного API Wildberries</li>
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


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Package, Info, ShoppingBag, MapPin, DollarSign } from "lucide-react";
import { WildberriesSale } from "@/types/store";
import { format, subDays } from "date-fns";
import { productAdvertisingData as defaultProductAdvertisingData } from "@/components/analytics/data/productAdvertisingData";
import { getAdvertCosts } from "@/services/advertisingApi";
import PeriodSelector, { Period } from "@/components/dashboard/PeriodSelector";

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
}

const COLORS = ["#8B5CF6", "#EC4899", "#10B981", "#FF8042", "#A86EE7"];

// Sample advertising data by date
const getAdvertisingExpensesByDate = (period: Period = 'week') => {
  const daysCount = period === 'today' ? 1 : 
                    period === 'yesterday' ? 1 : 
                    period === 'week' ? 7 : 
                    period === '2weeks' ? 14 : 28;
  
  return Array.from({ length: daysCount }, (_, i) => ({
    date: format(subDays(new Date(), daysCount - 1 - i), 'dd.MM'),
    value: Math.round(1500 + Math.random() * 3000)
  }));
};

const GeographySection: React.FC<GeographySectionProps> = ({
  warehouseDistribution,
  regionDistribution,
  sales = [],
  period = 'week'
}) => {
  const [activeView, setActiveView] = useState<'cabinets' | 'dates'>('cabinets');
  const [productAdvertisingData, setProductAdvertisingData] = useState(defaultProductAdvertisingData);
  const [advertisingExpensesByDate, setAdvertisingExpensesByDate] = useState(getAdvertisingExpensesByDate(period));
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка актуальных данных по рекламе при изменении периода
  useEffect(() => {
    const fetchAdvertisingData = async () => {
      try {
        setIsLoading(true);
        
        // Получаем выбранный магазин из localStorage
        const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
        const selectedStore = stores.find((store: any) => store.isSelected);
        
        if (!selectedStore?.apiKey) {
          setAdvertisingExpensesByDate(getAdvertisingExpensesByDate(period));
          return;
        }
        
        // Определяем даты на основе выбранного периода
        let dateFrom = new Date();
        const dateTo = new Date();
        
        if (period === 'today') {
          dateFrom = new Date();
        } else if (period === 'yesterday') {
          dateFrom = subDays(new Date(), 1);
          dateTo.setTime(dateFrom.getTime());
        } else if (period === 'week') {
          dateFrom = subDays(new Date(), 6);
        } else if (period === '2weeks') {
          dateFrom = subDays(new Date(), 13);
        } else if (period === '4weeks') {
          dateFrom = subDays(new Date(), 27);
        }
        
        // Получаем данные о расходах на рекламу через API
        const advertCosts = await getAdvertCosts(dateFrom, dateTo, selectedStore.apiKey);
        
        if (advertCosts && advertCosts.length > 0) {
          // Обработка данных по кабинетам
          const campaignCosts: Record<string, number> = {};
          
          advertCosts.forEach(cost => {
            if (!campaignCosts[cost.campName]) {
              campaignCosts[cost.campName] = 0;
            }
            campaignCosts[cost.campName] += cost.updSum;
          });
          
          const advertisingDataArray = Object.entries(campaignCosts)
            .map(([name, value]) => ({ 
              name, 
              value: Number(value.toFixed(2)),
              color: COLORS[Math.floor(Math.random() * COLORS.length)]
            }))
            .sort((a, b) => b.value - a.value);
          
          let topProducts = advertisingDataArray.slice(0, 4);
          const otherProducts = advertisingDataArray.slice(4);
          
          if (otherProducts.length > 0) {
            const otherSum = Number(otherProducts.reduce((sum, item) => sum + item.value, 0).toFixed(2));
            topProducts.push({ 
              name: "Другие товары", 
              value: otherSum,
              color: COLORS[4]
            });
          }
          
          setProductAdvertisingData(topProducts.length > 0 ? topProducts : defaultProductAdvertisingData);
          
          // Обработка данных по датам
          // Группируем данные по датам
          const dateMap: Record<string, number> = {};
          
          advertCosts.forEach(cost => {
            const date = cost.updTime.split('T')[0];
            const formattedDate = format(new Date(date), 'dd.MM');
            if (!dateMap[formattedDate]) {
              dateMap[formattedDate] = 0;
            }
            dateMap[formattedDate] += cost.updSum;
          });
          
          // Преобразуем в массив для графика
          const dateExpenses = Object.entries(dateMap)
            .map(([date, value]) => ({ 
              date, 
              value: Number(value.toFixed(2))
            }))
            .sort((a, b) => {
              const dateA = a.date.split('.');
              const dateB = b.date.split('.');
              return new Date(`2023-${dateA[1]}-${dateA[0]}`).getTime() - 
                     new Date(`2023-${dateB[1]}-${dateB[0]}`).getTime();
            });
          
          if (dateExpenses.length > 0) {
            setAdvertisingExpensesByDate(dateExpenses);
          } else {
            setAdvertisingExpensesByDate(getAdvertisingExpensesByDate(period));
          }
        } else {
          setProductAdvertisingData(defaultProductAdvertisingData);
          setAdvertisingExpensesByDate(getAdvertisingExpensesByDate(period));
        }
      } catch (error) {
        console.error('Error fetching advertising data:', error);
        setProductAdvertisingData(defaultProductAdvertisingData);
        setAdvertisingExpensesByDate(getAdvertisingExpensesByDate(period));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdvertisingData();
  }, [period]);

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

    // Include all properties from productAdvertisingData, including color
    const cabinetData = productAdvertisingData.map(item => ({
      name: item.name,
      value: item.value,
      color: item.color || COLORS[Math.floor(Math.random() * COLORS.length)]
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
            {isLoading ? (
              <div className="flex justify-center items-center h-[280px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              activeView === 'cabinets' ? (
                <>
                  {renderAdvertisingExpensesByCabinet()}
                  <div className="mt-4 px-4">
                    {renderAdvertisingExpensesList()}
                  </div>
                </>
              ) : (
                renderAdvertisingExpensesByDate()
              )
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

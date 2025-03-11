
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Warehouse, 
  BarChart3, 
  PieChart, 
  LineChart, 
  ArrowRight, 
  ArrowDown, 
  ArrowUp,
  DollarSign,
  Percent,
  Clock
} from "lucide-react";
import Chart from './Chart';

interface StorageCostDemoData {
  name: string;
  cost: number;
  category: string;
}

interface SalesTrendDemoData {
  date: string;
  sales: number;
  previousSales: number;
}

interface ProductSalesDemoData {
  subject_name: string;
  quantity: number;
}

const FeatureVisualization = () => {
  const [activeTab, setActiveTab] = useState("storage");

  // Demo data for storage costs
  const storageCostData: StorageCostDemoData[] = [
    { name: "Склад 1", cost: 25000, category: "fbo" },
    { name: "Склад 2", cost: 18500, category: "fbo" },
    { name: "Склад 3", cost: 32000, category: "fbo" },
    { name: "Склад 4", cost: 15000, category: "fbs" },
    { name: "Склад 5", cost: 21500, category: "fbs" },
  ];

  // Demo data for sales trend
  const salesTrendData: SalesTrendDemoData[] = [
    { date: "2023-01-01", sales: 45000, previousSales: 35000 },
    { date: "2023-01-02", sales: 52000, previousSales: 38000 },
    { date: "2023-01-03", sales: 49000, previousSales: 40000 },
    { date: "2023-01-04", sales: 63000, previousSales: 45000 },
    { date: "2023-01-05", sales: 59000, previousSales: 48000 },
    { date: "2023-01-06", sales: 68000, previousSales: 50000 },
    { date: "2023-01-07", sales: 72000, previousSales: 53000 },
  ];

  // Demo data for product sales
  const productSalesData: ProductSalesDemoData[] = [
    { subject_name: "Футболка", quantity: 350 },
    { subject_name: "Джинсы", quantity: 280 },
    { subject_name: "Куртка", quantity: 210 },
    { subject_name: "Кроссовки", quantity: 175 },
    { subject_name: "Худи", quantity: 155 },
    { subject_name: "Шапка", quantity: 120 },
    { subject_name: "Носки", quantity: 95 },
  ];

  const renderStorageAnalysis = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Анализ платного хранения
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Оптимизируйте свои расходы на хранение товаров на маркетплейсах. Наш умный инструмент:
        </p>
        
        <div className="space-y-4 mt-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
            <div className="mt-1 p-2 rounded-full bg-indigo-100 dark:bg-indigo-800">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Расчет затрат по каждому складу</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Автоматически анализирует текущие тарифы маркетплейсов и рассчитывает стоимость хранения для каждого товара и склада
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
            <div className="mt-1 p-2 rounded-full bg-purple-100 dark:bg-purple-800">
              <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Сопоставление с продажами</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Сравнивает расходы на хранение с объемами продаж, выявляя товары с низкой рентабельностью
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <div className="mt-1 p-2 rounded-full bg-blue-100 dark:bg-blue-800">
              <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Прогнозирование затрат</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Предсказывает будущие расходы на хранение с учетом сезонности и динамики продаж
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-indigo-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Текущие затраты</h4>
            </div>
            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">112 000 ₽</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-red-600 dark:text-red-400">
              <ArrowUp className="h-4 w-4" />
              <span>+12.5% к прошлому месяцу</span>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-5 w-5 text-indigo-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Доля в издержках</h4>
            </div>
            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">23%</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
              <ArrowDown className="h-4 w-4" />
              <span>-3.2% к прошлому месяцу</span>
            </div>
          </Card>
        </div>
        
        <Button className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          Оптимизировать расходы на хранение
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div>
        <Chart storageCosts={storageCostData} chartType="bar" />
      </div>
    </div>
  );

  const renderSalesTrend = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Аналитика продаж
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Получите полное представление о динамике ваших продаж с помощью интерактивных графиков и детальной аналитики.
        </p>
        
        <div className="space-y-4 mt-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
            <div className="mt-1 p-2 rounded-full bg-indigo-100 dark:bg-indigo-800">
              <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Динамика продаж</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Отслеживайте изменения продаж по дням, неделям и месяцам с возможностью сравнения с предыдущими периодами
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
            <div className="mt-1 p-2 rounded-full bg-purple-100 dark:bg-purple-800">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Анализ по товарам</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Выявляйте наиболее и наименее прибыльные товары в вашем ассортименте
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <div className="mt-1 p-2 rounded-full bg-blue-100 dark:bg-blue-800">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Прогнозирование продаж</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Используйте AI-алгоритмы для прогнозирования будущих продаж на основе исторических данных
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-5 w-5 text-indigo-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Продажи за месяц</h4>
            </div>
            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">487 000 ₽</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
              <ArrowUp className="h-4 w-4" />
              <span>+18.3% к прошлому месяцу</span>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-indigo-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Количество продаж</h4>
            </div>
            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">1 245</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
              <ArrowUp className="h-4 w-4" />
              <span>+22.1% к прошлому месяцу</span>
            </div>
          </Card>
        </div>
        
        <Button className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          Подробный анализ продаж
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div>
        <Chart salesTrend={salesTrendData} chartType="line" />
      </div>
    </div>
  );

  const renderProductAnalysis = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Анализ продуктов
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Получите детальную информацию о каждом товаре в вашем ассортименте для принятия обоснованных решений.
        </p>
        
        <div className="space-y-4 mt-6">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
            <div className="mt-1 p-2 rounded-full bg-indigo-100 dark:bg-indigo-800">
              <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Объемы продаж по категориям</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Анализируйте, какие категории товаров приносят наибольшую прибыль и имеют наибольший спрос
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30">
            <div className="mt-1 p-2 rounded-full bg-purple-100 dark:bg-purple-800">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Рентабельность товаров</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Оценивайте прибыльность каждого товара с учетом всех издержек: закупка, логистика, хранение, реклама
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <div className="mt-1 p-2 rounded-full bg-blue-100 dark:bg-blue-800">
              <Warehouse className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Оптимизация ассортимента</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Получайте рекомендации по оптимизации ассортимента на основе продаж, сезонности и рентабельности
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-indigo-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Всего товаров</h4>
            </div>
            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">128</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
              <ArrowUp className="h-4 w-4" />
              <span>+8 новых за месяц</span>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Топ категория</h4>
            </div>
            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">Одежда</p>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
              <ArrowUp className="h-4 w-4" />
              <span>65% от всех продаж</span>
            </div>
          </Card>
        </div>
        
        <Button className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          Подробный анализ продуктов
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div>
        <Chart productSales={productSalesData} chartType="pie" />
      </div>
    </div>
  );

  return (
    <div className="py-10">
      <Tabs 
        defaultValue="storage" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger 
            value="storage" 
            className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-white"
          >
            <Warehouse className="h-5 w-5 mr-2" />
            Анализ хранения
          </TabsTrigger>
          <TabsTrigger 
            value="sales" 
            className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-white"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Аналитика продаж
          </TabsTrigger>
          <TabsTrigger 
            value="products" 
            className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-white"
          >
            <Package className="h-5 w-5 mr-2" />
            Анализ продуктов
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="storage" className="mt-0">
          {renderStorageAnalysis()}
        </TabsContent>
        
        <TabsContent value="sales" className="mt-0">
          {renderSalesTrend()}
        </TabsContent>
        
        <TabsContent value="products" className="mt-0">
          {renderProductAnalysis()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureVisualization;

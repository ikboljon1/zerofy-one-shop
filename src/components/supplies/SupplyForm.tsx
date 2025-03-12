
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, TrendingDown, AlertTriangle, TrendingUp, BarChart3, Warehouse, Clock, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const SupplyForm: React.FC = () => {
  return (
    <Card className="shadow-lg overflow-hidden border-primary/10">
      <CardHeader className="pb-2 bg-gradient-to-r from-indigo-50/90 to-blue-50/80 dark:from-indigo-950/40 dark:to-blue-950/30">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Создание поставки FBW</CardTitle>
        </div>
        <CardDescription>
          Автоматизированная подготовка поставок на склады Wildberries
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Visual feature showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Feature 1: Price Analysis */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-100 dark:border-green-900/30 rounded-lg p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/60 rounded-full flex items-center justify-center mb-3">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Анализ цен</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Система анализирует динамику продаж и рекомендует оптимальную ценовую стратегию для каждого товара
            </p>
            <div className="mt-auto w-full">
              <div className="flex justify-between items-center p-2 bg-white dark:bg-black/40 rounded-md border border-green-100 dark:border-green-900/50 mb-2">
                <span className="text-xs font-medium">Футболка "Summer Vibes"</span>
                <span className="text-xs font-medium text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> Сохранить цену
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white dark:bg-black/40 rounded-md border border-amber-100 dark:border-amber-900/50">
                <span className="text-xs font-medium">Джинсы "Classic Blue"</span>
                <span className="text-xs font-medium text-amber-600 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" /> Снизить цену
                </span>
              </div>
            </div>
          </div>

          {/* Feature 2: Storage Cost Analysis */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/60 rounded-full flex items-center justify-center mb-3">
              <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Анализ хранения</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Расчет затрат на хранение и рекомендации по оптимизации остатков для максимальной прибыли
            </p>
            <div className="mt-auto w-full">
              <div className="relative w-full h-10 bg-gradient-to-r from-green-200 via-amber-200 to-red-200 dark:from-green-900/70 dark:via-amber-900/70 dark:to-red-900/70 rounded-md overflow-hidden mb-2">
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <span className="text-xs font-medium z-10">Низкие затраты</span>
                  <span className="text-xs font-medium z-10">Высокие затраты</span>
                </div>
                <div className="absolute h-full w-1/3 bg-white/30 dark:bg-white/10 border-r-2 border-blue-500 flex items-center justify-center">
                  <span className="text-xs font-bold">Ваши товары</span>
                </div>
              </div>
              <div className="text-xs text-center text-muted-foreground">
                Экономия на хранении до 30% с нашими рекомендациями
              </div>
            </div>
          </div>

          {/* Feature 3: Sales Velocity */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/20 border border-purple-100 dark:border-purple-900/30 rounded-lg p-5 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/60 rounded-full flex items-center justify-center mb-3">
              <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Скорость продаж</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Анализ скорости продаж и прогнозирование будущих трендов для вашего ассортимента
            </p>
            <div className="mt-auto w-full">
              <div className="flex items-center mb-2">
                <div className="h-2 flex-grow rounded-full bg-gradient-to-r from-red-200 to-red-400 dark:from-red-900/50 dark:to-red-700/70"></div>
                <span className="text-xs ml-2">Товар A: 3 дня</span>
              </div>
              <div className="flex items-center mb-2">
                <div className="h-2 flex-grow rounded-full bg-gradient-to-r from-amber-200 to-amber-400 dark:from-amber-900/50 dark:to-amber-700/70"></div>
                <span className="text-xs ml-2">Товар B: 7 дней</span>
              </div>
              <div className="flex items-center">
                <div className="h-2 flex-grow rounded-full bg-gradient-to-r from-green-200 to-green-400 dark:from-green-900/50 dark:to-green-700/70"></div>
                <span className="text-xs ml-2">Товар C: 14 дней</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming soon notice with visual enhancement */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-lg p-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">Скоро будет доступно</h2>
            <p className="text-muted-foreground mb-4">
              Мы работаем над созданием удобного интерфейса для формирования поставок напрямую через наш сервис.
            </p>
            <Button className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 dark:from-indigo-600 dark:to-blue-600">
              <Clock className="h-4 w-4 mr-2" />
              Получить уведомление
            </Button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-64 h-40 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="h-6 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="p-3 flex flex-col h-full">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                  <div className="flex-grow flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-indigo-300 dark:text-indigo-700 opacity-50" />
                  </div>
                  <div className="h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded mt-2"></div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-xs font-bold">NEW</span>
              </div>
            </div>
          </div>
        </div>
        
        <Alert variant="default" className="bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/50 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertTitle className="text-amber-700 dark:text-amber-400">Рекомендация</AlertTitle>
          <AlertDescription className="text-amber-700/90 dark:text-amber-400/90 text-sm">
            В текущий момент вы можете просматривать коэффициенты приемки складов и выбирать наиболее выгодный для вашей поставки. Создавать сами поставки необходимо через личный кабинет WB.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SupplyForm;

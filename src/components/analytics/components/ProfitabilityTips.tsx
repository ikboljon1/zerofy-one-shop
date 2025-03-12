
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, AlertCircle, ShoppingCart, Percent } from 'lucide-react';

interface ProfitabilityTipsProps {
  salesTotal?: number;
  profitTotal?: number;
  expensesTotal?: number;
}

const ProfitabilityTips: React.FC<ProfitabilityTipsProps> = ({
  salesTotal,
  profitTotal,
  expensesTotal
}) => {
  // Calculate profit margin if we have the data
  const profitMargin = salesTotal && profitTotal 
    ? Math.round((profitTotal / salesTotal) * 100)
    : null;
  
  const isLowMargin = profitMargin !== null && profitMargin < 15;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-800/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-semibold text-blue-800 dark:text-blue-400">
          <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
          Советы по улучшению прибыльности
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 dark:bg-green-900/60 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Оптимизация ценообразования</h4>
                <p className="text-sm text-muted-foreground">
                  Регулярно анализируйте цены конкурентов и корректируйте свои цены для максимизации прибыли. Используйте динамическое ценообразование в периоды высокого спроса.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-full">
                <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Управление запасами</h4>
                <p className="text-sm text-muted-foreground">
                  Оптимизируйте количество товаров на складе, чтобы минимизировать расходы на хранение. Используйте систему прогнозирования для планирования закупок.
                </p>
              </div>
            </div>
          </div>
          
          {isLowMargin && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-100 dark:border-red-800/50 shadow-sm md:col-span-2">
              <div className="flex items-start space-x-3">
                <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-full">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Внимание: низкая маржинальность</h4>
                  <p className="text-sm text-muted-foreground">
                    Ваша текущая маржа составляет {profitMargin}%, что ниже рекомендуемых 15-20%. Рассмотрите возможность повышения цен или сокращения издержек.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-full">
                <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Сократите комиссии</h4>
                <p className="text-sm text-muted-foreground">
                  Работайте над повышением рейтинга магазина, чтобы снизить комиссию маркетплейса. Участвуйте в программах лояльности для продавцов.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-full">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Оптимизируйте логистику</h4>
                <p className="text-sm text-muted-foreground">
                  Анализируйте логистические расходы и выбирайте наиболее выгодные способы доставки. Рассмотрите возможность объединения поставок.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitabilityTips;

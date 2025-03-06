
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Package, MapPin } from "lucide-react";
import { WildberriesOrder } from '@/types/store';
import { calculateWarehouseDistribution, calculateRegionDistribution } from '@/utils/storeUtils';

interface GeographySectionProps {
  orders: WildberriesOrder[];
  className?: string;
}

const GeographySection: React.FC<GeographySectionProps> = ({ orders = [], className }) => {
  const warehouseDistribution = calculateWarehouseDistribution(orders);
  const regionDistribution = calculateRegionDistribution(orders);
  
  const totalOrders = orders.length;
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-xl">Распределение заказов по складам</CardTitle>
          </div>
          <CardDescription>
            Показывает, как ваши заказы распределяются по складам Wildberries
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-sm text-muted-foreground">Всего заказов</div>
          </div>
          
          {warehouseDistribution.length > 0 ? (
            <div className="space-y-4">
              {warehouseDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.count} заказов ({item.percentage}%)</div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Нет данных о складах
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900/30 border-t text-sm text-muted-foreground">
          Данные о складах помогают понять, где хранятся ваши товары
        </CardFooter>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
            <CardTitle className="text-xl">Распределение заказов по регионам</CardTitle>
          </div>
          <CardDescription>
            Показывает, где географически расположены ваши клиенты
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-sm text-muted-foreground">Всего заказов</div>
          </div>
          
          {regionDistribution.length > 0 ? (
            <div className="space-y-4">
              {regionDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.count} заказов ({item.percentage}%)</div>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Нет данных о регионах
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-900/30 border-t text-sm text-muted-foreground">
          Данные о регионах помогают понять географию ваших клиентов
        </CardFooter>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Как рассчитываются данные</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Данные собираются из ваших заказов Wildberries с помощью API:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Для складов мы группируем заказы по полю warehouseName из ответа API</li>
            <li>Для регионов мы группируем заказы по полю regionName из ответа API</li>
            <li>Мы подсчитываем вхождения каждого склада/региона и рассчитываем проценты</li>
            <li>Диаграммы отображают 5 лучших складов и регионов по количеству заказов</li>
            <li>Общее количество вверху показывает сумму всех заказов за выбранный период</li>
          </ul>
          <Separator className="my-2" />
          <p>
            Эти географические данные предоставляют ценную информацию о том, где хранятся ваши продукты и где находятся ваши клиенты, 
            помогая вам оптимизировать ваши логистические и маркетинговые стратегии.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographySection;

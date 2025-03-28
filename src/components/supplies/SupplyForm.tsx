
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Clock, AlertTriangle, Hourglass, LucideWrench, TrendingUp, TrendingDown, BarChart2, ShieldCheck, ArrowUpRight, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SupplyForm: React.FC = () => {
  return (
    <Card className="shadow-md overflow-hidden border-primary/10 bg-gradient-to-b from-background to-background/80">
      <CardHeader className="pb-3 bg-muted/20">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Создание поставки FBW</CardTitle>
        </div>
        <CardDescription>
          Автоматизированная подготовка поставок на склады Wildberries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Визуальный пример интеллектуальных рекомендаций */}
        <div className="bg-card border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <BarChart2 className="h-5 w-5 text-primary mr-2" />
            Интеллектуальный анализ продаж
          </h3>
          
          {/* Примеры рекомендаций по ценообразованию */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center p-3 bg-emerald-50/50 border border-emerald-200/50 rounded-lg">
              <div className="p-2 bg-emerald-100 rounded-full mr-3">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Сохранить текущую цену</h4>
                  <span className="text-xs text-muted-foreground">3 490 ₽</span>
                </div>
                <p className="text-xs text-muted-foreground">Оптимальный баланс спроса и рентабельности</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50/50 border border-blue-200/50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full mr-3">
                <TrendingDown className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Снизить цену на 15%</h4>
                  <span className="text-xs text-muted-foreground">2 790 ₽ → 2 370 ₽</span>
                </div>
                <p className="text-xs text-muted-foreground">Увеличение продаж в категории при снижении цены</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-red-50/50 border border-red-200/50 rounded-lg">
              <div className="p-2 bg-red-100 rounded-full mr-3">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Срочная распродажа</h4>
                  <span className="text-xs text-muted-foreground">5 990 ₽ → 3 590 ₽</span>
                </div>
                <p className="text-xs text-muted-foreground">Высокие затраты на хранение превышают прибыль</p>
              </div>
            </div>
          </div>
          
          {/* Визуализация затрат на хранение */}
          <div className="border rounded-lg p-3 bg-muted/10 mb-4">
            <h4 className="text-sm font-medium mb-2">Анализ затрат на хранение</h4>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Платное хранение</span>
                  <span className="font-medium text-red-600">12 800 ₽/мес</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Выручка от продаж</span>
                  <span className="font-medium text-emerald-600">19 700 ₽/мес</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-primary" />
              <span>При снижении цены на 25% скорость продаж возрастет в 2.5 раза</span>
            </div>
          </div>
        </div>
        
        {/* Скоро будет доступно - модуль создания поставок */}
        <div className="bg-accent/15 border border-accent/20 rounded-lg p-5 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mb-3">
              <Hourglass className="h-6 w-6 text-primary/80" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Скоро будет доступно</h3>
            <p className="text-muted-foreground mb-5">
              Мы работаем над созданием удобного интерфейса для формирования поставок напрямую через наш сервис.
              Эта функция будет доступна в ближайшее время.
            </p>
            
            {/* Предварительный вид будущего интерфейса */}
            <div className="border rounded-lg overflow-hidden bg-card/90 shadow-sm mb-4">
              <div className="border-b px-4 py-2 bg-muted/10 flex items-center">
                <Package className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm font-medium">Новая поставка #WB-12345</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Склад назначения</label>
                    <div className="bg-muted/30 px-3 py-1.5 rounded border text-sm">Коледино (МСК)</div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Дата поставки</label>
                    <div className="bg-muted/30 px-3 py-1.5 rounded border text-sm">15.07.2023</div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-muted-foreground mb-1 block">Количество товаров</label>
                  <div className="bg-muted/30 px-3 py-1.5 rounded border text-sm">24 SKU / 268 единиц</div>
                </div>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" className="opacity-50 mr-2">Предпросмотр</Button>
                  <Button variant="default" size="sm" className="opacity-50">Создать поставку</Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full mx-auto inline-block">
              <LucideWrench className="h-3.5 w-3.5" />
              <span>В разработке</span>
            </div>
          </div>
        </div>
        
        <Alert variant="default" className="bg-amber-50/10 border-amber-200/30 text-amber-800/90">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Рекомендация</AlertTitle>
          <AlertDescription className="text-amber-700/90 text-sm">
            В текущий момент вы можете просматривать коэффициенты приемки складов и выбирать наиболее выгодный для вашей поставки. Создавать сами поставки необходимо через личный кабинет WB.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SupplyForm;

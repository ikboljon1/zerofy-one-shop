
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  TrendingUp, Target, Tag, ShoppingBag, 
  Package, Truck, BadgePercent, DollarSign,
  Megaphone, ChevronUp, ChevronDown, 
  BarChart3, Search, ShoppingCart 
} from 'lucide-react';

const TipsSection = () => {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span>Советы</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="profit-tips">
            <AccordionTrigger className="text-lg font-medium text-left">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">Как увеличить прибыль?</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-indigo-100 p-1.5 dark:bg-indigo-950">
                        <ShoppingBag className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Оптимизация ассортимента</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Анализируйте продажи и выявляйте самые прибыльные товары. Расширяйте ассортимент в успешных категориях и исключайте убыточные позиции.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-emerald-100 p-1.5 dark:bg-emerald-950">
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Управление ценообразованием</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Проводите A/B-тесты с разными ценами. Оптимизируйте цены на основе данных о конверсии и маржинальности.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-amber-100 p-1.5 dark:bg-amber-950">
                        <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Эффективная реклама</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Фокусируйте рекламный бюджет на товарах с высокой маржинальностью. Измеряйте ROI для каждой рекламной кампании и отключайте неэффективные.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-purple-100 p-1.5 dark:bg-purple-950">
                        <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Оптимизация логистики</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Выбирайте склады с учетом географии продаж. Распределяйте товары по складам для снижения логистических расходов и ускорения доставки.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-blue-100 p-1.5 dark:bg-blue-950">
                        <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Улучшение контента</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Оптимизируйте карточки товаров с качественными фото, детальными описаниями и ключевыми словами для повышения конверсии и видимости.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-red-100 p-1.5 dark:bg-red-950">
                        <BadgePercent className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Снижение штрафов</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Следите за качеством упаковки и соответствием маркировки. Отслеживайте причины штрафов и принимайте меры по их предотвращению.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="advertising-optimization">
            <AccordionTrigger className="text-lg font-medium text-left">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium">Оптимизация рекламных кампаний</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-orange-50/50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/30 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium flex items-center gap-1.5">
                        <Search className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                        <span>Поисковая реклама</span>
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Наиболее эффективна для привлечения новых клиентов с высокой конверсией.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300">Рекомендуемая доля бюджета:</span>
                      <span className="font-medium text-orange-700 dark:text-orange-400">50-60%</span>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium flex items-center gap-1.5">
                        <ShoppingCart className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Реклама в карточках</span>
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Помогает увеличить продажи у клиентов, уже заинтересованных в категории.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300">Рекомендуемая доля бюджета:</span>
                      <span className="font-medium text-amber-700 dark:text-amber-400">30-40%</span>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50/50 dark:bg-yellow-950/30 border border-yellow-100 dark:border-yellow-900/30 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                        <span>Промо и баннеры</span>
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      Эффективно для брендирования и повышения узнаваемости.
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-300">Рекомендуемая доля бюджета:</span>
                      <span className="font-medium text-yellow-700 dark:text-yellow-400">10-20%</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Стратегии повышения эффективности</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="mt-0.5 flex-shrink-0 rounded-full bg-emerald-100 p-1 dark:bg-emerald-900/40">
                          <ChevronUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Целевые ключевые слова:</span> Используйте высококонверсионные слова с низкой конкуренцией. Оптимизируйте ставки по времени суток и дням недели.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="mt-0.5 flex-shrink-0 rounded-full bg-emerald-100 p-1 dark:bg-emerald-900/40">
                          <ChevronUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-gray-100">A/B-тестирование:</span> Регулярно тестируйте разные версии рекламных кампаний, заголовков и изображений. Выделяйте 10-15% бюджета на эксперименты.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span>Типичные ошибки в рекламе</span>
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="mt-0.5 flex-shrink-0 rounded-full bg-red-100 p-1 dark:bg-red-900/40">
                          <ChevronDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Размытый фокус:</span> Слишком широкие ключевые слова приводят к нецелевому трафику и сниженной конверсии. Используйте минус-слова.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="mt-0.5 flex-shrink-0 rounded-full bg-red-100 p-1 dark:bg-red-900/40">
                          <ChevronDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Отсутствие анализа ROI:</span> Не отслеживая ROI по каждой кампании, невозможно оптимизировать расходы. Измеряйте стоимость привлечения.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TipsSection;

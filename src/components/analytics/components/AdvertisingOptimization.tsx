
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Megaphone, TrendingUp, ChevronUp, ChevronDown, 
  BarChart3, Target, Search, ShoppingCart, 
  PieChart, Calendar, Clock, Users, Zap, 
  AlertCircle, Smartphone, Crosshair
} from 'lucide-react';

const AdvertisingOptimization = () => {
  return (
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-orange-50/30 dark:from-gray-900 dark:to-orange-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-700 to-amber-700 dark:from-orange-400 dark:to-amber-400">
            Оптимизация рекламных кампаний
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-orange-50/50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Поисковая реклама</span>
                </h3>
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400 border-orange-200 dark:border-orange-800/30">
                  Приоритет
                </Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Наиболее эффективна для привлечения новых клиентов с высокой конверсией.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 dark:text-gray-300">Рекомендуемая доля бюджета:</span>
                <span className="font-medium text-orange-700 dark:text-orange-400">50-60%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50/50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Реклама в карточках</span>
                </h3>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
                  Важно
                </Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Помогает увеличить продажи у клиентов, уже заинтересованных в категории.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 dark:text-gray-300">Рекомендуемая доля бюджета:</span>
                <span className="font-medium text-amber-700 dark:text-amber-400">30-40%</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50/50 dark:bg-yellow-950/30 border-yellow-100 dark:border-yellow-900/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                  <span>Промо и баннеры</span>
                </h3>
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30">
                  Дополнительно
                </Badge>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Эффективно для брендирования и повышения узнаваемости.
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 dark:text-gray-300">Рекомендуемая доля бюджета:</span>
                <span className="font-medium text-yellow-700 dark:text-yellow-400">10-20%</span>
              </div>
            </CardContent>
          </Card>
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
              
              <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mt-0.5 flex-shrink-0 rounded-full bg-emerald-100 p-1 dark:bg-emerald-900/40">
                  <ChevronUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Автоматизация ставок:</span> Используйте автоматические стратегии с установленными ограничениями по максимальной цене за клик.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mt-0.5 flex-shrink-0 rounded-full bg-emerald-100 p-1 dark:bg-emerald-900/40">
                  <ChevronUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Сегментация аудитории:</span> Разделяйте кампании по демографии, поведению и интересам. Создавайте специфические объявления для каждого сегмента.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mt-0.5 flex-shrink-0 rounded-full bg-emerald-100 p-1 dark:bg-emerald-900/40">
                  <ChevronUp className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Ремаркетинг:</span> Настройте показ объявлений пользователям, которые уже просматривали ваши товары, но не совершили покупку.
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
              
              <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mt-0.5 flex-shrink-0 rounded-full bg-red-100 p-1 dark:bg-red-900/40">
                  <ChevronDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Игнорирование сезонности:</span> Не учитывая сезонные колебания спроса, вы тратите бюджет неэффективно. Планируйте кампании с учетом сезонности.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mt-0.5 flex-shrink-0 rounded-full bg-red-100 p-1 dark:bg-red-900/40">
                  <ChevronDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Низкое качество контента:</span> Плохие фотографии и невнятные описания снижают эффективность даже хорошо настроенных рекламных кампаний.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white dark:bg-gray-800 p-2.5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mt-0.5 flex-shrink-0 rounded-full bg-red-100 p-1 dark:bg-red-900/40">
                  <ChevronDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Чрезмерные ставки:</span> Завышенные ставки могут привлечь больше трафика, но сделать рекламу нерентабельной. Ориентируйтесь на ROI, а не объем кликов.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Рекомендации по времени запуска рекламы</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Лучшие дни недели:</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400 pl-5">
                <li className="flex items-start gap-1.5">
                  <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                  <span>Вторник-четверг: наиболее высокая конверсия для большинства категорий</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                  <span>Суббота: пик поисковых запросов в категориях одежды и электроники</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                  <span>Воскресенье вечер: подготовка к рабочей неделе, рост поисковых запросов</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-gray-900 dark:text-gray-100">Оптимальное время суток:</span>
              </div>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400 pl-5">
                <li className="flex items-start gap-1.5">
                  <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                  <span>12:00-14:00: обеденный перерыв, высокий трафик</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                  <span>19:00-22:00: вечернее время, максимальная конверсия</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                  <span>Используйте корректировки ставок по времени для оптимизации бюджета</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvertisingOptimization;

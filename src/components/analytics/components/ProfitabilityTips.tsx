
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, Target, Tag, ShoppingBag, 
  Package, Truck, BadgePercent, DollarSign 
} from 'lucide-react';

const ProfitabilityTips = () => {
  return (
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
            Как увеличить прибыль?
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
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
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Рекомендации по рекламе:</h3>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
              <span>Распределите бюджет между поисковой рекламой, карточками и промо-акциями в пропорции 60/30/10.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
              <span>Не превышайте затраты на рекламу более 15-20% от цены товара для сохранения прибыльности.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
              <span>Регулярно тестируйте новые ключевые слова и отключайте те, что привлекают нецелевой трафик.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
              <span>Используйте автоматизацию ставок с установлением максимальных лимитов для контроля расходов.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
              <span>Сосредоточьте рекламный бюджет на товарах с высоким рейтингом и хорошими отзывами для максимальной конверсии.</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitabilityTips;

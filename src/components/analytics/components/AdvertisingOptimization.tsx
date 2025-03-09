
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BadgePercent, 
  Loader2, 
  ChevronRight, 
  Clock,
  Target,
  Smartphone,
  Tag
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AnalyticsData {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
      deductions?: number;
    };
    netProfit: number;
  };
}

interface AdvertisingBreakdown {
  search: number;
}

interface AdvertisingOptimizationProps {
  data: AnalyticsData;
  advertisingBreakdown: AdvertisingBreakdown;
  isLoading?: boolean;
}

const AdvertisingOptimization = ({ 
  data, 
  advertisingBreakdown,
  isLoading = false 
}: AdvertisingOptimizationProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <BadgePercent className="mr-2 h-5 w-5 text-blue-500" />
            <span>Оптимизация рекламы</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-10 space-y-4">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка рекомендаций...</p>
        </CardContent>
      </Card>
    );
  }

  const { advertising } = data.currentPeriod.expenses;
  const sales = data.currentPeriod.sales;

  const adSpendPercentage = (advertising / sales) * 100 || 0;
  const formattedPercentage = adSpendPercentage.toFixed(1);

  // Determine recommendation based on ad spend percentage
  let recommendation = "";
  let recommendationClass = "";

  if (adSpendPercentage > 20) {
    recommendation = "Высокие расходы на рекламу. Рекомендуется оптимизировать бюджет.";
    recommendationClass = "text-red-600 dark:text-red-400";
  } else if (adSpendPercentage > 10) {
    recommendation = "Средние расходы на рекламу. Возможна дополнительная оптимизация.";
    recommendationClass = "text-amber-600 dark:text-amber-400";
  } else if (adSpendPercentage > 5) {
    recommendation = "Оптимальные расходы на рекламу. Хорошее соотношение затрат и продаж.";
    recommendationClass = "text-green-600 dark:text-green-400";
  } else {
    recommendation = "Низкие расходы на рекламу. Можно рассмотреть увеличение бюджета для роста продаж.";
    recommendationClass = "text-blue-600 dark:text-blue-400";
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BadgePercent className="mr-2 h-5 w-5 text-blue-500" />
          <span>Оптимизация рекламы</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Расходы на рекламу</span>
            <span className="text-sm font-bold">{advertising.toLocaleString('ru-RU')} ₽</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Доля от продаж</span>
            <span className={`text-sm font-bold ${
              adSpendPercentage > 15 
                ? 'text-red-600 dark:text-red-400' 
                : adSpendPercentage > 10 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-green-600 dark:text-green-400'
            }`}>
              {formattedPercentage}%
            </span>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <p className={`text-sm ${recommendationClass} font-medium`}>{recommendation}</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="budget-optimization">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <BadgePercent className="mr-2 h-4 w-4 text-blue-500" />
                  Оптимизация бюджета
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm pl-6 list-disc">
                  <li>Сфокусируйте рекламный бюджет на товарах с высокой маржинальностью</li>
                  <li>Снизьте ставки для поисковых запросов с низкой конверсией</li>
                  <li>Распределите бюджет между поиском и рекомендациями в соотношении 70/30</li>
                  <li>Используйте автобиддинг для оптимизации ставок</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="time-recommendations">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-blue-500" />
                  Рекомендации по времени запуска рекламы
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm pl-6 list-disc">
                  <li>Запускайте кампании в поиске утром с 8:00 до 10:00</li>
                  <li>Для товаров повседневного спроса - активация в вечернее время с 18:00 до 22:00</li>
                  <li>Проанализируйте пики активности ваших покупателей через отчеты маркетплейса</li>
                  <li>Выходные дни: увеличение бюджета на 20-30%</li>
                  <li>Учитывайте сезонность при планировании рекламных кампаний</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="targeting">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <Target className="mr-2 h-4 w-4 text-blue-500" />
                  Таргетинг и ключевые слова
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm pl-6 list-disc">
                  <li>Используйте минус-слова для исключения нецелевого трафика</li>
                  <li>Группируйте ключевые слова по уровню конверсии</li>
                  <li>Анализируйте поисковые запросы, по которым идут продажи</li>
                  <li>Учитывайте региональные особенности при настройке таргетинга</li>
                  <li>Регулярно обновляйте списки ключевых слов на основе аналитики</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mobile">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <Smartphone className="mr-2 h-4 w-4 text-blue-500" />
                  Особенности мобильной рекламы
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm pl-6 list-disc">
                  <li>Оптимизируйте карточки товаров для мобильных устройств</li>
                  <li>Используйте краткие и емкие заголовки для мобильных объявлений</li>
                  <li>Корректируйте ставки для мобильного трафика (обычно на 10-15% выше)</li>
                  <li>Учитывайте время активности мобильных пользователей (пик - вечер)</li>
                  <li>Анализируйте конверсию отдельно по десктопу и мобильным устройствам</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="product-cards">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4 text-blue-500" />
                  Улучшение карточек товаров
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm pl-6 list-disc">
                  <li>Используйте качественные фотографии с разных ракурсов</li>
                  <li>Добавьте подробное описание с характеристиками товара</li>
                  <li>Включите ключевые слова в название и описание товара</li>
                  <li>Добавьте отзывы и рейтинги, чтобы повысить доверие к товару</li>
                  <li>Регулярно обновляйте информацию о товаре в соответствии с сезоном</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvertisingOptimization;

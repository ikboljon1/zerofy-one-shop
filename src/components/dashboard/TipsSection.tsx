
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
  BarChart3, Search, ShoppingCart,
  LayoutGrid, BarChart4, MapPin, LineChart, Settings,
  BellRing, DatabaseZap, Filter, Scale, ArrowDownUp,
  PieChart, Calendar, Clock, Users, Star,
  BarChart2, BookOpen, Zap, Crosshair
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";

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
                {/* Основные советы по увеличению прибыли */}
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

                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-teal-100 p-1.5 dark:bg-teal-950">
                        <BarChart2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Сезонная стратегия</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Планируйте запасы и кампании с учетом сезонности. Увеличивайте закупки перед пиковыми периодами и избегайте переизбытка товара в низкий сезон.
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

                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-cyan-100 p-1.5 dark:bg-cyan-950">
                        <Star className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Работа с отзывами</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Активно собирайте и реагируйте на отзывы клиентов. Товары с высокими рейтингами получают больше продаж и требуют меньших вложений в рекламу.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Дополнительные разделы с подробными советами */}
                <Accordion type="multiple" className="w-full mt-4 border-t pt-4">
                  <AccordionItem value="warehouse-analysis">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium">Комплексный анализ по складам</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Разбивка продаж по складам:</b> Анализируйте, какие товары лучше продаются с каких складов и почему. Некоторые склады могут иметь более быструю логистику или лучшее географическое положение для определенных категорий товаров.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Оптимизация остатков:</b> Поддерживайте баланс между достаточным количеством товара для удовлетворения спроса и минимизацией расходов на хранение. Используйте данные о скорости продаж для каждого склада.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Анализ стоимости хранения:</b> Сравнивайте стоимость хранения на разных складах и перераспределяйте товары для минимизации затрат. Некоторые склады могут быть дороже, но обеспечивать лучшую конверсию.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Сезонное планирование:</b> Заранее увеличивайте запасы на складах в регионах, где ожидается сезонный спрос, и уменьшайте в регионах с низким сезонным спросом.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Географический анализ:</b> Изучайте откуда приходят заказы и размещайте товары на ближайших к покупателям складах для ускорения доставки и снижения ее стоимости.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="time-analysis">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <BarChart4 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium">Временной анализ и периодичность</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">•</span>
                          <span><b>Ежедневный мониторинг:</b> Отслеживайте ключевые метрики ежедневно — продажи, расходы на рекламу, средний чек и конверсию. Быстро реагируйте на аномалии и негативные тренды.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">•</span>
                          <span><b>Еженедельный анализ:</b> Еженедельно анализируйте эффективность рекламных кампаний, корректируйте ставки и сравнивайте результаты с предыдущими периодами.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">•</span>
                          <span><b>Ежемесячный аудит:</b> Проводите глубокий анализ всех аспектов бизнеса ежемесячно — пересматривайте ассортимент, оценивайте эффективность каждого товара, анализируйте структуру расходов.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">•</span>
                          <span><b>Сравнение периодов:</b> Анализируйте данные в сравнении с аналогичными периодами прошлого года для учета сезонности и выявления долгосрочных трендов.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">•</span>
                          <span><b>Пиковые периоды:</b> Детально анализируйте данные до, во время и после промо-акций и праздничных распродаж для оптимизации будущих стратегий.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="product-cards">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-medium">Оптимизация карточек товаров</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>SEO-оптимизация:</b> Используйте поисковые запросы с высокой конверсией в названиях и описаниях товаров. Анализируйте, по каким ключевым словам товары находят чаще всего.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Фотоконтент:</b> Инвестируйте в качественные фотографии, показывающие товар со всех сторон и в контексте использования. Регулярно A/B-тестируйте разные главные фото.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Оптимизация описаний:</b> Создавайте структурированные описания с акцентом на преимущества и уникальные характеристики. Используйте списки, эмодзи и другие элементы для улучшения читаемости.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Отзывы и рейтинги:</b> Активно работайте с отзывами, особенно негативными. Высокий рейтинг значительно повышает конверсию и улучшает позиции в поиске.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Регулярное обновление:</b> Обновляйте контент карточек минимум раз в квартал, добавляя актуальную информацию и улучшая визуальные элементы.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ad-campaigns-analysis">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium">Комплексный анализ рекламных кампаний</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Анализ ROAS:</b> Рассчитывайте возврат на рекламные инвестиции (ROAS) для каждой кампании и каждого товара. Концентрируйте бюджет на кампаниях с ROAS {'>'} 200%.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Ключевые слова:</b> Анализируйте эффективность каждого ключевого слова, отключайте слова с низкой конверсией и высокой стоимостью клика. Тестируйте новые релевантные ключевые слова.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Автоматические ставки:</b> Используйте автоматические стратегии для поддержания оптимальной позиции в поиске, но всегда устанавливайте лимиты на дневной бюджет и максимальную ставку.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Время проведения:</b> Анализируйте эффективность в разное время суток и дни недели. Корректируйте расписание рекламы, чтобы максимизировать результаты в пиковые часы.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Мультиканальность:</b> Сравнивайте эффективность разных рекламных форматов (поисковая, карточки товаров, баннеры) и оптимизируйте распределение бюджета на основе данных.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="expense-management">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium">Стратегии минимизации расходов</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                          <span><b>Оптимизация логистики:</b> Анализируйте стоимость доставки до разных складов и выбирайте наиболее выгодные маршруты. Консолидируйте поставки для снижения затрат.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                          <span><b>Управление запасами:</b> Внедрите систему прогнозирования спроса для минимизации излишков и недостатка товаров. Оптимизируйте пополнение запасов на основе аналитики скорости продаж.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                          <span><b>Предотвращение штрафов:</b> Создайте чек-лист требований маркетплейса и внедрите систему контроля качества перед отправкой товаров на склады. Один штраф может перекрыть прибыль от десятков продаж.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                          <span><b>Работа с возвратами:</b> Анализируйте причины возвратов и внедряйте меры по их снижению — улучшайте описания, добавляйте таблицы размеров, улучшайте упаковку.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                          <span><b>Оптимизация упаковки:</b> Пересмотрите упаковочные материалы для снижения веса и объема, что напрямую влияет на стоимость доставки и хранения.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="monitoring">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="font-medium">Система мониторинга и оповещений</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-red-600 dark:text-red-400">•</span>
                          <span><b>Критические показатели:</b> Настройте оповещения для ключевых метрик — резкое падение продаж, превышение рекламного бюджета, аномальное увеличение возвратов, снижение поискового рейтинга.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-red-600 dark:text-red-400">•</span>
                          <span><b>Товарные запасы:</b> Контролируйте уровень запасов и получайте уведомления о товарах, требующих пополнения или товарах с избыточным запасом.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-red-600 dark:text-red-400">•</span>
                          <span><b>Ценовой мониторинг:</b> Отслеживайте цены конкурентов и получайте уведомления о значительных изменениях, чтобы оперативно корректировать свои цены.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-red-600 dark:text-red-400">•</span>
                          <span><b>Рейтинг и отзывы:</b> Получайте мгновенные уведомления о новых отзывах, особенно негативных, чтобы быстро на них реагировать.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-red-600 dark:text-red-400">•</span>
                          <span><b>Регулярные отчеты:</b> Настройте еженедельную и ежемесячную отчетность по всем ключевым метрикам для регулярного анализа и корректировки стратегии.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="forecasting">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <DatabaseZap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span className="font-medium">Прогнозная аналитика и сценарное планирование</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-teal-600 dark:text-teal-400">•</span>
                          <span><b>Прогноз спроса:</b> Используйте исторические данные и сезонные тренды для прогнозирования спроса на ваши товары. Корректируйте закупки и рекламный бюджет соответственно.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-teal-600 dark:text-teal-400">•</span>
                          <span><b>Моделирование сценариев:</b> Разрабатывайте оптимистичные, реалистичные и пессимистичные сценарии для ключевых бизнес-решений и подготовьте стратегии для каждого.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-teal-600 dark:text-teal-400">•</span>
                          <span><b>Анализ трендов рынка:</b> Отслеживайте изменения в потребительском поведении и корректируйте ассортимент в соответствии с растущими трендами.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-teal-600 dark:text-teal-400">•</span>
                          <span><b>ROI-прогнозы:</b> Моделируйте потенциальный возврат инвестиций перед внедрением новых товаров или расширением категорий на основе данных о похожих товарах.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-teal-600 dark:text-teal-400">•</span>
                          <span><b>Сравнительный анализ:</b> Сравнивайте показатели своих товаров с бенчмарками по категории и выявляйте возможности для роста.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="segmentation">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">Сегментация и таргетирование</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Сегментация товаров:</b> Классифицируйте товары по ABC-анализу (A – высокоприбыльные, B – стабильные, C – низкоприбыльные) и распределяйте ресурсы соответственно.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Географический таргетинг:</b> Адаптируйте рекламу и промо-предложения под разные регионы с учетом особенностей спроса и конкуренции.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Таргетирование по интересам:</b> Настраивайте рекламные кампании на основе анализа потребительских интересов и поведения. Выявляйте смежные категории для кросс-продаж.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Ценовые сегменты:</b> Анализируйте спрос в разных ценовых категориях и оптимизируйте ассортимент для наиболее востребованных сегментов.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Сезонная сегментация:</b> Разделяйте товары на сезонные и всесезонные, адаптируя стратегии продвижения и управления запасами для каждой группы.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="balance">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-medium">Балансирование показателей для оптимальной прибыли</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-orange-600 dark:text-orange-400">•</span>
                          <span><b>Маржинальность vs. Объем:</b> Найдите оптимальный баланс между маржинальностью и объемом продаж. Иногда снижение цены и маржи позволяет увеличить общую прибыль за счет объема.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-orange-600 dark:text-orange-400">•</span>
                          <span><b>Качество vs. Себестоимость:</b> Анализируйте влияние качества товара на конверсию и количество возвратов. Часто инвестиции в повышение качества окупаются за счет снижения возвратов и роста продаж.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-orange-600 dark:text-orange-400">•</span>
                          <span><b>Реклама vs. Органика:</b> Оптимизируйте соотношение органических и рекламных продаж. Работайте над SEO карточек для снижения зависимости от рекламы.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-orange-600 dark:text-orange-400">•</span>
                          <span><b>Ассортимент vs. Глубина:</b> Находите баланс между широким ассортиментом и глубиной предложения в ключевых категориях. Сфокусируйтесь на категориях с наибольшей маржинальностью и минимальными логистическими затратами.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-orange-600 dark:text-orange-400">•</span>
                          <span><b>Инвестиции vs. Возврат:</b> Анализируйте ROI всех инвестиций (реклама, новые товары, улучшение контента) и перераспределяйте бюджет в пользу направлений с наибольшей отдачей.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="key-metrics">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <ArrowDownUp className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                        <span className="font-medium">Ключевые показатели для ежедневного мониторинга</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-pink-600 dark:text-pink-400">•</span>
                          <span><b>Маржинальность по товарам:</b> Отслеживайте маржинальность каждого товара с учетом всех расходов (логистика, реклама, хранение). Товары с маржинальностью менее 15% требуют немедленного внимания.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-pink-600 dark:text-pink-400">•</span>
                          <span><b>Конверсия карточек:</b> Анализируйте отношение просмотров к покупкам для каждого товара. Низкая конверсия указывает на проблемы с карточкой или ценой.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-pink-600 dark:text-pink-400">•</span>
                          <span><b>Показатель выкупа:</b> Соотношение заказанных и выкупленных товаров. Низкий процент выкупа может указывать на проблемы с описанием или качеством товара.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-pink-600 dark:text-pink-400">•</span>
                          <span><b>Стоимость привлечения клиента (CAC):</b> Затраты на рекламу, разделенные на количество новых покупателей. Должна быть значительно ниже среднего чека.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-pink-600 dark:text-pink-400">•</span>
                          <span><b>Средний рейтинг товаров:</b> Следите за динамикой рейтинга ваших товаров. Падение рейтинга ниже 4.5 требует немедленного анализа отзывов и улучшения товара или его описания.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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

                <Accordion type="multiple" className="w-full mt-4 border-t pt-4">
                  <AccordionItem value="ad-timing">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium">Рекомендации по времени запуска рекламы</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
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
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="audience-analysis">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium">Анализ аудитории и таргетирование</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Сегментация аудитории:</b> Разделяйте пользователей на группы по поведению (новые посетители, вернувшиеся, покупатели) и создавайте отдельные кампании для каждого сегмента.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Ремаркетинг:</b> Настройте показ объявлений пользователям, посетившим карточки, но не совершившим покупку. Используйте поощрения для стимулирования конверсии.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Анализ интересов:</b> Используйте инструменты маркетплейса для определения дополнительных интересов вашей аудитории и расширения таргетирования.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>География и устройства:</b> Корректируйте ставки в зависимости от эффективности рекламы в разных регионах и на разных устройствах.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
                          <span><b>Look-alike аудитории:</b> Создавайте аудитории, похожие на ваших лучших клиентов, для повышения эффективности рекламы на новых пользователях.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="ad-content-optimization">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <Crosshair className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">Оптимизация содержания рекламы</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Заголовки:</b> Используйте конкретные, ясные заголовки с упоминанием ключевых преимуществ. Тестируйте разные варианты с вопросами, числами и эмоциональными триггерами.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Изображения:</b> Избегайте перегруженных изображений, фокусируйтесь на продукте. Для баннеров используйте яркие цвета и контрастный текст.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Призывы к действию:</b> Используйте четкие и побуждающие CTA ("Купить сейчас", "Успей со скидкой", "Только сегодня"). Создавайте ощущение срочности.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Релевантность:</b> Убедитесь, что ваша реклама максимально соответствует поисковому запросу или интересам пользователя.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                          <span><b>Уникальное предложение:</b> Всегда выделяйте уникальные свойства или преимущества вашего товара по сравнению с конкурентами.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="inventory-analysis">
            <AccordionTrigger className="text-lg font-medium text-left">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span className="font-medium">Управление товарными запасами</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-teal-100 p-1.5 dark:bg-teal-950">
                        <PieChart className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">ABC-анализ товаров</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Разделите ассортимент на категории A (высокий доход), B (средний доход) и C (низкий доход) для приоритизации управления запасами.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-sky-100 p-1.5 dark:bg-sky-950">
                        <LineChart className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Прогнозирование спроса</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Используйте данные о продажах за прошлые периоды для прогнозирования будущего спроса с учетом сезонности и трендов.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-violet-100 p-1.5 dark:bg-violet-950">
                        <Truck className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Оптимизация поставок</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Рассчитывайте оптимальные объемы и частоту поставок на основе скорости продаж и стоимости хранения.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex-shrink-0 rounded-full bg-pink-100 p-1.5 dark:bg-pink-950">
                        <MapPin className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Распределение по складам</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Анализируйте продажи по регионам для оптимального распределения товаров по складам с учетом географии заказов.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Accordion type="multiple" className="w-full mt-4 border-t pt-4">
                  <AccordionItem value="stock-management">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <DatabaseZap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="font-medium">Стратегии управления остатками</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Минимальный запас безопасности:</b> Установите минимальный порог товарных запасов для каждого SKU, учитывая время на пополнение и риски задержек поставок.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Точка перезаказа:</b> Определите уровень запасов, при котором нужно делать новый заказ, чтобы товар не закончился к моменту поступления новой партии.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Оптимальный размер заказа:</b> Используйте формулу EOQ (Economic Order Quantity) для определения наиболее экономичного размера заказа с учетом затрат на хранение и оформление.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Управление неликвидами:</b> Регулярно выявляйте товары с низкой оборачиваемостью и принимайте меры (скидки, акции, возврат поставщику) для минимизации затрат на их хранение.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">•</span>
                          <span><b>Сезонное планирование:</b> Заблаговременно увеличивайте запасы сезонных товаров, но не переусердствуйте, чтобы избежать проблем с нераспроданными остатками в конце сезона.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="warehouse-efficiency">
                    <AccordionTrigger className="text-sm font-medium text-left">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-medium">Повышение эффективности складской логистики</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Анализ логистических затрат:</b> Регулярно оценивайте стоимость хранения на разных складах и выбирайте наиболее экономичные варианты с учётом географии продаж.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Оптимизация упаковки:</b> Минимизируйте объем и вес упаковки без ущерба для сохранности товара, чтобы сократить расходы на доставку и хранение.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Группировка товаров:</b> Размещайте часто продаваемые вместе товары на одних складах для оптимизации комплектации и отгрузки заказов.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Маркировка и упаковка:</b> Строго соблюдайте требования маркетплейса к маркировке и упаковке товаров, чтобы избежать штрафов и возвратов.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-amber-600 dark:text-amber-400">•</span>
                          <span><b>Автоматизация процессов:</b> Используйте программное обеспечение для автоматизации управления запасами, генерации документов и отслеживания движения товаров.</span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default TipsSection;


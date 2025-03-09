
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, Target, Tag, ShoppingBag, 
  Package, Truck, BadgePercent, DollarSign,
  BarChart2, BookOpen, PieChart, Clock, Users, Star,
  LayoutGrid, BarChart4, MapPin, LineChart, Settings,
  BellRing, DatabaseZap, Filter, Scale, ArrowDownUp
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
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Комплексный анализ по складам:
          </h3>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <BarChart4 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Временной анализ и периодичность:
          </h3>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Оптимизация карточек товаров:
          </h3>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <LineChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Комплексный анализ рекламных кампаний:
          </h3>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 text-purple-600 dark:text-purple-400">•</span>
              <span><b>Анализ ROAS:</b> Рассчитывайте возврат на рекламные инвестиции (ROAS) для каждой кампании и каждого товара. Концентрируйте бюджет на кампаниях с ROAS > 200%.</span>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Стратегии минимизации расходов:
          </h3>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <BellRing className="h-4 w-4 text-red-600 dark:text-red-400" />
            Система мониторинга и оповещений:
          </h3>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <DatabaseZap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            Прогнозная аналитика и сценарное планирование:
          </h3>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4 text-green-600 dark:text-green-400" />
            Сегментация и таргетирование:
          </h3>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <Scale className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            Балансирование показателей для оптимальной прибыли:
          </h3>
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
        </div>

        <Separator className="my-4" />
        
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <ArrowDownUp className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            Ключевые показатели для ежедневного мониторинга:
          </h3>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitabilityTips;

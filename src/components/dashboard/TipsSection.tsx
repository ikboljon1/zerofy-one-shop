
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Target, Tag, ShoppingBag, 
  Package, Truck, BadgePercent, DollarSign,
  BarChart2, BookOpen, PieChart, Clock, Users, Star,
  LayoutGrid, BarChart4, MapPin, LineChart, Settings,
  BellRing, DatabaseZap, Filter, Scale, ArrowDownUp,
  Lightbulb, Maximize2, Calendar, Server, Search
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const TipsSection = () => {
  const [activeTab, setActiveTab] = useState<string>("general");
  const isMobile = useIsMobile();

  return (
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-red-600 dark:from-amber-400 dark:to-red-400">
            Советы по оптимизации бизнеса
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`w-full ${isMobile ? 'grid grid-cols-3' : ''}`}>
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="profit">Прибыль</TabsTrigger>
            <TabsTrigger value="advertising">Реклама</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
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
          </TabsContent>
          
          <TabsContent value="profit" className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Как увеличить прибыль?
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                Ключевые стратегии для увеличения прибыльности вашего бизнеса
              </p>
            </div>
            
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
              </ul>
            </div>

            <Separator className="my-3" />
            
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
              </ul>
            </div>

            <Separator className="my-3" />
            
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
                  <span><b>Инвестиции vs. Возврат:</b> Анализируйте ROI всех инвестиций (реклама, новые товары, улучшение контента) и перераспределяйте бюджет в пользу направлений с наибольшей отдачей.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-3" />
            
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
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="advertising" className="space-y-4 mt-4">
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
              </ul>
            </div>

            <Separator className="my-3" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Комплексный анализ рекламных кампаний:
              </h3>
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
                  <span><b>Время проведения:</b> Анализируйте эффективность в разное время суток и дни недели. Корректируйте расписание рекламы, чтобы максимизировать результаты в пиковые часы.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-3" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                Рекомендации по времени запуска рекламы:
              </h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-cyan-600 dark:text-cyan-400">•</span>
                  <span><b>Пиковые часы:</b> Запускайте рекламные кампании в периоды максимальной активности покупателей (обычно 12:00-14:00 и 19:00-22:00 по мск).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-cyan-600 dark:text-cyan-400">•</span>
                  <span><b>Дни недели:</b> Для B2C товаров оптимальное время - вечер воскресенья и утро понедельника. Для B2B - вторник и среда в рабочие часы.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-cyan-600 dark:text-cyan-400">•</span>
                  <span><b>Сезонность:</b> Запускайте кампании за 2-4 недели до пиковых сезонов (праздники, начало учебного года и т.д.), чтобы набрать позиции в поиске.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-3" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Стратегии минимизации расходов:
              </h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                  <span><b>Ставки по времени:</b> Снижайте ставки в периоды низкой конверсии и повышайте в периоды высокой. Используйте автоматические стратегии с установленными лимитами.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                  <span><b>Минус-слова:</b> Регулярно анализируйте поисковые запросы и добавляйте нерелевантные запросы в минус-слова для предотвращения нецелевых показов.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">•</span>
                  <span><b>Бюджетирование:</b> Устанавливайте дневные лимиты расходов для каждой кампании и распределяйте бюджет в пользу наиболее эффективных кампаний.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-3" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <DatabaseZap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Прогнозная аналитика и сценарное планирование:
              </h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-teal-600 dark:text-teal-400">•</span>
                  <span><b>Прогноз эффективности:</b> Используйте данные за предыдущие периоды для прогнозирования эффективности будущих рекламных кампаний.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-teal-600 dark:text-teal-400">•</span>
                  <span><b>Моделирование ROI:</b> Рассчитывайте потенциальный возврат инвестиций для разных рекламных стратегий и бюджетов.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-teal-600 dark:text-teal-400">•</span>
                  <span><b>A/B тестирование:</b> Проводите регулярные тесты разных подходов к рекламе с небольшими бюджетами, перед масштабированием успешных кампаний.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-3" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <BellRing className="h-4 w-4 text-red-600 dark:text-red-400" />
                Система мониторинга и оповещений:
              </h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-red-600 dark:text-red-400">•</span>
                  <span><b>Ключевые метрики:</b> Настройте оповещения для резкого падения CTR, превышения бюджета, аномального роста стоимости клика и других критических показателей.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-red-600 dark:text-red-400">•</span>
                  <span><b>Регулярные отчеты:</b> Получайте ежедневные и еженедельные отчеты о ключевых метриках рекламных кампаний с указанием тенденций и отклонений.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-red-600 dark:text-red-400">•</span>
                  <span><b>Автоматические корректировки:</b> Настройте правила автоматической остановки или изменения ставок при достижении определенных пороговых значений метрик.</span>
                </li>
              </ul>
            </div>

            <Separator className="my-3" />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4 text-green-600 dark:text-green-400" />
                Сегментация и таргетирование:
              </h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                  <span><b>Географический таргетинг:</b> Адаптируйте рекламные кампании под конкретные регионы, учитывая их специфику, конкуренцию и платежеспособность.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                  <span><b>Таргетинг по интересам:</b> Используйте данные о поведении пользователей для настройки рекламы на целевую аудиторию с высокой вероятностью конверсии.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-green-600 dark:text-green-400">•</span>
                  <span><b>Сезонная сегментация:</b> Разделяйте рекламные кампании по сезонности, применяя разные стратегии для сезонных и всесезонных товаров.</span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TipsSection;

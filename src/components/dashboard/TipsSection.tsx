
import React from 'react';
import { Card } from "@/components/ui/card";
import { Info, TrendingUp, AlertTriangle, ShoppingCart, Clock, BarChart2, Zap } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const TipsSection = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Info className="h-5 w-5 text-blue-500" />
        <h2 className="text-xl font-semibold">Советы и рекомендации</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800/20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="text-base font-medium py-0">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Повышение эффективности продаж</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <p>Оптимизируйте заголовки товаров, включая ключевые характеристики и слова, по которым покупатели могут искать товар.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <p>Анализируйте конкурентов, находящихся в топе выдачи. Обратите внимание на их цены, описания и фотографии.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <p>Регулярно обновляйте контент карточек товаров. Это положительно влияет на ранжирование в поиске.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                    <p>Используйте высококачественные фотографии с разных ракурсов. Добавьте фото товара в действии или в интерьере.</p>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-100 dark:border-yellow-800/20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="text-base font-medium py-0">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Избегайте штрафов</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <p>Проверяйте качество товаров перед отправкой на склад. Дефектный товар может привести к штрафам и снижению рейтинга.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <p>Соблюдайте требования к упаковке и маркировке. Неправильная маркировка – частая причина штрафов.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <p>Регулярно отслеживайте претензии покупателей и оперативно урегулируйте проблемы для избежания негативных отзывов.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <p>Обеспечьте точное соответствие описания товара и его реальных характеристик, чтобы избежать возвратов.</p>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-800/20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="text-base font-medium py-0">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Управление ассортиментом</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <p>Выявляйте неэффективные товары по метрикам конверсии и оборачиваемости, заменяйте их более перспективными.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <p>Отслеживайте сезонные тренды и заблаговременно пополняйте запасы популярных товаров перед пиком спроса.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <p>Используйте ABC-анализ для выделения наиболее прибыльных товаров и оптимизации складских запасов.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <p>Анализируйте отзывы покупателей для выявления недостатков продукции и улучшения характеристик товаров.</p>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-100 dark:border-purple-800/20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="text-base font-medium py-0">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Clock className="h-4 w-4" />
                  <span>Оптимальное время для акций</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <p>Планируйте акции на вечер воскресенья и начало недели – в это время пользователи активнее всего совершают покупки.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <p>Запускайте промоакции за 2-3 недели до праздников, чтобы охватить период, когда покупатели ищут подарки.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <p>Используйте данные о пиках продаж в прошлые периоды для планирования будущих акций и специальных предложений.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                    <p>Учитывайте, что пользователи активнее делают покупки в вечернее время (19:00-23:00) и обеденные перерывы (12:00-14:00).</p>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-100 dark:border-red-800/20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="text-base font-medium py-0">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <BarChart2 className="h-4 w-4" />
                  <span>Оптимизация цен</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <p>Используйте динамическое ценообразование, корректируя цены в зависимости от спроса, сезонности и действий конкурентов.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <p>Экспериментируйте с ценовыми порогами. Часто снижение цены всего на 1-2% может значительно увеличить конверсию.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <p>Устанавливайте цены, оканчивающиеся на "9" (психологический приём). Исследования показывают, что это увеличивает продажи.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 font-bold">•</span>
                    <p>Регулярно мониторьте цены конкурентов на аналогичные товары, особенно тех, кто находится в топе поисковой выдачи.</p>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-100 dark:border-indigo-800/20">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-none">
              <AccordionTrigger className="text-base font-medium py-0">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <Zap className="h-4 w-4" />
                  <span>Рекомендации по рекламе</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <p>Сосредоточьте 60-70% рекламного бюджета на поисковой рекламе, как наиболее эффективном канале с высокой конверсией.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <p>Используйте низкочастотные ключевые слова с конкретными характеристиками товара для привлечения более целевой аудитории.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <p>Настройте ретаргетинг на пользователей, просмотревших товар, но не совершивших покупку. Это увеличит конверсию на 30-40%.</p>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <p>Запускайте рекламу в пиковые часы активности целевой аудитории (обычно 19:00-22:00) для максимального охвата.</p>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </div>
  );
};

export default TipsSection;

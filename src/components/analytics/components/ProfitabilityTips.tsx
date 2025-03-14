
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, TrendingUp, ArrowRight } from "lucide-react";

interface ProfitabilityTipsProps {
  data?: any;
}

const ProfitabilityTips: React.FC<ProfitabilityTipsProps> = ({ data }) => {
  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Советы по увеличению прибыльности
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-white/60 dark:bg-black/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Оптимизируйте расходы на доставку</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Увеличьте средний чек, чтобы снизить процент расходов на логистику. Попробуйте объединить товары в наборы или предложить дополнительные товары.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-black/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Пересмотрите ценовую политику</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Анализ показывает, что некоторые товары можно продавать с большей наценкой. Рассмотрите возможность повышения цен на популярные товары.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-black/10 border border-amber-100 dark:border-amber-800/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Улучшите описания и фотографии товаров</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Улучшение качества контента может увеличить конверсию и снизить процент возвратов, что положительно скажется на прибыльности.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex justify-end">
          <button className="flex items-center text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline">
            Подробнее <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitabilityTips;

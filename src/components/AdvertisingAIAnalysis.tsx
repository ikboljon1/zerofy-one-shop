
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BrainCircuit, Calendar, ArrowUpRight, Percent, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Campaign } from "@/services/advertisingApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AdvertisingAIAnalysisProps {
  storeId: string;
  campaign: Campaign;
  campaignStats?: {
    name: string;
    cost: number;
    views?: number;
    clicks?: number;
    orders?: number;
  };
  keywords?: Array<{
    keyword: string;
    views: number;
    clicks: number;
    ctr: number;
    sum: number;
    orders?: number;
    efficiency?: number;
  }>;
  dateFrom: Date;
  dateTo: Date;
  className?: string;
  variant?: "default" | "outline" | "card";
}

const AdvertisingAIAnalysis = ({ 
  className,
  variant = "outline"
}: AdvertisingAIAnalysisProps) => {
  const [open, setOpen] = useState(false);

  const getButtonVariantClass = () => {
    if (variant === "card") {
      return "w-full mt-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700";
    }
    return "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700";
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="outline"
        className={`${getButtonVariantClass()} ${className}`}
        size={variant === "card" ? "sm" : "default"}
      >
        <BrainCircuit className="h-4 w-4 mr-2 text-purple-500" />
        AI анализ
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              AI-анализ рентабельности
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Рекомендации по оптимизации товаров и стратегии продаж
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-slate-300">Расчет рентабельности хранения</span>
              </h3>
              
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                    <span className="text-emerald-500">Высокая маржа</span>
                  </div>
                  <span className="text-emerald-500 font-medium">17.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-amber-500" />
                    <span className="text-amber-500">Высокие затраты на хранение</span>
                  </div>
                  <span className="text-amber-500 font-medium">124.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-orange-500">Медленные продажи</span>
                  </div>
                  <span className="text-orange-500 font-medium">25 нед.</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-slate-300">СРАВНЕНИЕ СЦЕНАРИЕВ</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 p-3 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Текущая цена</div>
                  <div className="text-xl font-bold">855.00</div>
                </div>
                <div className="bg-amber-900/50 border border-amber-800 p-3 rounded-lg">
                  <div className="text-sm text-amber-300 mb-1">Со скидкой 30%</div>
                  <div className="text-xl font-bold text-amber-200">513.00</div>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg">
                  <div className="text-sm text-slate-400 mb-1">Себестоимость</div>
                  <div className="text-xl font-bold">350.00</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-slate-800 pt-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-slate-300">ПРОДАЖИ И ОБОРАЧИВАЕМОСТЬ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Текущие продажи в день</span>
                    <span className="font-medium">0.52 шт</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Продажи со скидкой</span>
                    <span className="font-medium">0.73 шт</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Текущий запас</span>
                    <span className="font-medium">92 шт</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Дней до распродажи</span>
                    <span className="font-medium">25 нед.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Со скидкой</span>
                    <span className="font-medium">18 нед.</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-slate-300">ЗАТРАТЫ НА ХРАНЕНИЕ</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Стоимость хранения в день</span>
                    <span className="font-medium">12,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">В день на весь запас</span>
                    <span className="font-medium">1 104,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Общие затраты на хранение</span>
                    <span className="font-medium">97 704,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Со скидкой</span>
                    <span className="font-medium">69 552,00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-slate-300">ДОПОЛНИТЕЛЬНЫЕ ЗАТРАТЫ</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Логистика (за единицу)</span>
                    <span className="font-medium">150,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Логистика (на весь запас)</span>
                    <span className="font-medium">13 800,00</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Комиссия WB</span>
                    <span className="font-medium">24%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Комиссия в деньгах (за единицу)</span>
                    <span className="font-medium">205,20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Комиссия (на весь запас)</span>
                    <span className="font-medium">18 878,40</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-lg font-semibold mb-3 text-slate-300">ИТОГОВЫЕ ФИНАНСОВЫЕ РЕЗУЛЬТАТЫ</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Прибыль без скидки</span>
                  <span className="font-medium text-red-500">-83 922,40</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Прибыль со скидкой</span>
                  <span className="font-medium text-red-500">-79 683,04</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Разница</span>
                  <span className="font-medium text-emerald-500">+4 239,36</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-bold mb-2">Рекомендация</h3>
                <div className="bg-red-950/30 rounded-lg p-2 inline-flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-red-300 font-medium">Быстрая продажа</span>
                </div>
                
                <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 space-y-3">
                  <h4 className="text-amber-300 font-medium">Рекомендация по распродаже <span className="text-amber-400 font-bold">30%</span></h4>
                  <p className="text-slate-300 text-sm">
                    Рекомендуется быстрая распродажа товара со скидкой до 30%, так как затраты на хранение превышают потенциальную прибыль.
                  </p>
                  <p className="text-emerald-400 text-sm">
                    Это уменьшит убытки на 4 239,36
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdvertisingAIAnalysis;

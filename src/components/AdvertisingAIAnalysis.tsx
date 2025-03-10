
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BrainCircuit, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { Campaign } from "@/services/advertisingApi";

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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              AI-анализ рекламной кампании
            </DialogTitle>
            <DialogDescription>
              Рекомендации по оптимизации рекламной кампании и ключевых слов
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Скоро появится</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              AI-анализ рекламных кампаний станет доступен в ближайшее время. 
              Мы работаем над улучшением алгоритмов для обеспечения более точных рекомендаций 
              по оптимизации ваших рекламных кампаний и ключевых слов.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ожидаемый запуск: скоро</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdvertisingAIAnalysis;

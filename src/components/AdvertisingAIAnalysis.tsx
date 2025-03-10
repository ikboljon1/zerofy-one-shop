
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AIRecommendation, AIAnalysisRequest } from "@/types/ai";
import { analyzeData } from "@/services/aiService";
import AIRecommendationCard from "./ai/AIRecommendationCard";
import { getAISettings } from "@/services/aiService";

interface AdvertisingAIAnalysisProps {
  storeId: string;
  advertisingData: {
    campaigns?: Array<{
      name: string;
      cost: number;
      views?: number;
      clicks?: number;
      orders?: number;
    }>;
    keywords?: Array<{
      keyword: string;
      views: number;
      clicks: number;
      ctr: number;
      sum: number;
      orders?: number;
      efficiency?: number;
    }>;
  };
  dateFrom: Date;
  dateTo: Date;
}

const AdvertisingAIAnalysis = ({ storeId, advertisingData, dateFrom, dateTo }: AdvertisingAIAnalysisProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const handleAnalyze = async () => {
    if (!advertisingData || (!advertisingData.campaigns && !advertisingData.keywords)) {
      toast({
        title: "Нет данных для анализа",
        description: "Необходимы данные о рекламных кампаниях и ключевых словах",
        variant: "destructive"
      });
      return;
    }

    const settings = getAISettings();
    if (!settings.isEnabled || !settings.apiKey) {
      toast({
        title: "AI анализ не настроен",
        description: "Откройте настройки AI и введите API ключ",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Подготовка данных для отправки в AI
      const request: AIAnalysisRequest = {
        context: {
          period: {
            from: dateFrom.toISOString().split('T')[0],
            to: dateTo.toISOString().split('T')[0]
          },
          sales: {
            total: 0 // Заглушка, т.к. это обязательное поле в запросе
          },
          expenses: {
            total: 0, // Заглушка, т.к. это обязательное поле в запросе
            logistics: 0,
            storage: 0,
            penalties: 0,
            advertising: advertisingData.campaigns ? advertisingData.campaigns.reduce((sum, camp) => sum + camp.cost, 0) : 0,
            acceptance: 0
          },
          advertising: advertisingData
        },
        requestType: 'advertising_analysis'
      };

      const newRecommendations = await analyzeData(request, storeId);
      setRecommendations(newRecommendations);

      toast({
        title: "Анализ завершен",
        description: "Получены рекомендации для оптимизации рекламы",
      });
      
      setOpen(true);
    } catch (error) {
      console.error('Ошибка при анализе данных:', error);
      toast({
        title: "Ошибка анализа",
        description: error instanceof Error ? error.message : "Не удалось проанализировать данные",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const dismissRecommendation = (id: string) => {
    try {
      const updatedRecommendations = recommendations.filter(rec => rec.id !== id);
      setRecommendations(updatedRecommendations);
    } catch (error) {
      console.error('Ошибка при удалении рекомендации:', error);
    }
  };

  return (
    <>
      <Button 
        onClick={handleAnalyze} 
        disabled={isAnalyzing}
        variant="outline"
        className="ml-auto bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Анализ рекламы...
          </>
        ) : (
          <>
            <BrainCircuit className="h-4 w-4 mr-2 text-purple-500" />
            AI анализ рекламы
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              Анализ рекламы
            </DialogTitle>
            <DialogDescription>
              Рекомендации по оптимизации рекламных кампаний и ключевых слов
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {recommendations.length > 0 ? (
              recommendations.map(recommendation => (
                <AIRecommendationCard 
                  key={recommendation.id} 
                  recommendation={recommendation}
                  onDismiss={dismissRecommendation}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет рекомендаций</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  AI не нашел значимых рекомендаций по оптимизации рекламы. Это может означать, что ваши рекламные кампании уже оптимизированы или недостаточно данных для анализа.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdvertisingAIAnalysis;

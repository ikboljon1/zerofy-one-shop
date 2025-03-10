
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AIRecommendation } from "@/types/ai";
import { analyzeData } from "@/services/aiService";
import { getAISettings } from "@/services/aiService";
import AIRecommendationCard from "./AIRecommendationCard";

interface UniversalAIAnalysisProps {
  storeId: string;
  contextData: any;
  dataType: 'sales' | 'products' | 'expenses' | 'full' | 'advertising';
  dateFrom: Date;
  dateTo: Date;
  className?: string;
  buttonText?: string;
  dialogTitle?: string;
  variant?: "default" | "outline" | "card";
  onAnalysisComplete?: (recommendations: AIRecommendation[]) => void;
}

const UniversalAIAnalysis = ({ 
  storeId, 
  contextData,
  dataType,
  dateFrom, 
  dateTo,
  className,
  buttonText = "AI анализ",
  dialogTitle = "AI анализ данных",
  variant = "outline",
  onAnalysisComplete
}: UniversalAIAnalysisProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const handleAnalyze = async () => {
    if (!contextData) {
      toast({
        title: "Нет данных для анализа",
        description: "Необходимы данные для анализа",
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
      // Формируем запрос в зависимости от типа данных
      const request = {
        context: {
          period: {
            from: dateFrom.toISOString().split('T')[0],
            to: dateTo.toISOString().split('T')[0]
          },
          sales: {
            total: contextData.sales?.total || 0,
            previousPeriod: contextData.sales?.previousPeriod || 0
          },
          expenses: {
            total: contextData.expenses?.total || 0,
            logistics: contextData.expenses?.logistics || 0,
            storage: contextData.expenses?.storage || 0,
            penalties: contextData.expenses?.penalties || 0,
            advertising: contextData.expenses?.advertising || 0,
            acceptance: contextData.expenses?.acceptance || 0
          },
          ...contextData
        },
        requestType: dataType === 'full' ? 'full_analysis' : 
                    dataType === 'sales' ? 'sales_analysis' : 
                    dataType === 'products' ? 'product_recommendations' : 
                    dataType === 'advertising' ? 'advertising_analysis' : 
                    'expense_analysis'
      };

      const newRecommendations = await analyzeData(request, storeId);
      setRecommendations(newRecommendations);

      if (onAnalysisComplete) {
        onAnalysisComplete(newRecommendations);
      }

      toast({
        title: "Анализ завершен",
        description: "Получены рекомендации для оптимизации",
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

  const getButtonVariantClass = () => {
    if (variant === "card") {
      return "w-full mt-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700";
    }
    return "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700";
  };

  return (
    <>
      <Button 
        onClick={handleAnalyze} 
        disabled={isAnalyzing}
        variant="outline"
        className={`${getButtonVariantClass()} ${className}`}
        size={variant === "card" ? "sm" : "default"}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Анализ...
          </>
        ) : (
          <>
            <BrainCircuit className="h-4 w-4 mr-2 text-purple-500" />
            {buttonText}
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              {dialogTitle}
            </DialogTitle>
            <DialogDescription>
              Рекомендации по оптимизации на основе AI-анализа
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
                  AI не нашел значимых рекомендаций. Это может означать, что данные уже оптимизированы или недостаточно информации для анализа.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UniversalAIAnalysis;

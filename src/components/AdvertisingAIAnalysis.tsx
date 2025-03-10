
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AIRecommendation, AIAnalysisRequest } from "@/types/ai";
import { analyzeData } from "@/services/aiService";
import AIRecommendationCard from "./ai/AIRecommendationCard";
import { getAISettings } from "@/services/aiService";
import { Campaign, CampaignFullStats, ProductStats, KeywordStat } from "@/services/advertisingApi";

interface AdvertisingAIAnalysisProps {
  storeId: string;
  campaign: Campaign;
  campaignStats?: CampaignFullStats;
  campaignProductStats?: ProductStats[];
  campaignKeywords?: KeywordStat[];
  dateFrom: Date;
  dateTo: Date;
  className?: string;
  variant?: "default" | "outline" | "card";
  onAnalysisComplete?: (recommendations: AIRecommendation[]) => void;
}

const AdvertisingAIAnalysis = ({ 
  storeId, 
  campaign,
  campaignStats,
  campaignProductStats,
  campaignKeywords,
  dateFrom, 
  dateTo,
  className,
  variant = "outline",
  onAnalysisComplete
}: AdvertisingAIAnalysisProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const handleAnalyze = async () => {
    if (!campaign) {
      toast({
        title: "Нет данных для анализа",
        description: "Необходимы данные о рекламной кампании",
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
      // Подготовка данных о кампании для AI анализа
      const campaignData = {
        name: campaign.campName || "Рекламная кампания",
        id: campaign.advertId,
        status: campaign.status,
        type: campaign.type,
        // Используем данные статистики, если они есть
        cost: campaignStats?.sum || 0,
        views: campaignStats?.views || 0,
        clicks: campaignStats?.clicks || 0,
        orders: campaignStats?.orders || 0,
        ctr: campaignStats?.ctr || 0,
        cr: campaignStats?.cr || 0,
        atbs: campaignStats?.atbs || 0, // добавлено в корзину
        shks: campaignStats?.shks || 0, // продано товаров
        sum_price: campaignStats?.sum_price || 0 // сумма заказов
      };
      
      // Формируем статистику по дням, если она есть
      const dailyStats = campaignStats?.days?.map(day => ({
        date: day.date,
        views: day.views,
        clicks: day.clicks,
        ctr: day.ctr,
        sum: day.sum,
        orders: day.orders
      })) || [];
      
      // Обработка статистики по товарам
      const productStats = campaignProductStats?.map(product => ({
        nmId: product.nmId,
        name: product.name || `Товар ${product.nmId}`,
        views: product.views,
        clicks: product.clicks,
        ctr: product.ctr,
        sum: product.sum,
        orders: product.orders,
        cr: product.cr,
        efficiency: product.orders > 0 ? product.sum / product.orders : 0
      })) || [];
      
      // Обработка статистики по ключевым словам
      const keywordStats = campaignKeywords?.map(keyword => ({
        keyword: keyword.keyword,
        views: keyword.views,
        clicks: keyword.clicks,
        ctr: keyword.ctr,
        sum: keyword.sum,
        efficiency: keyword.clicks > 0 ? keyword.sum / keyword.clicks : 0
      })) || [];
      
      // Подготовка данных для отправки в AI
      const request: AIAnalysisRequest = {
        context: {
          period: {
            from: dateFrom.toISOString().split('T')[0],
            to: dateTo.toISOString().split('T')[0]
          },
          sales: {
            total: campaignStats?.sum_price || 0 // Используем сумму заказов как продажи
          },
          expenses: {
            total: campaignStats?.sum || 0, // Общие расходы на рекламу
            logistics: 0,
            storage: 0,
            penalties: 0,
            advertising: campaignStats?.sum || 0, // Расходы на рекламу
            acceptance: 0
          },
          advertising: {
            campaigns: [{
              name: campaignData.name,
              cost: campaignData.cost,
              views: campaignData.views,
              clicks: campaignData.clicks,
              orders: campaignData.orders
            }],
            keywords: keywordStats
          },
          // Добавляем дополнительный контекст для AI
          campaignDetails: {
            id: campaignData.id,
            status: campaignData.status,
            type: campaignData.type,
            ctr: campaignData.ctr,
            cr: campaignData.cr,
            dailyStats: dailyStats,
            productStats: productStats
          }
        },
        requestType: 'advertising_analysis'
      };

      const newRecommendations = await analyzeData(request, storeId);
      setRecommendations(newRecommendations);

      if (onAnalysisComplete) {
        onAnalysisComplete(newRecommendations);
      }

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
            AI анализ
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              Анализ кампании {campaign?.campName || ""}
            </DialogTitle>
            <DialogDescription>
              Рекомендации по оптимизации рекламной кампании и ключевых слов
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
                  AI не нашел значимых рекомендаций по оптимизации рекламы. Это может означать, что ваша рекламная кампания уже оптимизирована или недостаточно данных для анализа.
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

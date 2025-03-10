
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import UniversalAIAnalysis from "@/components/ai/UniversalAIAnalysis";
import { AIRecommendation } from "@/types/ai";
import AIRecommendationCard from "@/components/ai/AIRecommendationCard";
import { getSavedRecommendations } from "@/services/aiService";

interface AIMetricsAnalysisProps {
  storeId: string;
  analyticsData: any;
  dateFrom: Date;
  dateTo: Date;
}

const AIMetricsAnalysis = ({ storeId, analyticsData, dateFrom, dateTo }: AIMetricsAnalysisProps) => {
  const [recentRecommendations, setRecentRecommendations] = useState<AIRecommendation[]>([]);
  
  useEffect(() => {
    if (storeId) {
      const savedRecs = getSavedRecommendations(storeId);
      // Берем только 3 самые последние рекомендации для отображения
      setRecentRecommendations(savedRecs.slice(0, 3));
    }
  }, [storeId]);

  const prepareContextData = () => {
    if (!analyticsData) return null;
    
    return {
      sales: {
        total: analyticsData.currentPeriod?.sales || 0,
        previousPeriod: analyticsData.previousPeriod?.sales || 0,
        dailySales: analyticsData.dailySales || []
      },
      expenses: {
        total: analyticsData.currentPeriod?.expenses?.total || 0,
        logistics: analyticsData.currentPeriod?.expenses?.logistics || 0,
        storage: analyticsData.currentPeriod?.expenses?.storage || 0,
        penalties: analyticsData.currentPeriod?.expenses?.penalties || 0,
        advertising: analyticsData.currentPeriod?.expenses?.advertising || 0,
        acceptance: analyticsData.currentPeriod?.expenses?.acceptance || 0
      },
      products: analyticsData.productSales ? {
        topProfitable: analyticsData.productSales.filter((p: any) => p.profit > 0).slice(0, 5).map((p: any) => ({
          name: p.name,
          profit: p.profit,
          margin: p.margin,
          quantitySold: p.quantity
        })),
        topUnprofitable: analyticsData.productSales.filter((p: any) => p.profit <= 0).slice(0, 5).map((p: any) => ({
          name: p.name,
          profit: p.profit,
          margin: p.margin,
          quantitySold: p.quantity
        }))
      } : undefined
    };
  };

  const dismissRecommendation = (id: string) => {
    setRecentRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            <CardTitle>AI-анализ показателей</CardTitle>
          </div>
          <UniversalAIAnalysis
            storeId={storeId}
            contextData={prepareContextData()}
            dataType="full"
            dateFrom={dateFrom}
            dateTo={dateTo}
            variant="card"
            buttonText="Полный анализ"
            dialogTitle="Аналитика бизнес-показателей"
          />
        </div>
        <CardDescription>
          Автоматические рекомендации на основе анализа ваших данных
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {recentRecommendations.length > 0 ? (
            recentRecommendations.map(recommendation => (
              <AIRecommendationCard 
                key={recommendation.id} 
                recommendation={recommendation}
                onDismiss={dismissRecommendation}
                compact
              />
            ))
          ) : (
            <div className="text-center py-4 border border-dashed rounded-lg">
              <BrainCircuit className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Запустите AI-анализ, чтобы получить рекомендации
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMetricsAnalysis;

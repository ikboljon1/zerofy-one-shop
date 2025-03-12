import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import AdvertisingAIAnalysis from "@/components/AdvertisingAIAnalysis";
import { Button } from "@/components/ui/button";

interface AIAnalysisSectionProps {
  storeId?: string;
  analyticsData?: any;
  dateFrom?: Date;
  dateTo?: Date;
}

const AIAnalysisSection = ({ storeId, analyticsData, dateFrom, dateTo }: AIAnalysisSectionProps = {}) => {
  // Mock campaign data for the AI analysis component
  const mockCampaign = {
    id: "mock-campaign-1",
    name: "Складские остатки",
    adType: "auto",
    startDate: new Date(),
    type: "auto",
    status: "active"
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              <CardTitle>AI-анализ данных</CardTitle>
            </div>
          </div>
          <CardDescription>
            Автоматический анализ данных и рекомендации по оптимизации работы магазина
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between items-start flex-wrap gap-4">
            {/* Storage Profitability Analysis */}
            <Card className="border-purple-200 dark:border-purple-800 flex-1 min-w-[280px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-purple-500" />
                  Рентабельность хранения
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-анализ рентабельности хранения товаров
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Анализ эффективности использования складских площадей и рекомендации по оптимизации.
                </p>
                <AdvertisingAIAnalysis 
                  storeId={storeId || ""}
                  campaign={mockCampaign}
                  dateFrom={dateFrom || new Date()} 
                  dateTo={dateTo || new Date()}
                  variant="card"
                />
              </CardContent>
            </Card>

            {/* Pricing Optimization Card */}
            <Card className="border-blue-200 dark:border-blue-800 flex-1 min-w-[280px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-blue-500" />
                  Оптимизация цен
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-рекомендации по ценообразованию
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Интеллектуальный анализ цен конкурентов и рекомендации по оптимизации ваших цен.
                </p>
                <Button 
                  variant="outline"
                  className="w-full mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                  size="sm"
                >
                  <BrainCircuit className="h-4 w-4 mr-2 text-blue-500" />
                  AI анализ цен
                </Button>
              </CardContent>
            </Card>

            {/* Marketing Recommendations Card */}
            <Card className="border-emerald-200 dark:border-emerald-800 flex-1 min-w-[280px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-emerald-500" />
                  Маркетинговая стратегия
                </CardTitle>
                <CardDescription className="text-xs">
                  AI-рекомендации по маркетингу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Анализ эффективности маркетинговых каналов и рекомендации по оптимизации стратегии.
                </p>
                <Button 
                  variant="outline"
                  className="w-full mt-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
                  size="sm"
                >
                  <BrainCircuit className="h-4 w-4 mr-2 text-emerald-500" />
                  AI стратегия
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalysisSection;

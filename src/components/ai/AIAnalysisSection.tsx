
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, ArrowUpRight, Percent, Clock, AlertTriangle } from "lucide-react";
import AdvertisingAIAnalysis from "@/components/AdvertisingAIAnalysis";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/services/advertisingApi";

interface AIAnalysisSectionProps {
  storeId?: string;
  analyticsData?: any;
  dateFrom?: Date;
  dateTo?: Date;
}

const AIAnalysisSection = ({ storeId, analyticsData, dateFrom, dateTo }: AIAnalysisSectionProps = {}) => {
  // Mock campaign data for the AI analysis component that matches the Campaign interface
  const mockCampaign: Campaign = {
    advertId: 1234,  // Required by Campaign interface
    campName: "Складские остатки",  // Required by Campaign interface
    status: "active",
    type: "automatic",
    changeTime: new Date().toISOString()
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
                <div className="flex flex-col gap-4">
                  <img 
                    src="/lovable-uploads/3e8d0c36-0538-4f48-9ba9-802a145e207a.png" 
                    alt="Анализ рентабельности" 
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="space-y-3 mt-2 px-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-500 text-sm font-medium">Высокая маржа</span>
                      </div>
                      <span className="text-emerald-500 font-medium text-sm">17.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-500 text-sm font-medium">Высокие затраты на хранение</span>
                      </div>
                      <span className="text-amber-500 font-medium text-sm">124.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-500 text-sm font-medium">Медленные продажи</span>
                      </div>
                      <span className="text-orange-500 font-medium text-sm">25 нед.</span>
                    </div>
                  </div>
                  <AdvertisingAIAnalysis 
                    storeId={storeId || ""}
                    campaign={mockCampaign}
                    dateFrom={dateFrom || new Date()} 
                    dateTo={dateTo || new Date()}
                    variant="card"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Warehouse Distribution Card */}
            <Card className="border-blue-200 dark:border-blue-800 flex-1 min-w-[280px]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-blue-500" />
                  Распределение по складам
                </CardTitle>
                <CardDescription className="text-xs">
                  Интерактивная демонстрация функций платформы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <img 
                    src="/lovable-uploads/73b1d5d2-9b9c-4c66-9367-68656cd07112.png" 
                    alt="Распределение по складам" 
                    className="w-full h-auto rounded-lg"
                  />
                  <Button 
                    variant="outline"
                    className="w-full mt-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                    size="sm"
                  >
                    <BrainCircuit className="h-4 w-4 mr-2 text-blue-500" />
                    Посмотреть подробнее
                  </Button>
                </div>
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

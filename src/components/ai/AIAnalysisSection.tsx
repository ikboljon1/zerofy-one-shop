
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Brain, BrainCircuit, Loader2, History, SparkleIcon, ChevronRight, AreaChart, PackageSearch, Megaphone, PackageX, AlertCircle } from "lucide-react";
import { AIUserConfig, AIAnalysisRequest, AIAnalysisResponse } from "@/types/ai";
import { getAIConfig, analyzeData, getAnalysisResults } from "@/services/aiService";
import AISettingsDialog from "./AISettingsDialog";
import AIAnalysisCard from "./AIAnalysisCard";

interface AIAnalysisSectionProps {
  marketplaceData: any;
  timeframe: {
    dateFrom: Date;
    dateTo: Date;
  };
}

export default function AIAnalysisSection({ marketplaceData, timeframe }: AIAnalysisSectionProps) {
  const [aiConfig, setAiConfig] = useState<AIUserConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [previousAnalyses, setPreviousAnalyses] = useState<AIAnalysisResponse[]>([]);
  const [view, setView] = useState<"current" | "history">("current");
  
  const { toast } = useToast();
  
  // Загружаем конфигурацию ИИ при монтировании
  useEffect(() => {
    const config = getAIConfig();
    if (config) {
      setAiConfig(config);
    }
    
    // Загружаем предыдущие анализы
    const analyses = getAnalysisResults();
    if (analyses.length > 0) {
      setPreviousAnalyses(analyses);
      setCurrentAnalysis(analyses[0]);
    }
  }, []);
  
  const handleConfigSaved = (config: AIUserConfig) => {
    setAiConfig(config);
  };
  
  const runAnalysis = async () => {
    if (!aiConfig) {
      toast({
        title: "Необходима настройка",
        description: "Пожалуйста, настройте подключение к ИИ",
        variant: "destructive"
      });
      return;
    }
    
    if (!marketplaceData) {
      toast({
        title: "Отсутствуют данные",
        description: "Необходимы данные магазина для анализа",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      const request: AIAnalysisRequest = {
        marketplaceData,
        timeframe: {
          dateFrom: timeframe.dateFrom.toISOString(),
          dateTo: timeframe.dateTo.toISOString()
        },
        analysisType: activeTab as any,
        customPrompt: activeTab === "custom" ? customPrompt : undefined
      };
      
      const result = await analyzeData(request, aiConfig);
      
      setCurrentAnalysis(result);
      setPreviousAnalyses(prev => [result, ...prev.slice(0, 9)]);
      setView("current");
      
      toast({
        title: "Анализ завершен",
        description: "ИИ успешно проанализировал данные вашего магазина",
      });
    } catch (error) {
      console.error("Ошибка при анализе данных:", error);
      toast({
        title: "Ошибка анализа",
        description: "Не удалось выполнить анализ данных. Проверьте настройки ИИ и попробуйте снова.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getAnalysisIcon = (analysisType: string) => {
    switch (analysisType) {
      case "general":
        return <AreaChart className="h-4 w-4" />;
      case "products":
        return <PackageSearch className="h-4 w-4" />;
      case "advertising":
        return <Megaphone className="h-4 w-4" />;
      case "returns":
        return <PackageX className="h-4 w-4" />;
      case "penalties":
        return <AlertCircle className="h-4 w-4" />;
      case "custom":
        return <SparkleIcon className="h-4 w-4" />;
      default:
        return <BrainCircuit className="h-4 w-4" />;
    }
  };
  
  if (!marketplaceData) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Для анализа данных с помощью ИИ необходимо выбрать магазин и период анализа</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h2 className="text-xl font-semibold">AI-анализ данных</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 ${view === "history" ? "bg-muted" : ""}`}
            onClick={() => setView("history")}
            disabled={previousAnalyses.length === 0}
          >
            <History className="h-4 w-4" />
            История
          </Button>
          
          <AISettingsDialog onConfigSaved={handleConfigSaved} />
        </div>
      </div>
      
      {view === "current" ? (
        <div className="space-y-6">
          <Card className="border">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-6">
                    <TabsTrigger value="general" className="gap-2">
                      <AreaChart className="h-4 w-4" />
                      <span className="hidden sm:inline">Общий анализ</span>
                      <span className="sm:hidden">Общий</span>
                    </TabsTrigger>
                    <TabsTrigger value="products" className="gap-2">
                      <PackageSearch className="h-4 w-4" />
                      <span className="hidden sm:inline">Товары</span>
                      <span className="sm:hidden">Товары</span>
                    </TabsTrigger>
                    <TabsTrigger value="advertising" className="gap-2">
                      <Megaphone className="h-4 w-4" />
                      <span className="hidden sm:inline">Реклама</span>
                      <span className="sm:hidden">Реклама</span>
                    </TabsTrigger>
                    <TabsTrigger value="returns" className="gap-2">
                      <PackageX className="h-4 w-4" />
                      <span className="hidden sm:inline">Возвраты</span>
                      <span className="sm:hidden">Возвраты</span>
                    </TabsTrigger>
                    <TabsTrigger value="penalties" className="gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Штрафы</span>
                      <span className="sm:hidden">Штрафы</span>
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="gap-2">
                      <SparkleIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Свой запрос</span>
                      <span className="sm:hidden">Свой</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg mt-4">
                      <h3 className="font-medium mb-2">Общий анализ данных</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ИИ проанализирует общие показатели вашего магазина, выделит тренды и предложит рекомендации по улучшению.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          onClick={runAnalysis} 
                          disabled={isAnalyzing || !aiConfig}
                          className="gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <BrainCircuit className="h-4 w-4" />
                          )}
                          {isAnalyzing ? "Анализ..." : "Запустить анализ"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="products">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg mt-4">
                      <h3 className="font-medium mb-2">Анализ ассортимента</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ИИ проанализирует ваш ассортимент, выделит наиболее и наименее прибыльные товары и даст рекомендации по оптимизации.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          onClick={runAnalysis} 
                          disabled={isAnalyzing || !aiConfig}
                          className="gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <PackageSearch className="h-4 w-4" />
                          )}
                          {isAnalyzing ? "Анализ..." : "Запустить анализ"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advertising">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg mt-4">
                      <h3 className="font-medium mb-2">Анализ рекламы</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ИИ проанализирует ваши рекламные расходы и даст рекомендации по повышению эффективности маркетинговых кампаний.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          onClick={runAnalysis} 
                          disabled={isAnalyzing || !aiConfig}
                          className="gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Megaphone className="h-4 w-4" />
                          )}
                          {isAnalyzing ? "Анализ..." : "Запустить анализ"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="returns">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg mt-4">
                      <h3 className="font-medium mb-2">Анализ возвратов</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ИИ проанализирует статистику возвратов, выявит причины и предложит меры по их снижению.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          onClick={runAnalysis} 
                          disabled={isAnalyzing || !aiConfig}
                          className="gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <PackageX className="h-4 w-4" />
                          )}
                          {isAnalyzing ? "Анализ..." : "Запустить анализ"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="penalties">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg mt-4">
                      <h3 className="font-medium mb-2">Анализ штрафов</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        ИИ проанализирует штрафы маркетплейса, определит основные причины и предложит меры по их минимизации.
                      </p>
                      <div className="flex justify-end">
                        <Button 
                          onClick={runAnalysis} 
                          disabled={isAnalyzing || !aiConfig}
                          className="gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          {isAnalyzing ? "Анализ..." : "Запустить анализ"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="custom">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg mt-4">
                      <h3 className="font-medium mb-2">Свой запрос к ИИ</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Напишите свой вопрос или задание для анализа данных с помощью ИИ.
                      </p>
                      <Textarea
                        placeholder="Например: Проанализируй динамику продаж за период и дай прогноз на следующий месяц"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        rows={4}
                        className="mb-4"
                      />
                      <div className="flex justify-end">
                        <Button 
                          onClick={runAnalysis} 
                          disabled={isAnalyzing || !aiConfig || !customPrompt.trim()}
                          className="gap-2"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SparkleIcon className="h-4 w-4" />
                          )}
                          {isAnalyzing ? "Анализ..." : "Запустить анализ"}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
          
          {isAnalyzing && (
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">ИИ анализирует данные вашего магазина...</p>
              </div>
            </div>
          )}
          
          {!isAnalyzing && currentAnalysis && (
            <AIAnalysisCard analysis={currentAnalysis} />
          )}
          
          {!isAnalyzing && !currentAnalysis && !aiConfig && (
            <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-lg font-medium mb-2">Настройте подключение к ИИ</h3>
              <p className="text-muted-foreground mb-4">
                Для использования AI-анализа данных необходимо настроить подключение к провайдеру ИИ и добавить API ключ.
              </p>
              <div className="flex justify-end">
                <AISettingsDialog onConfigSaved={handleConfigSaved} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">История анализов</h3>
            <Button variant="outline" size="sm" onClick={() => setView("current")} className="gap-2">
              <ChevronRight className="h-4 w-4" />
              Вернуться
            </Button>
          </div>
          
          {previousAnalyses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">У вас пока нет истории анализов</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {previousAnalyses.map((analysis, index) => (
                <AIAnalysisCard key={index} analysis={analysis} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Loader2, Bot, AlertTriangle, RefreshCw } from "lucide-react";
import { analyzeDataWithAI, AnalysisContext, AIRecommendation } from "@/services/aiAnalysisService";
import AIRecommendations from "./AIRecommendations";
import { getSelectedStore, getSelectedAIModel } from "@/utils/storeUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIDashboardSectionProps {
  salesData?: any[];
  ordersData?: any[];
  returnsData?: any[];
  warehouseData?: any[];
  expensesData?: any;
  period?: string;
}

const AIDashboardSection = ({
  salesData = [],
  ordersData = [],
  returnsData = [],
  warehouseData = [],
  expensesData = {},
  period = 'week'
}: AIDashboardSectionProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [aiModelError, setAiModelError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasData, setHasData] = useState<boolean>(false);
  
  useEffect(() => {
    // Проверяем наличие данных при получении пропсов
    const hasValidData = (salesData && salesData.length > 0) || (ordersData && ordersData.length > 0);
    console.log('Checking data availability:', { 
      salesDataLength: salesData?.length || 0, 
      ordersDataLength: ordersData?.length || 0,
      hasValidData
    });
    setHasData(hasValidData);
    
    if (!hasValidData) {
      setAnalysisError("Отсутствуют данные для анализа. Пожалуйста, загрузите данные о продажах или заказах на странице Заказы или Продажи.");
    } else {
      setAnalysisError(null);
    }
  }, [salesData, ordersData]);
  
  const runAnalysis = async () => {
    try {
      setIsLoading(true);
      setAiModelError(null);
      setAnalysisError(null);
      
      // Проверяем наличие данных для анализа
      if (!hasData) {
        setAnalysisError("Отсутствуют данные для анализа. Пожалуйста, перейдите на вкладки 'Заказы' или 'Продажи' и загрузите данные.");
        setIsLoading(false);
        return;
      }
      
      // Проверяем, выбрана ли AI модель
      const selectedAIModel = getSelectedAIModel();
      if (!selectedAIModel) {
        setAiModelError("Необходимо добавить и выбрать AI модель в разделе 'AI модели'");
        setIsLoading(false);
        return;
      }
      
      // Проверяем ключ API
      if (!selectedAIModel.apiKey || selectedAIModel.apiKey.trim() === '') {
        setAiModelError(`Для модели ${selectedAIModel.name} не установлен API ключ. Пожалуйста, обновите настройки в разделе 'AI модели'.`);
        setIsLoading(false);
        return;
      }
      
      const selectedStore = getSelectedStore();
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Соберем все доступные данные для анализа
      const context: AnalysisContext = {
        sales: salesData,
        orders: ordersData,
        returns: returnsData,
        expenses: expensesData,
        warehouses: warehouseData,
        period: period,
        store: {
          id: selectedStore.id,
          name: selectedStore.name,
          marketplace: selectedStore.marketplace
        }
      };
      
      // Получаем данные о товарах из localStorage, если они есть
      try {
        const productsData = localStorage.getItem(`marketplace_products_${selectedStore.id}`);
        if (productsData) {
          context.products = JSON.parse(productsData);
        }
      } catch (error) {
        console.error('Ошибка при получении данных о товарах:', error);
      }
      
      console.log('Отправляем данные для AI анализа:', context);
      console.log(`Используем AI модель: ${selectedAIModel.name} (${selectedAIModel.type})`);
      
      const aiRecommendations = await analyzeDataWithAI(context);
      
      // Проверяем, содержит ли первая рекомендация ошибку
      const hasError = aiRecommendations.length > 0 && 
                      aiRecommendations[0].type === 'error' && 
                      aiRecommendations[0].title.includes('Ошибка');
      
      if (hasError) {
        setAnalysisError(aiRecommendations[0].description);
      } else {
        setAnalysisError(null);
      }
      
      setRecommendations(aiRecommendations);
      setLastUpdated(new Date());
      
      // Обновляем lastUsed для выбранной модели только при успешном анализе
      if (!hasError) {
        const models = JSON.parse(localStorage.getItem('ai_models') || '[]');
        const updatedModels = models.map((model: any) => {
          if (model.id === selectedAIModel.id) {
            return {
              ...model,
              lastUsed: new Date().toISOString()
            };
          }
          return model;
        });
        localStorage.setItem('ai_models', JSON.stringify(updatedModels));
        
        toast({
          title: "Анализ завершен",
          description: `ИИ модель ${selectedAIModel.name} успешно проанализировала ваши данные и предоставила рекомендации`,
        });
      }
    } catch (error) {
      console.error('Ошибка при выполнении AI анализа:', error);
      setAnalysisError(`Ошибка при анализе: ${(error as Error).message || 'Неизвестная ошибка'}`);
      toast({
        title: "Ошибка анализа",
        description: `Не удалось выполнить AI-анализ данных: ${(error as Error).message || 'Неизвестная ошибка'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Проверяем, есть ли выбранная AI модель
    const selectedAIModel = getSelectedAIModel();
    if (!selectedAIModel) {
      setAiModelError("Необходимо добавить и выбрать AI модель в разделе 'AI модели'");
      return;
    }
    
    // Проверяем ключ API
    if (!selectedAIModel.apiKey || selectedAIModel.apiKey.trim() === '') {
      setAiModelError(`Для модели ${selectedAIModel.name} не установлен API ключ. Пожалуйста, обновите настройки в разделе 'AI модели'.`);
      return;
    }
    
    // При первой загрузке или при изменении данных запускаем анализ только если есть данные
    if (hasData && selectedAIModel) {
      runAnalysis();
    }
  }, [hasData]);
  
  return (
    <div className="space-y-4">
      {aiModelError && (
        <Alert className="bg-yellow-900/20 border-yellow-800/30 text-yellow-300">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription>
            {aiModelError}
          </AlertDescription>
        </Alert>
      )}
      
      {analysisError && (
        <Alert className="bg-red-900/20 border-red-800/30 text-red-300">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            {analysisError}
          </AlertDescription>
          {!hasData && (
            <div className="mt-4">
              <p className="text-sm text-red-300 mb-2">Чтобы загрузить данные:</p>
              <ol className="list-decimal list-inside text-sm text-red-300 space-y-1">
                <li>Перейдите на вкладку "Заказы" или "Продажи"</li>
                <li>Выберите период для анализа</li>
                <li>Дождитесь загрузки данных</li>
                <li>Вернитесь на вкладку "AI Анализ"</li>
              </ol>
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-300 border-red-800/50 hover:bg-red-900/20"
                  onClick={() => window.location.hash = "#orders"}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Перейти к заказам
                </Button>
              </div>
            </div>
          )}
        </Alert>
      )}
      
      <AIRecommendations 
        recommendations={recommendations} 
        isLoading={isLoading} 
        onRefresh={runAnalysis}
        aiModelError={aiModelError || analysisError}
      />
    </div>
  );
};

export default AIDashboardSection;

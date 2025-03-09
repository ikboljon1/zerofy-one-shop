
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Loader2, Bot, AlertTriangle } from "lucide-react";
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
  
  const runAnalysis = async () => {
    try {
      setIsLoading(true);
      setAiModelError(null);
      setAnalysisError(null);
      
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
      
      // Проверяем наличие данных для анализа
      if (salesData.length === 0 && ordersData.length === 0) {
        setAnalysisError("Отсутствуют данные для анализа. Пожалуйста, загрузите данные о продажах или заказах.");
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
    if ((salesData.length > 0 || ordersData.length > 0) && selectedAIModel) {
      runAnalysis();
    }
  }, []);
  
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

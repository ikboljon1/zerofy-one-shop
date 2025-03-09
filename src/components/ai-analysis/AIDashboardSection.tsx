
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Brain, Loader2 } from "lucide-react";
import { analyzeDataWithAI, AnalysisContext, AIRecommendation } from "@/services/aiAnalysisService";
import AIRecommendations from "./AIRecommendations";
import { getSelectedStore } from "@/utils/storeUtils";

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
  
  const runAnalysis = async () => {
    try {
      setIsLoading(true);
      
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
      
      const aiRecommendations = await analyzeDataWithAI(context);
      setRecommendations(aiRecommendations);
      setLastUpdated(new Date());
      
      toast({
        title: "Анализ завершен",
        description: "ИИ успешно проанализировал ваши данные и предоставил рекомендации",
      });
    } catch (error) {
      console.error('Ошибка при выполнении AI анализа:', error);
      toast({
        title: "Ошибка анализа",
        description: "Не удалось выполнить AI-анализ данных. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // При первой загрузке или при изменении данных запускаем анализ
    if (salesData.length > 0 || ordersData.length > 0) {
      runAnalysis();
    }
  }, []);
  
  return (
    <div className="space-y-4">
      <AIRecommendations 
        recommendations={recommendations} 
        isLoading={isLoading} 
        onRefresh={runAnalysis}
      />
    </div>
  );
};

export default AIDashboardSection;

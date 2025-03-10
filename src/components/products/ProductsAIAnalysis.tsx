
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import UniversalAIAnalysis from "@/components/ai/UniversalAIAnalysis";
import { AIRecommendation } from "@/types/ai";

interface ProductsAIAnalysisProps {
  storeId: string;
  products: any[];
  dateFrom: Date;
  dateTo: Date;
}

const ProductsAIAnalysis = ({ storeId, products, dateFrom, dateTo }: ProductsAIAnalysisProps) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  const prepareContextData = () => {
    if (!products || products.length === 0) return null;
    
    // Сортируем товары по прибыльности
    const sortedProducts = [...products].sort((a, b) => 
      (b.profit || 0) - (a.profit || 0)
    );
    
    // Получаем топ прибыльных товаров
    const topProfitable = sortedProducts
      .filter(p => (p.profit || 0) > 0)
      .slice(0, 10)
      .map(p => ({
        name: p.name || `Товар ID: ${p.id || 'Неизвестный'}`,
        profit: p.profit || 0,
        margin: p.margin || 0,
        quantitySold: p.quantitySold || p.sold || 0
      }));
    
    // Получаем топ убыточных товаров
    const topUnprofitable = sortedProducts
      .filter(p => (p.profit || 0) <= 0)
      .slice(0, 10)
      .map(p => ({
        name: p.name || `Товар ID: ${p.id || 'Неизвестный'}`,
        profit: p.profit || 0,
        margin: p.margin || 0,
        quantitySold: p.quantitySold || p.sold || 0
      }));
    
    // Считаем общие суммы
    const totalSales = products.reduce((sum, p) => sum + (p.revenue || 0), 0);
    const totalProfit = products.reduce((sum, p) => sum + (p.profit || 0), 0);
    
    return {
      sales: {
        total: totalSales
      },
      expenses: {
        total: totalSales - totalProfit,
        logistics: 0,
        storage: 0,
        penalties: 0,
        advertising: 0,
        acceptance: 0
      },
      products: {
        topProfitable,
        topUnprofitable
      }
    };
  };

  const handleAnalysisComplete = (newRecommendations: AIRecommendation[]) => {
    setRecommendations(newRecommendations);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            <CardTitle>AI-анализ товаров</CardTitle>
          </div>
          <UniversalAIAnalysis
            storeId={storeId}
            contextData={prepareContextData()}
            dataType="products"
            dateFrom={dateFrom}
            dateTo={dateTo}
            buttonText="Анализировать ассортимент"
            dialogTitle="Анализ ассортимента товаров"
            onAnalysisComplete={handleAnalysisComplete}
          />
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.slice(0, 3).map(recommendation => (
              <div key={recommendation.id} className="p-3 border rounded-lg">
                <h4 className="font-medium">{recommendation.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{recommendation.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 border border-dashed rounded-lg">
            <BrainCircuit className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Запустите AI-анализ, чтобы получить рекомендации по оптимизации ассортимента
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductsAIAnalysis;

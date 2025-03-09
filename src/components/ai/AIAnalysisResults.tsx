
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAnalysisResults } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, BrainCircuit } from "lucide-react";

interface AIAnalysisResultsProps {
  userId: number;
  storeId: string;
  onRefreshRequest?: () => void;
}

interface AnalysisResult {
  id: number;
  user_id: number;
  store_id: string;
  analysis_type: string;
  analysis_result: string;
  created_at: string;
}

export default function AIAnalysisResults({ userId, storeId, onRefreshRequest }: AIAnalysisResultsProps) {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sales");
  const { toast } = useToast();

  useEffect(() => {
    if (userId && storeId) {
      loadAnalysisResults();
    }
  }, [userId, storeId]);

  const loadAnalysisResults = async () => {
    setIsLoading(true);
    try {
      const data = await getAnalysisResults(userId, storeId);
      setResults(data || []);
    } catch (error) {
      console.error("Ошибка при загрузке результатов анализа:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить результаты анализа",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getResultsByType = (type: string) => {
    return results.filter(result => result.analysis_type === type);
  };

  const handleRefreshRequest = () => {
    if (onRefreshRequest) {
      onRefreshRequest();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            <CardTitle>Результаты ИИ-анализа</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshRequest}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить анализ
          </Button>
        </div>
        <CardDescription>
          Рекомендации ИИ на основе данных вашего магазина
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Нет результатов анализа</p>
            <Button 
              className="mt-4"
              onClick={handleRefreshRequest}
            >
              Запросить анализ
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="sales">Продажи</TabsTrigger>
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="marketing">Маркетинг</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales" className="space-y-4">
              {getResultsByType("sales").length > 0 ? (
                getResultsByType("sales").map((result) => (
                  <div key={result.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Анализ продаж</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(result.created_at)}
                      </span>
                    </div>
                    <div className="whitespace-pre-line text-sm">
                      {result.analysis_result}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Нет результатов анализа продаж</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              {getResultsByType("orders").length > 0 ? (
                getResultsByType("orders").map((result) => (
                  <div key={result.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Анализ заказов</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(result.created_at)}
                      </span>
                    </div>
                    <div className="whitespace-pre-line text-sm">
                      {result.analysis_result}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Нет результатов анализа заказов</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="products" className="space-y-4">
              {getResultsByType("products").length > 0 ? (
                getResultsByType("products").map((result) => (
                  <div key={result.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Анализ товаров</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(result.created_at)}
                      </span>
                    </div>
                    <div className="whitespace-pre-line text-sm">
                      {result.analysis_result}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Нет результатов анализа товаров</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="marketing" className="space-y-4">
              {getResultsByType("marketing").length > 0 ? (
                getResultsByType("marketing").map((result) => (
                  <div key={result.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Анализ маркетинга</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(result.created_at)}
                      </span>
                    </div>
                    <div className="whitespace-pre-line text-sm">
                      {result.analysis_result}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Нет результатов анализа маркетинга</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}


import { useState, useEffect } from "react";
import { Package, RefreshCw, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProductsList from "@/components/ProductsList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { getProductProfitabilityData, getProductProfitability30Days } from "@/utils/storeUtils";
import { Badge } from "@/components/ui/badge";
import Products from "@/components/Products";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductsProps {
  selectedStore?: {
    id: string;
    apiKey: string;
  } | null;
}

interface ProductData {
  name: string;
  price: string;
  profit: string;
  image: string;
  quantitySold?: number;
  margin?: number;
  returnCount?: number;
  category?: string;
}

const ProductsPage = ({ selectedStore }: ProductsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [profitableProducts, setProfitableProducts] = useState<ProductData[]>([]);
  const [unprofitableProducts, setUnprofitableProducts] = useState<ProductData[]>([]);
  const [lastUpdateDate, setLastUpdateDate] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedStore) {
      loadProductProfitabilityData();
    } else {
      setProfitableProducts([]);
      setUnprofitableProducts([]);
      setLastUpdateDate(null);
    }
  }, [selectedStore]);

  const loadProductProfitabilityData = () => {
    if (!selectedStore) return;
    
    const profitabilityData = getProductProfitabilityData(selectedStore.id);
    
    if (profitabilityData) {
      setProfitableProducts(profitabilityData.profitableProducts || []);
      setUnprofitableProducts(profitabilityData.unprofitableProducts || []);
      setLastUpdateDate(profitabilityData.updateDate);
    } else {
      // Если данных нет - запускаем анализ за 30 дней
      handleAnalyze30Days();
    }
  };

  const handleSync = async () => {
    if (!selectedStore) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите магазин для синхронизации товаров",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://content-api.wildberries.ru/content/v2/get/cards/list", {
        method: "POST",
        headers: {
          "Authorization": selectedStore.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          settings: {
            cursor: {
              limit: 100
            },
            filter: {
              withPhoto: -1
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to sync products");
      }

      const data = await response.json();
      
      // Сохраняем полученные товары в localStorage
      localStorage.setItem(`products_${selectedStore.id}`, JSON.stringify(data.cards));

      toast({
        title: "Успешно",
        description: "Товары успешно синхронизированы",
      });
      
      // Повторно загружаем данные о прибыльности или запускаем анализ
      loadProductProfitabilityData();
    } catch (error) {
      console.error("Error syncing products:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось синхронизировать товары",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze30Days = async () => {
    if (!selectedStore) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите магазин для анализа товаров",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyticsLoading(true);
    try {
      // Анализируем эффективность товаров за 30 дней
      const result = await getProductProfitability30Days(selectedStore);
      
      if (result) {
        setProfitableProducts(result.profitableProducts || []);
        setUnprofitableProducts(result.unprofitableProducts || []);
        setLastUpdateDate(result.updateDate);
        
        toast({
          title: "Анализ завершен",
          description: "Данные о прибыльности товаров за 30 дней обновлены",
        });
      } else {
        toast({
          title: "Предупреждение",
          description: "Не удалось выполнить анализ. Возможно, недостаточно данных.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error analyzing products:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при анализе товаров",
        variant: "destructive",
      });
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Товары</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleAnalyze30Days} 
            disabled={isAnalyticsLoading || !selectedStore}
          >
            {isAnalyticsLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4 mr-2" />
            )}
            Анализ за 30 дней
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={isLoading || !selectedStore}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Синхронизировать
          </Button>
        </div>
      </div>
      
      {lastUpdateDate && (
        <div className="flex items-center justify-end">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Последнее обновление: {new Date(lastUpdateDate).toLocaleString('ru-RU')}
          </Badge>
        </div>
      )}
      
      {!selectedStore ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Выберите магазин для просмотра товаров</p>
          </CardContent>
        </Card>
      ) : isAnalyticsLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Анализируем эффективность товаров за 30 дней...</p>
            <p className="text-xs text-muted-foreground mt-2">Это может занять некоторое время</p>
          </CardContent>
        </Card>
      ) : profitableProducts.length === 0 && unprofitableProducts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
            <p className="text-muted-foreground">Нет данных о прибыльности товаров</p>
            <p className="text-xs text-muted-foreground mt-2">Нажмите "Анализ за 30 дней" для расчета</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Products 
            topProfitableProducts={profitableProducts} 
            topUnprofitableProducts={unprofitableProducts} 
          />
          
          <div className={`mt-8 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800/30 ${isMobile ? '' : 'p-6'}`}>
            <h3 className="text-lg font-semibold mb-2">Рекомендации по оптимизации</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/80 dark:bg-gray-900/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Для прибыльных товаров</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Увеличьте рекламный бюджет для этих позиций</li>
                    <li>Рассмотрите возможность расширения ассортимента в этой категории</li>
                    <li>Оптимизируйте описания для повышения конверсии</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-gray-900/80">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Для убыточных товаров</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Пересмотрите ценовую политику</li>
                    <li>Снизьте расходы на хранение за счет уменьшения остатков</li>
                    <li>Рассмотрите вопрос о снятии товара с продажи, если убыточность сохраняется</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <ProductsList selectedStore={selectedStore} />
        </>
      )}
    </div>
  );
};

export default ProductsPage;

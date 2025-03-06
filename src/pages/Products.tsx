
import { useState, useEffect } from "react";
import { Package, RefreshCw, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProductsList from "@/components/ProductsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { getProductProfitabilityData } from "@/utils/storeUtils";
import { Badge } from "@/components/ui/badge";

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
}

const Products = ({ selectedStore }: ProductsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profitableProducts, setProfitableProducts] = useState<ProductData[]>([]);
  const [unprofitableProducts, setUnprofitableProducts] = useState<ProductData[]>([]);
  const [lastUpdateDate, setLastUpdateDate] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      // Повторно загружаем данные о прибыльности
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

  const ProductProfitabilityCard = ({ 
    products, 
    isProfitable,
    title 
  }: {
    products: ProductData[], 
    isProfitable: boolean,
    title: string
  }) => {
    if (!products || products.length === 0) return null;
    
    const IconComponent = isProfitable ? TrendingUp : TrendingDown;
    const textColorClass = isProfitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    const bgClass = isProfitable 
      ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-800/30" 
      : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-100 dark:border-red-800/30";
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <div className={`p-2 rounded-md ${isProfitable ? 'bg-green-100 dark:bg-green-900/60' : 'bg-red-100 dark:bg-red-900/60'}`}>
              <IconComponent className={`h-4 w-4 ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product, index) => {
              const profit = parseFloat(product.profit);
              const formattedProfit = isProfitable
                ? `+${formatCurrency(profit)}`
                : formatCurrency(profit);
              
              return (
                <div 
                  key={index} 
                  className={`flex items-center p-3 rounded-lg border ${bgClass}`}
                >
                  <div className="w-12 h-12 rounded overflow-hidden mr-4 bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={product.image || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name || "Неизвестный товар"}</h4>
                    <p className="text-sm text-muted-foreground">Цена: {formatCurrency(parseFloat(product.price))}</p>
                  </div>
                  <div className="text-right flex items-center">
                    <span className={`${textColorClass} font-semibold mr-1`}>
                      {formattedProfit}
                    </span>
                    {isProfitable ? (
                      <ArrowUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Товары</h1>
        </div>
        <Button 
          onClick={handleSync} 
          disabled={isLoading || !selectedStore}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Синхронизировать
        </Button>
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
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ProductProfitabilityCard 
              title="Самые прибыльные товары" 
              products={profitableProducts} 
              isProfitable={true} 
            />
            <ProductProfitabilityCard 
              title="Самые убыточные товары" 
              products={unprofitableProducts} 
              isProfitable={false} 
            />
          </div>
          
          <ProductsList selectedStore={selectedStore} />
        </>
      )}
    </div>
  );
};

export default Products;

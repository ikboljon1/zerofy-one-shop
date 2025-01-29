import { useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProductsList from "@/components/ProductsList";
import { Card, CardContent } from "@/components/ui/card";

interface ProductsProps {
  selectedStore?: {
    id: string;
    apiKey: string;
  } | null;
}

const Products = ({ selectedStore }: ProductsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      
      {!selectedStore ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Выберите магазин для просмотра товаров</p>
          </CardContent>
        </Card>
      ) : (
        <ProductsList selectedStore={selectedStore} />
      )}
    </div>
  );
};

export default Products;
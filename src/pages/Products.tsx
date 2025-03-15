import { useState, useEffect } from "react";
import { Package, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ProductsList from "@/components/ProductsList";
import { Card, CardContent } from "@/components/ui/card";
import { getProductProfitabilityData } from "@/utils/storeUtils";
import { Badge } from "@/components/ui/badge";
import { Store } from "@/types/store";
import ProductsComponent from "@/components/Products";
import { useIsMobile } from "@/hooks/use-mobile";
import { CostPriceMetrics } from "@/components/supplies";
import axios from "axios";
import FetchProductDataDialog from "@/components/supplies/FetchProductDataDialog";

interface ProductsProps {
  selectedStore?: Store | null;
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
  nmId?: number; // Поле nmId для идентификации товара
}

const Products = ({ selectedStore }: ProductsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profitableProducts, setProfitableProducts] = useState<ProductData[]>([]);
  const [unprofitableProducts, setUnprofitableProducts] = useState<ProductData[]>([]);
  const [lastUpdateDate, setLastUpdateDate] = useState<string | null>(null);
  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedStore) {
      loadProductProfitabilityData();
      // Auto-sync products when store is selected
      handleSync();
    } else {
      setProfitableProducts([]);
      setUnprofitableProducts([]);
      setLastUpdateDate(null);
    }
  }, [selectedStore]);

  const loadProductProfitabilityData = () => {
    if (!selectedStore) return;
    
    try {
      const profitabilityData = getProductProfitabilityData(selectedStore.id);
      
      if (profitabilityData) {
        console.log("Loaded profitability data:", profitabilityData);
        
        // Ensure we're only taking the top profitable and unprofitable products
        setProfitableProducts(profitabilityData.profitableProducts?.slice(0, 3) || []);
        setUnprofitableProducts(profitabilityData.unprofitableProducts?.slice(0, 3) || []);
        setLastUpdateDate(profitabilityData.updateDate);
      }
    } catch (error) {
      console.error("Error loading product profitability data:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о прибыльности товаров",
        variant: "destructive",
      });
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
      
      // Логируем подробную информацию о полученных продуктах
      console.log('Received products data:');
      if (data.cards && data.cards.length > 0) {
        console.log('Products count:', data.cards.length);
        console.log('First product full sample:', data.cards[0]);
        console.log('NmId values in first 5 products:',
          data.cards.slice(0, 5).map((card: any) => ({
            nmID: card.nmID,
            nmId: card.nmId,
            vendorCode: card.vendorCode
          }))
        );
      } else {
        console.log('No products received');
      }
      
      // Нормализуем данные, чтобы все продукты имели поле nmId (а не nmID)
      const normalizedProducts = data.cards.map((product: any) => {
        // Убедимся, что nmId существует (используем nmID если nmId не существует)
        if (!product.nmId && product.nmID) {
          product.nmId = product.nmID;
        }
        return product;
      });
      
      // Сохраняем полученные товары в БД
      try {
        await axios.post('http://localhost:3001/api/products', {
          storeId: selectedStore.id,
          products: normalizedProducts
        });
        
        // Также сохраняем локально для кэширования
        localStorage.setItem(`products_${selectedStore.id}`, JSON.stringify(normalizedProducts));
        
        console.log(`Saved ${normalizedProducts.length} products to database`);
        
        toast({
          title: "Успешно",
          description: "Товары успешно синхронизированы и сохранены в базе данных",
        });
      } catch (dbError) {
        console.error("Error saving products to DB:", dbError);
        
        // Если не удалось сохранить в БД, используем localStorage
        localStorage.setItem(`products_${selectedStore.id}`, JSON.stringify(normalizedProducts));
        
        console.log(`Saved ${normalizedProducts.length} products to localStorage`);
        
        toast({
          title: "Частично успешно",
          description: "Товары синхронизированы, но сохранены локально (нет соединения с БД)",
        });
      }
      
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
  
  const handleProductDataFetched = async (data: {
    nmId: number;
    averageStorageCost: number;
    averageDailySales: number;
    brand: string;
    vendorCode: string;
    subject: string;
    sa_name: string;
  }) => {
    // We've fetched data for a specific product
    // Here we could do something with it at the page level if needed
    toast({
      title: "Данные получены",
      description: `Получены данные для nmId: ${data.nmId}`,
    });
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
            onClick={() => setIsDataDialogOpen(true)}
            disabled={!selectedStore}
            size={isMobile ? "sm" : "default"}
          >
            <Search className="h-4 w-4 mr-2" />
            {isMobile ? "По nmId" : "Получить по nmId"}
          </Button>
          <Button 
            onClick={handleSync} 
            disabled={isLoading || !selectedStore}
            size={isMobile ? "sm" : "default"}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isMobile ? "Синхр." : "Синхронизировать"}
          </Button>
        </div>
      </div>
      
      {/* Dialog for fetching product data by nmId */}
      <FetchProductDataDialog
        open={isDataDialogOpen}
        onOpenChange={setIsDataDialogOpen}
        onDataFetched={handleProductDataFetched}
        selectedStore={selectedStore}
      />
      
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
          {/* Компонент для отображения статистики себестоимости */}
          <CostPriceMetrics selectedStore={selectedStore} />
          
          {/* Компонент с прибыльными/убыточными товарами */}
          <ProductsComponent 
            topProfitableProducts={profitableProducts} 
            topUnprofitableProducts={unprofitableProducts} 
          />
          
          {/* Список всех товаров */}
          <ProductsList selectedStore={selectedStore} />
        </>
      )}
    </div>
  );
};

export default Products;

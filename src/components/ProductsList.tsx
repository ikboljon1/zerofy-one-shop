import { useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface Product {
  nmID: number;
  vendorCode: string;
  brand: string;
  title: string;
  photos: Array<{
    big: string;
    c246x328: string;
  }>;
  costPrice?: number;
  price?: number;
  clubPrice?: number;
  expenses?: {
    logistics: number;
    storage: number;
    penalties: number;
    acceptance: number;
  };
}

interface ProductsListProps {
  selectedStore: {
    id: string;
    apiKey: string;
  } | null;
}

const ProductsList = ({ selectedStore }: ProductsListProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const calculateNetProfit = (product: Product) => {
    if (!product.costPrice || !product.expenses) return 0;
    
    const totalExpenses = 
      product.costPrice + 
      product.expenses.logistics + 
      product.expenses.storage + 
      product.expenses.penalties + 
      product.expenses.acceptance;
    
    return product.price ? (product.price - totalExpenses) : -totalExpenses;
  };

  const updateCostPrice = (productId: number, costPrice: number) => {
    const updatedProducts = products.map(product => 
      product.nmID === productId ? { ...product, costPrice } : product
    );
    setProducts(updatedProducts);
    
    // Save to localStorage
    if (selectedStore?.apiKey) {
      localStorage.setItem(`products_${selectedStore.apiKey}`, JSON.stringify(updatedProducts));
      
      // Trigger stats recalculation by updating the timestamp
      const statsKey = `marketplace_stats_${selectedStore.apiKey}`;
      const currentStats = JSON.parse(localStorage.getItem(statsKey) || "{}");
      localStorage.setItem(statsKey, JSON.stringify({
        ...currentStats,
        lastUpdated: new Date().toISOString()
      }));

      toast({
        title: "Успешно",
        description: "Себестоимость товара обновлена",
      });
    }
  };

  // Загружаем продукты из localStorage при изменении магазина
  useState(() => {
    if (selectedStore) {
      const storedProducts = localStorage.getItem(`products_${selectedStore.id}`);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts([]);
      }
    }
  });

  if (!selectedStore) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Выберите магазин для просмотра товаров</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Товары</h2>
        </div>
        <Button onClick={syncProducts} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Синхронизировать
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Нет товаров для отображения</p>
          </CardContent>
        </Card>
      ) : (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-3'}`}>
          {products.map((product) => (
            <Card key={product.nmID} className="flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className={`${isMobile ? 'text-sm' : 'text-base'} font-medium line-clamp-2`}>
                  {product.title || "Неизвестный товар"}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  ID: {product.nmID}
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <img
                  src={product.photos?.[0]?.c246x328 || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"}
                  alt={product.title}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label htmlFor={`costPrice-${product.nmID}`} className="text-xs text-muted-foreground">
                      Себестоимость:
                    </label>
                    <Input
                      id={`costPrice-${product.nmID}`}
                      type="number"
                      value={product.costPrice || ""}
                      onChange={(e) => updateCostPrice(product.nmID, Number(e.target.value))}
                      className="h-8 text-sm"
                      placeholder="Введите себестоимость"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Цена товара:
                    </label>
                    <div className="text-sm font-medium">
                      {product.price ? `${product.price.toFixed(2)} ₽` : "0.00 ₽"}
                    </div>
                  </div>
                  {product.expenses && (
                    <div className="space-y-1.5 border-t pt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Логистика:</span>
                        <span>{product.expenses.logistics.toFixed(2)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Хранение:</span>
                        <span>{product.expenses.storage.toFixed(2)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Штрафы:</span>
                        <span>{product.expenses.penalties.toFixed(2)} ₽</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Приемка:</span>
                        <span>{product.expenses.acceptance.toFixed(2)} ₽</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>Чистая прибыль:</span>
                        <span className={calculateNetProfit(product) >= 0 ? "text-green-500" : "text-red-500"}>
                          {calculateNetProfit(product).toFixed(2)} ₽
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;

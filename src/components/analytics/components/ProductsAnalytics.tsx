
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Zap, Search } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import FetchProductDataDialog from "@/components/supplies/FetchProductDataDialog";
import { useToast } from "@/hooks/use-toast";

interface Product {
  name: string;
  price: string;
  profit: string;
  image: string;
  quantitySold?: number;
  margin?: number;
  returnCount?: number;
  category?: string;
  nmId?: number; // Add nmId for identification
  averageStorageCost?: number; // Add storage cost
  averageDailySales?: number; // Add average daily sales
}

interface ProductsAnalyticsProps {
  profitableProducts: Product[];
  unprofitableProducts: Product[];
  selectedStore?: Store | null;
}

const ProductsAnalytics = ({ profitableProducts, unprofitableProducts, selectedStore }: ProductsAnalyticsProps) => {
  const isMobile = useIsMobile();
  const [isDataDialogOpen, setIsDataDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
  const handleFetchData = (product: Product) => {
    if (!product.nmId) {
      toast({
        title: "Ошибка",
        description: "У этого товара нет nmId",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedProduct(product);
    setIsDataDialogOpen(true);
  };
  
  const handleDataFetched = (data: {
    nmId: number;
    averageStorageCost: number;
    averageDailySales: number;
    brand: string;
    vendorCode: string;
    subject: string;
    sa_name: string;
  }) => {
    // No need to update anything as this component doesn't manage the state of the products
    toast({
      title: "Данные получены",
      description: `Получены данные для nmId: ${data.nmId}`,
    });
  };
  
  const ProductList = ({ products, isProfitable }: { products: Product[], isProfitable: boolean }) => {
    const textColorClass = isProfitable ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    const bgClass = isProfitable 
      ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-800/30" 
      : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-100 dark:border-red-800/30";
    
    if (!products || products.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <p>Нет данных о {isProfitable ? "прибыльных" : "убыточных"} товарах</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {products.map((product, index) => {
          const profit = parseFloat(product.profit);
          const formattedProfit = isProfitable
            ? `+${formatCurrency(profit)}`
            : formatCurrency(profit);
          
          return (
            <div 
              key={index} 
              className={`flex items-start p-4 rounded-lg border ${bgClass}`}
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                <img 
                  src={product.image || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg";
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-base line-clamp-2">{product.name || "Неизвестный товар"}</h4>
                  <div className="text-right flex items-center ml-2">
                    <span className={`${textColorClass} font-semibold mr-1 whitespace-nowrap`}>
                      {formattedProfit}
                    </span>
                    {isProfitable ? (
                      <ArrowUp className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Цена: {formatCurrency(parseFloat(product.price))}
                </p>
                
                {product.category && (
                  <p className="text-sm text-muted-foreground">
                    Категория: {product.category}
                  </p>
                )}
                
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-1 mt-2' : 'grid-cols-2 gap-2 mt-3'} text-sm`}>
                  {product.quantitySold !== undefined && (
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-1 text-amber-500" />
                      <span>Продано: {product.quantitySold} шт.</span>
                    </div>
                  )}
                  
                  {product.margin !== undefined && (
                    <div className="flex items-center">
                      <span className={product.margin > 20 ? 'text-green-600' : 'text-amber-600'}>
                        Маржа: {product.margin}%
                      </span>
                    </div>
                  )}
                  
                  {product.returnCount !== undefined && (
                    <div className="flex items-center">
                      <ArrowDown className={`h-4 w-4 mr-1 ${product.returnCount > 5 ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <span>Возвраты: {product.returnCount} шт.</span>
                    </div>
                  )}
                  
                  {/* Display additional data if we have it */}
                  {product.averageStorageCost !== undefined && (
                    <div className="flex items-center">
                      <span>Хранение: {product.averageStorageCost.toFixed(2)} ₽/день</span>
                    </div>
                  )}
                  
                  {product.averageDailySales !== undefined && (
                    <div className="flex items-center">
                      <span>Продажи: {product.averageDailySales.toFixed(2)} шт/день</span>
                    </div>
                  )}
                </div>
                
                {product.nmId && selectedStore && (
                  <div className="mt-2">
                    <Button
                      variant="outline" 
                      size="sm"
                      className="w-full text-xs" 
                      onClick={() => handleFetchData(product)}
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Получить данные
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Прибыльные товары</CardTitle>
            <div className="bg-green-100 dark:bg-green-900/60 p-2 rounded-md">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProductList products={profitableProducts} isProfitable={true} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Убыточные товары</CardTitle>
            <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-md">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProductList products={unprofitableProducts} isProfitable={false} />
        </CardContent>
      </Card>
      
      {/* Dialog for fetching product data by nmId */}
      {selectedStore && (
        <FetchProductDataDialog
          open={isDataDialogOpen}
          onOpenChange={setIsDataDialogOpen}
          onDataFetched={handleDataFetched}
          selectedStore={selectedStore}
        />
      )}
    </div>
  );
};

export default ProductsAnalytics;

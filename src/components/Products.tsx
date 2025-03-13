import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, FileText, Info, Filter } from "lucide-react";
import { formatCurrency, parseCurrencyString } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  name: string;
  price: string;
  profit: string;
  image: string;
  quantitySold?: number;
  margin?: number;
  returnCount?: number; // Changed from returnRate to returnCount
  category?: string;
}

interface ProductListProps {
  products: Product[];
  isProfitable: boolean;
}

type FilterType = "default" | "bestSelling" | "highestMargin" | "lowestReturns";

const Products = ({ 
  topProfitableProducts = [], 
  topUnprofitableProducts = [],
  hideFilters = false
}: { 
  topProfitableProducts: Product[],
  topUnprofitableProducts: Product[],
  hideFilters?: boolean
}) => {
  const isMobile = useIsMobile();
  const [profitableFilter, setProfitableFilter] = useState<FilterType>("default");
  const [unprofitableFilter, setUnprofitableFilter] = useState<FilterType>("default");

  const filterProducts = (products: Product[], filterType: FilterType): Product[] => {
    // Create a copy to avoid modifying the original array
    let filteredProducts = [...products];
    
    switch (filterType) {
      case "bestSelling":
        return filteredProducts
          .filter(p => p.quantitySold !== undefined)
          .sort((a, b) => (b.quantitySold || 0) - (a.quantitySold || 0));
      case "highestMargin":
        return filteredProducts
          .filter(p => p.margin !== undefined)
          .sort((a, b) => (b.margin || 0) - (a.margin || 0));
      case "lowestReturns":
        return filteredProducts
          .filter(p => p.returnCount !== undefined)
          .sort((a, b) => (a.returnCount || 0) - (b.returnCount || 0));
      default:
        return filteredProducts;
    }
  };

  const getProfitabilityReason = (product: Product, isProfitable: boolean) => {
    if (isProfitable) {
      if (product.margin && product.margin > 30) {
        return "Высокая маржинальность";
      } else if (product.quantitySold && product.quantitySold > 50) {
        return "Высокие объемы продаж";
      } else if (product.returnCount !== undefined && product.returnCount < 3) {
        return "Низкое количество возвратов";
      }
      return "Стабильные продажи";
    } else {
      if (product.margin && product.margin < 10) {
        return "Низкая маржинальность";
      } else if (product.returnCount !== undefined && product.returnCount > 10) {
        return "Высокое количество возвратов";
      } else if (product.quantitySold && product.quantitySold < 5) {
        return "Низкие объемы продаж";
      }
      return "Нестабильные продажи";
    }
  };

  const ProductList = ({ products = [], isProfitable }: ProductListProps) => {
    const IconComponent = isProfitable ? TrendingUp : TrendingDown;
    
    const formatProfitWithSign = (profitStr: string) => {
      const profit = parseCurrencyString(profitStr);
      return isProfitable
        ? `+${formatCurrency(profit)}`
        : formatCurrency(profit);
    };
    
    return (
      <div className="space-y-4">
        {products.map((product, index) => (
          <div 
            key={index} 
            className={`flex flex-col ${
              isMobile ? 'p-3' : 'p-4'
            } ${isProfitable 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-800/30 rounded-lg' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-100 dark:border-red-800/30 rounded-lg'}`}
          >
            <div className="flex items-start">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className={`rounded-lg object-cover ${
                    isMobile ? 'h-16 w-16' : 'h-20 w-20'
                  } mr-3`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <div className={`rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${
                  isMobile ? 'h-16 w-16' : 'h-20 w-20'
                } mr-3`}>
                  <span className="text-xs text-center text-gray-500 dark:text-gray-400 px-1">Нет фото</span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'} line-clamp-2`}>
                    {product.name || "Неизвестный товар"}
                  </h4>
                  <p className={`text-sm flex items-center ${isProfitable ? 'text-green-500' : 'text-red-500'} font-medium ${isMobile ? 'ml-1' : 'ml-2'}`}>
                    {isMobile ? '' : (isProfitable ? 'Прибыль: ' : 'Убыток: ')}
                    {formatProfitWithSign(product.profit)}
                    {isProfitable ? (
                      <ArrowUp className="h-4 w-4 ml-1" />
                    ) : (
                      <ArrowDown className="h-4 w-4 ml-1" />
                    )}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Цена: {formatCurrency(parseCurrencyString(product.price))}
                </p>
                {product.category && !isMobile && (
                  <p className="text-sm text-muted-foreground">
                    Категория: {product.category}
                  </p>
                )}
              </div>
            </div>
            
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-1 mt-2' : 'grid-cols-2 gap-2 mt-3'} text-sm`}>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className={isProfitable ? 'text-green-600' : 'text-red-600'}>
                  {product.margin !== undefined ? `Маржа: ${product.margin}%` : 'Маржа: Н/Д'}
                </span>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  {product.quantitySold !== undefined ? `Продано: ${product.quantitySold} шт.` : 'Продано: Н/Д'}
                </span>
              </div>
              
              <div className="flex items-center">
                <ArrowDown className={`h-4 w-4 mr-1 ${product.returnCount && product.returnCount > 5 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span>
                  {product.returnCount !== undefined ? `Возвраты: ${product.returnCount} шт.` : 'Возвраты: Н/Д'}
                </span>
              </div>
              
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {getProfitabilityReason(product, isProfitable)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
      <Card className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
              Топ-3 прибыльных товара
            </h3>
            <div className="bg-green-100 dark:bg-green-900/60 p-2 rounded-md">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          {!hideFilters && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={profitableFilter} 
                onValueChange={(value) => setProfitableFilter(value as FilterType)}
              >
                <SelectTrigger className="h-8 w-[200px]">
                  <SelectValue placeholder="Фильтр" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">По умолчанию</SelectItem>
                  <SelectItem value="bestSelling">Самые продаваемые</SelectItem>
                  <SelectItem value="highestMargin">Самая высокая маржа</SelectItem>
                  <SelectItem value="lowestReturns">Меньше всего возвратов</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <ProductList 
            products={filterProducts(topProfitableProducts, profitableFilter).slice(0, 3)} 
            isProfitable={true} 
          />
        </div>
      </Card>
      
      <Card className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
              Топ-3 убыточных товара
            </h3>
            <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-md">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          
          {!hideFilters && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={unprofitableFilter} 
                onValueChange={(value) => setUnprofitableFilter(value as FilterType)}
              >
                <SelectTrigger className="h-8 w-[200px]">
                  <SelectValue placeholder="Фильтр" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">По умолчанию</SelectItem>
                  <SelectItem value="bestSelling">Самые продаваемые</SelectItem>
                  <SelectItem value="highestMargin">Самая низкая маржа</SelectItem>
                  <SelectItem value="lowestReturns">Больше всего возвратов</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <ProductList 
            products={filterProducts(topUnprofitableProducts, unprofitableFilter).slice(0, 3)} 
            isProfitable={false} 
          />
        </div>
      </Card>
    </div>
  );
};

export default Products;


import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, DollarSign, FileText, Info, Image } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { useIsMobile } from "@/hooks/use-mobile";

interface Product {
  name: string;
  price: string;
  profit: string;
  image: string;
  quantitySold?: number;
  margin?: number;
  returnCount?: number;
  category?: string;
}

interface ProductListProps {
  title: string;
  products: Product[] | undefined;
  isProfitable: boolean;
}

const ProductList = ({ title, products = [], isProfitable }: ProductListProps) => {
  const isMobile = useIsMobile();
  const textColorClass = isProfitable 
    ? "text-green-600 dark:text-green-400" 
    : "text-red-600 dark:text-red-400";
  
  const bgGradientClass = isProfitable
    ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-100 dark:border-green-800/30"
    : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-100 dark:border-red-800/30";

  const IconComponent = isProfitable ? TrendingUp : TrendingDown;

  const formatNumberWithSign = (value: string) => {
    const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (isNaN(numValue)) return value;
    
    return isProfitable 
      ? `+${formatCurrency(numValue)}` 
      : formatCurrency(numValue);
  };

  const safeText = (text: string | undefined): string => {
    if (!text) return "Нет данных";
    
    try {
      return text.replace(/�/g, '');
    } catch (e) {
      return text;
    }
  };

  const getProfitabilityReason = (product: Product) => {
    if (isProfitable) {
      if (product.quantitySold && product.quantitySold > 50) {
        return "Высокие объемы продаж";
      } else if (product.returnCount !== undefined && product.returnCount < 3) {
        return "Низкое количество возвратов";
      }
      return "Стабильные продажи";
    } else {
      if (product.returnCount !== undefined && product.returnCount > 10) {
        return "Высокое количество возвратов";
      } else if (product.quantitySold && product.quantitySold < 5) {
        return "Низкие объемы продаж";
      }
      return "Нестабильные продажи";
    }
  };

  return (
    <Card className={`p-2 ${isMobile ? 'p-1.5' : 'p-2'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">{safeText(title)}</h3>
        <div className={`p-1 rounded-md ${isProfitable ? 'bg-green-100 dark:bg-green-900/60' : 'bg-red-100 dark:bg-red-900/60'}`}>
          <IconComponent className={`h-3 w-3 ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
        </div>
      </div>
      <div className="space-y-2">
        {products && products.length > 0 ? (
          products.map((product, index) => (
            <div 
              key={index} 
              className={`flex flex-col p-2 rounded-lg border ${bgGradientClass}`}
            >
              <div className="flex items-start mb-1">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-2 bg-gray-100 dark:bg-gray-800">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={safeText(product.name)} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-6 w-6 text-muted-foreground opacity-40" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-xs">{safeText(product.name || "Неизвестный товар")}</h4>
                    <div className="text-right flex items-center">
                      <span className={`${textColorClass} font-semibold mr-1 text-xs`}>
                        {formatNumberWithSign(product.profit)}
                      </span>
                      {isProfitable ? (
                        <ArrowUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Цена: {formatCurrency(parseFloat(product.price || "0"))}
                  </p>
                  {product.category && (
                    <p className="text-[10px] text-muted-foreground">
                      Категория: {safeText(product.category)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 text-[10px]">
                <div className="flex items-center">
                  <FileText className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span>
                    Продано: {product.quantitySold !== undefined ? `${product.quantitySold} шт.` : 'Н/Д'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <ArrowDown className={`h-3 w-3 mr-1 ${product.returnCount && product.returnCount > 5 ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span>
                    Возвраты: {product.returnCount !== undefined ? `${product.returnCount} шт.` : 'Н/Д'}
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Info className="h-3 w-3 mr-1 text-muted-foreground" />
                  <span className="font-medium">
                    {safeText(getProfitabilityReason(product))}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-3 px-2 text-center text-muted-foreground">
            <div className="flex flex-col items-center">
              <Image className="h-8 w-8 text-muted-foreground opacity-20 mb-1" />
              <p className="text-xs">Нет данных за выбранный период</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductList;

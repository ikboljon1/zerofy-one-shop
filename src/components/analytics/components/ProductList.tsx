
import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface Product {
  name: string;
  price: string;
  profit: string;
  image: string;
}

interface ProductListProps {
  title: string;
  products: Product[] | undefined;
  isProfitable: boolean;
}

const ProductList = ({ title, products = [], isProfitable }: ProductListProps) => {
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className={`p-2 rounded-md ${isProfitable ? 'bg-green-100 dark:bg-green-900/60' : 'bg-red-100 dark:bg-red-900/60'}`}>
          <IconComponent className={`h-4 w-4 ${isProfitable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
        </div>
      </div>
      <div className="space-y-4">
        {products && products.length > 0 ? (
          products.map((product, index) => (
            <div 
              key={index} 
              className={`flex items-center p-3 rounded-lg border ${bgGradientClass}`}
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
                  {formatNumberWithSign(product.profit)}
                </span>
                {isProfitable ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            <p>Нет данных за выбранный период</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductList;

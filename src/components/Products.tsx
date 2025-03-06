
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, parseCurrencyString } from "@/utils/formatCurrency";

interface Product {
  name: string;
  price: string;
  profit: string;
  image: string;
}

interface ProductListProps {
  products: Product[];
  isProfitable: boolean;
}

const Products = ({ 
  topProfitableProducts = [], 
  topUnprofitableProducts = [] 
}: { 
  topProfitableProducts: Product[],
  topUnprofitableProducts: Product[] 
}) => {
  const isMobile = useIsMobile();

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
            className={`flex items-center ${
              isMobile ? 'p-3 space-x-3' : 'p-4 space-x-4'
            } ${isProfitable 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-800/30 rounded-lg' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border border-red-100 dark:border-red-800/30 rounded-lg'}`}
          >
            <img
              src={product.image || "https://storage.googleapis.com/a1aa/image/Fo-j_LX7WQeRkTq3s3S37f5pM6wusM-7URWYq2Rq85w.jpg"}
              alt={product.name}
              className={`rounded-lg object-cover ${
                isMobile ? 'h-12 w-12' : 'h-16 w-16'
              }`}
            />
            <div className="flex-1">
              <h4 className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>
                {product.name || "Неизвестный товар"}
              </h4>
              <p className="text-sm text-muted-foreground">
                Цена: {formatCurrency(parseCurrencyString(product.price))}
              </p>
              <p className={`text-sm flex items-center ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                {isProfitable ? 'Прибыль: ' : 'Убыток: '}
                {formatProfitWithSign(product.profit)}
                {isProfitable ? (
                  <ArrowUp className="h-4 w-4 ml-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 ml-1" />
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
      <Card className={`mt-6 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
            Топ-3 прибыльных товара
          </h3>
          <div className="bg-green-100 dark:bg-green-900/60 p-2 rounded-md">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <ProductList products={topProfitableProducts} isProfitable={true} />
      </Card>
      
      <Card className={`mt-6 ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
            Топ-3 убыточных товара
          </h3>
          <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-md">
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <ProductList products={topUnprofitableProducts} isProfitable={false} />
      </Card>
    </div>
  );
};

export default Products;

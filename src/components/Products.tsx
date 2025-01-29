import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown } from "lucide-react";

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

  const ProductList = ({ products = [], isProfitable }: ProductListProps) => (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div 
          key={index} 
          className={`flex items-center ${
            isMobile ? 'p-3 space-x-3' : 'p-4 space-x-4'
          }`}
        >
          <img
            src={product.image}
            alt={product.name}
            className={`rounded-lg object-cover ${
              isMobile ? 'h-12 w-12' : 'h-16 w-16'
            }`}
          />
          <div>
            <h4 className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>
              {product.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              Цена: {product.price} руб
            </p>
            <p className={`text-sm flex items-center ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {isProfitable ? 'Прибыль: ' : 'Убыток: '}{product.profit} руб
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

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
      <Card className={`mt-6 ${isMobile ? 'p-3' : 'p-4'}`}>
        <h3 className={`mb-4 font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>Let me analyze the errors step by step:

1. Looking at the error stack trace, the issue is in `Products.tsx` where we're trying to map over `products` that is undefined
2. The second error shows that required props aren't being passed to the Products component
3. Looking at the code, I see that while we added default empty arrays for the props, we still need to fix the ProductList component that's using the products prop

Let's fix this:

<lov-code>
Let's update the Products.tsx file to properly handle the products prop:

<lov-write file_path="src/components/Products.tsx">
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown } from "lucide-react";

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

  const ProductList = ({ products = [], isProfitable }: ProductListProps) => (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div 
          key={index} 
          className={`flex items-center ${
            isMobile ? 'p-3 space-x-3' : 'p-4 space-x-4'
          }`}
        >
          <img
            src={product.image}
            alt={product.name}
            className={`rounded-lg object-cover ${
              isMobile ? 'h-12 w-12' : 'h-16 w-16'
            }`}
          />
          <div>
            <h4 className={`font-semibold ${isMobile ? 'text-sm' : ''}`}>
              {product.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              Цена: {product.price} руб
            </p>
            <p className={`text-sm flex items-center ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
              {isProfitable ? 'Прибыль: ' : 'Убыток: '}{product.profit} руб
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

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
      <Card className={`mt-6 ${isMobile ? 'p-3' : 'p-4'}`}>
        <h3 className={`mb-4 font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
          Топ-3 прибыльных товара
        </h3>
        <ProductList products={topProfitableProducts} isProfitable={true} />
      </Card>
      
      <Card className={`mt-6 ${isMobile ? 'p-3' : 'p-4'}`}>
        <h3 className={`mb-4 font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
          Топ-3 убыточных товара
        </h3>
        <ProductList products={topUnprofitableProducts} isProfitable={false} />
      </Card>
    </div>
  );
};

export default Products;
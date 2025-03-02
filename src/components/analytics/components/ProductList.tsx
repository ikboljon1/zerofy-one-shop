
import { Card } from "@/components/ui/card";

interface Product {
  name: string;
  price: string;
  profit: string;
  image: string;
}

interface ProductListProps {
  title: string;
  products: Product[];
  isProfitable: boolean;
}

const ProductList = ({ title, products, isProfitable }: ProductListProps) => {
  const textColorClass = isProfitable 
    ? "text-green-600 dark:text-green-400" 
    : "text-red-600 dark:text-red-400";

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {products?.map((product, index) => (
          <div key={index} className="flex items-center p-3 rounded-lg border dark:border-muted">
            <div className="w-12 h-12 rounded overflow-hidden mr-4 bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-muted-foreground">{product.price}</p>
            </div>
            <div className="text-right">
              <span className={`${textColorClass} font-semibold`}>{product.profit}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProductList;

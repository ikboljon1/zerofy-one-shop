
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Info } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";

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
  products?: Product[];
  isProfitable?: boolean;
  isDemoData?: boolean;
}

const ProductList = ({ title, products = [], isProfitable = true, isDemoData = false }: ProductListProps) => {
  return (
    <Card className={isDemoData ? "border-gray-300 dark:border-gray-700" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-row items-center space-x-2">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          
          {isDemoData && (
            <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">
              <Info className="h-3 w-3 mr-1" />
              Демо данные
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products && products.length > 0 ? (
            products.map((product, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                      style={isDemoData ? { opacity: 0.8, filter: 'grayscale(0.5)' } : {}}
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-gray-400">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDemoData ? "text-gray-600 dark:text-gray-400" : ""}`}>
                    {product.name}
                  </p>
                  <p className={`text-xs text-muted-foreground ${isDemoData ? "text-gray-500 dark:text-gray-500" : ""}`}>
                    {product.category || "Категория не указана"}
                    {product.quantitySold && ` · Продано: ${product.quantitySold} шт.`}
                    {product.returnCount ? ` · Возвратов: ${product.returnCount}` : ''}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className={`flex items-center ${isProfitable ? "text-green-600" : "text-red-600"}`}>
                    {isProfitable ? (
                      <ArrowUp className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDown className="h-3 w-3 mr-1" />
                    )}
                    <span className="font-semibold">{product.profit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Цена: {product.price}
                    {product.margin && ` · ${product.margin.toFixed(1)}%`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>Нет данных о товарах</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;

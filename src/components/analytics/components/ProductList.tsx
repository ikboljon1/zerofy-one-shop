import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package, AlertTriangle, BarChart2, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProductListProps {
  title: string;
  products?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  isProfitable: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ title, products = [], isProfitable }) => {
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isProfitable ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent className="p-0">
        {products && products.length > 0 ? (
          <ScrollArea className="h-[300px] w-full">
            <div className="space-y-4 p-4">
              {products.map((product, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={product.image} alt={product.name} />
                    <AvatarFallback>{product.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{product.name}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {isProfitable ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Прибыль: {product.profit}
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          Убыток: {product.profit}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Продано: {product.quantitySold || 0} шт.
                    </div>
                    {product.margin && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <BarChart2 className="h-3 w-3" />
                        Маржа: {product.margin}%
                      </div>
                    )}
                    {product.returnCount !== undefined && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Package className="h-3 w-3 text-red-500" />
                        Возвраты: {product.returnCount}
                      </div>
                    )}
                    {product.category && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Badge className="bg-secondary border-transparent">{product.category}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-4 px-4 text-center text-muted-foreground">
            Нет данных о товарах
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductList;

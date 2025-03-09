
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Loader2, Package } from 'lucide-react';

export interface ProductItem {
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
  profitableProducts?: ProductItem[];
  unprofitableProducts?: ProductItem[];
  isLoading?: boolean;
  title?: string;
  products?: ProductItem[];
  isProfitable?: boolean;
}

const ProductList = ({ 
  profitableProducts = [], 
  unprofitableProducts = [], 
  isLoading = false,
  title,
  products,
  isProfitable
}: ProductListProps) => {
  // If we're using the new props pattern
  const usingNewPropsPattern = products !== undefined && isProfitable !== undefined;
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-500" />
            <span>{title || "Доходность товаров"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground">Загрузка данных о продуктах...</p>
        </CardContent>
      </Card>
    );
  }
  
  // If using the new pattern with title, products, and isProfitable
  if (usingNewPropsPattern) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-500" />
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
            {products && products.length > 0 ? products.map((product, index) => (
              <div key={`product-${index}`} className={`flex items-start gap-3 p-2 ${
                isProfitable 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20' 
                  : 'bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20'
              } rounded-lg`}>
                <div className="flex-shrink-0 w-12 h-12 rounded-md bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium truncate mb-0.5">{product.name}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Цена: {product.price}</span>
                    <span className={isProfitable ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                      Прибыль: {product.profit}
                    </span>
                    {product.margin && <span className="text-blue-600 dark:text-blue-400">Маржа: {product.margin}%</span>}
                    {product.quantitySold && <span className="text-purple-600 dark:text-purple-400">Продано: {product.quantitySold}</span>}
                    {product.returnCount && <span className="text-orange-600 dark:text-orange-400">Возвраты: {product.returnCount}</span>}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 col-span-full py-4 text-center">
                {isProfitable ? "Данные о прибыльных товарах отсутствуют" : "Данные о убыточных товарах отсутствуют"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Original implementation
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Package className="mr-2 h-5 w-5 text-blue-500" />
          <span>Доходность товаров</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold flex items-center mb-2">
            <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Самые прибыльные товары</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
            {profitableProducts && profitableProducts.length > 0 ? profitableProducts.slice(0, 4).map((product, index) => (
              <div key={`profit-${index}`} className="flex items-start gap-3 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                <div className="flex-shrink-0 w-12 h-12 rounded-md bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium truncate mb-0.5">{product.name}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Цена: {product.price}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Прибыль: {product.profit}</span>
                    {product.margin && <span className="text-blue-600 dark:text-blue-400">Маржа: {product.margin}%</span>}
                    {product.quantitySold && <span className="text-purple-600 dark:text-purple-400">Продано: {product.quantitySold}</span>}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 col-span-full py-4 text-center">Данные о прибыльных товарах отсутствуют</p>
            )}
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-semibold flex items-center mb-2">
            <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
            <span>Убыточные товары</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
            {unprofitableProducts && unprofitableProducts.length > 0 ? unprofitableProducts.slice(0, 4).map((product, index) => (
              <div key={`loss-${index}`} className="flex items-start gap-3 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/20">
                <div className="flex-shrink-0 w-12 h-12 rounded-md bg-white dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium truncate mb-0.5">{product.name}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Цена: {product.price}</span>
                    <span className="text-red-600 dark:text-red-400">Прибыль: {product.profit}</span>
                    {product.margin && <span className="text-blue-600 dark:text-blue-400">Маржа: {product.margin}%</span>}
                    {product.returnCount && <span className="text-orange-600 dark:text-orange-400">Возвраты: {product.returnCount}</span>}
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 col-span-full py-4 text-center">Данных о убыточных товарах нет</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;

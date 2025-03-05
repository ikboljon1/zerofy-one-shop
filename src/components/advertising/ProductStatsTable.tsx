
import { ProductStats } from "@/services/advertisingApi";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

export interface ProductStatsTableProps {
  products: ProductStats[];
}

const ProductStatsTable = ({ products }: ProductStatsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name?.toLowerCase().includes(term) || 
      product.nmId.toString().includes(term)
    );
  }, [products, searchTerm]);

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 bg-white dark:bg-gray-800 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Поиск по названию или ID товара"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-50 dark:bg-gray-900"
            />
          </div>
        </div>
        
        <ScrollArea className="h-[400px] overflow-auto w-full">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
              <TableRow>
                <TableHead className="w-[200px]">Товар</TableHead>
                <TableHead className="text-right">Показы</TableHead>
                <TableHead className="text-right">Клики</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">CPC</TableHead>
                <TableHead className="text-right">Затраты</TableHead>
                <TableHead className="text-right">Корзина</TableHead>
                <TableHead className="text-right">Заказы</TableHead>
                <TableHead className="text-right">CR</TableHead>
                <TableHead className="text-right">Продано</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, i) => (
                  <TableRow key={`${product.nmId}-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="truncate max-w-[180px]" title={product.name || 'Без названия'}>
                          {product.name || 'Без названия'}
                        </span>
                        <span className="text-xs text-gray-500">ID: {product.nmId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{product.views.toLocaleString('ru-RU')}</TableCell>
                    <TableCell className="text-right">{product.clicks.toLocaleString('ru-RU')}</TableCell>
                    <TableCell className="text-right">{product.ctr.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{product.cpc.toFixed(2)} ₽</TableCell>
                    <TableCell className="text-right">{product.sum.toLocaleString('ru-RU')} ₽</TableCell>
                    <TableCell className="text-right">{product.atbs.toLocaleString('ru-RU')}</TableCell>
                    <TableCell className="text-right">{product.orders.toLocaleString('ru-RU')}</TableCell>
                    <TableCell className="text-right">{product.cr.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{product.shks.toLocaleString('ru-RU')}</TableCell>
                    <TableCell className="text-right">{product.sum_price.toLocaleString('ru-RU')} ₽</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="h-32 text-center">
                    {searchTerm ? "Товары не найдены" : "Нет данных по товарам"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ProductStatsTable;

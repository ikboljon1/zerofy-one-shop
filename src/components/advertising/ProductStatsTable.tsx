
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductStats } from "@/services/advertisingApi";
import { Card } from "../ui/card";
import { Package, TrendingUp, Eye, MousePointerClick, ShoppingCart } from "lucide-react";

interface ProductStatsTableProps {
  products: ProductStats[];
}

const ProductStatsTable = ({ products }: ProductStatsTableProps) => {
  if (!products || products.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Нет данных о товарах</h3>
          <p className="text-sm text-muted-foreground">
            В этой рекламной кампании пока нет статистики по товарам
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-xl rounded-3xl">
      <div className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <Package className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
          Статистика по товарам
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-indigo-50 dark:bg-indigo-950/30">
            <TableRow>
              <TableHead className="w-[300px]">Название товара</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Eye className="h-4 w-4" />
                  <span>Показы</span>
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <MousePointerClick className="h-4 w-4" />
                  <span>Клики</span>
                </div>
              </TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Корзина</span>
                </div>
              </TableHead>
              <TableHead className="text-right">Заказы</TableHead>
              <TableHead className="text-right">CR</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Затраты</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-indigo-100 dark:divide-indigo-900/20">
            {products.map((product, index) => (
              <TableRow key={index} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300 px-2 py-1 rounded">
                      {product.nmId}
                    </span>
                    <span>{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{product.views.toLocaleString('ru-RU')}</TableCell>
                <TableCell className="text-right">{product.clicks.toLocaleString('ru-RU')}</TableCell>
                <TableCell className="text-right">{product.ctr.toFixed(2)}%</TableCell>
                <TableCell className="text-right">{product.cpc.toFixed(2)} ₽</TableCell>
                <TableCell className="text-right">{product.atbs.toLocaleString('ru-RU')}</TableCell>
                <TableCell className="text-right">{product.orders.toLocaleString('ru-RU')}</TableCell>
                <TableCell className="text-right">{product.cr.toFixed(2)}%</TableCell>
                <TableCell className="text-right">{product.sum.toLocaleString('ru-RU')} ₽</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ProductStatsTable;

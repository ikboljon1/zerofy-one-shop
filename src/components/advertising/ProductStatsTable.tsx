
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductStats } from "@/services/advertisingApi";
import { Card } from "../ui/card";
import { Package, TrendingUp, Eye, MousePointerClick, ShoppingCart, ExternalLink, Info, Tag } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface ProductStatsTableProps {
  productStats: ProductStats[];
  loading?: boolean;
  showProgressBar?: boolean;
}

const ProductStatsTable = ({ productStats, loading, showProgressBar }: ProductStatsTableProps) => {
  if (loading || !productStats || productStats.length === 0) {
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

  const ProductInfoCard = ({ product }: { product: ProductStats }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-indigo-100 dark:border-indigo-900/30">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-5 w-5 text-indigo-500" />
        <h4 className="text-lg font-semibold">{product.name}</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Артикул WB:</span>
            <span className="font-medium">{product.nmId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Показы:</span>
            <span className="font-medium">{(product.views || product.shows || 0).toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Клики:</span>
            <span className="font-medium">{product.clicks.toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">CTR:</span>
            <span className="font-medium">{product.ctr.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Стоимость клика (CPC):</span>
            <span className="font-medium">{product.cpc.toFixed(2)} ₽</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Добавлено в корзину:</span>
            <span className="font-medium">{(product.atbs || 0).toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Заказы:</span>
            <span className="font-medium">{product.orders.toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Конверсия (CR):</span>
            <span className="font-medium">{product.cr.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Продано шт.:</span>
            <span className="font-medium">{(product.shks || 0).toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Сумма заказов:</span>
            <span className="font-medium">{(product.sum_price || 0).toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div>
          <div className="text-sm font-semibold">Затраты на рекламу:</div>
          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            {(product.cost || product.sum || 0).toLocaleString('ru-RU')} ₽
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          className="border-indigo-500 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
          onClick={() => window.open(`https://www.wildberries.ru/catalog/${product.nmId}/detail.aspx`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Открыть товар
        </Button>
      </div>
    </div>
  );

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
              <TableHead className="text-center">Подробно</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-indigo-100 dark:divide-indigo-900/20">
            {productStats.map((product, index) => (
              <TableRow key={index} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-800/30 dark:text-indigo-300 px-2 py-1 rounded">
                      {product.nmId}
                    </span>
                    <span className="line-clamp-1">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{(product.views || product.shows || 0).toLocaleString('ru-RU')}</TableCell>
                <TableCell className="text-right">{product.clicks.toLocaleString('ru-RU')}</TableCell>
                <TableCell className="text-right">{product.ctr.toFixed(2)}%</TableCell>
                <TableCell className="text-right">{product.cpc.toFixed(2)} ₽</TableCell>
                <TableCell className="text-right">{(product.atbs || 0).toLocaleString('ru-RU')}</TableCell>
                <TableCell className="text-right">{product.orders.toLocaleString('ru-RU')}</TableCell>
                <TableCell className="text-right">{product.cr.toFixed(2)}%</TableCell>
                <TableCell className="text-right">{(product.cost || product.sum || 0).toLocaleString('ru-RU')} ₽</TableCell>
                <TableCell className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/30"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Информация о товаре</DialogTitle>
                        <DialogDescription>
                          Подробная информация о рекламе товара
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <ProductInfoCard product={product} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default ProductStatsTable;

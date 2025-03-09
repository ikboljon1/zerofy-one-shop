
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Package, ArrowUpDown, RefreshCw, AlertTriangle } from "lucide-react";
import { WildberriesOrder } from "@/types/store";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatCurrency";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface OrdersTableProps {
  orders: WildberriesOrder[];
  title?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  title = "Заказы", 
  isLoading = false,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof WildberriesOrder>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof WildberriesOrder) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredOrders = orders.filter(order => 
    order.supplierArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.srid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valueA: any = a[sortField];
    let valueB: any = b[sortField];

    // Преобразование дат для правильной сортировки
    if (sortField === "date" || sortField === "lastChangeDate") {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }

    // Преобразование числовых строк для правильной сортировки
    if (typeof valueA === "string" && !isNaN(Number(valueA))) {
      valueA = Number(valueA);
    }
    if (typeof valueB === "string" && !isNaN(Number(valueB))) {
      valueB = Number(valueB);
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const formatDate = (dateString: string) => {
    try {
      if (!dateString || dateString === "0001-01-01T00:00:00") return "-";
      return format(new Date(dateString), "dd MMM yyyy", { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {orders.length > 0 ? `Всего заказов: ${orders.length}` : "Данные не загружены"}
        </CardDescription>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск заказов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 && (
          <Alert className="mb-4 bg-yellow-900/20 border-yellow-800/30 text-yellow-300">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              Данные о заказах не загружены. Проверьте, что:
              <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                <li>Выбран правильный магазин в разделе "Магазины"</li>
                <li>Настроен API ключ для выбранного магазина</li>
                <li>Выбран подходящий период для анализа</li>
              </ol>
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 text-yellow-300 border-yellow-800/50 hover:bg-yellow-900/20" 
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Обновить данные
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("date")}
                    className="flex items-center px-0"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Дата
                    {sortField === "date" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("supplierArticle")}
                    className="flex items-center px-0"
                  >
                    Артикул
                    {sortField === "supplierArticle" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Предмет</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("priceWithDisc")}
                    className="flex items-center px-0"
                  >
                    Цена (со скидкой)
                    {sortField === "priceWithDisc" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Склад</TableHead>
                <TableHead>Регион</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order, index) => (
                  <TableRow key={order.srid || index}>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell>{order.supplierArticle}</TableCell>
                    <TableCell>{order.category}</TableCell>
                    <TableCell>{order.subject}</TableCell>
                    <TableCell>{formatCurrency(order.priceWithDisc)} ₽</TableCell>
                    <TableCell>{order.warehouseName}</TableCell>
                    <TableCell>{order.regionName}</TableCell>
                    <TableCell>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                        order.isCancel 
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300" 
                          : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      }`}>
                        {order.isCancel ? 'Отменен' : 'Активен'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {isLoading 
                      ? "Загрузка данных..." 
                      : (searchTerm ? "Заказы не найдены" : "Заказов нет")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;

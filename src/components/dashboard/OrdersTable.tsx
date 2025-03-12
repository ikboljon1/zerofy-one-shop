
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Package, ArrowUpDown } from "lucide-react";
import { WildberriesOrder } from "@/types/store";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatCurrency";

interface OrdersTableProps {
  orders: WildberriesOrder[];
  title?: string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, title = "Заказы" }) => {
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
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/60 dark:from-gray-900 dark:to-indigo-950/40 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-indigo-100/30 dark:border-indigo-800/20">
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100/80 dark:bg-indigo-900/30">
            <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700 dark:from-indigo-400 dark:to-violet-400 text-2xl font-bold">
            {title}
          </span>
        </CardTitle>
        <CardDescription className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70">
          Всего заказов: <span className="font-bold">{orders.length}</span>
        </CardDescription>
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500/70 dark:text-indigo-400/70" />
            <Input
              placeholder="Поиск заказов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/70 dark:bg-indigo-950/30 backdrop-blur-sm border-indigo-200/50 dark:border-indigo-800/30 ring-indigo-100 dark:ring-indigo-800/20 focus:ring-2 focus:ring-indigo-200/50 dark:focus:ring-indigo-700/30 transition-all"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="rounded-lg overflow-hidden border border-indigo-100/40 dark:border-indigo-800/30 bg-white/80 dark:bg-gray-950/60 backdrop-blur-sm shadow-inner">
          <Table>
            <TableHeader>
              <TableRow className="bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30">
                <TableHead className="text-indigo-900/80 dark:text-indigo-200/90 font-medium">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("date")}
                    className="flex items-center px-1 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Дата
                    {sortField === "date" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-indigo-900/80 dark:text-indigo-200/90 font-medium">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("supplierArticle")}
                    className="flex items-center px-1 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30"
                  >
                    Артикул
                    {sortField === "supplierArticle" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-indigo-900/80 dark:text-indigo-200/90 font-medium">Категория</TableHead>
                <TableHead className="text-indigo-900/80 dark:text-indigo-200/90 font-medium">Предмет</TableHead>
                <TableHead className="text-indigo-900/80 dark:text-indigo-200/90 font-medium">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("priceWithDisc")}
                    className="flex items-center px-1 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/30"
                  >
                    Цена (со скидкой)
                    {sortField === "priceWithDisc" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-indigo-900/80 dark:text-indigo-200/90 font-medium">Склад</TableHead>
                <TableHead className="text-indigo-900/80 dark:text-indigo-200/90 font-medium">Регион</TableHead>
                <TableHead className="text-indigo-900/80 dark:text-indigo-200/90 font-medium">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.length > 0 ? (
                sortedOrders.map((order, index) => (
                  <TableRow 
                    key={order.srid || index}
                    className={`
                      ${index % 2 === 0 ? 'bg-white dark:bg-gray-900/20' : 'bg-indigo-50/30 dark:bg-indigo-950/10'} 
                      hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20 transition-colors
                    `}
                  >
                    <TableCell className="font-medium text-indigo-800 dark:text-indigo-300">{formatDate(order.date)}</TableCell>
                    <TableCell>{order.supplierArticle}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={order.category}>{order.category}</TableCell>
                    <TableCell className="max-w-[150px] truncate" title={order.subject}>{order.subject}</TableCell>
                    <TableCell className="font-semibold text-indigo-700 dark:text-indigo-300">{formatCurrency(order.priceWithDisc)} ₽</TableCell>
                    <TableCell className="max-w-[120px] truncate" title={order.warehouseName}>{order.warehouseName}</TableCell>
                    <TableCell className="max-w-[120px] truncate" title={order.regionName}>{order.regionName}</TableCell>
                    <TableCell>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                        order.isCancel 
                          ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200/70 dark:border-red-800/30" 
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/30"
                      }`}>
                        {order.isCancel ? 'Отменен' : 'Активен'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-10 w-10 text-indigo-300/50 dark:text-indigo-700/50" />
                      <span className="text-indigo-400 dark:text-indigo-500">
                        {searchTerm ? "Заказы не найдены" : "Заказов нет"}
                      </span>
                    </div>
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

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Package, ArrowUpDown, ChevronDown, ChevronRight, Filter, Eye, ChevronLeft, ChevronsLeft, ChevronsRight } from "lucide-react";
import { WildberriesOrder } from "@/types/store";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface OrdersTableProps {
  orders: WildberriesOrder[];
  title?: string;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, title = "Заказы" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof WildberriesOrder>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const handleSort = (field: keyof WildberriesOrder) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleOrderExpand = (srid: string) => {
    setExpandedOrder(expandedOrder === srid ? null : srid);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (
      order.supplierArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.srid.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = statusFilter.length === 0 || 
      (statusFilter.includes("active") && !order.isCancel) ||
      (statusFilter.includes("canceled") && order.isCancel);

    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valueA: any = a[sortField];
    let valueB: any = b[sortField];

    if (sortField === "date" || sortField === "lastChangeDate") {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }

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

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-fuchsia-50/40 dark:from-gray-900 dark:to-fuchsia-950/30 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-fuchsia-100/30 dark:border-fuchsia-800/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-100/80 dark:bg-fuchsia-900/50 shadow-inner">
              <Package className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-700 to-violet-700 dark:from-fuchsia-400 dark:to-violet-400 font-bold">
              {title}
            </span>
          </CardTitle>
          <CardDescription className="text-sm font-medium text-fuchsia-600/70 dark:text-fuchsia-300/70">
            Всего заказов: <span className="font-bold">{orders.length}</span>
          </CardDescription>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-fuchsia-500/70 dark:text-fuchsia-400/70" />
            <Input
              placeholder="Поиск заказов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/70 dark:bg-fuchsia-950/30 backdrop-blur-sm border-fuchsia-200/50 dark:border-fuchsia-800/30"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative bg-white/70 dark:bg-fuchsia-950/30 border-fuchsia-200/50 dark:border-fuchsia-800/30">
                <Filter className="h-4 w-4 text-fuchsia-500/70 dark:text-fuchsia-400/70" />
                {statusFilter.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-fuchsia-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                    {statusFilter.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52">
              <div className="space-y-2 p-1">
                <h4 className="font-medium text-sm mb-2">Фильтр по статусу</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="active-filter" 
                    checked={statusFilter.includes("active")} 
                    onCheckedChange={() => handleStatusFilterChange("active")}
                  />
                  <Label htmlFor="active-filter" className="text-sm">Активные</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canceled-filter" 
                    checked={statusFilter.includes("canceled")} 
                    onCheckedChange={() => handleStatusFilterChange("canceled")}
                  />
                  <Label htmlFor="canceled-filter" className="text-sm">Отмененные</Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="rounded-lg overflow-hidden border border-fuchsia-100/40 dark:border-fuchsia-800/30 bg-white/80 dark:bg-gray-950/60 backdrop-blur-sm shadow-inner">
          <Table>
            <TableHeader>
              <TableRow className="bg-indigo-50/80 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/30">
                <TableHead className="w-10"></TableHead>
                <TableHead>
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
                <TableHead>
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
                <TableHead>Категория</TableHead>
                <TableHead>Предмет</TableHead>
                <TableHead>
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
                <TableHead>Склад</TableHead>
                <TableHead>Регион</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-10">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order, index) => (
                  <React.Fragment key={order.srid || index}>
                    <TableRow 
                      className={`
                        ${index % 2 === 0 ? 'bg-white dark:bg-gray-900/20' : 'bg-indigo-50/30 dark:bg-indigo-950/10'} 
                        hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer
                      `}
                    >
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleOrderExpand(order.srid)}>
                          {expandedOrder === order.srid ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium text-indigo-800 dark:text-indigo-300">{formatDate(order.date)}</TableCell>
                      <TableCell>{order.supplierArticle}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={order.category}>{order.category}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={order.subject}>{order.subject}</TableCell>
                      <TableCell className="font-semibold text-indigo-700 dark:text-indigo-300">{formatCurrency(order.priceWithDisc)} ₽</TableCell>
                      <TableCell className="max-w-[120px] truncate" title={order.warehouseName}>{order.warehouseName}</TableCell>
                      <TableCell className="max-w-[120px] truncate" title={order.regionName}>{order.regionName}</TableCell>
                      <TableCell>
                        <Badge variant={order.isCancel ? "destructive" : "success"} className="font-normal">
                          {order.isCancel ? 'Отменен' : 'Активен'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Подробнее">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {expandedOrder === order.srid && (
                      <TableRow className="bg-indigo-50/50 dark:bg-indigo-950/20">
                        <TableCell colSpan={10} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Общая информация</h4>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <div className="text-muted-foreground">ID заказа:</div>
                                <div className="font-medium">{order.srid}</div>
                                <div className="text-muted-foreground">Штрих-код:</div>
                                <div className="font-medium">{order.barcode}</div>
                                <div className="text-muted-foreground">Бренд:</div>
                                <div className="font-medium">{order.brand}</div>
                                <div className="text-muted-foreground">Размер:</div>
                                <div className="font-medium">{order.techSize || "Не указан"}</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Информация о цене</h4>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <div className="text-muted-foreground">Полная цена:</div>
                                <div className="font-medium">{formatCurrency(order.totalPrice)} ₽</div>
                                <div className="text-muted-foreground">Скидка:</div>
                                <div className="font-medium">{order.discountPercent}%</div>
                                <div className="text-muted-foreground">Финальная цена:</div>
                                <div className="font-medium">{formatCurrency(order.finishedPrice)} ₽</div>
                                <div className="text-muted-foreground">С учетом скидки:</div>
                                <div className="font-medium">{formatCurrency(order.priceWithDisc)} ₽</div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Информация о доставке</h4>
                              <div className="grid grid-cols-2 gap-1 text-xs">
                                <div className="text-muted-foreground">Дата изменения:</div>
                                <div className="font-medium">{formatDate(order.lastChangeDate)}</div>
                                <div className="text-muted-foreground">Страна:</div>
                                <div className="font-medium">{order.countryName}</div>
                                <div className="text-muted-foreground">Область/Округ:</div>
                                <div className="font-medium">{order.oblastOkrugName}</div>
                                <div className="text-muted-foreground">Тип склада:</div>
                                <div className="font-medium">{order.warehouseType}</div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-10 w-10 text-indigo-300/50 dark:text-indigo-700/50" />
                      <span className="text-indigo-400 dark:text-indigo-500">
                        {searchTerm || statusFilter.length > 0 ? "Заказы не найдены" : "Заказов нет"}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {sortedOrders.length > ordersPerPage && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-fuchsia-100/40 dark:border-fuchsia-800/30 bg-white/50 dark:bg-gray-950/30">
              <div className="text-sm text-fuchsia-600/80 dark:text-fuchsia-300/80">
                Показано {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, sortedOrders.length)} из {sortedOrders.length} заказов
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => goToPage(1)} 
                  disabled={currentPage === 1}
                  className="h-8 w-8 border-fuchsia-200/50 dark:border-fuchsia-800/30"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="h-8 w-8 border-fuchsia-200/50 dark:border-fuchsia-800/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-3 py-1 rounded-md bg-fuchsia-100/50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-300">
                  {currentPage} из {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 border-fuchsia-200/50 dark:border-fuchsia-800/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => goToPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 border-fuchsia-200/50 dark:border-fuchsia-800/30"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;

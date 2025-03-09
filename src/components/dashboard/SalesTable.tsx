
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, ShoppingBag, ArrowUpDown, PackageX, RefreshCw, AlertTriangle } from "lucide-react";
import { WildberriesSale } from "@/types/store";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatCurrency";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SalesTableProps {
  sales: WildberriesSale[];
  title?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const SalesTable: React.FC<SalesTableProps> = ({ 
  sales, 
  title = "Продажи", 
  isLoading = false,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof WildberriesSale>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: keyof WildberriesSale) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredSales = sales.filter(sale => 
    sale.supplierArticle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.saleID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.srid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedSales = [...filteredSales].sort((a, b) => {
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
      if (!dateString) return "-";
      return format(new Date(dateString), "dd MMM yyyy", { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  const isReturn = (sale: WildberriesSale) => sale.priceWithDisc < 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingBag className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {sales.length > 0 ? `Всего продаж: ${sales.length}` : "Данные не загружены"}
        </CardDescription>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск продаж..."
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
        {sales.length === 0 && (
          <Alert className="mb-4 bg-yellow-900/20 border-yellow-800/30 text-yellow-300">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              Данные о продажах не загружены. Проверьте, что:
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
                <TableHead>ID Продажи</TableHead>
                <TableHead>Категория</TableHead>
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
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort("forPay")}
                    className="flex items-center px-0"
                  >
                    К перечислению
                    {sortField === "forPay" && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Склад</TableHead>
                <TableHead>Регион</TableHead>
                <TableHead>Тип</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSales.length > 0 ? (
                sortedSales.map((sale, index) => (
                  <TableRow 
                    key={sale.saleID || index}
                    className={isReturn(sale) ? "bg-red-50 dark:bg-red-950/20" : ""}
                  >
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell>{sale.supplierArticle}</TableCell>
                    <TableCell>{sale.saleID}</TableCell>
                    <TableCell>{sale.category}</TableCell>
                    <TableCell className={isReturn(sale) ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                      {formatCurrency(sale.priceWithDisc)} ₽
                    </TableCell>
                    <TableCell className={isReturn(sale) ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                      {formatCurrency(sale.forPay)} ₽
                    </TableCell>
                    <TableCell>{sale.warehouseName}</TableCell>
                    <TableCell>{sale.regionName}</TableCell>
                    <TableCell>
                      {isReturn(sale) ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-full text-xs font-medium">
                          <PackageX className="h-3 w-3" />
                          <span>Возврат</span>
                        </div>
                      ) : (
                        <div className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                          Продажа
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    {isLoading 
                      ? "Загрузка данных..." 
                      : (searchTerm ? "Продажи не найдены" : "Продаж нет")}
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

export default SalesTable;

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, ShoppingBag, ArrowUpDown, PackageX } from "lucide-react";
import { WildberriesSale } from "@/types/store";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatCurrency";

interface SalesTableProps {
  sales: WildberriesSale[];
  title?: string;
}

const SalesTable: React.FC<SalesTableProps> = ({ sales, title = "Продажи" }) => {
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
          Всего продаж: {sales.length}
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
        </div>
      </CardHeader>
      <CardContent>
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
                    {searchTerm ? "Продажи не найдены" : "Продаж нет"}
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


import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingBag, ArrowUp, ArrowDown, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSelectedStore } from "@/utils/storeUtils";

interface DailySalesData {
  nmId: number;
  vendorCode: string;
  brand: string;
  subject: string;
  averageSales: number;
  totalSales: number;
  daysCount: number;
}

const AverageSalesTable = () => {
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<DailySalesData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState<keyof DailySalesData>("averageSales");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAverageSalesData = async () => {
    setIsLoading(true);
    try {
      const selectedStore = getSelectedStore();
      if (!selectedStore) {
        toast({
          title: "Ошибка",
          description: "Не выбран магазин",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Получаем данные о продажах из localStorage
      const salesKey = `marketplace_sales_${selectedStore.id}`;
      const salesData = localStorage.getItem(salesKey);
      
      if (!salesData) {
        toast({
          title: "Ошибка",
          description: "Данные о продажах не найдены",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const sales = JSON.parse(salesData);
      const salesByNmId: Record<number, DailySalesData> = {};
      
      // Группируем продажи по nmId
      sales.forEach((sale: any) => {
        const nmId = sale.nmId;
        if (!nmId) return;
        
        if (!salesByNmId[nmId]) {
          salesByNmId[nmId] = {
            nmId,
            vendorCode: sale.supplierArticle || "Неизвестно",
            brand: sale.brand || "Неизвестно",
            subject: sale.subject || "Неизвестно",
            totalSales: 0,
            daysCount: 0,
            averageSales: 0
          };
        }
        
        // Считаем количество продаж (не возвраты)
        if (!sale.isReturn) {
          salesByNmId[nmId].totalSales += 1;
        }
      });
      
      // Получаем уникальные даты продаж для расчёта количества дней
      const uniqueDates = new Set(sales.map((sale: any) => sale.date.split('T')[0]));
      const daysCount = uniqueDates.size || 1; // Минимум 1 день
      
      // Вычисляем среднее количество продаж в день
      const processedData = Object.values(salesByNmId).map(item => {
        return {
          ...item,
          daysCount,
          averageSales: +(item.totalSales / daysCount).toFixed(2)
        };
      });
      
      // Сортируем данные - FIX: добавляем приведение типов для обеспечения корректного сравнения
      const sortedData = processedData.sort((a, b) => {
        const aValue = typeof a[sortField] === 'number' ? a[sortField] : 0;
        const bValue = typeof b[sortField] === 'number' ? b[sortField] : 0;
        
        if (sortDirection === "desc") {
          return Number(bValue) - Number(aValue);
        } else {
          return Number(aValue) - Number(bValue);
        }
      });
      
      setSalesData(sortedData);
      
      toast({
        title: "Успех",
        description: `Данные успешно загружены (${processedData.length} товаров)`
      });
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о продажах",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAverageSalesData();
  }, []);

  const handleSort = (field: keyof DailySalesData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: keyof DailySalesData) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  // Фильтрация данных по поисковому запросу
  const filteredData = salesData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.nmId.toString().includes(searchLower) ||
      item.vendorCode.toLowerCase().includes(searchLower) ||
      item.brand.toLowerCase().includes(searchLower) ||
      item.subject.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">
          Среднее количество продаж в день
        </CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск..."
              className="pl-8 h-9 w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAverageSalesData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Обновить'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {filteredData.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                {searchTerm ? "Нет результатов по запросу" : "Нет данных о продажах"}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("nmId")}
                      >
                        <div className="flex items-center">
                          Артикул WB {getSortIcon("nmId")}
                        </div>
                      </TableHead>
                      <TableHead>Артикул продавца</TableHead>
                      <TableHead>Бренд</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort("averageSales")}
                      >
                        <div className="flex items-center justify-end">
                          Ср. продажи/день {getSortIcon("averageSales")}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer text-right"
                        onClick={() => handleSort("totalSales")}
                      >
                        <div className="flex items-center justify-end">
                          Всего продаж {getSortIcon("totalSales")}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 50).map((item) => (
                      <TableRow key={item.nmId}>
                        <TableCell className="font-medium">{item.nmId}</TableCell>
                        <TableCell>{item.vendorCode}</TableCell>
                        <TableCell>{item.brand}</TableCell>
                        <TableCell>{item.subject}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={item.averageSales > 5 ? "success" : item.averageSales > 1 ? "warning" : "destructive"}>
                            {item.averageSales}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.totalSales}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredData.length > 50 && (
                  <div className="py-2 px-4 text-center text-sm text-muted-foreground">
                    Показано 50 из {filteredData.length} записей
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AverageSalesTable;

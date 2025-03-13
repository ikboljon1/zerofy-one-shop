import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProductSearchQueries, ProductSearchQuery } from "@/services/advertisingApi";
import { useToast } from "@/hooks/use-toast";
import { Search, ExternalLink, TrendingUp, Layers, ArrowRightLeft, ShoppingCart, BarChart4, AlertCircle, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { subDays } from 'date-fns';

interface ProductSearchQueriesProps {
  productIds: number[];
  apiKey: string;
  dateFrom?: Date;
  dateTo?: Date;
}

const ProductSearchQueries = ({ productIds, apiKey, dateFrom, dateTo }: ProductSearchQueriesProps) => {
  const [searchQueries, setSearchQueries] = useState<ProductSearchQuery[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<ProductSearchQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [sortField, setSortField] = useState<string>("text");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchData = async () => {
    if (loading || !productIds.length) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use provided dates or default to last 7 days
      const queryDateFrom = dateFrom || subDays(new Date(), 6);
      const queryDateTo = dateTo || new Date();
      
      const data = await getProductSearchQueries(
        apiKey,
        productIds,
        queryDateFrom,
        queryDateTo,
        'openToCart',
        20
      );
      
      setSearchQueries(data);
      setFilteredQueries(data);
      
      if (data.length > 0) {
        toast({
          title: "Данные получены",
          description: `Загружено ${data.length} поисковых запросов`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Нет данных",
          description: "По заданным параметрам не найдено поисковых запросов",
        });
      }
    } catch (error) {
      console.error("Error fetching product search queries:", error);
      setError(error instanceof Error ? error.message : "Произошла ошибка при загрузке данных");
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить данные о поисковых запросах",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productIds.length > 0 && apiKey) {
      fetchData();
    }
  }, [productIds, apiKey, dateFrom, dateTo]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredQueries(searchQueries);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredQueries(
        searchQueries.filter(query => 
          query.text.toLowerCase().includes(term) ||
          query.name.toLowerCase().includes(term) ||
          query.brandName.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, searchQueries]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    
    const sortedQueries = [...filteredQueries].sort((a, b) => {
      let valA: any;
      let valB: any;
      
      // Handle nested fields
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentKeyA = parent as keyof ProductSearchQuery;
        const parentObjA = a[parentKeyA];
        const parentKeyB = parent as keyof ProductSearchQuery;
        const parentObjB = b[parentKeyB];
        
        if (parentObjA && typeof parentObjA === 'object' && 'current' in parentObjA) {
          valA = parentObjA.current;
        } else {
          valA = 0;
        }
        
        if (parentObjB && typeof parentObjB === 'object' && 'current' in parentObjB) {
          valB = parentObjB.current;
        } else {
          valB = 0;
        }
      } else if (field === "text") {
        valA = a.text;
        valB = b.text;
      } else if (field === "avgPosition") {
        valA = a.avgPosition.current;
        valB = b.avgPosition.current;
      } else {
        // @ts-ignore - dynamic access
        valA = a[field];
        // @ts-ignore - dynamic access
        valB = b[field];
      }
      
      if (valA === valB) return 0;
      
      const comparison = valA > valB ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
    
    setFilteredQueries(sortedQueries);
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 inline-block">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const formatDynamics = (value: number | undefined) => {
    if (value === undefined) return <span className="text-gray-400">—</span>;
    
    const prefix = value > 0 ? "+" : "";
    const colorClass = value > 0 
      ? "text-green-600 dark:text-green-400" 
      : value < 0 
        ? "text-red-600 dark:text-red-400" 
        : "text-gray-600 dark:text-gray-400";
        
    return <span className={colorClass}>{prefix}{value}%</span>;
  };

  const getPositionColorClass = (position: number) => {
    if (position <= 10) return "text-green-600 dark:text-green-400 font-medium";
    if (position <= 30) return "text-amber-600 dark:text-amber-400 font-medium";
    if (position <= 50) return "text-orange-600 dark:text-orange-400 font-medium";
    return "text-red-600 dark:text-red-400 font-medium";
  };

  const getPercentileColorClass = (percentile: number) => {
    if (percentile >= 75) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    if (percentile >= 50) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    if (percentile >= 25) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-300">Ошибка при загрузке данных</h3>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 bg-white dark:bg-gray-800"
              onClick={fetchData}
              disabled={loading}
            >
              Повторить запрос
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Поиск по запросам, товарам, брендам..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-2 py-1 h-8 text-sm"
          />
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="h-8 px-2 text-xs"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin mr-1"></div>
              Загрузка...
            </>
          ) : (
            <>
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Обновить
            </>
          )}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                <TableHead 
                  className="cursor-pointer py-2 px-2 text-xs"
                  onClick={() => handleSort("text")}
                >
                  Поисковый запрос {renderSortIcon("text")}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                  onClick={() => handleSort("avgPosition")}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-end">
                          Позиция {renderSortIcon("avgPosition")}
                          <ChevronsUpDown className="ml-1 h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Средняя позиция товара в результатах поиска</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                  onClick={() => handleSort("frequency.current")}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-end">
                          Запросы {renderSortIcon("frequency.current")}
                          <Layers className="ml-1 h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Количество обращений с этим поисковым запросом</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                  onClick={() => handleSort("openCard.current")}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-end">
                          Клики {renderSortIcon("openCard.current")}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Количество переходов в карточку товара из поиска</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                  onClick={() => handleSort("openToCart.current")}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-end">
                          CTR {renderSortIcon("openToCart.current")}
                          <ArrowRightLeft className="ml-1 h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Конверсия из поиска в корзину</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer py-2 px-2 text-xs w-16"
                  onClick={() => handleSort("orders.current")}
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-end">
                          Заказы {renderSortIcon("orders.current")}
                          <ShoppingCart className="ml-1 h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Сколько раз товары из поиска заказали</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="w-16 text-right py-2 px-2 text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center justify-end">
                          Рейтинг
                          <BarChart4 className="ml-1 h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Рейтинг выше конкурентов по показателю конверсии в корзину</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueries.length > 0 ? (
                filteredQueries.map((query, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/20">
                    <TableCell className="py-1.5 px-2 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium truncate max-w-[180px]" title={query.text}>{query.text}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[180px]" title={query.name}>{query.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 px-2 text-right">
                      <div className="flex flex-col items-end">
                        <span className={getPositionColorClass(query.avgPosition.current)}>
                          {query.avgPosition.current}
                        </span>
                        {query.avgPosition.dynamics !== undefined && (
                          <span className="text-xs">{formatDynamics(query.avgPosition.dynamics)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 px-2 text-right">
                      <div className="flex flex-col items-end">
                        <span>{query.frequency.current.toLocaleString('ru-RU')}</span>
                        {query.frequency.dynamics !== undefined && (
                          <span className="text-xs">{formatDynamics(query.frequency.dynamics)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 px-2 text-right">
                      <div className="flex flex-col items-end">
                        <span>{query.openCard.current.toLocaleString('ru-RU')}</span>
                        {query.openCard.dynamics !== undefined && (
                          <span className="text-xs">{formatDynamics(query.openCard.dynamics)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 px-2 text-right">
                      <div className="flex flex-col items-end">
                        <span>{query.openToCart.current}%</span>
                        {query.openToCart.dynamics !== undefined && (
                          <span className="text-xs">{formatDynamics(query.openToCart.dynamics)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 px-2 text-right">
                      <div className="flex flex-col items-end">
                        <span>{query.orders.current.toLocaleString('ru-RU')}</span>
                        {query.orders.dynamics !== undefined && (
                          <span className="text-xs">{formatDynamics(query.orders.dynamics)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 px-2 text-right">
                      <Badge 
                        variant="outline" 
                        className={`${getPercentileColorClass(query.openToCart.percentile)}`}
                      >
                        +{query.openToCart.percentile}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-20 text-center">
                    {loading ? (
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                      </div>
                    ) : searchTerm ? (
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-6 w-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Ничего не найдено по запросу "{searchTerm}"</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Нет данных о поисковых запросах</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ProductSearchQueries;

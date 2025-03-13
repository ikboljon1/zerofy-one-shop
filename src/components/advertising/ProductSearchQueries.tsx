
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProductSearchQueries, ProductSearchQuery } from "@/services/advertisingApi";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";
import { Search, Tag, Clock, BarChart2, Eye, MousePointerClick, PercentIcon, ShoppingCart, PackageCheck, Filter, ArrowDown, ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import DateRangePicker from "@/components/analytics/components/DateRangePicker";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSearchQueriesProps {
  apiKey: string;
  productIds: number[];
}

const ProductSearchQueries = ({ apiKey, productIds }: ProductSearchQueriesProps) => {
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 6));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [searchQueries, setSearchQueries] = useState<ProductSearchQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("avgPosition");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<'openCard' | 'addToCart' | 'openToCart' | 'orders' | 'cartToOrder'>('openToCart');
  const { toast } = useToast();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const filteredQueries = searchQueries.filter(
    query => query.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const fetchSearchQueries = async () => {
    if (!apiKey || !productIds.length) {
      toast({
        title: "Ошибка",
        description: "Не указан API ключ или ID товаров",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await getProductSearchQueries(apiKey, productIds, dateFrom, dateTo, sortBy, 20);
      setSearchQueries(data);
      setLastUpdate(new Date().toISOString());
      
      if (data.length > 0) {
        toast({
          title: "Данные обновлены",
          description: `Загружено ${data.length} поисковых запросов`,
        });
      } else {
        toast({
          title: "Нет данных",
          description: "За указанный период не найдено поисковых запросов для выбранных товаров",
        });
      }
    } catch (error) {
      console.error('Error fetching search queries:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить поисковые запросы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = () => {
    fetchSearchQueries();
  };

  const handleSortByChange = (value: 'openCard' | 'addToCart' | 'openToCart' | 'orders' | 'cartToOrder') => {
    setSortBy(value);
    fetchSearchQueries();
  };

  useEffect(() => {
    if (apiKey && productIds.length > 0) {
      fetchSearchQueries();
    }
  }, [apiKey, productIds]);

  const sortedQueries = [...filteredQueries].sort((a, b) => {
    let valA, valB;
    
    switch (sortField) {
      case "avgPosition":
        valA = a.avgPosition.current;
        valB = b.avgPosition.current;
        break;
      case "medianPosition":
        valA = a.medianPosition.current;
        valB = b.medianPosition.current;
        break;
      case "frequency":
        valA = a.frequency.current;
        valB = b.frequency.current;
        break;
      case "openCard":
        valA = a.openCard.current;
        valB = b.openCard.current;
        break;
      case "addToCart":
        valA = a.addToCart.current;
        valB = b.addToCart.current;
        break;
      case "orders":
        valA = a.orders.current;
        valB = b.orders.current;
        break;
      case "openToCart":
        valA = a.openToCart.current;
        valB = b.openToCart.current;
        break;
      case "cartToOrder":
        valA = a.cartToOrder.current;
        valB = b.cartToOrder.current;
        break;
      default:
        valA = a.text;
        valB = b.text;
    }
    
    if (sortDirection === "asc") {
      return valA > valB ? 1 : -1;
    } else {
      return valA < valB ? 1 : -1;
    }
  });

  const getColorForPosition = (position: number) => {
    if (position <= 10) return "text-green-600 dark:text-green-400 font-medium";
    if (position <= 30) return "text-yellow-600 dark:text-yellow-400 font-medium";
    return "text-red-600 dark:text-red-400 font-medium";
  };

  const getDynamicsIcon = (dynamics?: number) => {
    if (!dynamics) return null;
    if (dynamics > 0) return <ArrowUp className="h-3.5 w-3.5 text-green-500" />;
    if (dynamics < 0) return <ArrowDown className="h-3.5 w-3.5 text-red-500" />;
    return null;
  };

  const getDynamicsClass = (dynamics?: number) => {
    if (!dynamics) return "";
    if (dynamics > 0) return "text-green-600 dark:text-green-400";
    if (dynamics < 0) return "text-red-600 dark:text-red-400";
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Поисковые запросы по товарам</h2>
        <div className="text-xs text-gray-500">
          Обновлено: {lastUpdate ? format(new Date(lastUpdate), 'dd.MM.yyyy HH:mm') : 'Никогда'}
        </div>
      </div>

      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <DateRangePicker 
                dateFrom={dateFrom}
                dateTo={dateTo}
                setDateFrom={setDateFrom}
                setDateTo={setDateTo}
                onUpdate={handleDateChange}
              />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex-shrink-0">
                  <Select
                    defaultValue={sortBy}
                    onValueChange={(value: any) => handleSortByChange(value)}
                  >
                    <SelectTrigger className="w-[180px] h-9 text-xs">
                      <SelectValue placeholder="Сортировка по" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openCard">Переходы в карточку</SelectItem>
                      <SelectItem value="addToCart">Добавления в корзину</SelectItem>
                      <SelectItem value="openToCart">Конверсия в корзину</SelectItem>
                      <SelectItem value="orders">Заказы</SelectItem>
                      <SelectItem value="cartToOrder">Конверсия в заказ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Поиск по запросам..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-8 pr-2 h-9 text-xs"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchSearchQueries}
                  disabled={loading}
                  className="h-9 px-2 text-xs"
                >
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Обновить
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                    <TableHead 
                      className="cursor-pointer text-xs"
                      onClick={() => handleSortChange("text")}
                    >
                      Поисковый запрос 
                      {sortField === "text" && 
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      }
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right text-xs"
                      onClick={() => handleSortChange("avgPosition")}
                    >
                      Ср. позиция 
                      {sortField === "avgPosition" && 
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      }
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right text-xs"
                      onClick={() => handleSortChange("medianPosition")}
                    >
                      Мед. позиция
                      {sortField === "medianPosition" && 
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      }
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right text-xs"
                      onClick={() => handleSortChange("frequency")}
                    >
                      Частота 
                      {sortField === "frequency" && 
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      }
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right text-xs"
                      onClick={() => handleSortChange("openCard")}
                    >
                      Переходы 
                      {sortField === "openCard" && 
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      }
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right text-xs"
                      onClick={() => handleSortChange("addToCart")}
                    >
                      В корзину 
                      {sortField === "addToCart" && 
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      }
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer text-right text-xs"
                      onClick={() => handleSortChange("openToCart")}
                    >
                      Конв. в корзину 
                      {sortField === "openToCart" && 
                        <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      }
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : sortedQueries.length > 0 ? (
                    sortedQueries.map((query, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm font-medium truncate max-w-[200px]" title={query.text}>
                          {query.text}
                        </TableCell>
                        <TableCell className={`text-right text-sm ${getColorForPosition(query.avgPosition.current)}`}>
                          {query.avgPosition.current}
                          <span className="ml-1 inline-flex items-center">
                            {getDynamicsIcon(query.avgPosition.dynamics)}
                          </span>
                        </TableCell>
                        <TableCell className={`text-right text-sm ${getColorForPosition(query.medianPosition.current)}`}>
                          {query.medianPosition.current}
                          <span className="ml-1 inline-flex items-center">
                            {getDynamicsIcon(query.medianPosition.dynamics)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {query.frequency.current.toLocaleString('ru-RU')}
                          <span className={`ml-1 text-xs ${getDynamicsClass(query.frequency.dynamics)}`}>
                            {query.frequency.dynamics ? `${query.frequency.dynamics > 0 ? '+' : ''}${query.frequency.dynamics}%` : ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {query.openCard.current.toLocaleString('ru-RU')}
                          <span className={`ml-1 text-xs ${getDynamicsClass(query.openCard.dynamics)}`}>
                            {query.openCard.dynamics ? `${query.openCard.dynamics > 0 ? '+' : ''}${query.openCard.dynamics}%` : ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {query.addToCart.current.toLocaleString('ru-RU')}
                          <span className={`ml-1 text-xs ${getDynamicsClass(query.addToCart.dynamics)}`}>
                            {query.addToCart.dynamics ? `${query.addToCart.dynamics > 0 ? '+' : ''}${query.addToCart.dynamics}%` : ''}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {query.openToCart.current}%
                          <span className={`ml-1 text-xs ${getDynamicsClass(query.openToCart.dynamics)}`}>
                            {query.openToCart.dynamics ? `${query.openToCart.dynamics > 0 ? '+' : ''}${query.openToCart.dynamics}%` : ''}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Tag className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-500 mb-1">Нет данных о поисковых запросах</p>
                          <p className="text-xs text-gray-400">Выберите период и нажмите "Обновить"</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductSearchQueries;

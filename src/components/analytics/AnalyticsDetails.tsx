
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const AnalyticsDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    
    // Имитация загрузки данных
    setTimeout(() => {
      setData({
        topProducts: [
          { id: 1, name: "Футболка Classic XL", sku: "TS-1245", sales: 183, price: 1290, revenue: 236070, growth: 12.5 },
          { id: 2, name: "Джинсы Urban Slim", sku: "JN-0987", sales: 145, price: 2490, revenue: 361050, growth: 8.7 },
          { id: 3, name: "Кроссовки Runner Pro", sku: "SH-5678", sales: 98, price: 3990, revenue: 391020, growth: 15.3 },
          { id: 4, name: "Куртка Winter", sku: "JK-4321", sales: 67, price: 5490, revenue: 367830, growth: -2.1 },
          { id: 5, name: "Шапка Warm", sku: "HA-8765", sales: 120, price: 790, revenue: 94800, growth: 5.6 }
        ],
        topRegions: [
          { id: 1, name: "Москва", orders: 432, revenue: 578900, growth: 14.2 },
          { id: 2, name: "Санкт-Петербург", orders: 321, revenue: 425300, growth: 9.8 },
          { id: 3, name: "Екатеринбург", orders: 187, revenue: 234500, growth: 7.3 },
          { id: 4, name: "Новосибирск", orders: 145, revenue: 198700, growth: 11.2 },
          { id: 5, name: "Казань", orders: 132, revenue: 176500, growth: -3.5 }
        ]
      });
      setIsLoading(false);
    }, 1500);
  };

  const handleRefresh = () => {
    fetchData();
    toast({
      title: "Обновление данных",
      description: "Данные аналитики обновлены"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Детальная информация</h2>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Обновление...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить данные
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Топ продаваемых товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={isMobile ? "overflow-auto" : ""}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Товар</TableHead>
                      <TableHead>Артикул</TableHead>
                      <TableHead className="text-right">Продажи</TableHead>
                      <TableHead className="text-right">Цена</TableHead>
                      <TableHead className="text-right">Выручка</TableHead>
                      <TableHead className="text-right">Рост</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topProducts.map((product: any) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell className="text-right">{product.sales}</TableCell>
                        <TableCell className="text-right">{product.price.toLocaleString()} ₽</TableCell>
                        <TableCell className="text-right">{product.revenue.toLocaleString()} ₽</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <span className={product.growth >= 0 ? "text-green-500" : "text-red-500"}>
                              {product.growth > 0 ? "+" : ""}{product.growth}%
                            </span>
                            {product.growth >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Топ регионов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={isMobile ? "overflow-auto" : ""}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Регион</TableHead>
                      <TableHead className="text-right">Заказы</TableHead>
                      <TableHead className="text-right">Выручка</TableHead>
                      <TableHead className="text-right">Рост</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topRegions.map((region: any) => (
                      <TableRow key={region.id}>
                        <TableCell>{region.name}</TableCell>
                        <TableCell className="text-right">{region.orders}</TableCell>
                        <TableCell className="text-right">{region.revenue.toLocaleString()} ₽</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <span className={region.growth >= 0 ? "text-green-500" : "text-red-500"}>
                              {region.growth > 0 ? "+" : ""}{region.growth}%
                            </span>
                            {region.growth >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Нет доступных данных</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDetails;

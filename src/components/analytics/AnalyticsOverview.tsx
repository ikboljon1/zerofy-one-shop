
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2, PieChart, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import Chart from "@/components/Chart";

const AnalyticsOverview = () => {
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
        revenue: {
          value: 854621,
          change: 12.5,
          isPositive: true
        },
        orders: {
          value: 1243,
          change: 8.2,
          isPositive: true
        },
        averageOrder: {
          value: 687,
          change: 3.6,
          isPositive: true
        },
        conversion: {
          value: 3.2,
          change: -0.4,
          isPositive: false
        },
        salesTrend: [
          { date: '2023-01-01', currentValue: 12000, previousValue: 10000 },
          { date: '2023-01-02', currentValue: 14000, previousValue: 11000 },
          { date: '2023-01-03', currentValue: 16000, previousValue: 12000 },
          { date: '2023-01-04', currentValue: 15000, previousValue: 13000 },
          { date: '2023-01-05', currentValue: 18000, previousValue: 14000 },
          { date: '2023-01-06', currentValue: 20000, previousValue: 15000 },
          { date: '2023-01-07', currentValue: 22000, previousValue: 16000 }
        ],
        productSales: [
          { name: "Футболки", quantity: 450 },
          { name: "Джинсы", quantity: 320 },
          { name: "Кроссовки", quantity: 280 },
          { name: "Куртки", quantity: 175 },
          { name: "Аксессуары", quantity: 230 }
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
        <h2 className="text-xl font-semibold">Общая информация</h2>
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
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                  Выручка
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.revenue.value.toLocaleString()} ₽</div>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${data.revenue.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {data.revenue.isPositive ? '+' : ''}{data.revenue.change}%
                  </span>
                  {data.revenue.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className="text-xs text-muted-foreground ml-1">vs прошлый месяц</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1 text-blue-500" />
                  Заказы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.orders.value.toLocaleString()}</div>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${data.orders.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {data.orders.isPositive ? '+' : ''}{data.orders.change}%
                  </span>
                  {data.orders.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className="text-xs text-muted-foreground ml-1">vs прошлый месяц</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-purple-500" />
                  Средний чек
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.averageOrder.value.toLocaleString()} ₽</div>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${data.averageOrder.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {data.averageOrder.isPositive ? '+' : ''}{data.averageOrder.change}%
                  </span>
                  {data.averageOrder.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className="text-xs text-muted-foreground ml-1">vs прошлый месяц</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <PieChart className="h-4 w-4 mr-1 text-orange-500" />
                  Конверсия
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.conversion.value}%</div>
                <div className="flex items-center mt-1">
                  <span className={`text-sm ${data.conversion.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {data.conversion.isPositive ? '+' : ''}{data.conversion.change}%
                  </span>
                  {data.conversion.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 ml-1" />
                  )}
                  <span className="text-xs text-muted-foreground ml-1">vs прошлый месяц</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Chart 
            salesTrend={data.salesTrend}
            productSales={data.productSales}
          />
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Нет доступных данных</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsOverview;

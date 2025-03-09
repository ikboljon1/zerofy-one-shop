import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, CircleDot, TrendingDown, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchWildberriesStats, WildberriesResponse } from "@/services/wildberriesApi";
import { useToast } from "@/hooks/use-toast";
import { subDays } from "date-fns";
import { getSelectedStore } from "@/utils/storeUtils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart,
  Bar,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';

interface DashboardData {
  current: any;
  previous: any;
  salesChartData: any[];
  productData: any[];
  returnData: any[];
  topProfitable: any[];
  topUnprofitable: any[];
  geoData: GeoData[];
  penaltyData: any[];
  deductionData: any[];
  returnChartData: any[];
  salesData: any[];
}

interface GeoData {
  region: string;
  sales: number;
}

const mapDataForDisplay = (data: WildberriesResponse): DashboardData => {
  // Создаем объект данных по периодам  
  const { currentPeriod, previousPeriod } = data;
  
  const currentExpenses = currentPeriod.expenses || { 
    total: 0, 
    logistics: 0, 
    storage: 0, 
    penalties: 0, 
    advertising: 0, 
    acceptance: 0 
  };
  
  // Добавляем acceptance в корень объекта currentPeriod для совместимости
  const currentWithAcceptance = {
    ...currentPeriod,
    acceptance: currentExpenses.acceptance // Дублируем значение для совместимости
  };
  
  // Создаем объект с данными текущего периода, соответствующий ожидаемому типу
  const current = {
    sales: currentPeriod.sales || 0,
    transferred: currentPeriod.transferred || 0,
    expenses: {
      total: currentExpenses.total,
      logistics: currentExpenses.logistics,
      storage: currentExpenses.storage,
      penalties: currentExpenses.penalties,
      advertising: currentExpenses.advertising,
      acceptance: currentExpenses.acceptance,
      deductions: currentExpenses.deductions || 0
    },
    netProfit: currentPeriod.profit,
    acceptance: currentExpenses.acceptance, // Для совместимости
    ...currentWithAcceptance
  };
  
  const previous = {
    ...previousPeriod
  };
  
  // Собираем массивы данных из различных источников
  const salesChartData = data.dailySales || [];
  const productData = data.productSales || [];
  const returnData = data.productReturns || [];
  const topProfitable = data.topProfitableProducts || [];
  const topUnprofitable = data.topUnprofitableProducts || [];
  
  // Данные для гео-графика - генерируем моковые данные
  const geoData: GeoData[] = [
    { region: 'Москва', sales: 42000 },
    { region: 'Санкт-Петербург', sales: 19500 },
    { region: 'Новосибирск', sales: 8700 },
    { region: 'Екатеринбург', sales: 7800 },
    { region: 'Казань', sales: 6400 }
  ];
  
  // Данные для графиков по категориям расходов
  const penalties = data.penaltiesData || [];
  const penaltyData = penalties.length > 0 
    ? penalties 
    : Array.from({ length: 10 }, (_, i) => ({
        date: new Date(2023, 10, i + 1).toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 500) + 100,
        reason: `Нарушение #${i+1}`
      }));
  
  const deductions = data.deductionsData || [];
  const deductionData = deductions.length > 0 
    ? deductions 
    : Array.from({ length: 10 }, (_, i) => ({
        date: new Date(2023, 10, i + 1).toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 1000) + 200,
        type: i % 2 === 0 ? "Комиссия" : "Возврат"
      }));
  
  const returns = data.productReturns || [];
  const returnChartData = returns.length > 0 
    ? returns 
    : Array.from({ length: 10 }, (_, i) => ({
        date: new Date(2023, 10, i + 1).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5,
        value: Math.floor(Math.random() * 5000) + 1000
      }));
  
  const dailySales = data.dailySales || [];
  const salesData = dailySales.length > 0 
    ? dailySales.map(item => ({
        date: item.date,
        value: item.sales,
        previousValue: item.previousSales
      })) 
    : Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - 29 + i);
        return {
          date: date.toISOString().split('T')[0],
          value: Math.floor(Math.random() * 10000) + 5000,
          previousValue: Math.floor(Math.random() * 8000) + 4000
        };
      });
  
  return {
    current,
    previous,
    salesChartData,
    productData,
    returnData,
    topProfitable,
    topUnprofitable,
    geoData,
    penaltyData,
    deductionData,
    returnChartData,
    salesData
  };
};

const AnalyticsSection = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const store = getSelectedStore();
        if (!store) {
          toast({
            title: "Ошибка",
            description: "Не выбран магазин. Пожалуйста, выберите магазин в разделе 'Магазины'.",
            variant: "destructive",
          });
          return;
        }

        const dateFrom = subDays(new Date(), 30);
        const dateTo = new Date();
        const data = await fetchWildberriesStats(store.apiKey, dateFrom, dateTo);
        const mappedData = mapDataForDisplay(data);
        setDashboardData(mappedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Загрузка...</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Загрузка...</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[200px]" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return <div>Нет данных для отображения.</div>;
  }

  const { current, previous } = dashboardData;

  const calculatePercentageChange = (currentValue: number, previousValue: number): number => {
    if (previousValue === 0) {
      return currentValue === 0 ? 0 : Infinity;
    }
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const salesChange = calculatePercentageChange(current.sales, previous.sales);
  const profitChange = calculatePercentageChange(current.netProfit, previous.profit);
  const expensesChange = calculatePercentageChange(current.expenses.total, previous.expenses.total);

  const formatPercentageChange = (change: number): string => {
    const formattedChange = Math.abs(change).toFixed(2);
    return change >= 0 ? `+${formattedChange}%` : `-${formattedChange}%`;
  };

  const getTrendingIcon = (change: number) => {
    return change >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const renderTooltipContent = (o: any) => {
    if (o && o.payload && o.payload.length > 0) {
      const data = o.payload[0].payload;
      return (
        <Card className="p-2">
          <CardContent className="p-2">
            <p className="text-sm font-medium">{new Date(data.date).toLocaleDateString()}</p>
            <p className="text-sm">
              Продажи: {data.value}
            </p>
            <p className="text-sm">
              Предыдущие продажи: {data.previousValue}
            </p>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Общие продажи</CardTitle>
            <CardContent>
              <div className="text-2xl font-semibold">{current.sales.toLocaleString()} ₽</div>
              <div className="flex items-center text-sm text-muted-foreground">
                {getTrendingIcon(salesChange)}
                <span>{formatPercentageChange(salesChange)}</span>
                <span> по сравнению с предыдущим периодом</span>
              </div>
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Чистая прибыль</CardTitle>
            <CardContent>
              <div className="text-2xl font-semibold">{current.netProfit.toLocaleString()} ₽</div>
              <div className="flex items-center text-sm text-muted-foreground">
                {getTrendingIcon(profitChange)}
                <span>{formatPercentageChange(profitChange)}</span>
                <span> по сравнению с предыдущим периодом</span>
              </div>
            </CardContent>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Общие расходы</CardTitle>
            <CardContent>
              <div className="text-2xl font-semibold">{current.expenses.total.toLocaleString()} ₽</div>
              <div className="flex items-center text-sm text-muted-foreground">
                {getTrendingIcon(expensesChange)}
                <span>{formatPercentageChange(expensesChange)}</span>
                <span> по сравнению с предыдущим периодом</span>
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика продаж за последние 30 дней</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={renderTooltipContent} />
              <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
              <Area type="monotone" dataKey="previousValue" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Топ прибыльных товаров</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Прибыль</TableHead>
                  <TableHead>Продано</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.topProfitable.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.profit} ₽</TableCell>
                    <TableCell>{product.quantitySold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ убыточных товаров</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>Убыток</TableHead>
                  <TableHead>Продано</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.topUnprofitable.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.profit} ₽</TableCell>
                    <TableCell>{product.quantitySold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Расходы по категориям</CardTitle>
        </CardHeader>
        <CardContent>
          <ComposedChart
            width={isMobile ? 400 : 800}
            height={300}
            data={dashboardData.penaltyData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" barSize={20} fill="#413ea0" />
            <Line type="monotone" dataKey="amount" stroke="#ff7300" />
          </ComposedChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Удержания по категориям</CardTitle>
        </CardHeader>
        <CardContent>
          <ComposedChart
            width={isMobile ? 400 : 800}
            height={300}
            data={dashboardData.deductionData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" barSize={20} fill="#413ea0" />
            <Line type="monotone" dataKey="amount" stroke="#ff7300" />
          </ComposedChart>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;

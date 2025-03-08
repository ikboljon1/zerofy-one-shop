import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Progress } from "./ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  Megaphone,
  Users,
  Eye,
  MousePointerClick,
  BarChart3,
  CreditCard,
  Clock,
  Search,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";
import ProductStatsTable from "./advertising/ProductStatsTable";
import { getAdvertCosts, getAdvertStats, getAdvertPayments, getAdvFullStats } from "@/services/advertisingApi";
import { ProductStats } from "@/services/advertisingApi";
import KeywordStatisticsComponent from "./advertising/KeywordStatistics";
import { formatCurrency } from "@/utils/formatCurrency";

interface CampaignDetailsProps {
  campaignId: number;
  campaignName: string;
  campaignType: string;
  apiKey: string;
  onBack: () => void;
}

interface Statistics {
  clicks: number;
  shows: number;
  orders: number;
  cpc: number;
  ctr: number;
  cr: number;
  cost: number;
}

interface Payment {
  date: string;
  amount: number;
}

interface Cost {
  date: string;
  updSum: number;
  campName: string;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  campaignId,
  campaignName,
  campaignType,
  apiKey,
  onBack
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics>({
    clicks: 0,
    shows: 0,
    orders: 0,
    cpc: 0,
    ctr: 0,
    cr: 0,
    cost: 0,
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProductStats = productStats.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [fromCalendarOpen, setFromCalendarOpen] = useState(false);
  const [toCalendarOpen, setToCalendarOpen] = useState(false);

  const loadCachedData = () => {
    const cached = JSON.parse(localStorage.getItem('adv_campaigns_cache') || '{}');
    if (cached[campaignId] && cached[campaignId].statistics) {
      const { costs, stats, payments, fullStats } = cached[campaignId].statistics;
      setCosts(costs || []);
      setPayments(payments || []);

      if (fullStats && fullStats.length > 0) {
        const totalClicks = fullStats.reduce((sum, item) => sum + item.clicks, 0);
        const totalShows = fullStats.reduce((sum, item) => sum + item.shows, 0);
        const totalOrders = fullStats.reduce((sum, item) => sum + item.orders, 0);
        const totalCost = fullStats.reduce((sum, item) => sum + item.cost, 0);

        const ctr = totalShows > 0 ? (totalClicks / totalShows) * 100 : 0;
        const cr = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
        const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;

        setStatistics({
          clicks: totalClicks,
          shows: totalShows,
          orders: totalOrders,
          cpc: cpc,
          ctr: ctr,
          cr: cr,
          cost: totalCost,
        });
      }

      if (cached[campaignId].lastUpdate) {
        setLastUpdate(cached[campaignId].lastUpdate);
      }

      if (fullStats && fullStats.length > 0) {
        const productStatsMap: { [key: string]: ProductStats } = {};

        fullStats.forEach(item => {
          const productId = item.nmId.toString();
          if (!productStatsMap[productId]) {
            productStatsMap[productId] = {
              id: item.nmId,
              name: item.name,
              clicks: 0,
              shows: 0,
              orders: 0,
              ctr: 0,
              cr: 0,
              cpc: 0,
              cost: 0,
              profit: 0,
              roi: 0,
              imageUrl: ''
            };
          }

          productStatsMap[productId].clicks += item.clicks;
          productStatsMap[productId].shows += item.shows;
          productStatsMap[productId].orders += item.orders;
          productStatsMap[productId].cost += item.cost;
          productStatsMap[productId].profit += item.profit;
          productStatsMap[productId].imageUrl = item.imageUrl;
        });

        const productStatsArray: ProductStats[] = Object.values(productStatsMap);

        productStatsArray.forEach(product => {
          product.ctr = product.shows > 0 ? (product.clicks / product.shows) * 100 : 0;
          product.cr = product.clicks > 0 ? (product.orders / product.clicks) * 100 : 0;
          product.cpc = product.clicks > 0 ? product.cost / product.clicks : 0;
          product.roi = product.cost > 0 ? (product.profit / product.cost) * 100 : 0;
        });

        setProductStats(productStatsArray);
      }

      setLoading(false);
    } else {
      fetchData();
    }
  };

  const calculateTotal = (data: any[], key: string): number => {
    return data.reduce((acc, item) => acc + (item[key] || 0), 0);
  };

  const formatNumber = (value: number): string => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [costsData, statsData, paymentsData, fullStatsData] = await Promise.all([
        getAdvertCosts(dateFrom, dateTo, apiKey),
        getAdvertStats(dateFrom, dateTo, apiKey),
        getAdvertPayments(dateFrom, dateTo, apiKey),
        getAdvFullStats(dateFrom, dateTo, apiKey)
      ]);

      setCosts(costsData || []);
      setPayments(paymentsData || []);

      if (fullStatsData && fullStatsData.length > 0) {
        const totalClicks = fullStatsData.reduce((sum, item) => sum + item.clicks, 0);
        const totalShows = fullStatsData.reduce((sum, item) => sum + item.shows, 0);
        const totalOrders = fullStatsData.reduce((sum, item) => sum + item.orders, 0);
        const totalCost = fullStatsData.reduce((sum, item) => sum + item.cost, 0);

        const ctr = totalShows > 0 ? (totalClicks / totalShows) * 100 : 0;
        const cr = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
        const cpc = totalClicks > 0 ? totalCost / totalClicks : 0;

        setStatistics({
          clicks: totalClicks,
          shows: totalShows,
          orders: totalOrders,
          cpc: cpc,
          ctr: ctr,
          cr: cr,
          cost: totalCost,
        });

        const productStatsMap: { [key: string]: ProductStats } = {};

        fullStatsData.forEach(item => {
          const productId = item.nmId.toString();
          if (!productStatsMap[productId]) {
            productStatsMap[productId] = {
              id: item.nmId,
              name: item.name,
              clicks: 0,
              shows: 0,
              orders: 0,
              ctr: 0,
              cr: 0,
              cpc: 0,
              cost: 0,
              profit: 0,
              roi: 0,
              imageUrl: ''
            };
          }

          productStatsMap[productId].clicks += item.clicks;
          productStatsMap[productId].shows += item.shows;
          productStatsMap[productId].orders += item.orders;
          productStatsMap[productId].cost += item.cost;
          productStatsMap[productId].profit += item.profit;
          productStatsMap[productId].imageUrl = item.imageUrl;
        });

        const productStatsArray: ProductStats[] = Object.values(productStatsMap);

        productStatsArray.forEach(product => {
          product.ctr = product.shows > 0 ? (product.clicks / product.shows) * 100 : 0;
          product.cr = product.clicks > 0 ? (product.orders / product.clicks) * 100 : 0;
          product.cpc = product.clicks > 0 ? product.cost / product.clicks : 0;
          product.roi = product.cost > 0 ? (product.profit / product.cost) * 100 : 0;
        });

        setProductStats(productStatsArray);
      } else {
        setStatistics({
          clicks: 0,
          shows: 0,
          orders: 0,
          cpc: 0,
          ctr: 0,
          cr: 0,
          cost: 0,
        });
        setProductStats([]);
      }

      // Save timestamp of the last update
      setLastUpdate(new Date().toISOString());
      const cached = JSON.parse(localStorage.getItem('adv_campaigns_cache') || '{}');
      localStorage.setItem('adv_campaigns_cache', JSON.stringify({
        ...cached,
        [campaignId]: {
          ...(cached[campaignId] || {}),
          lastUpdate: new Date().toISOString(),
          statistics: {
            costs: costsData,
            stats: statsData,
            payments: paymentsData,
            fullStats: fullStatsData
          }
        }
      }));

    } catch (error) {
      console.error('Error fetching campaign details:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные по кампании",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCachedData();
  }, [campaignId]);

  const getFormattedLastUpdate = () => {
    if (!lastUpdate) {
      return "Данные еще не загружались";
    }

    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();
    const diff = now.getTime() - lastUpdateDate.getTime();
    const minutes = Math.round(diff / (1000 * 60));

    if (minutes < 1) {
      return "Обновлено менее минуты назад";
    } else if (minutes < 60) {
      return `Обновлено ${minutes} минут назад`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `Обновлено ${hours} ${hours === 1 ? 'час' : 'часов'} назад`;
    }
  };

  const totalPayments = calculateTotal(payments, "amount");
  const totalCost = calculateTotal(costs, "updSum");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Breadcrumb className="w-full sm:w-auto">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={onBack} className="flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                <Megaphone className="h-4 w-4 mr-1" />
                <span>Кампании</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{campaignName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Button 
          size="sm" 
          onClick={fetchData}
          className="w-full sm:w-auto"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить данные
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-48" /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <AnimatePresence>
            {statistics === null ? (
              <motion.div
                key="no-data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400"
              >
                Нет данных для отображения.
              </motion.div>
            ) : null}
          </AnimatePresence>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="keywords">Ключевые слова</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="mr-2 h-4 w-4" />
                      Показы
                    </CardTitle>
                    <CardDescription>Количество показов объявлений</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(statistics.shows)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MousePointerClick className="mr-2 h-4 w-4" />
                      Клики
                    </CardTitle>
                    <CardDescription>Количество кликов по объявлениям</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(statistics.clicks)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Затраты
                    </CardTitle>
                    <CardDescription>Общая сумма затрат на рекламу</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statistics.cost)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Заказы
                    </CardTitle>
                    <CardDescription>Количество заказов после клика</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatNumber(statistics.orders)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-lg mt-8">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 sm:mb-0">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Подробная статистика</span>
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Popover open={fromCalendarOpen} onOpenChange={setFromCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !dateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, 'PPP') : <span>Начальная дата</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={(date) => {
                              if (date) {
                                setDateFrom(date);
                                setFromCalendarOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Popover open={toCalendarOpen} onOpenChange={setToCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !dateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, 'PPP') : <span>Конечная дата</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={(date) => {
                              if (date) {
                                setDateTo(date);
                                setToCalendarOpen(false);
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Button onClick={fetchData} disabled={loading}>
                        {loading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Загрузка...
                          </>
                        ) : (
                          "Применить"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{getFormattedLastUpdate()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>CTR (Click-Through Rate)</CardTitle>
                    <CardDescription>Отношение кликов к показам</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={statistics.ctr} max={100} className="mb-2" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatNumber(statistics.ctr)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>CPC (Cost Per Click)</CardTitle>
                    <CardDescription>Средняя стоимость клика</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(statistics.cpc)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>CR (Conversion Rate)</CardTitle>
                    <CardDescription>Отношение заказов к кликам</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={statistics.cr} max={100} className="mb-2" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatNumber(statistics.cr)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Statistics Table */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Статистика по товарам</h3>
                <ProductStatsTable 
                  productStats={productStats} 
                  loading={loading && productStats.length === 0} 
                />
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <h3 className="text-lg font-semibold">Статистика по товарам</h3>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                  <Input 
                    className="w-full sm:w-64" 
                    placeholder="Поиск по названию" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    prefix={<Search className="h-4 w-4 text-gray-500" />}
                  />
                </div>
              </div>

              <ProductStatsTable 
                productStats={filteredProductStats} 
                loading={loading && productStats.length === 0}
                showProgressBar={true}
              />
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <KeywordStatisticsComponent 
                campaignId={campaignId} 
                apiKey={apiKey} 
                dateFrom={dateFrom}
                dateTo={dateTo}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default CampaignDetails;

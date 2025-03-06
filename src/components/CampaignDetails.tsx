
import { Card, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { 
  getAdvertCosts, 
  getAdvertStats, 
  getAdvertPayments, 
  getCampaignFullStats,
  CampaignFullStats 
} from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronLeft, 
  AlertCircle, 
  Sparkles, 
  Star, 
  Trophy, 
  Gem,
  Target,
  Eye,
  MousePointerClick,
  ShoppingCart,
  PercentIcon,
  Package,
  BarChart3,
  CreditCard,
  Clock,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";
import { Progress } from "./ui/progress";
import ProductStatsTable from "./advertising/ProductStatsTable";
import { ProductStats } from "@/services/advertisingApi";
import KeywordStatisticsComponent from "./advertising/KeywordStatistics";
import { formatCurrency } from "@/utils/formatCurrency";

interface CampaignDetailsProps {
  campaignId: number;
  campaignName: string;
  apiKey: string;
  onBack: () => void;
}

interface CampaignStats {
  views: number;
  clicks: number;
  ctr: number;
  orders: number;
  cr: number;
  sum: number;
}

const CAMPAIGN_DETAILS_KEY = 'campaign_details';
const CAMPAIGN_COSTS_KEY = 'campaign_costs';
const CAMPAIGN_PAYMENTS_KEY = 'campaign_payments';
const CAMPAIGN_LAST_UPDATE_KEY = 'campaign_last_update';

const CampaignDetails = ({ campaignId, campaignName, apiKey, onBack }: CampaignDetailsProps) => {
  const [costs, setCosts] = useState<any[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [fullStats, setFullStats] = useState<CampaignFullStats | null>(null);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const loadCachedData = () => {
    try {
      const detailsKey = `${CAMPAIGN_DETAILS_KEY}_${campaignId}`;
      const costsKey = `${CAMPAIGN_COSTS_KEY}_${campaignId}`;
      const paymentsKey = `${CAMPAIGN_PAYMENTS_KEY}_${campaignId}`;
      const lastUpdateKey = `${CAMPAIGN_LAST_UPDATE_KEY}_${campaignId}`;
      const productsKey = `campaign_products_${campaignId}`;

      const savedDetails = localStorage.getItem(detailsKey);
      const savedCosts = localStorage.getItem(costsKey);
      const savedPayments = localStorage.getItem(paymentsKey);
      const savedLastUpdate = localStorage.getItem(lastUpdateKey);
      const savedProducts = localStorage.getItem(productsKey);

      if (savedDetails) {
        const parsedDetails = JSON.parse(savedDetails);
        setStats(parsedDetails.stats);
        setFullStats(parsedDetails.fullStats);
      }

      if (savedCosts) {
        setCosts(JSON.parse(savedCosts));
      }

      if (savedPayments) {
        setPayments(JSON.parse(savedPayments));
      }

      if (savedLastUpdate) {
        setLastUpdate(savedLastUpdate);
      }
      
      if (savedProducts) {
        setProductStats(JSON.parse(savedProducts));
      }

      const shouldRefresh = !savedLastUpdate || 
        (new Date().getTime() - new Date(savedLastUpdate).getTime()) > 60 * 60 * 1000;

      if (shouldRefresh || !savedDetails) {
        fetchData();
      }
    } catch (error) {
      console.error('Error loading cached campaign data:', error);
    }
  };

  const cacheData = (
    statsData: CampaignStats | null, 
    fullStatsData: CampaignFullStats | null,
    costsData: any[],
    paymentsData: any[],
    productsData: ProductStats[] = []
  ) => {
    try {
      const now = new Date().toISOString();
      
      const detailsKey = `${CAMPAIGN_DETAILS_KEY}_${campaignId}`;
      const costsKey = `${CAMPAIGN_COSTS_KEY}_${campaignId}`;
      const paymentsKey = `${CAMPAIGN_PAYMENTS_KEY}_${campaignId}`;
      const lastUpdateKey = `${CAMPAIGN_LAST_UPDATE_KEY}_${campaignId}`;
      const productsKey = `campaign_products_${campaignId}`;

      localStorage.setItem(detailsKey, JSON.stringify({
        stats: statsData,
        fullStats: fullStatsData
      }));
      localStorage.setItem(costsKey, JSON.stringify(costsData));
      localStorage.setItem(paymentsKey, JSON.stringify(paymentsData));
      localStorage.setItem(lastUpdateKey, now);
      localStorage.setItem(productsKey, JSON.stringify(productsData));
      
      setLastUpdate(now);
    } catch (error) {
      console.error('Error caching campaign data:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);

      const [costsData, statsData, paymentsData, fullStatsData] = await Promise.all([
        getAdvertCosts(dateFrom, dateTo, apiKey),
        getAdvertStats(dateFrom, dateTo, [campaignId], apiKey),
        getAdvertPayments(dateFrom, dateTo, apiKey),
        getCampaignFullStats(apiKey, [campaignId], dateFrom, dateTo)
      ]);

      const campaignCosts = costsData.filter(cost => cost.advertId === campaignId);
      setCosts(campaignCosts);
      setStats(statsData[0]);
      setPayments(paymentsData);
      
      let productsData: ProductStats[] = [];
      
      if (fullStatsData && fullStatsData.length > 0) {
        const campaignData = fullStatsData[0];
        setFullStats(campaignData);
        
        if (campaignData.days && campaignData.days.length > 0) {
          const productsMap = new Map<number, ProductStats>();
          
          for (const day of campaignData.days) {
            if (day.nm && day.nm.length > 0) {
              for (const product of day.nm) {
                if (productsMap.has(product.nmId)) {
                  const existingProduct = productsMap.get(product.nmId)!;
                  existingProduct.views += product.views;
                  existingProduct.clicks += product.clicks;
                  existingProduct.sum += product.sum;
                  existingProduct.atbs += product.atbs;
                  existingProduct.orders += product.orders;
                  existingProduct.shks += product.shks;
                  existingProduct.sum_price += product.sum_price;
                  if (existingProduct.views > 0) {
                    existingProduct.ctr = (existingProduct.clicks / existingProduct.views) * 100;
                  }
                  if (existingProduct.clicks > 0) {
                    existingProduct.cpc = existingProduct.sum / existingProduct.clicks;
                    existingProduct.cr = (existingProduct.orders / existingProduct.clicks) * 100;
                  }
                } else {
                  productsMap.set(product.nmId, { ...product });
                }
              }
            }
          }
          
          productsData = Array.from(productsMap.values());
        }
      }
      
      setProductStats(productsData);

      cacheData(statsData[0], fullStatsData?.[0] || null, campaignCosts, paymentsData, productsData);

      toast({
        title: "Успех",
        description: "Данные успешно обновлены",
      });
    } catch (error) {
      console.error('Error fetching campaign data:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCachedData();
  }, [campaignId]);

  const getFormattedLastUpdate = () => {
    if (!lastUpdate) return "Никогда";
    
    const updateDate = new Date(lastUpdate);
    return `${updateDate.toLocaleDateString('ru-RU')} ${updateDate.toLocaleTimeString('ru-RU')}`;
  };

  const StatCard = ({ title, value, icon: Icon, trend, color, isTrendPositive, caption }: { 
    title: string; 
    value: string; 
    icon: any; 
    trend?: number;
    color: string;
    isTrendPositive?: boolean;
    caption?: string;
  }) => (
    <div className={`rounded-2xl p-4 bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm border border-${color}-100 dark:border-${color}-900/30 shadow-md overflow-hidden relative`}>
      <div className={`w-1.5 h-full absolute left-0 top-0 bg-gradient-to-b from-${color}-400 to-${color}-600 rounded-l-lg`}></div>
      <div className="flex flex-col pl-2">
        <div className="flex items-center justify-between mb-1">
          <div className={`p-2 rounded-full bg-${color}-100 dark:bg-${color}-900/40`}>
            <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center ${isTrendPositive ? 'text-green-500' : 'text-red-500'} 
                            ${isTrendPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} 
                            px-2 py-0.5 rounded-full text-xs font-medium`}>
              {isTrendPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              <span>{typeof trend === 'number' ? trend.toFixed(1) : trend}%</span>
            </div>
          )}
        </div>
        <p className={`text-xs font-medium text-${color}-600 dark:text-${color}-400 mb-0.5`}>{title}</p>
        <p className="text-lg font-bold">{value}</p>
        {caption && (
          <p className="text-xs text-gray-500 mt-0.5">{caption}</p>
        )}
      </div>
    </div>
  );

  const renderCostHistory = () => (
    <Card className="overflow-hidden border-0 shadow-xl rounded-3xl h-full">
      <div 
        className="relative overflow-hidden h-full flex flex-col"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(30,41,59,1) 0%, rgba(45,55,72,1) 100%)'
            : 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)'
        }}
      >
        <div className="absolute -top-16 -right-16 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <DollarSign className="h-64 w-64" />
          </motion.div>
        </div>

        <div className="p-5 border-b border-gray-200/30 dark:border-gray-700/30 flex items-center justify-between relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-amber-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-pink-500">История затрат</span>
          </h3>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Star className="h-5 w-5 text-amber-400" />
            </motion.div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getFormattedLastUpdate()}</span>
            </div>
          </div>
        </div>

        <div className="p-5 relative z-10 overflow-y-auto scrollbar-hide flex-1">
          <AnimatePresence>
            {costs.length > 0 ? (
              <div className="space-y-4">
                {costs.map((cost, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    className="relative overflow-hidden"
                  >
                    <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 border border-amber-100/80 dark:border-amber-900/30 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-2 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 mr-3"></div>
                          <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-rose-500">
                            {formatCurrency(cost.updSum)}
                          </span>
                        </div>
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-full font-medium">
                          {format(new Date(cost.updTime), 'dd.MM.yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 flex flex-col items-center justify-center"
              >
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className="w-20 h-20 mb-4 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center"
                >
                  <DollarSign className="h-10 w-10 text-amber-400" />
                </motion.div>
                <h4 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-1">
                  Нет данных о затратах
                </h4>
                <p className="text-center text-gray-500 max-w-xs">
                  Информация о расходах появится здесь после запуска кампании
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );

  const renderStatMetrics = () => {
    if (!fullStats) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6 mx-auto"></div>
            <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-1">
              Загрузка статистики...
            </h4>
          </div>
        </div>
      );
    }

    const metricCards = [
      {
        title: "Показы",
        value: formatCurrency(fullStats.views),
        icon: Eye,
        color: "purple",
        trend: 12.5,
        isTrendPositive: true,
        caption: "Всего просмотров"
      },
      {
        title: "Клики",
        value: formatCurrency(fullStats.clicks),
        icon: MousePointerClick,
        color: "blue",
        trend: 8.7,
        isTrendPositive: true,
        caption: "Всего кликов"
      },
      {
        title: "CTR",
        value: `${fullStats.ctr.toFixed(2)}%`,
        icon: PercentIcon,
        color: "green",
        trend: fullStats.ctr - 1.2,
        isTrendPositive: fullStats.ctr > 1.2,
        caption: "Кликабельность"
      },
      {
        title: "CPC",
        value: `${fullStats.cpc.toFixed(2)}`,
        icon: CreditCard,
        color: "amber",
        trend: 3.2,
        isTrendPositive: false,
        caption: "Стоимость клика"
      },
      {
        title: "Затраты",
        value: formatCurrency(fullStats.sum),
        icon: DollarSign,
        color: "red",
        trend: 5.3,
        isTrendPositive: false,
        caption: "Всего затрат"
      },
      {
        title: "Товары в корзине",
        value: formatCurrency(fullStats.atbs),
        icon: ShoppingCart,
        color: "teal",
        trend: 9.4,
        isTrendPositive: true,
        caption: "Добавлено в корзину"
      },
      {
        title: "Заказы",
        value: formatCurrency(fullStats.orders),
        icon: Package,
        color: "indigo",
        trend: 7.2,
        isTrendPositive: true,
        caption: "Количество заказов"
      },
      {
        title: "CR",
        value: `${fullStats.cr.toFixed(2)}%`,
        icon: Target,
        color: "emerald",
        trend: 4.1,
        isTrendPositive: true,
        caption: "Конверсия"
      },
      {
        title: "Продано товаров",
        value: formatCurrency(fullStats.shks),
        icon: BarChart3,
        color: "sky",
        trend: 10.3,
        isTrendPositive: true,
        caption: "шт."
      },
      {
        title: "Сумма заказов",
        value: formatCurrency(fullStats.sum_price),
        icon: TrendingUp,
        color: "fuchsia",
        trend: 6.8,
        isTrendPositive: true,
        caption: "Общая сумма"
      }
    ];

    return (
      <div className="space-y-6">
        {isMobile ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex flex-row gap-3" style={{ minWidth: "max-content" }}>
              {metricCards.map((card, index) => (
                <div key={index} className="w-[170px]">
                  <StatCard {...card} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metricCards.map((card, index) => (
              <StatCard key={index} {...card} />
            ))}
          </div>
        )}

        <div className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-blue-100 dark:border-blue-900/20 shadow-lg">
          <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-4">Эффективность кампании</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span>CTR (Кликабельность)</span>
                  </span>
                  <span className="font-bold">{fullStats.ctr.toFixed(2)}%</span>
                </div>
                <Progress value={Math.min(fullStats.ctr * 10, 100)} className="h-2 bg-purple-100 dark:bg-purple-900/30" />
                <p className="text-xs text-gray-500">Отношение кликов к показам</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>CR (Конверсия)</span>
                  </span>
                  <span className="font-bold">{fullStats.cr.toFixed(2)}%</span>
                </div>
                <Progress value={Math.min(fullStats.cr * 10, 100)} className="h-2 bg-green-100 dark:bg-green-900/30" />
                <p className="text-xs text-gray-500">Отношение заказов к кликам</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4 text-amber-500" />
                    <span>CPC (Стоимость клика)</span>
                  </span>
                  <span className="font-bold">{fullStats.cpc.toFixed(2)} ₽</span>
                </div>
                <Progress value={Math.min((fullStats.cpc / 10) * 100, 100)} className="h-2 bg-amber-100 dark:bg-amber-900/30" />
                <p className="text-xs text-gray-500">Средняя стоимость за клик</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                    <span>Корзина / Показы</span>
                  </span>
                  <span className="font-bold">{(fullStats.atbs / fullStats.views * 100).toFixed(2)}%</span>
                </div>
                <Progress value={Math.min((fullStats.atbs / fullStats.views * 100) * 3, 100)} className="h-2 bg-blue-100 dark:bg-blue-900/30" />
                <p className="text-xs text-gray-500">Добавления в корзину к показам</p>
              </div>
            </div>
          </div>
        </div>
        
        {fullStats.days && fullStats.days.length > 0 && (
          <Card className="overflow-hidden border-0 shadow-xl rounded-3xl">
            <div className="bg-white/90 dark:bg-gray-800/60 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Статистика по дням
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 dark:bg-blue-950/30">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Дата</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Показы</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Клики</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">CTR</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Затраты</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider">Заказы</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 dark:divide-blue-900/20">
                  {fullStats.days.map((day, index) => (
                    <tr key={index} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
                      <td className="py-3 px-4 text-sm whitespace-nowrap font-medium">
                        {format(new Date(day.date), 'dd.MM.yyyy')}
                      </td>
                      <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
                        {day.views.toLocaleString('ru-RU')}
                      </td>
                      <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
                        {day.clicks.toLocaleString('ru-RU')}
                      </td>
                      <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
                        {day.ctr.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
                        {day.sum.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
                        {day.orders.toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderDetailedStats = () => (
    <Card className="overflow-hidden border-0 shadow-xl rounded-3xl w-full">
      <div 
        className="relative overflow-hidden"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(51,65,85,1) 100%)'
            : 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)'
        }}
      >
        <div className="p-5 border-b border-gray-200/30 dark:border-gray-700/30 flex items-center justify-between relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Подробная статистика</span>
          </h3>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{getFormattedLastUpdate()}</span>
          </div>
        </div>

        <div className="p-5 relative z-10">
          {renderStatMetrics()}
        </div>
      </div>
    </Card>
  );

  const renderPaymentHistory = () => (
    <Card className="overflow-hidden border-0 shadow-xl rounded-3xl h-full">
      <div 
        className="relative overflow-hidden h-full flex flex-col"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(236,72,153,0.2) 100%)'
            : 'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)'
        }}
      >
        <div className="absolute -top-16 -right-16 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <DollarSign className="h-64 w-64" />
          </motion.div>
        </div>

        <div className="p-5 border-b border-gray-200/30 dark:border-gray-700/30 flex items-center justify-between relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Gem className="h-5 w-5 text-purple-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">История пополнений</span>
          </h3>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Trophy className="h-5 w-5 text-purple-400" />
            </motion.div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getFormattedLastUpdate()}</span>
            </div>
          </div>
        </div>

        <div className="p-5 relative z-10 overflow-y-auto scrollbar-hide flex-1">
          <AnimatePresence>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    className="relative overflow-hidden"
                  >
                    <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-100/80 dark:border-purple-900/30">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="w-2 h-10 rounded-full bg-gradient-to-b from-purple-400 to-pink-600 mr-3"></div>
                          <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                            {formatCurrency(payment.sum)}
                          </span>
                        </div>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full font-medium">
                          {format(new Date(payment.date), 'dd.MM.yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-10 flex flex-col items-center justify-center"
              >
                <motion.div 
                  whileHover={{ rotate: 10 }}
                  className="w-20 h-20 mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center"
                >
                  <DollarSign className="h-10 w-10 text-purple-400" />
                </motion.div>
                <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">
                  Нет данных о пополнениях
                </h4>
                <p className="text-center text-gray-500 max-w-xs">
                  Информация о пополнениях появится здесь после запуска кампании
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{campaignName}</h1>
        </div>
        <Button 
          className="flex items-center space-x-2" 
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Обновить данные</span>
        </Button>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="stats" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Статистика</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Товары</span>
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Ключевые слова</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {renderDetailedStats()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
              {renderCostHistory()}
              {renderPaymentHistory()}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <ProductStatsTable products={productStats} />
        </TabsContent>

        <TabsContent value="keywords">
          <KeywordStatisticsComponent 
            campaignId={campaignId} 
            apiKey={apiKey} 
            dateFrom={new Date(new Date().setDate(new Date().getDate() - 30))}
            dateTo={new Date()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CampaignDetails;

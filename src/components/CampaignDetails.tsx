
import { Card, CardContent } from "./ui/card";
import { useEffect, useState } from "react";
import { getAdvertCosts, getAdvertStats, getAdvertPayments } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, ChevronLeft, AlertCircle, Sparkles, Star, Trophy, Gem } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/use-theme";

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

const CampaignDetails = ({ campaignId, campaignName, apiKey, onBack }: CampaignDetailsProps) => {
  const [costs, setCosts] = useState<any[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("stats");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  const fetchData = async () => {
    setLoading(true);
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);

      const [costsData, statsData, paymentsData] = await Promise.all([
        getAdvertCosts(dateFrom, dateTo, apiKey),
        getAdvertStats(dateFrom, dateTo, [campaignId], apiKey),
        getAdvertPayments(dateFrom, dateTo, apiKey)
      ]);

      const campaignCosts = costsData.filter(cost => cost.advertId === campaignId);
      setCosts(campaignCosts);
      setStats(statsData[0]);
      setPayments(paymentsData);

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
    fetchData();
  }, [campaignId]);

  const StatCard = ({ title, value, icon: Icon, trend, color, sparkleColor }: { 
    title: string; 
    value: string; 
    icon: any; 
    trend?: number;
    color: string;
    sparkleColor?: string;
  }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="relative overflow-hidden"
    >
      <div className={`relative overflow-hidden rounded-2xl shadow-lg border-2 border-${color}-300 dark:border-${color}-800`}
           style={{
             background: theme === 'dark' 
               ? `linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(${color === 'purple' ? '147,39,143' : color === 'blue' ? '1,138,216' : color === 'green' ? '38,166,91' : '247,114,22'},0.4) 100%)`
               : `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(${color === 'purple' ? '226,213,250' : color === 'blue' ? '201,235,255' : color === 'green' ? '209,250,229' : '255,226,208'},1) 100%)`
           }}
      >
        {sparkleColor && (
          <motion.div 
            className="absolute -top-4 -right-4 opacity-50"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className={`h-14 w-14 text-${sparkleColor}-300 dark:text-${sparkleColor}-600`} />
          </motion.div>
        )}
        
        <div className="p-6 z-10 relative">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/40 shadow-inner`}>
              <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'} 
                               ${trend >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'} 
                               px-3 py-1 rounded-full font-medium text-sm`}>
                {trend >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <h3 className={`text-sm font-medium text-${color}-600 dark:text-${color}-400 mb-1`}>{title}</h3>
          <p className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderCostHistory = () => (
    <Card className="overflow-hidden border-0 shadow-xl rounded-3xl">
      <div 
        className="relative overflow-hidden"
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
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Star className="h-5 w-5 text-amber-400" />
          </motion.div>
        </div>

        <div className="p-5 relative z-10 max-h-[400px] overflow-y-auto scrollbar-hide">
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
                            {cost.updSum.toLocaleString('ru-RU')} ₽
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

  const renderDetailedStats = () => (
    <Card className="overflow-hidden border-0 shadow-xl rounded-3xl">
      <div 
        className="relative overflow-hidden"
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(59,130,246,0.2) 100%)'
            : 'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)'
        }}
      >
        <div className="absolute -top-16 -right-16 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <TrendingUp className="h-64 w-64" />
          </motion.div>
        </div>

        <div className="p-5 border-b border-gray-200/30 dark:border-gray-700/30 flex items-center justify-between relative z-10">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">Подробная статистика</span>
          </h3>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Sparkles className="h-5 w-5 text-blue-400" />
          </motion.div>
        </div>

        <div className="p-5 relative z-10">
          <AnimatePresence>
            {stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Показы', value: stats.views.toLocaleString('ru-RU'), color: 'blue', icon: Trophy },
                  { label: 'Клики', value: stats.clicks.toLocaleString('ru-RU'), color: 'purple', icon: Sparkles },
                  { label: 'CTR', value: `${stats.ctr.toFixed(2)}%`, color: 'green', icon: TrendingUp },
                  { label: 'Заказы', value: stats.orders.toLocaleString('ru-RU'), color: 'amber', icon: Star },
                  { label: 'CR', value: `${stats.cr.toFixed(2)}%`, color: 'purple', icon: Gem },
                  { label: 'Сумма', value: `${stats.sum.toLocaleString('ru-RU')} ₽`, color: 'green', icon: DollarSign }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.1)" }}
                    className="relative overflow-hidden"
                  >
                    <div className={`rounded-2xl p-4 border-2 border-${item.color}-200 dark:border-${item.color}-800/40 relative overflow-hidden`}
                      style={{
                        background: theme === 'dark' 
                          ? `linear-gradient(135deg, rgba(0,0,0,0.2) 0%, rgba(${item.color === 'purple' ? '147,39,143' : item.color === 'blue' ? '1,138,216' : item.color === 'green' ? '38,166,91' : '247,114,22'},0.3) 100%)`
                          : `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(${item.color === 'purple' ? '226,213,250' : item.color === 'blue' ? '201,235,255' : item.color === 'green' ? '209,250,229' : '255,226,208'},0.8) 100%)`
                      }}
                    >
                      <motion.div 
                        className="absolute -bottom-4 -right-4 opacity-10"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <item.icon className="h-16 w-16" />
                      </motion.div>

                      <div className="flex justify-between items-center relative z-10">
                        <span className={`text-${item.color}-700 dark:text-${item.color}-300 font-medium flex items-center`}>
                          <div className={`w-2 h-6 rounded-full bg-${item.color}-500 mr-2`}></div>
                          {item.label}
                        </span>
                        <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                          {item.value}
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
                className="py-10 flex flex-col items-center justify-center h-[300px]"
              >
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  Загрузка статистики...
                </h4>
                <p className="text-center text-gray-500 max-w-xs">
                  Собираем данные о вашей кампании
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );

  const renderPaymentHistory = () => (
    <Card className="overflow-hidden border-0 shadow-xl rounded-3xl">
      <div 
        className="relative overflow-hidden"
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
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Trophy className="h-5 w-5 text-purple-400" />
          </motion.div>
        </div>

        <div className="p-5 relative z-10 max-h-[400px] overflow-y-auto scrollbar-hide">
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
                            {payment.sum.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-3 py-1.5 rounded-full font-medium">
                          {format(new Date(payment.date), 'dd.MM.yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pl-5">
                        <span className="text-sm text-gray-600 dark:text-gray-400">ID: {payment.id}</span>
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="text-sm font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/40 dark:to-pink-500/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-xl"
                        >
                          {payment.type}
                        </motion.span>
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
                  <AlertCircle className="h-10 w-10 text-purple-400" />
                </motion.div>
                <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">
                  Нет данных о пополнениях
                </h4>
                <p className="text-center text-gray-500 max-w-xs">
                  История пополнений появится здесь после первого платежа
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="sticky top-0 z-20 pt-4 pb-4 bg-background/80 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="mb-2 hover:bg-purple-100 dark:hover:bg-purple-900/20 group flex items-center"
            >
              <motion.div 
                whileHover={{ x: -3 }} 
                className="mr-1"
              >
                <ChevronLeft className="h-4 w-4 group-hover:text-purple-500" />
              </motion.div>
              <span className="group-hover:text-purple-500">Назад к списку</span>
            </Button>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600">
              {campaignName}
            </h2>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button 
              onClick={fetchData} 
              disabled={loading} 
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-medium"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {stats && (
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <StatCard
            title="Показы"
            value={stats.views.toLocaleString('ru-RU')}
            icon={Trophy}
            color="purple"
            sparkleColor="purple"
          />
          <StatCard
            title="Клики"
            value={stats.clicks.toLocaleString('ru-RU')}
            icon={Sparkles}
            trend={stats.ctr}
            color="blue"
            sparkleColor="blue"
          />
          <StatCard
            title="CTR"
            value={`${stats.ctr.toFixed(2)}%`}
            icon={TrendingUp}
            color="green"
            sparkleColor="green"
          />
        </motion.div>
      )}

      {isMobile ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="border-0 shadow-xl overflow-hidden rounded-3xl">
            <div 
              className="p-1 rounded-2xl"
              style={{
                background: 'linear-gradient(90deg, #9b87f5, #7E69AB)'
              }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 bg-background/90 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-1">
                  <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                    Статистика
                  </TabsTrigger>
                  <TabsTrigger value="costs" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                    Затраты
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg">
                    Пополнения
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <AnimatePresence mode="wait">
              {activeTab === "stats" && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderDetailedStats()}
                </motion.div>
              )}
              
              {activeTab === "costs" && (
                <motion.div
                  key="costs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderCostHistory()}
                </motion.div>
              )}
              
              {activeTab === "payments" && (
                <motion.div
                  key="payments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderPaymentHistory()}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            {renderCostHistory()}
          </motion.div>
          
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            {renderDetailedStats()}
          </motion.div>
          
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            {renderPaymentHistory()}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CampaignDetails;

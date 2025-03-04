
import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { getAdvertCosts, getAdvertStats, getAdvertPayments } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, ChevronLeft, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const StatCard = ({ title, value, icon: Icon, trend, color }: { 
    title: string; 
    value: string; 
    icon: any; 
    trend?: number;
    color: string;
  }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/30 p-4 rounded-lg border border-${color}-200 dark:border-${color}-800`}>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-full`}>
            <Icon className={`h-5 w-5 text-${color}-500 dark:text-${color}-400`} />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              <span className="text-sm font-medium ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </motion.div>
  );

  // Render the Cost History section
  const renderCostHistory = () => (
    <Card className="overflow-hidden bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-800 dark:to-gray-700 border-0 shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-[#9b87f5]" />
          История затрат
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
          {costs.length > 0 ? (
            costs.map((cost, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-white/80 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">{cost.updSum.toLocaleString('ru-RU')} ₽</span>
                    <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      {format(new Date(cost.updTime), 'dd.MM.yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <DollarSign className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-center text-gray-500 font-medium">Нет данных о затратах</p>
              <p className="text-center text-gray-400 text-sm mt-1">Информация о расходах появится здесь</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  // Render the Detailed Statistics section
  const renderDetailedStats = () => (
    <Card className="overflow-hidden bg-gradient-to-br from-[#accbee] to-[#e7f0fd] dark:from-gray-800 dark:to-gray-700 border-0 shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
          Подробная статистика
        </h3>
      </div>
      <div className="p-4">
        {stats ? (
          <div className="space-y-3">
            {[
              { label: 'Показы', value: stats.views.toLocaleString('ru-RU'), color: 'blue' },
              { label: 'Клики', value: stats.clicks.toLocaleString('ru-RU'), color: 'purple' },
              { label: 'CTR', value: `${stats.ctr.toFixed(2)}%`, color: 'green' },
              { label: 'Заказы', value: stats.orders.toLocaleString('ru-RU'), color: 'amber' },
              { label: 'CR', value: `${stats.cr.toFixed(2)}%`, color: 'indigo' },
              { label: 'Сумма', value: `${stats.sum.toLocaleString('ru-RU')} ₽`, color: 'pink' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`bg-white/80 dark:bg-gray-800/50 rounded-lg p-4 border border-${item.color}-100 dark:border-${item.color}-800/50 shadow-sm`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-${item.color}-700 dark:text-${item.color}-400 font-medium flex items-center`}>
                      <div className={`w-2 h-2 rounded-full bg-${item.color}-500 mr-2`}></div>
                      {item.label}
                    </span>
                    <span className="font-semibold text-lg">{item.value}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-center text-gray-500 font-medium">Загрузка статистики...</p>
            <p className="text-center text-gray-400 text-sm mt-1">Пожалуйста, подождите</p>
          </div>
        )}
      </div>
    </Card>
  );

  // Render the Payment History section
  const renderPaymentHistory = () => (
    <Card className="overflow-hidden bg-gradient-to-br from-[#d299c2] to-[#fef9d7] dark:from-gray-800 dark:to-gray-700 border-0 shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-pink-500" />
          История пополнений
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="bg-white/80 dark:bg-gray-800/50 rounded-lg p-4 border border-pink-100 dark:border-pink-800/50 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg">{payment.sum.toLocaleString('ru-RU')} ₽</span>
                    <span className="text-sm bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300 px-2 py-1 rounded-full">
                      {format(new Date(payment.date), 'dd.MM.yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">ID: {payment.id}</span>
                    <span className="text-sm font-medium bg-[#9b87f5]/20 text-[#9b87f5] px-2 py-1 rounded">
                      {payment.type}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="h-7 w-7 text-pink-400" />
              </div>
              <p className="text-center text-gray-500 font-medium">Нет данных о пополнениях</p>
              <p className="text-center text-gray-400 text-sm mt-1">История пополнений появится здесь</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2 hover:bg-purple-100 dark:hover:bg-purple-900/20">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Назад к списку
          </Button>
          <h2 className="text-2xl font-bold">{campaignName}</h2>
        </div>
        <Button 
          onClick={fetchData} 
          disabled={loading} 
          className="bg-[#9b87f5] hover:bg-[#7E69AB]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Показы"
            value={stats.views.toLocaleString('ru-RU')}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Клики"
            value={stats.clicks.toLocaleString('ru-RU')}
            icon={TrendingDown}
            trend={stats.ctr}
            color="blue"
          />
          <StatCard
            title="CTR"
            value={`${stats.ctr.toFixed(2)}%`}
            icon={TrendingUp}
            color="green"
          />
        </div>
      )}

      {isMobile ? (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-4">
              <TabsTrigger value="stats" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Статистика
              </TabsTrigger>
              <TabsTrigger value="costs" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Затраты
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                Пополнения
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="mt-0">
              {renderDetailedStats()}
            </TabsContent>
            
            <TabsContent value="costs" className="mt-0">
              {renderCostHistory()}
            </TabsContent>
            
            <TabsContent value="payments" className="mt-0">
              {renderPaymentHistory()}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderCostHistory()}
          {renderDetailedStats()}
          {renderPaymentHistory()}
        </div>
      )}
    </motion.div>
  );
};

export default CampaignDetails;

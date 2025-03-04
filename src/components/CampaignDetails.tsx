
import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { getAdvertCosts, getAdvertStats, getAdvertPayments } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";

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
  const { toast } = useToast();

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

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-800 dark:to-gray-700 p-4 border-b">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-[#9b87f5]" />
              История затрат
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
              {costs.length > 0 ? (
                costs.map((cost, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">{cost.updSum.toLocaleString('ru-RU')} ₽</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(cost.updTime), 'dd.MM.yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <DollarSign className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-center text-gray-500">Нет данных о затратах</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#accbee] to-[#e7f0fd] dark:from-gray-800 dark:to-gray-700 p-4 border-b">
            <h3 className="text-lg font-semibold mb-2">Подробная статистика</h3>
          </div>
          <div className="p-4">
            {stats ? (
              <div className="space-y-4">
                {[
                  { label: 'Показы', value: stats.views },
                  { label: 'Клики', value: stats.clicks },
                  { label: 'CTR', value: `${stats.ctr.toFixed(2)}%` },
                  { label: 'Заказы', value: stats.orders },
                  { label: 'CR', value: `${stats.cr.toFixed(2)}%` },
                  { label: 'Сумма', value: `${stats.sum.toLocaleString('ru-RU')} ₽` }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px]">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-[#9b87f5] rounded-full animate-spin mb-4"></div>
                <p className="text-center text-gray-500">Загрузка статистики...</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#d299c2] to-[#fef9d7] dark:from-gray-800 dark:to-gray-700 p-4 border-b">
            <h3 className="text-lg font-semibold mb-2">История пополнений</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg">{payment.sum.toLocaleString('ru-RU')} ₽</span>
                        <span className="text-sm text-gray-500">
                          {format(new Date(payment.date), 'dd.MM.yyyy')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">ID: {payment.id}</span>
                        <span className="text-sm font-medium bg-[#9b87f5]/10 text-[#9b87f5] px-2 py-1 rounded">
                          {payment.type}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <DollarSign className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-center text-gray-500">Нет данных о пополнениях</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default CampaignDetails;

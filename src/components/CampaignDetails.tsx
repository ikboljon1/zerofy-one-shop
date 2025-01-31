import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { getAdvertCosts, getAdvertStats, getAdvertPayments } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  atbs?: number;
  shks?: number;
  sum_price?: number;
}

const STORAGE_KEY = 'campaign_stats_';

const CampaignDetails = ({ campaignId, campaignName, apiKey, onBack }: CampaignDetailsProps) => {
  const [costs, setCosts] = useState<any[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const cachedData = localStorage.getItem(`${STORAGE_KEY}${campaignId}`);
    if (cachedData) {
      const { costs, stats, payments } = JSON.parse(cachedData);
      setCosts(costs);
      setStats(stats);
      setPayments(payments);
    } else {
      fetchData();
    }
  }, [campaignId]);

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
      const campaignStats = statsData[0];

      setCosts(campaignCosts);
      setStats(campaignStats);
      setPayments(paymentsData);

      const dataToCache = {
        costs: campaignCosts,
        stats: campaignStats,
        payments: paymentsData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`${STORAGE_KEY}${campaignId}`, JSON.stringify(dataToCache));

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

  const StatCard = ({ title, value, icon: Icon, trend }: { title: string; value: string; icon: any; trend?: number }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-5 w-5 text-primary" />
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
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Назад к списку
          </Button>
          <h2 className="text-2xl font-bold">{campaignName}</h2>
        </div>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Обновление...' : 'Обновить'}
        </Button>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Показы"
            value={stats.views.toLocaleString('ru-RU')}
            icon={TrendingUp}
          />
          <StatCard
            title="Клики"
            value={stats.clicks.toLocaleString('ru-RU')}
            icon={TrendingDown}
            trend={stats.ctr}
          />
          <StatCard
            title="CTR"
            value={`${stats.ctr.toFixed(2)}%`}
            icon={TrendingUp}
          />
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Загрузка статистики...</span>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Нет данных для отображения</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 bg-gradient-to-br from-[#fdfcfb] to-[#e2d1c3] dark:from-gray-800 dark:to-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            История затрат
          </h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
            {costs.length > 0 ? (
              costs.map((cost, index) => (
                <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 transition-all hover:translate-y-[-2px]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">{cost.updSum.toLocaleString('ru-RU')} ₽</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(cost.updTime), 'dd.MM.yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Нет данных о затратах</p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#accbee] to-[#e7f0fd] dark:from-gray-800 dark:to-gray-700">
          <h3 className="text-lg font-semibold mb-4">Подробная статистика</h3>
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
                <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Загрузка статистики...</p>
          )}
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#d299c2] to-[#fef9d7] dark:from-gray-800 dark:to-gray-700">
          <h3 className="text-lg font-semibold mb-4">История пополнений</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 transition-all hover:translate-y-[-2px]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg">{payment.sum.toLocaleString('ru-RU')} ₽</span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(payment.date), 'dd.MM.yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">ID: {payment.id}</span>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {payment.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Нет данных о пополнениях</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CampaignDetails;

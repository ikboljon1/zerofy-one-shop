import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { getAdvertCosts, getAdvertFullStats, getAdvertPayments } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CampaignDetailsProps {
  campaignId: number;
  campaignName: string;
  apiKey: string;
  onBack: () => void;
}

const CampaignDetails = ({ campaignId, campaignName, apiKey, onBack }: CampaignDetailsProps) => {
  const [costs, setCosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>();
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
        getAdvertFullStats(dateFrom, dateTo, [campaignId], apiKey),
        getAdvertPayments(dateFrom, dateTo, apiKey)
      ]);

      // Filter costs for this campaign
      const campaignCosts = costsData.filter(cost => cost.advertId === campaignId);
      setCosts(campaignCosts);
      setStats(statsData[0]);
      setPayments(paymentsData);

      // Save data to localStorage
      localStorage.setItem(`campaign_${campaignId}`, JSON.stringify({
        costs: campaignCosts,
        stats: statsData[0],
        payments: paymentsData,
        lastUpdate: new Date().toISOString()
      }));

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
    // Try to load data from localStorage first
    const savedData = localStorage.getItem(`campaign_${campaignId}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCosts(parsed.costs);
      setStats(parsed.stats);
      setPayments(parsed.payments);
    }
    fetchData();
  }, [campaignId]);

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
          Обновить
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">История затрат</h3>
          <div className="space-y-4">
            {costs.map((cost, index) => (
              <div key={index} className="border-b pb-2">
                <p>Сумма: {cost.updSum}</p>
                <p>Дата: {new Date(cost.updTime).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Статистика</h3>
          {stats ? (
            <div className="space-y-2">
              <p>Показы: {stats.views}</p>
              <p>Клики: {stats.clicks}</p>
              <p>CTR: {stats.ctr}%</p>
              <p>Заказы: {stats.orders}</p>
              <p>CR: {stats.cr}%</p>
              <p>Сумма: {stats.sum}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">Загрузка статистики...</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">История пополнений</h3>
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="border-b pb-2">
                <p>ID: {payment.id}</p>
                <p>Сумма: {payment.sum}</p>
                <p>Дата: {new Date(payment.date).toLocaleDateString()}</p>
                <p>Тип: {payment.type}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CampaignDetails;
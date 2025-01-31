import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { getAdvertCosts, getAdvertFullStats, getAdvertPayments } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdvertisingProps {
  selectedStore?: { id: string; apiKey: string } | null;
}

interface Campaign {
  advertId: number;
  campName: string;
  stats?: any;
}

const Advertising = ({ selectedStore }: AdvertisingProps) => {
  const [costs, setCosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [openCampaignId, setOpenCampaignId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!selectedStore) {
      toast({
        title: "Ошибка",
        description: "Выберите магазин для просмотра рекламной статистики",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);

      const [costsData, paymentsData] = await Promise.all([
        getAdvertCosts(dateFrom, dateTo, selectedStore.apiKey),
        getAdvertPayments(dateFrom, dateTo, selectedStore.apiKey)
      ]);

      setCosts(costsData);
      setPayments(paymentsData);

      // Extract unique campaigns from costs data
      const uniqueCampaigns = costsData.reduce((acc: Campaign[], cost: any) => {
        if (!acc.find(c => c.advertId === cost.advertId)) {
          acc.push({
            advertId: cost.advertId,
            campName: cost.campName
          });
        }
        return acc;
      }, []);

      setCampaigns(uniqueCampaigns);

      toast({
        title: "Успех",
        description: "Данные успешно загружены",
      });
    } catch (error) {
      console.error('Error fetching advertising data:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignStats = async (campaignId: number) => {
    if (!selectedStore) return;

    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);

      const statsData = await getAdvertFullStats(dateFrom, dateTo, [campaignId], selectedStore.apiKey);
      
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign.advertId === campaignId 
            ? { ...campaign, stats: statsData[0] }
            : campaign
        )
      );
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику кампании",
        variant: "destructive",
      });
    }
  };

  const handleCampaignClick = async (campaignId: number) => {
    if (openCampaignId === campaignId) {
      setOpenCampaignId(null);
    } else {
      setOpenCampaignId(campaignId);
      await fetchCampaignStats(campaignId);
    }
  };

  useEffect(() => {
    if (selectedStore) {
      fetchData();
    }
  }, [selectedStore]);

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Реклама</h2>
        <p className="text-muted-foreground">Выберите магазин для просмотра рекламной статистики</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Реклама</h2>
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
                <p>Кампания: {cost.campName}</p>
                <p>Сумма: {cost.updSum}</p>
                <p>Дата: {new Date(cost.updTime).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Статистика кампаний</h3>
          <div className="space-y-2">
            {campaigns.map((campaign) => (
              <Collapsible
                key={campaign.advertId}
                open={openCampaignId === campaign.advertId}
                onOpenChange={() => handleCampaignClick(campaign.advertId)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted rounded-md">
                  <span>{campaign.campName}</span>
                  {openCampaignId === campaign.advertId ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="p-2">
                  {campaign.stats ? (
                    <div className="space-y-2">
                      <p>Показы: {campaign.stats.views}</p>
                      <p>Клики: {campaign.stats.clicks}</p>
                      <p>CTR: {campaign.stats.ctr}%</p>
                      <p>Заказы: {campaign.stats.orders}</p>
                      <p>CR: {campaign.stats.cr}%</p>
                      <p>Сумма: {campaign.stats.sum}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Загрузка статистики...</p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
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

export default Advertising;
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { getAdvertCosts, getAdvertStats, getAdvertBalance } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw, CheckCircle, PauseCircle, Archive, Target, Zap, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CampaignDetails from "./CampaignDetails";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdvertisingProps {
  selectedStore?: { id: string; apiKey: string } | null;
}

interface Campaign {
  advertId: number;
  campName: string;
  status: 'active' | 'paused' | 'archived' | 'ready';
  type: 'auction' | 'automatic';
}

const Advertising = ({ selectedStore }: AdvertisingProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all-active");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [balance, setBalance] = useState<number>(0);
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

      // Fetch costs data
      const costsData = await getAdvertCosts(dateFrom, dateTo, selectedStore.apiKey);
      
      if (costsData.length === 0) {
        toast({
          title: "Информация",
          description: "Нет данных о рекламных кампаниях за выбранный период",
        });
        return;
      }

      // Fetch stats for each campaign
      const campaignIds = costsData.map(cost => cost.advertId);
      const statsData = await getAdvertStats(dateFrom, dateTo, campaignIds, selectedStore.apiKey);

      // Combine costs and stats data
      const uniqueCampaigns = Array.from(
        new Map(
          costsData.map((cost) => [
            cost.advertId,
            {
              advertId: cost.advertId,
              campName: cost.campName,
              status: statsData.find(stat => stat.advertId === cost.advertId)?.status || 'active',
              type: statsData.find(stat => stat.advertId === cost.advertId)?.type || 'auction'
            }
          ])
        ).values()
      );

      setCampaigns(uniqueCampaigns);
      
      // Fetch and set real balance
      const balanceData = await getAdvertBalance(selectedStore.apiKey);
      setBalance(balanceData.balance);

      localStorage.setItem(`campaigns_${selectedStore.id}`, JSON.stringify(uniqueCampaigns));

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
      setCampaigns([]);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStore) {
      const savedCampaigns = localStorage.getItem(`campaigns_${selectedStore.id}`);
      if (savedCampaigns) {
        setCampaigns(JSON.parse(savedCampaigns));
      }
      fetchData();
    }
  }, [selectedStore]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = statusFilter === "all-active" 
      ? campaign.status !== "archived"
      : statusFilter === "all" 
        ? true 
        : campaign.status === statusFilter;
    
    const matchesType = typeFilter === "all" 
      ? true 
      : campaign.type === typeFilter;

    return matchesStatus && matchesType;
  });

  if (!selectedStore) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Реклама</h2>
        <p className="text-muted-foreground">Выберите магазин для просмотра рекламной статистики</p>
      </div>
    );
  }

  if (selectedCampaign) {
    return (
      <CampaignDetails
        campaignId={selectedCampaign.advertId}
        campaignName={selectedCampaign.campName}
        apiKey={selectedStore.apiKey}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: Campaign['type']) => {
    return type === 'auction' 
      ? <Target className="h-4 w-4" />
      : <Zap className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Рекламные кампании</h2>
          <div className="flex gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Типы кампаний</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="auction">Аукцион</SelectItem>
                  <SelectItem value="automatic">Автоматическая</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Статусы</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-active">Все, кроме архивных</SelectItem>
                  <SelectItem value="ready">Готовые к запуску</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="paused">Приостановленные</SelectItem>
                  <SelectItem value="archived">Архивные</SelectItem>
                  <SelectItem value="all">Все</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-card p-3 rounded-lg border">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Баланс</p>
              <p className="font-semibold">{balance.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
          <Button onClick={fetchData} disabled={loading} className="w-full">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Обновление...' : 'Обновить'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCampaigns.map((campaign) => (
          <Card
            key={campaign.advertId}
            className="p-4 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => setSelectedCampaign(campaign)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(campaign.status)}
                {getTypeIcon(campaign.type)}
              </div>
            </div>
            <h3 className="font-medium line-clamp-2">{campaign.campName}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Advertising;

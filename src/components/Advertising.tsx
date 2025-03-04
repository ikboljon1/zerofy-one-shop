
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
import { motion } from "framer-motion";

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

  // Status color backgrounds
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 border-green-200 dark:border-green-800';
      case 'paused': return 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800';
      case 'archived': return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/40 dark:to-gray-800/60 border-gray-200 dark:border-gray-700';
      case 'ready': return 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">Рекламные кампании</h2>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Типы кампаний</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
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
                <SelectTrigger className="w-full sm:w-[180px]">
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
          <motion.div 
            className="flex items-center gap-2 bg-gradient-to-r from-[#9b87f5]/10 to-[#8B5CF6]/20 dark:from-[#9b87f5]/20 dark:to-[#8B5CF6]/30 p-4 rounded-lg border border-[#9b87f5]/20"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Wallet className="h-5 w-5 text-[#9b87f5]" />
            <div>
              <p className="text-sm text-muted-foreground">Баланс</p>
              <p className="font-semibold">{balance.toLocaleString('ru-RU')} ₽</p>
            </div>
          </motion.div>
          <Button 
            onClick={fetchData} 
            disabled={loading} 
            className="w-full bg-[#9b87f5] hover:bg-[#7E69AB]"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Обновление...' : 'Обновить'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <motion.div
              key={campaign.advertId}
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all duration-300 ${getStatusColor(campaign.status)}`}
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(campaign.status)}
                    {getTypeIcon(campaign.type)}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-black/20">
                    {campaign.status === 'active' && 'Активна'}
                    {campaign.status === 'paused' && 'Пауза'}
                    {campaign.status === 'archived' && 'Архив'}
                    {campaign.status === 'ready' && 'Готова'}
                  </div>
                </div>
                <h3 className="font-medium line-clamp-2 leading-tight">{campaign.campName}</h3>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Нет активных кампаний</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {loading ? 'Загрузка данных...' : 'Попробуйте изменить фильтры или обновить данные'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Advertising;

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { getAdvertCosts } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CampaignDetails from "./CampaignDetails";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdvertisingProps {
  selectedStore?: { id: string; apiKey: string } | null;
}

interface Campaign {
  advertId: number;
  campName: string;
}

const ITEMS_PER_PAGE = 10;

const Advertising = ({ selectedStore }: AdvertisingProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
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

      const costsData = await getAdvertCosts(dateFrom, dateTo, selectedStore.apiKey);

      // Extract unique campaigns
      const uniqueCampaigns = Array.from(
        new Map(
          costsData.map(cost => [
            cost.advertId,
            { advertId: cost.advertId, campName: cost.campName }
          ])
        ).values()
      );

      setCampaigns(uniqueCampaigns);
      
      // Save to localStorage
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStore) {
      // Try to load from localStorage first
      const savedCampaigns = localStorage.getItem(`campaigns_${selectedStore.id}`);
      if (savedCampaigns) {
        setCampaigns(JSON.parse(savedCampaigns));
      }
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

  const totalPages = Math.ceil(campaigns.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCampaigns = campaigns.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Рекламные кампании</h2>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      <div className="grid gap-4">
        {currentCampaigns.map((campaign) => (
          <Card
            key={campaign.advertId}
            className="p-4 hover:bg-accent cursor-pointer transition-colors"
            onClick={() => setSelectedCampaign(campaign)}
          >
            <h3 className="font-medium">{campaign.campName}</h3>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Advertising;
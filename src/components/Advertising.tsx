import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdvertisingStats, fetchCampaignsList, Campaign } from "@/services/advertisingApi";
import { Megaphone, RefreshCw } from "lucide-react";

interface AdvertisingProps {
  selectedStore?: { id: string; apiKey: string } | null;
}

export default function Advertising({ selectedStore }: AdvertisingProps) {
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    if (!selectedStore?.apiKey) {
      toast({
        title: "Ошибка",
        description: "Выберите магазин",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchCampaignsList(selectedStore.apiKey);
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить список кампаний",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async (campaignId: number) => {
    if (!selectedStore?.apiKey) {
      toast({
        title: "Ошибка",
        description: "Выберите магазин",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const today = new Date();
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);

      const data = await fetchAdvertisingStats(
        selectedStore.apiKey,
        [campaignId],
        lastWeek,
        today
      );

      setStats(data);
      toast({
        title: "Успешно",
        description: "Статистика рекламы обновлена",
      });
    } catch (error) {
      console.error('Error fetching advertising stats:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить статистику рекламы",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStore?.apiKey) {
      fetchCampaigns();
    }
  }, [selectedStore]);

  const handleCampaignSelect = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    fetchStats(campaignId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Реклама</h2>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Рекламные кампании</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!selectedStore ? (
              <div className="text-center text-muted-foreground">
                Выберите магазин для просмотра рекламных кампаний
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center text-muted-foreground">
                {isLoading ? "Загрузка кампаний..." : "Нет активных рекламных кампаний"}
              </div>
            ) : (
              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card 
                    key={campaign.id}
                    className={`cursor-pointer transition-colors hover:bg-accent ${
                      selectedCampaignId === campaign.id ? 'border-primary' : ''
                    }`}
                    onClick={() => handleCampaignSelect(campaign.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Кампания #{campaign.id}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.name}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCampaignSelect(campaign.id);
                          }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Обновить статистику
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {stats.length > 0 && stats.map((campaign) => (
            <div key={campaign.advertId} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{campaign.views.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Просмотры</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{campaign.clicks.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Клики</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{campaign.ctr.toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">CTR</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{campaign.sum.toLocaleString()} ₽</div>
                    <p className="text-xs text-muted-foreground">Затраты</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Динамика показателей</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={campaign.days}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="views"
                          stroke="#8884d8"
                          name="Просмотры"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="clicks"
                          stroke="#82ca9d"
                          name="Клики"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Детальная статистика по дням</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Дата</TableHead>
                          <TableHead className="text-right">Просмотры</TableHead>
                          <TableHead className="text-right">Клики</TableHead>
                          <TableHead className="text-right">CTR</TableHead>
                          <TableHead className="text-right">CPC</TableHead>
                          <TableHead className="text-right">Затраты</TableHead>
                          <TableHead className="text-right">Заказы</TableHead>
                          <TableHead className="text-right">CR</TableHead>
                          <TableHead className="text-right">Сумма заказов</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {campaign.days.map((day, index) => (
                          <TableRow key={index}>
                            <TableCell>{day.date}</TableCell>
                            <TableCell className="text-right">{day.views.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{day.clicks.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{day.ctr.toFixed(2)}%</TableCell>
                            <TableCell className="text-right">{day.cpc.toFixed(2)} ₽</TableCell>
                            <TableCell className="text-right">{day.sum.toLocaleString()} ₽</TableCell>
                            <TableCell className="text-right">{day.orders.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{day.cr.toFixed(2)}%</TableCell>
                            <TableCell className="text-right">{day.sum_price.toLocaleString()} ₽</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {campaign.boosterStats && campaign.boosterStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика позиций</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={campaign.boosterStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="position"
                            stroke="#8884d8"
                            name="Позиция"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
      ))}
    </div>
  );
}

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdvertisingStats } from "@/services/advertisingApi";
import { Megaphone, RefreshCw } from "lucide-react";

interface AdvertisingProps {
  selectedStore?: { id: string; apiKey: string } | null;
}

export default function Advertising({ selectedStore }: AdvertisingProps) {
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignId, setCampaignId] = useState<string>("");
  const { toast } = useToast();

  const fetchStats = async () => {
    if (!selectedStore?.apiKey || !campaignId) {
      toast({
        title: "Ошибка",
        description: "Выберите магазин и введите ID кампании",
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
        [parseInt(campaignId)],
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
          <CardTitle>Статистика рекламной кампании</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="campaignId">ID кампании</Label>
              <Input
                id="campaignId"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="Введите ID рекламной кампании"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={fetchStats} 
                disabled={isLoading || !selectedStore}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isLoading ? "Загрузка..." : "Обновить статистику"}
              </Button>
            </div>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
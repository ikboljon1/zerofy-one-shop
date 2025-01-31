import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { getAdvertCosts, getAdvertFullStats, getAdvertPayments } from "@/services/advertisingApi";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdvertisingProps {
  selectedStore?: { id: string; apiKey: string } | null;
}

const Advertising = ({ selectedStore }: AdvertisingProps) => {
  const [costs, setCosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

      const [costsData, statsData, paymentsData] = await Promise.all([
        getAdvertCosts(dateFrom, dateTo),
        getAdvertFullStats(dateFrom, dateTo, [8960367, 9876543]), // Example campaign IDs
        getAdvertPayments(dateFrom, dateTo)
      ]);

      setCosts(costsData);
      setStats(statsData);
      setPayments(paymentsData);

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
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="border-b pb-2">
                <p>ID: {stat.advertId}</p>
                <p>Показы: {stat.views}</p>
                <p>Клики: {stat.clicks}</p>
                <p>CTR: {stat.ctr}%</p>
                <p>Заказы: {stat.orders}</p>
              </div>
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
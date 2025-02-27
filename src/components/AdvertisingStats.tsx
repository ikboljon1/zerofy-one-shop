
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdvertisingExpenseStructure, getAdvertBalance } from "@/services/advertisingApi";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Loader2, DollarSign, PieChart as PieChartIcon } from "lucide-react";

interface AdvertisingStatsProps {
  apiKey: string;
}

const COLORS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];
const RADIAN = Math.PI / 180;

const AdvertisingStats = ({ apiKey }: AdvertisingStatsProps) => {
  const [loading, setLoading] = useState(false);
  const [expenseStructure, setExpenseStructure] = useState<{
    searchAds: number;
    bannerAds: number;
    cardAds: number;
    autoAds: number;
    otherAds: number;
    total: number;
  } | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!apiKey) {
      toast({
        title: "Ошибка",
        description: "API ключ не предоставлен",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Получаем структуру расходов
      const structure = await getAdvertisingExpenseStructure(apiKey);
      setExpenseStructure(structure);

      // Получаем баланс
      const balanceData = await getAdvertBalance(apiKey);
      setBalance(balanceData.balance);

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
    if (apiKey) {
      fetchData();
    }
  }, [apiKey]);

  // Подготовка данных для диаграммы
  const chartData = expenseStructure
    ? [
        { name: "Реклама в поиске", value: expenseStructure.searchAds },
        { name: "Баннерная реклама", value: expenseStructure.bannerAds },
        { name: "Реклама в карточках", value: expenseStructure.cardAds },
        { name: "Автоматическая", value: expenseStructure.autoAds },
        { name: "Прочее", value: expenseStructure.otherAds },
      ].filter(item => item.value > 0)
    : [];

  // Кастомная метка для диаграммы
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <p className="text-muted-foreground">Для просмотра статистики рекламы необходим API ключ</p>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
            Структура расходов на рекламу
          </h3>
          <p className="text-sm text-muted-foreground">За последние 7 дней</p>
        </div>
        <div className="flex items-center gap-4">
          {balance > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Баланс</p>
                <p className="font-semibold">{balance.toLocaleString()} ₽</p>
              </div>
            </div>
          )}
          <Button onClick={fetchData} disabled={loading} variant="outline">
            <RefreshIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Загрузка...' : 'Обновить'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : expenseStructure && chartData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value.toLocaleString()} ₽`, '']}
                  contentStyle={{ background: '#ffffff', borderRadius: '4px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 flex flex-col justify-center">
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="font-medium">Общие расходы:</span>
                <span className="font-bold text-lg">{expenseStructure.total.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[300px] text-center">
          <p className="text-muted-foreground mb-4">Нет данных о рекламных расходах</p>
          <p className="text-sm text-muted-foreground">Возможно, у вас нет активных рекламных кампаний или необходимо обновить данные</p>
        </div>
      )}
    </Card>
  );
};

// Отдельный компонент иконки для обновления
const RefreshIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M3 21v-5h5"></path>
  </svg>
);

export default AdvertisingStats;

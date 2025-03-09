
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import StoreManager from "@/components/stores/StoreManager";
import { SalesOverview } from "@/components/sales/SalesOverview";
import { OrdersChart } from "@/components/analytics/OrdersChart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Calculator, Clock, CreditCard, LayoutDashboard, RefreshCw } from "lucide-react";
import { WildberriesStatistics } from "@/components/analytics/WildberriesStatistics";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { addDays, endOfMonth, startOfMonth, subDays } from "date-fns";
import CalculatorModal from "@/components/CalculatorModal";
import QuickStats from "@/components/analytics/QuickStats";
import { formatCurrency } from "@/utils/formatCurrency";

interface Store {
  id: string;
  name: string;
  marketplace: string;
  apiKey: string;
  createdAt: string;
  isSelected?: boolean;
}

const Index = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [statsLastUpdated, setStatsLastUpdated] = useState<Date | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Получаем ID текущего пользователя из localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserId(userData.id);
      } catch (error) {
        console.error('Ошибка при парсинге данных пользователя:', error);
      }
    }
  }, []);

  // Загружаем выбранный магазин для текущего пользователя
  useEffect(() => {
    if (userId) {
      loadSelectedStore();
    }
  }, [userId]);

  const loadSelectedStore = () => {
    if (!userId) return;
    
    const storageKey = `marketplace_stores_${userId}`;
    const savedStores = localStorage.getItem(storageKey);
    
    if (savedStores) {
      try {
        const stores = JSON.parse(savedStores);
        const selected = stores.find((store: Store) => store.isSelected);
        if (selected) {
          setSelectedStore(selected);
        }
      } catch (error) {
        console.error('Ошибка при загрузке выбранного магазина:', error);
      }
    }
  };

  const getDateRange = () => {
    const today = new Date();
    let dateFrom, dateTo;

    switch (selectedPeriod) {
      case "7days":
        dateFrom = subDays(today, 7);
        dateTo = today;
        break;
      case "30days":
        dateFrom = subDays(today, 30);
        dateTo = today;
        break;
      case "90days":
        dateFrom = subDays(today, 90);
        dateTo = today;
        break;
      case "currentMonth":
        dateFrom = startOfMonth(today);
        dateTo = today;
        break;
      case "previousMonth":
        const prevMonth = subDays(startOfMonth(today), 1);
        dateFrom = startOfMonth(prevMonth);
        dateTo = endOfMonth(prevMonth);
        break;
      default:
        dateFrom = subDays(today, 30);
        dateTo = today;
    }

    return { dateFrom, dateTo };
  };

  const fetchStatistics = async () => {
    if (!selectedStore) {
      toast({
        title: "Ошибка",
        description: "Выберите магазин для просмотра статистики",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { dateFrom, dateTo } = getDateRange();
      
      // Получаем данные из API
      const data = await fetchWildberriesStats(selectedStore.apiKey, dateFrom, dateTo);
      
      if (!data) {
        throw new Error("Не удалось получить данные статистики");
      }
      
      // Сохраняем данные в localStorage
      const statsKey = `wb_stats_${selectedStore.id}_${selectedPeriod}`;
      localStorage.setItem(statsKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      
      setStatistics(data);
      setStatsLastUpdated(new Date());
      
      toast({
        title: "Успех",
        description: "Статистика успешно обновлена",
      });
    } catch (error) {
      console.error("Ошибка при загрузке статистики:", error);
      toast({
        title: "Ошибка загрузки данных",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем сохранённую статистику при изменении выбранного магазина или периода
  useEffect(() => {
    if (selectedStore) {
      loadSavedStatistics();
    }
  }, [selectedStore, selectedPeriod]);

  const loadSavedStatistics = () => {
    if (!selectedStore) return;
    
    const statsKey = `wb_stats_${selectedStore.id}_${selectedPeriod}`;
    const savedStats = localStorage.getItem(statsKey);
    
    if (savedStats) {
      try {
        const { data, timestamp } = JSON.parse(savedStats);
        setStatistics(data);
        setStatsLastUpdated(new Date(timestamp));
      } catch (error) {
        console.error("Ошибка при загрузке сохранённой статистики:", error);
      }
    } else {
      // Если статистики нет в localStorage, загружаем её
      fetchStatistics();
    }
  };

  const handleStoreSelect = (store: Store | null) => {
    setSelectedStore(store);
    // Сбрасываем статистику при изменении магазина
    setStatistics(null);
    setStatsLastUpdated(null);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    // Сбрасываем статистику при изменении периода
    setStatistics(null);
    setStatsLastUpdated(null);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
          <div className="flex items-center space-x-2">
            {selectedStore && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCalculatorOpen(true)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Калькулятор цены
                </Button>
                <Button 
                  onClick={fetchStatistics} 
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Обновление...' : 'Обновить данные'}
                </Button>
              </>
            )}
          </div>
        </div>

        {statsLastUpdated && (
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Последнее обновление: {statsLastUpdated.toLocaleString('ru-RU')}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Управление магазинами</CardTitle>
              <CardDescription>
                Добавьте и настройте ваши магазины на маркетплейсах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoreManager onStoreSelect={handleStoreSelect} />
            </CardContent>
          </Card>

          {selectedStore ? (
            <>
              {statistics ? (
                <>
                  <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-center space-x-4">
                      <div>
                        <CardTitle>Быстрая статистика</CardTitle>
                        <CardDescription>
                          Основные показатели магазина {selectedStore.name}
                        </CardDescription>
                      </div>
                      <Tabs 
                        value={selectedPeriod} 
                        onValueChange={handlePeriodChange}
                        className="ml-auto"
                      >
                        <TabsList>
                          <TabsTrigger value="7days">7 дней</TabsTrigger>
                          <TabsTrigger value="30days">30 дней</TabsTrigger>
                          <TabsTrigger value="90days">90 дней</TabsTrigger>
                          <TabsTrigger value="currentMonth">Тек. месяц</TabsTrigger>
                          <TabsTrigger value="previousMonth">Прош. месяц</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>
                    <CardContent>
                      <QuickStats statistics={statistics} />
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle>Доходы и заказы</CardTitle>
                      <CardDescription>
                        График продаж и заказов за выбранный период
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <OrdersChart 
                        ordersData={statistics.sales || []} 
                        period={selectedPeriod} 
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="space-y-0.5">
                        <CardTitle>Доход</CardTitle>
                        <CardDescription>За период</CardDescription>
                      </div>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(statistics.currentPeriod?.income || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        За предыдущий период: {formatCurrency(statistics.previousPeriod?.income || 0)}
                      </div>
                      {statistics.currentPeriod?.income !== undefined && statistics.previousPeriod?.income !== undefined && (
                        <div className="mt-2">
                          <SalesOverview 
                            currentValue={statistics.currentPeriod.income} 
                            previousValue={statistics.previousPeriod.income} 
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-4">
                    <CardHeader>
                      <CardTitle>Подробная статистика</CardTitle>
                      <CardDescription>
                        Детальная аналитика продаж, расходов и прибыли
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <WildberriesStatistics statistics={statistics} />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Загрузка данных</CardTitle>
                    <CardDescription>
                      Подготовка статистики для магазина {selectedStore.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center py-8">
                    <div className="mb-4">
                      <LayoutDashboard className="h-12 w-12 text-primary" />
                    </div>
                    {isLoading ? (
                      <>
                        <h3 className="text-lg font-medium mb-2">Загрузка статистики...</h3>
                        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-pulse"></div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium mb-2">Нажмите "Обновить данные" </h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Для получения статистики необходимо обновить данные
                        </p>
                        <Button onClick={fetchStatistics}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Обновить данные
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Добавьте или выберите магазин</CardTitle>
                <CardDescription>
                  Для просмотра статистики необходимо выбрать магазин
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-8">
                <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет выбранного магазина</h3>
                <p className="text-muted-foreground text-center">
                  Добавьте новый магазин или выберите существующий для просмотра статистики
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Модальное окно калькулятора */}
      <CalculatorModal 
        open={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />
    </Layout>
  );
};

export default Index;

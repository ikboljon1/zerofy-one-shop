
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw, Package, Banknote, XCircle, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadStores, getOrdersData, getSalesData, fetchAndUpdateOrders, fetchAndUpdateSales } from "@/utils/storeUtils";
import OrdersTable from "./OrdersTable";
import SalesTable from "./SalesTable";
import GeographySection from "./GeographySection";
import { StatsCard } from "./StatsCard";
import { TimePeriod } from "@/types/statistics";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today");

  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const [warehouseDistribution, setWarehouseDistribution] = useState([]);
  const [regionDistribution, setRegionDistribution] = useState([]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const stores = loadStores();
      const selectedStore = stores.find(s => s.isSelected);
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        return;
      }

      // Загружаем заказы
      const ordersResult = await fetchAndUpdateOrders(selectedStore);
      if (ordersResult) {
        setOrders(ordersResult.orders);
        setWarehouseDistribution(ordersResult.warehouseDistribution);
        setRegionDistribution(ordersResult.regionDistribution);
      } else {
        // Если не удалось получить новые данные, пробуем загрузить из хранилища
        const savedOrdersData = getOrdersData(selectedStore.id);
        if (savedOrdersData) {
          setOrders(savedOrdersData.orders || []);
          setWarehouseDistribution(savedOrdersData.warehouseDistribution || []);
          setRegionDistribution(savedOrdersData.regionDistribution || []);
        }
      }

      // Загружаем продажи
      const salesResult = await fetchAndUpdateSales(selectedStore);
      if (salesResult) {
        setSales(salesResult);
      } else {
        const savedSalesData = getSalesData(selectedStore.id);
        if (savedSalesData) {
          setSales(savedSalesData.sales || []);
        }
      }

      toast({
        title: "Успех",
        description: "Данные успешно обновлены",
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const calculateStats = () => {
    const orderStats = {
      totalOrders: orders.length,
      totalAmount: orders.reduce((sum, order: any) => sum + order.priceWithDisc, 0),
      canceledOrders: orders.filter((order: any) => order.isCancel).length,
      activeOrders: orders.filter((order: any) => !order.isCancel).length,
    };

    const salesStats = {
      totalSales: sales.length,
      totalAmount: sales.reduce((sum, sale: any) => sum + sale.priceWithDisc, 0),
      returnedItems: sales.filter((sale: any) => sale.saleID.startsWith('R')).length,
      totalForPay: sales.reduce((sum, sale: any) => sum + sale.forPay, 0),
    };

    return { orderStats, salesStats };
  };

  const { orderStats, salesStats } = calculateStats();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Дашборд</h2>
        <Button onClick={fetchData} disabled={isLoading} variant="default">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Обновить данные
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <ToggleGroup type="single" value={selectedPeriod} onValueChange={(value: TimePeriod) => value && setSelectedPeriod(value)}>
          <ToggleGroupItem value="today">Сегодня</ToggleGroupItem>
          <ToggleGroupItem value="week">Неделя</ToggleGroupItem>
          <ToggleGroupItem value="2weeks">2 недели</ToggleGroupItem>
          <ToggleGroupItem value="4weeks">4 недели</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="geography">География</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard 
              title="Всего заказов" 
              value={orderStats.totalOrders}
              icon={Package}
            />
            <StatsCard 
              title="Сумма заказов" 
              value={orderStats.totalAmount}
              icon={Banknote}
              isCurrency
            />
            <StatsCard 
              title="Отменено" 
              value={orderStats.canceledOrders}
              icon={XCircle}
            />
            <StatsCard 
              title="Активных" 
              value={orderStats.activeOrders}
              icon={ShoppingBag}
            />
          </div>
          <OrdersTable orders={orders} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <StatsCard 
              title="Всего продаж" 
              value={salesStats.totalSales}
              icon={ShoppingBag}
            />
            <StatsCard 
              title="Сумма продаж" 
              value={salesStats.totalAmount}
              icon={Banknote}
              isCurrency
            />
            <StatsCard 
              title="Возвраты" 
              value={salesStats.returnedItems}
              icon={XCircle}
            />
            <StatsCard 
              title="К перечислению" 
              value={salesStats.totalForPay}
              icon={Banknote}
              isCurrency
            />
          </div>
          <SalesTable sales={sales} />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <GeographySection 
            warehouseDistribution={warehouseDistribution} 
            regionDistribution={regionDistribution}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

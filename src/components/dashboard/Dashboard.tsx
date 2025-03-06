
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  loadStores,
  getOrdersData, 
  getSalesData, 
  fetchAndUpdateOrders, 
  fetchAndUpdateSales 
} from "@/utils/storeUtils";
import OrdersTable from "./OrdersTable";
import SalesTable from "./SalesTable";
import GeographySection from "./GeographySection";
import Stats from "@/components/Stats";
import PeriodSelector, { Period } from "./PeriodSelector";
import { WildberriesOrder, WildberriesSale } from "@/types/store";

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState<Period>("today");
  const [isLoading, setIsLoading] = useState(false);
  
  const [orders, setOrders] = useState<WildberriesOrder[]>([]);
  const [sales, setSales] = useState<WildberriesSale[]>([]);
  const [warehouseDistribution, setWarehouseDistribution] = useState<any[]>([]);
  const [regionDistribution, setRegionDistribution] = useState<any[]>([]);

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

      const ordersResult = await fetchAndUpdateOrders(selectedStore);
      if (ordersResult) {
        setOrders(ordersResult.orders);
        setWarehouseDistribution(ordersResult.warehouseDistribution);
        setRegionDistribution(ordersResult.regionDistribution);
      } else {
        const savedOrdersData = getOrdersData(selectedStore.id);
        if (savedOrdersData) {
          setOrders(savedOrdersData.orders || []);
          setWarehouseDistribution(savedOrdersData.warehouseDistribution || []);
          setRegionDistribution(savedOrdersData.regionDistribution || []);
        }
      }

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
    const stores = loadStores();
    const selectedStore = stores.find(s => s.isSelected);
    
    if (selectedStore) {
      const savedOrdersData = getOrdersData(selectedStore.id);
      if (savedOrdersData) {
        setOrders(savedOrdersData.orders || []);
        setWarehouseDistribution(savedOrdersData.warehouseDistribution || []);
        setRegionDistribution(savedOrdersData.regionDistribution || []);
      }

      const savedSalesData = getSalesData(selectedStore.id);
      if (savedSalesData) {
        setSales(savedSalesData.sales || []);
      }

      if (!savedOrdersData || !savedSalesData) {
        fetchData();
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Дашборд</h2>
        <Button 
          onClick={fetchData} 
          disabled={isLoading}
          variant="default"
        >
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

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="geography">География</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Stats />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="mb-4">
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
          <OrdersTable orders={orders} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="mb-4">
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
          <SalesTable sales={sales} />
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="mb-4">
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>
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

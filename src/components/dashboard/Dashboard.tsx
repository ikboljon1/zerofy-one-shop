
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Loader2, RefreshCw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
import Chart from "@/components/Chart";
import { WildberriesOrder, WildberriesSale } from "@/types/store";

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
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
        // Если не удалось получить новые данные, пробуем загрузить из хранилища
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

  // Загрузка данных при первом рендере
  useEffect(() => {
    const stores = loadStores();
    const selectedStore = stores.find(s => s.isSelected);
    
    if (selectedStore) {
      // Пробуем загрузить данные из хранилища
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

      // Если данных нет или они устарели, загружаем новые
      if (!savedOrdersData || !savedSalesData) {
        fetchData();
      }
    }
  }, []);

  const renderDatePicker = (date: Date, onChange: (date: Date) => void, label: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

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

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {renderDatePicker(dateFrom, setDateFrom, "Начальная дата")}
        {renderDatePicker(dateTo, setDateTo, "Конечная дата")}
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
          <OrdersTable orders={orders} />
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
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

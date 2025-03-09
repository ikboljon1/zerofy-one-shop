
import React, { useState, useEffect } from "react";
import { subDays, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

import SalesChart from "./SalesChart";
import SalesTable from "./SalesTable";
import OrdersTable from "./OrdersTable";
import SalesMetrics from "./SalesMetrics";
import OrderMetrics from "./OrderMetrics";
import OrdersChart from "./OrdersChart";
import PeriodSelector from "./PeriodSelector";
import TipsAccordion from "./TipsAccordion";

import { fetchWildberriesSales, fetchWildberriesOrders } from "@/services/wildberriesApi";
import { WildberriesSale, WildberriesOrder } from "@/types/store";

const Dashboard = () => {
  const [dateFrom, setDateFrom] = useState(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<WildberriesSale[]>([]);
  const [orders, setOrders] = useState<WildberriesOrder[]>([]);
  const { toast } = useToast();

  const getSelectedStore = () => {
    const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
    return stores.find((store: any) => store.isSelected) || null;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const selectedStore = getSelectedStore();
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const [salesData, ordersData] = await Promise.all([
        fetchWildberriesSales(selectedStore.apiKey, dateFrom, dateTo),
        fetchWildberriesOrders(selectedStore.apiKey, dateFrom, dateTo)
      ]);

      setSales(salesData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о продажах и заказах",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  const handlePeriodChange = (from: Date, to: Date) => {
    setDateFrom(from);
    setDateTo(to);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PeriodSelector 
        dateFrom={dateFrom}
        dateTo={dateTo}
        onPeriodChange={handlePeriodChange}
      />
      
      {/* Добавляем раздел Советы */}
      <TipsAccordion />
      
      <SalesMetrics sales={sales} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SalesChart sales={sales} />
        <OrdersChart orders={orders} />
      </div>
      
      <div className="space-y-8">
        <OrderMetrics orders={orders} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SalesTable sales={sales} />
          <OrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

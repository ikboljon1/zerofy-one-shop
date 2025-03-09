import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "@/components/dashboard/Overview";
import { RecentSales } from "@/components/dashboard/RecentSales";
import { SearchOrders } from "@/components/dashboard/SearchOrders";
import { GeographyChart } from "@/components/dashboard/GeographyChart";
import { Warehouses } from "@/components/dashboard/Warehouses";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/hooks/use-store";

// Import the new AdvertisingSection component
import AdvertisingSection from './AdvertisingSection';
import { Store } from '@/types';

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const { stores } = useStore();

  useEffect(() => {
    const storedStoreId = localStorage.getItem('selectedStoreId');
    if (storedStoreId) {
      const store = stores?.find(s => s.id === storedStoreId);
      if (store) {
        setSelectedStore(store);
      } else {
        localStorage.removeItem('selectedStoreId');
      }
    }
  }, [stores]);

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    localStorage.setItem('selectedStoreId', store.id);
    toast({
      title: "Магазин выбран",
      description: `Вы выбрали магазин ${store.name}`,
    });
  };

  return (
    <div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="sales">Продажи</TabsTrigger>
          <TabsTrigger value="orders">Заказы</TabsTrigger>
          <TabsTrigger value="advertising">Реклама</TabsTrigger>
          <TabsTrigger value="geography">География</TabsTrigger>
          <TabsTrigger value="warehouses">Склады</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Overview onStoreSelect={handleStoreSelect} selectedStore={selectedStore} />
        </TabsContent>
        
        <TabsContent value="sales" className="space-y-6">
          <RecentSales selectedStore={selectedStore} />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-6">
          <SearchOrders selectedStore={selectedStore} />
        </TabsContent>
        
        <TabsContent value="advertising" className="space-y-6">
          <AdvertisingSection selectedStore={selectedStore} />
        </TabsContent>
        
        <TabsContent value="geography" className="space-y-6">
          <GeographyChart selectedStore={selectedStore} />
        </TabsContent>
        
        <TabsContent value="warehouses" className="space-y-6">
          <Warehouses selectedStore={selectedStore} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

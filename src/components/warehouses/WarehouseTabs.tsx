
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardListIcon, PackageOpen, DollarSign } from 'lucide-react';
import { Store as StoreType } from '@/types/store';
import { getPreferredWarehouses } from '@/services/suppliesApi';
import { useWarehouse } from '@/contexts/WarehouseContext';
import WarehouseInventoryTab from './WarehouseInventoryTab';
import WarehouseSuppliesTab from './WarehouseSuppliesTab';
import WarehouseStorageTab from './WarehouseStorageTab';

interface WarehouseTabsProps {
  selectedStore: StoreType;
}

const WarehouseTabs: React.FC<WarehouseTabsProps> = ({ selectedStore }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const { 
    clearWarehouseData,
    loadWarehouses, 
    loadCoefficients, 
    loadWarehouseRemains, 
    loadAverageDailySales, 
    loadPaidStorageData
  } = useWarehouse();

  // При изменении выбранного магазина или таба загружаем соответствующие данные
  useEffect(() => {
    if (selectedStore) {
      // Сначала очищаем предыдущие данные
      clearWarehouseData();
      
      // Загружаем данные в зависимости от активного таба
      if (activeTab === 'supplies') {
        loadWarehouses(selectedStore.apiKey);
        loadCoefficients(selectedStore.apiKey);
        // Get preferred warehouses but don't need to store them in a variable here
        getPreferredWarehouses(selectedStore.id.toString());
      } else if (activeTab === 'inventory') {
        loadWarehouseRemains(selectedStore.apiKey);
        loadAverageDailySales(selectedStore.apiKey);
        loadPaidStorageData(selectedStore.apiKey);
      } else if (activeTab === 'storage') {
        loadPaidStorageData(selectedStore.apiKey);
      }
    }
  }, [activeTab, selectedStore]);

  return (
    <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-3 w-full max-w-md">
        <TabsTrigger value="inventory" className="flex items-center justify-center">
          <ClipboardListIcon className="h-4 w-4 mr-2" />
          <span>Инвентарь</span>
        </TabsTrigger>
        <TabsTrigger value="supplies" className="flex items-center justify-center">
          <PackageOpen className="h-4 w-4 mr-2" />
          <span>Поставки</span>
        </TabsTrigger>
        <TabsTrigger value="storage" className="flex items-center justify-center">
          <DollarSign className="h-4 w-4 mr-2" />
          <span>Хранение</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inventory" className="space-y-4">
        <WarehouseInventoryTab storeApiKey={selectedStore.apiKey} />
      </TabsContent>

      <TabsContent value="supplies" className="space-y-4">
        <WarehouseSuppliesTab storeApiKey={selectedStore.apiKey} storeId={parseInt(selectedStore.id.toString())} />
      </TabsContent>

      <TabsContent value="storage" className="space-y-4">
        <WarehouseStorageTab storeApiKey={selectedStore.apiKey} />
      </TabsContent>
    </Tabs>
  );
};

export default WarehouseTabs;

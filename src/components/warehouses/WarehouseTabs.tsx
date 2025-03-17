
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardListIcon, 
  PackageOpen, 
  RefreshCw, 
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Store } from '@/types/store';
import { useWarehouse } from '@/contexts/WarehouseContext';
import WarehouseInventoryTab from './WarehouseInventoryTab';
import WarehouseSuppliesTab from './WarehouseSuppliesTab';
import WarehouseStorageTab from './WarehouseStorageTab';
import NoStoreSelectedCard from './NoStoreSelectedCard';

interface WarehouseTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedStore: Store | null;
}

const WarehouseTabs: React.FC<WarehouseTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  selectedStore 
}) => {
  const { loading, refreshStoreData } = useWarehouse();

  const handleRefreshData = () => {
    if (!selectedStore) return;
    refreshStoreData(selectedStore, activeTab);
  };

  return (
    <Tabs 
      defaultValue="inventory" 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="space-y-4"
    >
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

      {!selectedStore ? (
        <NoStoreSelectedCard />
      ) : (
        <>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshData}
              disabled={loading.warehouses || loading.coefficients || loading.remains || loading.paidStorage}
              className="flex items-center gap-2"
            >
              {(loading.warehouses || loading.coefficients || loading.remains || loading.paidStorage) ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Обновить данные
            </Button>
          </div>

          <TabsContent value="inventory" className="space-y-4">
            <WarehouseInventoryTab />
          </TabsContent>

          <TabsContent value="supplies" className="space-y-4">
            <WarehouseSuppliesTab />
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <WarehouseStorageTab />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

export default WarehouseTabs;

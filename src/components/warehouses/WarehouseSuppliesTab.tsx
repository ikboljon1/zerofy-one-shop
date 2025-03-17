
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';
import { SupplyForm, WarehouseCoefficientsDateCard } from '@/components/supplies';
import WarehouseTabHeader from './WarehouseTabHeader';
import { useWarehouse } from '@/contexts/WarehouseContext';

interface WarehouseSuppliesTabProps {
  storeApiKey: string;
  storeId: number;
}

const WarehouseSuppliesTab: React.FC<WarehouseSuppliesTabProps> = ({ storeApiKey, storeId }) => {
  const { 
    wbWarehouses, 
    coefficients, 
    selectedWarehouseId,
    loading,
    loadWarehouses,
    loadCoefficients,
    setSelectedWarehouseId,
    handleSavePreferredWarehouse
  } = useWarehouse();

  const handleRefreshData = () => {
    loadWarehouses(storeApiKey);
    loadCoefficients(storeApiKey);
  };

  const handleWarehouseSelect = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    loadCoefficients(storeApiKey, warehouseId);
  };

  const handleSavePreferred = (warehouseId: number) => {
    handleSavePreferredWarehouse(storeId, warehouseId);
  };

  return (
    <>
      <WarehouseTabHeader
        title="Управление поставками"
        description="Анализ коэффициентов приемки и выбор оптимального склада"
        tooltipContent={
          <div className="space-y-2">
            <p className="font-medium">Как работать с разделом "Поставки":</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Используйте форму для ввода параметров планируемой поставки</li>
              <li>Изучите коэффициенты приемки по дням недели для каждого склада</li>
              <li>Выбирайте склады с высокими коэффициентами для более быстрой приемки</li>
              <li>При отсутствии данных API показываются демо-данные</li>
            </ol>
          </div>
        }
        isLoading={loading.warehouses || loading.coefficients}
        onRefresh={handleRefreshData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <SupplyForm onWarehouseSelect={handleWarehouseSelect} />
        </div>
        
        <div className="lg:col-span-2">
          {loading.coefficients ? (
            <Skeleton className="h-[600px] w-full" />
          ) : (
            <WarehouseCoefficientsDateCard
              coefficients={coefficients} 
              selectedWarehouseId={selectedWarehouseId}
              title="Коэффициенты приемки по дням"
              warehouses={wbWarehouses}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default WarehouseSuppliesTab;

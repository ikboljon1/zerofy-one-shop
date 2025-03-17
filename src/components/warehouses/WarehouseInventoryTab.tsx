
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  WarehouseRemains,
  StorageProfitabilityAnalysis
} from '@/components/supplies';
import { useWarehouse } from '@/contexts/WarehouseContext';
import WarehouseTabHeader from './WarehouseTabHeader';

const WarehouseInventoryTab: React.FC = () => {
  const { 
    warehouseRemains, 
    paidStorageData, 
    averageDailySales, 
    dailyStorageCosts,
    loading 
  } = useWarehouse();

  return (
    <>
      <WarehouseTabHeader 
        title="Остатки товаров на складах"
        description="Актуальная информация о количестве товаров"
        tooltipContent={
          <div className="space-y-2">
            <p className="font-medium">Как работать с разделом "Инвентарь":</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Здесь отображаются все ваши товары на складах Wildberries</li>
              <li>Таблица показывает количество, стоимость и дневные продажи</li>
              <li>Анализ рентабельности помогает выявить "залежавшиеся" товары</li>
              <li>При отсутствии данных API показываются демо-данные</li>
            </ol>
          </div>
        }
      />

      {loading.remains ? (
        <div className="grid gap-4">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <>
          <WarehouseRemains 
            data={warehouseRemains} 
            isLoading={loading.remains} 
          />
          
          <div className="mt-8">
            {loading.paidStorage ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <StorageProfitabilityAnalysis 
                warehouseItems={warehouseRemains}
                paidStorageData={paidStorageData}
                averageDailySalesRate={averageDailySales}
                dailyStorageCost={dailyStorageCosts}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default WarehouseInventoryTab;

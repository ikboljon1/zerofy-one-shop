
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PaidStorageCostReport } from '@/components/supplies';
import WarehouseTabHeader from './WarehouseTabHeader';
import { useWarehouse } from '@/contexts/WarehouseContext';

interface WarehouseStorageTabProps {
  storeApiKey: string;
}

const WarehouseStorageTab: React.FC<WarehouseStorageTabProps> = ({ storeApiKey }) => {
  const { 
    paidStorageData, 
    loading,
    loadPaidStorageData
  } = useWarehouse();

  const handleRefreshData = () => {
    loadPaidStorageData(storeApiKey);
  };

  return (
    <>
      <WarehouseTabHeader
        title="Отчет о платном хранении"
        description="Аналитика затрат на хранение товаров"
        tooltipContent={
          <div className="space-y-2">
            <p className="font-medium">Как работать с разделом "Хранение":</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Здесь отображаются затраты на хранение ваших товаров</li>
              <li>Анализируйте дневную стоимость хранения каждого товара</li>
              <li>Сопоставляйте стоимость хранения с прибылью от продаж</li>
              <li>Выявляйте товары с высокими затратами на хранение</li>
              <li>При отсутствии данных API показываются демо-данные</li>
            </ol>
          </div>
        }
        isLoading={loading.paidStorage}
        onRefresh={handleRefreshData}
      />

      {loading.paidStorage && paidStorageData.length === 0 ? (
        <Skeleton className="h-[600px] w-full" />
      ) : (
        <PaidStorageCostReport 
          apiKey={storeApiKey}
          storageData={paidStorageData}
          isLoading={loading.paidStorage}
          onRefresh={loadPaidStorageData}
        />
      )}
    </>
  );
};

export default WarehouseStorageTab;

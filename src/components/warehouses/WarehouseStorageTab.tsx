
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PaidStorageCostReport } from '@/components/supplies';
import { useWarehouse } from '@/contexts/WarehouseContext';
import WarehouseTabHeader from './WarehouseTabHeader';

const WarehouseStorageTab: React.FC = () => {
  const { 
    paidStorageData, 
    loading,
    loadPaidStorageData 
  } = useWarehouse();

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
      />

      {loading.paidStorage && paidStorageData.length === 0 ? (
        <Skeleton className="h-[600px] w-full" />
      ) : (
        <PaidStorageCostReport 
          apiKey="" // This will be handled in the component which gets the API key from the selected store
          storageData={paidStorageData}
          isLoading={loading.paidStorage}
          onRefresh={(apiKey) => {
            if (apiKey) {
              loadPaidStorageData(apiKey);
            }
          }}
        />
      )}
    </>
  );
};

export default WarehouseStorageTab;

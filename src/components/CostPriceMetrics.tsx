
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Store } from '@/types/store';

interface CostPriceMetricsProps {
  selectedStore: Store;
}

const CostPriceMetrics: React.FC<CostPriceMetricsProps> = ({ selectedStore }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Себестоимость товаров</CardTitle>
        <CardDescription>
          Анализ себестоимости и прибыльности товаров для магазина {selectedStore.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Раздел находится в разработке. Здесь будет отображаться информация о себестоимости товаров
          и ее влиянии на прибыльность.
        </p>
      </CardContent>
    </Card>
  );
};

export default CostPriceMetrics;

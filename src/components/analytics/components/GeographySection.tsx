import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MapPin, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { calculateWarehouseDistribution, calculateRegionDistribution } from "@/utils/storeUtils";

interface GeographySectionProps {
  orders: any[];
}

const GeographySection = ({ orders }: GeographySectionProps) => {
  const [warehouseData, setWarehouseData] = useState<Record<string, number>>({});
  const [regionData, setRegionData] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (orders && orders.length > 0) {
      setWarehouseData(calculateWarehouseDistribution(orders));
      setRegionData(calculateRegionDistribution(orders));
    }
  }, [orders]);
  
  const topWarehouses = Object.entries(warehouseData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  const topRegions = Object.entries(regionData)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const totalWarehouseOrders = topWarehouses.reduce((sum, { count }) => sum + count, 0);
  const totalRegionOrders = topRegions.reduce((sum, { count }) => sum + count, 0);
  
  const renderDistributionChart = (
    items: { name: string; count: number }[], 
    total: number, 
    title: string, 
    icon: React.ReactNode,
    iconColor: string
  ) => (
    <Card className="p-5 border-0 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Badge variant="outline" className="ml-auto">
          Всего: {total}
        </Badge>
      </div>
      
      <ScrollArea className="h-48 w-full pr-4">
        {items.length > 0 ? (
          items.map((item, index) => {
            const percentage = Math.round((item.count / total) * 100);
            
            return (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">{item.count} заказов ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`${iconColor} h-2.5 rounded-full`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Нет данных для отображения
          </div>
        )}
      </ScrollArea>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">География заказов</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderDistributionChart(
          topWarehouses, 
          totalWarehouseOrders, 
          "Распределение заказов по складам", 
          <Package className="text-purple-500" />,
          "bg-purple-600"
        )}
        {renderDistributionChart(
          topRegions, 
          totalRegionOrders, 
          "Распределение заказов по регионам", 
          <MapPin className="text-blue-500" />,
          "bg-blue-600"
        )}
      </div>
    </div>
  );
};

export default GeographySection;

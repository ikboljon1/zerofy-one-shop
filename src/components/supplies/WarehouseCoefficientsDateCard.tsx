
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  WarehouseCoefficient, 
  Warehouse 
} from '@/types/supplies';
import WarehouseCoefficientsTable from './WarehouseCoefficientsTable';
import { Badge } from '@/components/ui/badge';

export interface WarehouseCoefficientsDateCardProps {
  coefficients: WarehouseCoefficient[];
  selectedWarehouseId?: number;
  title: string;
  warehouses: Warehouse[];
  onWarehouseSelect: (warehouseId: number) => void;
  onSavePreferred: (warehouseId: number) => void;
  preferredWarehouses: number[];
}

const WarehouseCoefficientsDateCard: React.FC<WarehouseCoefficientsDateCardProps> = ({
  coefficients,
  selectedWarehouseId,
  title,
  warehouses,
  onWarehouseSelect,
  onSavePreferred,
  preferredWarehouses
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filter coefficients by selected date
  const filteredCoefficients = coefficients.filter(coef => {
    if (!selectedDate) return true;
    
    const coefDate = new Date(coef.date);
    return (
      coefDate.getDate() === selectedDate.getDate() &&
      coefDate.getMonth() === selectedDate.getMonth() &&
      coefDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {warehouses.map(warehouse => (
            <Badge
              key={warehouse.id}
              variant={selectedWarehouseId === warehouse.id ? "default" : 
                      (preferredWarehouses.includes(warehouse.id) ? "secondary" : "outline")}
              className="cursor-pointer"
              onClick={() => onWarehouseSelect(warehouse.id)}
            >
              {warehouse.name}
              {preferredWarehouses.includes(warehouse.id) && " ★"}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="border rounded-md"
          />
        </div>
        <div className="md:col-span-2">
          <WarehouseCoefficientsTable 
            coefficients={filteredCoefficients} 
            selectedWarehouseId={selectedWarehouseId}
            onSavePreferred={onSavePreferred}
            preferredWarehouses={preferredWarehouses}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseCoefficientsDateCard;

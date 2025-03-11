
import React from 'react';
import { Warehouse } from '@/types/supplies';
import { SearchIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchInput } from '@/components/ui/search-input';

interface WarehouseSearchSelectProps {
  warehouses: Warehouse[];
  selectedWarehouseId?: number;
  onWarehouseSelect: (warehouseId: number) => void;
}

const WarehouseSearchSelect: React.FC<WarehouseSearchSelectProps> = ({
  warehouses,
  selectedWarehouseId,
  onWarehouseSelect,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(warehouse.ID).includes(searchTerm)
  );

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="space-y-4">
          <SearchInput
            placeholder="Поиск склада по названию или ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={<SearchIcon className="h-4 w-4 text-gray-400" />}
          />
          
          <Select
            value={selectedWarehouseId?.toString()}
            onValueChange={(value) => onWarehouseSelect(Number(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите склад" />
            </SelectTrigger>
            <SelectContent>
              {filteredWarehouses.map((warehouse) => (
                <SelectItem key={warehouse.ID} value={warehouse.ID.toString()}>
                  {warehouse.name} (ID: {warehouse.ID})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseSearchSelect;

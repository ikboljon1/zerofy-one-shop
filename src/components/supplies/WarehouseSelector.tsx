
import React, { useState, useEffect } from 'react';
import { Warehouse, WarehouseCoefficient } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, Star, StarOff, Building2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WarehouseSelectorProps {
  warehouses: Warehouse[];
  coefficients: WarehouseCoefficient[];
  onWarehouseSelect: (warehouseId: number) => void;
  selectedWarehouseId?: number;
  onSavePreferred: (warehouseId: number) => void;
  preferredWarehouses: number[];
}

const WarehouseSelector: React.FC<WarehouseSelectorProps> = ({
  warehouses,
  coefficients,
  onWarehouseSelect,
  selectedWarehouseId,
  onSavePreferred,
  preferredWarehouses = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>(warehouses);

  useEffect(() => {
    if (searchTerm) {
      const filtered = warehouses.filter(warehouse => 
        warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warehouse.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWarehouses(filtered);
    } else {
      setFilteredWarehouses(warehouses);
    }
  }, [searchTerm, warehouses]);

  const getWarehouseCoefficient = (warehouseId: number) => {
    return coefficients.find(c => c.warehouseID === warehouseId);
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouseIdNumber = parseInt(warehouseId);
    onWarehouseSelect(warehouseIdNumber);
  };

  const handleToggleFavorite = (warehouseId: number) => {
    onSavePreferred(warehouseId);
    toast.success('Список предпочтительных складов обновлен');
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary" />
          Выбор склада
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="warehouse-select" className="text-sm font-medium">Выберите склад назначения</label>
          <Select 
            value={selectedWarehouseId?.toString() || ''} 
            onValueChange={handleWarehouseChange}
          >
            <SelectTrigger id="warehouse-select" className="w-full bg-background">
              <SelectValue placeholder="Выберите склад" />
            </SelectTrigger>
            <SelectContent 
              className="bg-background border border-border shadow-lg z-[999]" 
              position="popper"
              sideOffset={4}
            >
              <div className="py-2 px-3 sticky top-0 bg-background border-b">
                <input 
                  type="text" 
                  placeholder="Поиск склада..." 
                  className="w-full p-2 text-sm rounded-md border focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {filteredWarehouses.map(warehouse => {
                  const coef = getWarehouseCoefficient(warehouse.ID);
                  const isFavorite = preferredWarehouses.includes(warehouse.ID);
                  
                  return (
                    <SelectItem 
                      key={warehouse.ID} 
                      value={warehouse.ID.toString()}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span>{warehouse.name}</span>
                          {warehouse.acceptsQR && (
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">QR</Badge>
                          )}
                          
                          {coef && coef.allowUnload && (
                            <Badge variant="outline" className={coef.coefficient === 0 ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}>
                              {coef.coefficient === 0 ? "Бесплатно" : `${coef.coefficient}x`}
                            </Badge>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 ml-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleFavorite(warehouse.ID);
                          }}
                        >
                          {isFavorite ? (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          ) : (
                            <StarOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </SelectItem>
                  );
                })}
              </div>
            </SelectContent>
          </Select>
        </div>

        {preferredWarehouses.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-2 text-amber-500 fill-amber-500" />
              Предпочтительные склады
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferredWarehouses.map(warehouseId => {
                const warehouse = warehouses.find(w => w.ID === warehouseId);
                if (!warehouse) return null;
                
                return (
                  <Badge 
                    key={warehouseId} 
                    variant="outline" 
                    className="py-1 px-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleWarehouseChange(warehouseId.toString())}
                  >
                    {warehouse.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WarehouseSelector;

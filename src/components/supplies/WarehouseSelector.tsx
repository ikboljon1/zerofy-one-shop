
import React, { useState, useEffect, useMemo } from 'react';
import { Warehouse, WarehouseCoefficient } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, Star, StarOff, Building2, Search, Clock, ArrowUpDown, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [sortBy, setSortBy] = useState<'name' | 'coefficient'>('name');
  
  // Use useMemo for filtered warehouses to improve performance
  const filteredWarehouses = useMemo(() => {
    let filtered = [...warehouses];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(warehouse => 
        warehouse.name.toLowerCase().includes(lowerSearch) ||
        warehouse.address.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        const coefA = coefficients.find(c => c.warehouseID === a.ID)?.coefficient || 0;
        const coefB = coefficients.find(c => c.warehouseID === b.ID)?.coefficient || 0;
        return coefA - coefB;
      }
    });
    
    // Move preferred warehouses to the top
    if (preferredWarehouses.length > 0) {
      const preferred = filtered.filter(w => preferredWarehouses.includes(w.ID));
      const others = filtered.filter(w => !preferredWarehouses.includes(w.ID));
      filtered = [...preferred, ...others];
    }
    
    return filtered;
  }, [searchTerm, warehouses, sortBy, preferredWarehouses, coefficients]);

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

  const selectedWarehouse = warehouses.find(w => w.ID === selectedWarehouseId);
  const selectedCoefficient = coefficients.find(c => c.warehouseID === selectedWarehouseId);

  return (
    <Card className="shadow-md overflow-hidden border-primary/10 bg-gradient-to-b from-background to-background/80">
      <CardHeader className="pb-3 bg-muted/20">
        <CardTitle className="text-lg flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-primary" />
          Выбор склада
        </CardTitle>
        <CardDescription>
          Выберите склад для проверки коэффициентов и доступности поставки
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {selectedWarehouse && selectedCoefficient && (
          <div className="mb-4 p-4 rounded-lg bg-accent/20 border border-accent/20 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{selectedWarehouse.name}</h3>
              <Badge 
                variant={selectedCoefficient.allowUnload ? "success" : "destructive"}
                className="px-2 py-0.5"
              >
                {selectedCoefficient.allowUnload ? "Доступен" : "Закрыт"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Обновлено:</span>
              </div>
              <div className="font-medium text-right">
                {new Date(selectedCoefficient.date).toLocaleDateString()}
              </div>
              <div className="text-muted-foreground">Коэффициент:</div>
              <div className="font-semibold text-right">
                {selectedCoefficient.coefficient === 0 ? (
                  <span className="text-green-600">Бесплатно</span>
                ) : (
                  <span>{selectedCoefficient.coefficient}x</span>
                )}
              </div>
              <div className="text-muted-foreground">Адрес:</div>
              <div className="text-right">{selectedWarehouse.address}</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Поиск склада..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 h-10"
              onClick={() => setSortBy(sortBy === 'name' ? 'coefficient' : 'name')}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {sortBy === 'name' ? 'По имени' : 'По коэф.'}
              </span>
            </Button>
          </div>

          <div className="rounded-md border">
            <Select 
              value={selectedWarehouseId?.toString() || ''} 
              onValueChange={handleWarehouseChange}
            >
              <SelectTrigger id="warehouse-select" className="w-full bg-background">
                <SelectValue placeholder="Выберите склад" />
              </SelectTrigger>
              <SelectContent 
                className="bg-background border shadow-lg z-[999] max-h-[60vh]" 
                position="popper"
                sideOffset={4}
              >
                <div className="bg-muted/10 px-3 py-2 sticky top-0 z-10 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Filter className="h-3 w-3" />
                    <span>Найдено складов: {filteredWarehouses.length}</span>
                  </div>
                  {searchTerm && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-xs px-2"
                      onClick={() => setSearchTerm('')}
                    >
                      Сбросить
                    </Button>
                  )}
                </div>
                
                <ScrollArea className="max-h-[400px] overflow-y-auto p-1">
                  {filteredWarehouses.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      Складов не найдено
                    </div>
                  ) : (
                    filteredWarehouses.map(warehouse => {
                      const coef = getWarehouseCoefficient(warehouse.ID);
                      const isFavorite = preferredWarehouses.includes(warehouse.ID);
                      
                      return (
                        <SelectItem 
                          key={warehouse.ID} 
                          value={warehouse.ID.toString()}
                          className="flex items-center justify-between py-3 cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {isFavorite && (
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                              )}
                              <span className={isFavorite ? "font-medium" : ""}>{warehouse.name}</span>
                              
                              {warehouse.acceptsQR && (
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">QR</Badge>
                              )}
                              
                              {coef && (
                                <Badge 
                                  variant={coef.allowUnload 
                                    ? (coef.coefficient === 0 ? "success" : "outline") 
                                    : "destructive"} 
                                  className="text-xs"
                                >
                                  {coef.coefficient === 0 ? "Бесплатно" : `${coef.coefficient}x`}
                                </Badge>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 ml-2 rounded-full"
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
                    })
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>

        {preferredWarehouses.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium flex items-center">
              <Star className="h-4 w-4 mr-2 text-amber-500 fill-amber-500" />
              <span>Избранные склады</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {preferredWarehouses.map(warehouseId => {
                const warehouse = warehouses.find(w => w.ID === warehouseId);
                if (!warehouse) return null;
                const coef = getWarehouseCoefficient(warehouseId);
                
                return (
                  <Badge 
                    key={warehouseId} 
                    variant={warehouseId === selectedWarehouseId ? "default" : "outline"} 
                    className="py-1.5 pl-2 pr-2.5 gap-1.5 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleWarehouseChange(warehouseId.toString())}
                  >
                    {warehouse.name}
                    {coef && coef.coefficient === 0 && (
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block ml-1"></span>
                    )}
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


import React, { useMemo, useState } from 'react';
import { WarehouseCoefficient, Warehouse } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle,
  TruckIcon, 
  PackageOpen, 
  DollarSign,
  CalendarIcon,
  Warehouse as WarehouseIcon,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchInput } from '@/components/ui/search-input';

interface WarehouseCoefficientsDateCardProps {
  coefficients: WarehouseCoefficient[];
  selectedWarehouseId?: number;
  title?: string;
  warehouses?: Warehouse[];
  onWarehouseSelect?: (warehouseId: number) => void;
  onSavePreferred?: (warehouseId: number) => void;
  preferredWarehouses?: number[];
}

const WarehouseCoefficientsDateCard: React.FC<WarehouseCoefficientsDateCardProps> = ({ 
  coefficients, 
  selectedWarehouseId,
  title = "Коэффициенты приемки",
  warehouses = [],
  onWarehouseSelect,
  onSavePreferred,
  preferredWarehouses = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Function to get warehouse name by ID
  const getWarehouseName = (warehouseId: number): string => {
    const warehouse = warehouses.find(w => w.ID === warehouseId);
    return warehouse?.name || `Склад ${warehouseId}`;
  };
  
  // Filter coefficients by selected warehouse if provided and by search term
  const filteredCoefficients = useMemo(() => {
    let filtered = coefficients;
    
    if (selectedWarehouseId) {
      filtered = filtered.filter(c => c.warehouseID === selectedWarehouseId);
    }
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(c => {
        // Search by box type, ID, or coefficient values
        const boxTypeMatch = (c.boxTypeName?.toLowerCase().includes(searchLower)) ||
          String(c.boxTypeID).includes(searchLower) ||
          (c.deliveryCoef?.toString().toLowerCase().includes(searchLower)) ||
          (c.storageCoef?.toString().toLowerCase().includes(searchLower));
          
        // Search by warehouse name or ID if warehouses are provided
        const warehouseMatch = warehouses.length > 0 ? 
          getWarehouseName(c.warehouseID).toLowerCase().includes(searchLower) || 
          String(c.warehouseID).includes(searchLower) :
          String(c.warehouseID).includes(searchLower);
          
        return boxTypeMatch || warehouseMatch;
      });
    }
    
    return filtered;
  }, [coefficients, selectedWarehouseId, searchTerm, warehouses]);
  
  // Get the next 7 days from today instead of 14
  const next7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(today, i));
    }
    
    return days;
  }, []);

  // Group coefficients by date and warehouse, keeping the most recent data for each box type
  const groupedCoefficients = useMemo(() => {
    const grouped = new Map<string, Map<number, Map<number, WarehouseCoefficient>>>();
    
    // First group by date
    filteredCoefficients.forEach(coef => {
      const date = coef.date.split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, new Map<number, Map<number, WarehouseCoefficient>>());
      }
      
      // Then by warehouse ID
      const dateMap = grouped.get(date)!;
      if (!dateMap.has(coef.warehouseID)) {
        dateMap.set(coef.warehouseID, new Map<number, WarehouseCoefficient>());
      }
      
      // Then keep only one coefficient per box type per warehouse (the most recent one)
      const warehouseMap = dateMap.get(coef.warehouseID)!;
      warehouseMap.set(coef.boxTypeID, coef);
    });
    
    return grouped;
  }, [filteredCoefficients]);

  // Map box type IDs to names for easier reference
  const boxTypeNames = {
    2: 'Короба',
    5: 'Монопаллеты',
    6: 'Суперсейф'
  };

  const hasAnyCoefficients = coefficients.length > 0;
  const hasFilteredCoefficients = filteredCoefficients.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasAnyCoefficients && (
          <div className="mb-4">
            <SearchInput
              placeholder="Поиск по складу или типу коробов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<WarehouseIcon className="h-4 w-4 text-gray-400" />}
            />
          </div>
        )}

        {!hasAnyCoefficients ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              Нет данных о коэффициентах приемки
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Проверьте подключение к API Wildberries или выберите другой склад
            </p>
          </div>
        ) : !hasFilteredCoefficients ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              Нет данных соответствующих поисковому запросу
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Попробуйте изменить параметры поиска или выбрать другой склад
            </p>
            {searchTerm && (
              <Badge 
                variant="outline" 
                className="mt-4 cursor-pointer hover:bg-primary/10"
                onClick={() => setSearchTerm('')}
              >
                Сбросить поиск
              </Badge>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {next7Days.map((date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayWarehouses = groupedCoefficients.get(dateStr);

                if (!dayWarehouses || dayWarehouses.size === 0) return null;

                return (
                  <div key={dateStr} className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{format(date, 'd MMMM', { locale: ru })}</span>
                    </div>
                    
                    {/* Maps through each warehouse for this date */}
                    {Array.from(dayWarehouses.entries()).map(([warehouseId, boxCoefficients]) => (
                      <Card key={`${dateStr}-${warehouseId}`} className="shadow-sm">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-base flex items-center gap-2">
                            <WarehouseIcon className="h-4 w-4 text-primary" />
                            {getWarehouseName(warehouseId)}
                          </CardTitle>
                          {warehouses.find(w => w.ID === warehouseId)?.address && (
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {warehouses.find(w => w.ID === warehouseId)?.address}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent className="px-4 py-2 space-y-2">
                          {Array.from(boxCoefficients.values()).map((coef, idx) => (
                            <div key={idx} className="border-b last:border-0 pb-2 last:pb-0">
                              <div className="flex justify-between items-center mb-1">
                                <Badge variant="outline" className="mr-2">
                                  {boxTypeNames[coef.boxTypeID as keyof typeof boxTypeNames] || coef.boxTypeName}
                                </Badge>
                                <div className="flex items-center">
                                  {coef.coefficient >= 0 && coef.allowUnload ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center">
                                            {coef.coefficient === 0 ? (
                                              <CheckCircle className="h-4 w-4 text-green-500" />
                                            ) : (
                                              <span className="text-amber-500 font-medium">{coef.coefficient}x</span>
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {coef.coefficient === 0 
                                              ? "Бесплатная приемка" 
                                              : `Платная приемка (коэффициент ${coef.coefficient})`}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Приемка недоступна</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                {coef.deliveryCoef && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <TruckIcon className="h-3 w-3" />
                                      Логистика:
                                    </span>
                                    <span>{coef.deliveryCoef}</span>
                                  </div>
                                )}
                                
                                {coef.storageCoef && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      Хранение:
                                    </span>
                                    <span>{coef.storageCoef}</span>
                                  </div>
                                )}
                                
                                {coef.deliveryBaseLiter && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <PackageOpen className="h-3 w-3" />
                                      Первый л:
                                    </span>
                                    <span>{coef.deliveryBaseLiter} ₽</span>
                                  </div>
                                )}
                                
                                {coef.deliveryAdditionalLiter && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                      <PackageOpen className="h-3 w-3" />
                                      Доп. л:
                                    </span>
                                    <span>{coef.deliveryAdditionalLiter} ₽</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        
        {hasFilteredCoefficients && (
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Бесплатная приемка</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-amber-500 font-medium">1.5x</span>
              <span>Платная приемка</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Недоступно</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WarehouseCoefficientsDateCard;

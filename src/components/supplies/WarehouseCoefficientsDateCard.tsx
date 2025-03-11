
import React, { useState, useMemo } from 'react';
import { WarehouseCoefficient, Warehouse as WBWarehouse } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, addDays, isToday, isTomorrow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle,
  TruckIcon, 
  PackageOpen, 
  DollarSign,
  CalendarIcon,
  InfoIcon,
  FilterIcon,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WarehouseCoefficientsDateCardProps {
  coefficients: WarehouseCoefficient[];
  warehouses: WBWarehouse[];
  selectedWarehouseId?: number;
  title?: string;
}

const WarehouseCoefficientsDateCard: React.FC<WarehouseCoefficientsDateCardProps> = ({ 
  coefficients, 
  warehouses,
  selectedWarehouseId,
  title = "Коэффициенты приемки по датам"
}) => {
  const [showLogistics, setShowLogistics] = useState(false);
  const [boxTypeFilter, setBoxTypeFilter] = useState<string | null>(null);
  
  // Filter coefficients by selected warehouse if provided
  const filteredCoefficients = useMemo(() => {
    let filtered = coefficients;
    
    if (selectedWarehouseId) {
      filtered = filtered.filter(c => c.warehouseID === selectedWarehouseId);
    }
    
    if (boxTypeFilter) {
      filtered = filtered.filter(c => c.boxTypeName === boxTypeFilter);
    }
    
    return filtered;
  }, [coefficients, selectedWarehouseId, boxTypeFilter]);
  
  // Get the next 14 days from today
  const next14Days = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i));
    }
    
    return days;
  }, []);

  // Group coefficients by date and box type
  const groupedCoefficients = useMemo(() => {
    const grouped = new Map<string, WarehouseCoefficient[]>();
    
    filteredCoefficients.forEach(coef => {
      const date = coef.date.split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)?.push(coef);
    });
    
    return grouped;
  }, [filteredCoefficients]);

  // Get unique box types
  const boxTypes = useMemo(() => {
    const types = new Set<string>();
    coefficients.forEach(coef => {
      if (coef.boxTypeName) {
        types.add(coef.boxTypeName);
      }
    });
    return Array.from(types);
  }, [coefficients]);

  // Get warehouse name by ID
  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse ? warehouse.name : `Склад ${warehouseId}`;
  };

  if (filteredCoefficients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {selectedWarehouseId 
              ? "Нет данных о коэффициентах приемки для выбранного склада"
              : "Выберите склад для просмотра коэффициентов приёмки"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center gap-3">
          {boxTypes.length > 0 && (
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={boxTypeFilter || "all"} 
                onValueChange={(value) => setBoxTypeFilter(value === "all" ? null : value)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Все типы коробов" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы коробов</SelectItem>
                  {boxTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLogistics(!showLogistics)}
            className="flex items-center gap-1.5"
          >
            {showLogistics ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Скрыть логистику</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Показать логистику</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {next14Days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayCoefficients = groupedCoefficients.get(dateStr) || [];

            if (dayCoefficients.length === 0) return null;

            const isCurrentDay = isToday(date);
            const isNextDay = isTomorrow(date);

            return (
              <Card 
                key={dateStr} 
                className={`relative transition-all duration-200 ${
                  isCurrentDay 
                    ? 'border-green-400 shadow-md shadow-green-100 dark:shadow-green-900/20' 
                    : isNextDay 
                      ? 'border-blue-400 shadow-md shadow-blue-100 dark:shadow-blue-900/20' 
                      : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className={`h-4 w-4 ${
                      isCurrentDay 
                        ? 'text-green-500' 
                        : isNextDay 
                          ? 'text-blue-500' 
                          : ''
                    }`} />
                    <span className={
                      isCurrentDay 
                        ? 'text-green-700 dark:text-green-400' 
                        : isNextDay 
                          ? 'text-blue-700 dark:text-blue-400' 
                          : ''
                    }>
                      {isCurrentDay ? 'Сегодня' : isNextDay ? 'Завтра' : format(date, 'd MMMM', { locale: ru })}
                    </span>
                    
                    {(isCurrentDay || isNextDay) && (
                      <Badge 
                        variant={isCurrentDay ? "success" : "default"}
                        className={`ml-auto ${isCurrentDay ? 'bg-green-500/20 text-green-700 dark:text-green-400' : ''}`}
                      >
                        {format(date, 'd MMMM', { locale: ru })}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 bg-card">
                  {dayCoefficients.map((coef, idx) => (
                    <div 
                      key={idx} 
                      className="space-y-2 pb-2 border-b last:border-0 transition-all duration-200 hover:bg-muted/20 rounded-md p-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{coef.boxTypeName}</Badge>
                          {!selectedWarehouseId && (
                            <span className="text-xs text-muted-foreground">
                              {getWarehouseName(coef.warehouseID)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {coef.coefficient >= 0 && coef.allowUnload ? (
                            <>
                              {coef.coefficient === 0 ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Бесплатная приемка</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-amber-500 font-medium">{coef.coefficient}x</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Платная приемка (коэффициент {coef.coefficient})</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </>
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

                      {showLogistics && (
                        <div className="text-sm space-y-1 mt-2 p-2 bg-muted/20 rounded-md">
                          <div className="text-xs font-medium mb-1 flex items-center gap-1 text-muted-foreground">
                            <InfoIcon className="h-3 w-3" />
                            <span>Информация о логистике:</span>
                          </div>
                          
                          {coef.deliveryCoef && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <TruckIcon className="h-3 w-3" />
                                <span>Коэф. логистики:</span>
                              </div>
                              <span className="font-mono text-xs">{coef.deliveryCoef}</span>
                            </div>
                          )}
                          {coef.deliveryBaseLiter && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <PackageOpen className="h-3 w-3" />
                                <span>Первый литр:</span>
                              </div>
                              <span className="font-mono text-xs">{coef.deliveryBaseLiter} ₽</span>
                            </div>
                          )}
                          {coef.deliveryAdditionalLiter && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <PackageOpen className="h-3 w-3" />
                                <span>За доп. литр:</span>
                              </div>
                              <span className="font-mono text-xs">{coef.deliveryAdditionalLiter} ₽</span>
                            </div>
                          )}
                          {coef.storageBaseLiter && (
                            <div className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>Хранение:</span>
                              </div>
                              <span className="font-mono text-xs">{coef.storageBaseLiter} ₽</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

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
    </div>
  );
};

export default WarehouseCoefficientsDateCard;

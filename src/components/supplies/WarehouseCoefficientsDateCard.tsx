
import React, { useState } from 'react';
import { WarehouseCoefficient, Warehouse } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  CalendarIcon, 
  TruckIcon, 
  PackageOpen, 
  DollarSign,
  InfoIcon,
  FilterIcon
} from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface WarehouseCoefficientsDateCardProps {
  coefficients: WarehouseCoefficient[];
  warehouses: Warehouse[];
  selectedWarehouseId?: number;
}

const WarehouseCoefficientsDateCard: React.FC<WarehouseCoefficientsDateCardProps> = ({
  coefficients,
  warehouses,
  selectedWarehouseId
}) => {
  const [showLogistics, setShowLogistics] = useState(true);
  const [boxTypeFilter, setBoxTypeFilter] = useState<string | null>(null);
  
  // Get warehouse name helper function
  const getWarehouseName = (warehouseId: number): string => {
    const warehouse = warehouses.find(w => w.ID === warehouseId);
    return warehouse?.name || `Склад ${warehouseId}`;
  };
  
  // Filter coefficients by selected warehouse if provided
  const filteredCoefficients = React.useMemo(() => {
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
  const next14Days = React.useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i));
    }
    
    return days;
  }, []);

  // Group coefficients by date
  const groupedByDate = React.useMemo(() => {
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

  // Get unique box types for filtering
  const boxTypes = React.useMemo(() => {
    const types = new Set<string>();
    coefficients.forEach(coef => {
      if (coef.boxTypeName) {
        types.add(coef.boxTypeName);
      }
    });
    return Array.from(types);
  }, [coefficients]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  if (filteredCoefficients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Коэффициенты приемки</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {selectedWarehouseId 
              ? "Нет данных о коэффициентах приемки для выбранного склада"
              : "Нет данных о коэффициентах приемки"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Коэффициенты приемки по датам
        </h3>
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
          >
            {showLogistics ? 'Скрыть логистику' : 'Показать логистику'}
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {next14Days.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayCoefficients = groupedByDate.get(dateStr) || [];
            
            if (dayCoefficients.length === 0) return null;
            
            // Group by warehouse for this date
            const warehouseGroups = new Map<number, WarehouseCoefficient[]>();
            dayCoefficients.forEach(coef => {
              if (!warehouseGroups.has(coef.warehouseID)) {
                warehouseGroups.set(coef.warehouseID, []);
              }
              warehouseGroups.get(coef.warehouseID)?.push(coef);
            });

            return (
              <motion.div key={dateStr} variants={cardVariants}>
                <Card className="overflow-hidden border-t-4 border-t-primary">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {format(date, 'd MMMM (EEEE)', { locale: ru })}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-4">
                    {Array.from(warehouseGroups.entries()).map(([warehouseId, coefs]) => {
                      const warehouseName = getWarehouseName(warehouseId);
                      const hasAvailableUnload = coefs.some(c => c.allowUnload);
                      const hasFreeUnload = coefs.some(c => c.allowUnload && c.coefficient === 0);
                      
                      return (
                        <div 
                          key={`${dateStr}-${warehouseId}`} 
                          className={`p-3 rounded-lg border ${
                            hasFreeUnload 
                              ? "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/30" 
                              : hasAvailableUnload 
                                ? "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30" 
                                : "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm flex items-center gap-1.5">
                              {hasFreeUnload ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : hasAvailableUnload ? (
                                <CheckCircle className="h-4 w-4 text-amber-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              {warehouseName}
                            </h4>
                            <Badge 
                              variant={
                                hasFreeUnload 
                                  ? "success" 
                                  : hasAvailableUnload 
                                    ? "outline" 
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {hasFreeUnload 
                                ? "Бесплатно" 
                                : hasAvailableUnload 
                                  ? "Платно" 
                                  : "Закрыт"}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {coefs.map((coef, idx) => (
                              <TooltipProvider key={`${warehouseId}-box-${idx}`}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge 
                                      variant={
                                        coef.allowUnload
                                          ? coef.coefficient === 0 
                                            ? "success" 
                                            : "outline"
                                          : "destructive"
                                      } 
                                      className="text-xs py-0.5 cursor-help"
                                    >
                                      {coef.boxTypeName}
                                      {coef.allowUnload && coef.coefficient > 0 && (
                                        <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">
                                          {coef.coefficient}x
                                        </span>
                                      )}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <div className="space-y-1 text-xs">
                                      <p className="font-medium">{coef.boxTypeName}</p>
                                      <p>
                                        {coef.allowUnload 
                                          ? (coef.coefficient === 0 
                                            ? "Бесплатная приемка" 
                                            : `Коэф. приемки: ${coef.coefficient}`) 
                                          : "Приемка недоступна"}
                                      </p>
                                      {showLogistics && coef.deliveryCoef && (
                                        <p>Коэф. логистики: {coef.deliveryCoef}</p>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                          
                          {showLogistics && (
                            <div className="text-xs space-y-1 p-2 bg-white/70 dark:bg-gray-900/50 rounded">
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <InfoIcon className="h-3 w-3" />
                                <span>Логистика</span>
                              </div>
                              {coefs.some(c => c.deliveryCoef) ? (
                                coefs.filter(c => c.deliveryCoef).map((coef, idx) => (
                                  <div key={`${warehouseId}-logistics-${idx}`} className="grid grid-cols-2 gap-1">
                                    {coef.deliveryCoef && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                          <TruckIcon className="h-3 w-3" />
                                          <span>Коэф.:</span>
                                        </div>
                                        <span>{coef.deliveryCoef}</span>
                                      </div>
                                    )}
                                    {coef.deliveryBaseLiter && (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                          <PackageOpen className="h-3 w-3" />
                                          <span>Первый литр:</span>
                                        </div>
                                        <span>{coef.deliveryBaseLiter} ₽</span>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-muted-foreground italic">Нет данных о логистике</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </ScrollArea>
      
      <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-950/30 rounded-full">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span className="text-green-700 dark:text-green-400">Бесплатная приемка</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-950/30 rounded-full">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
          <span className="text-amber-700 dark:text-amber-400">Платная приемка</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-950/30 rounded-full">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <span className="text-red-700 dark:text-red-400">Приемка недоступна</span>
        </div>
      </div>
    </div>
  );
};

export default WarehouseCoefficientsDateCard;

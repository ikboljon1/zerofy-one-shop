
import React, { useState, useMemo } from 'react';
import { WarehouseCoefficient } from '@/types/supplies';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, parseISO, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  TruckIcon, 
  PackageOpen, 
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WarehouseCoefficientsTableProps {
  coefficients: WarehouseCoefficient[];
  selectedWarehouseId?: number;
}

const WarehouseCoefficientsTable: React.FC<WarehouseCoefficientsTableProps> = ({ 
  coefficients, 
  selectedWarehouseId 
}) => {
  const [showLogistics, setShowLogistics] = useState(false);
  
  // Filter coefficients by selected warehouse if provided
  const filteredCoefficients = useMemo(() => {
    if (!selectedWarehouseId) return coefficients;
    return coefficients.filter(c => c.warehouseID === selectedWarehouseId);
  }, [coefficients, selectedWarehouseId]);
  
  // Group coefficients by warehouse
  const groupedByWarehouse = useMemo(() => {
    const grouped = new Map<number, WarehouseCoefficient[]>();
    
    filteredCoefficients.forEach(coef => {
      if (!grouped.has(coef.warehouseID)) {
        grouped.set(coef.warehouseID, []);
      }
      grouped.get(coef.warehouseID)?.push(coef);
    });
    
    return grouped;
  }, [filteredCoefficients]);
  
  // Get the next 14 days from today
  const next14Days = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i));
    }
    
    return days;
  }, []);
  
  const getStatusForDate = (warehouseId: number, date: Date, boxType: string): {
    available: boolean;
    coefficient: number;
    tooltip: string;
    deliveryCoef?: string | null;
    deliveryBaseLiter?: string | null;
    deliveryAdditionalLiter?: string | null;
    storageBaseLiter?: string | null;
    storageAdditionalLiter?: string | null;
  } => {
    const warehouseCoefs = groupedByWarehouse.get(warehouseId) || [];
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Find coefficient for this date and box type
    const coef = warehouseCoefs.find(c => {
      const coefDate = c.date.split('T')[0];
      return coefDate === dateStr && c.boxTypeName === boxType;
    });
    
    if (!coef) {
      return {
        available: false,
        coefficient: -1,
        tooltip: 'Нет данных'
      };
    }
    
    const available = coef.coefficient >= 0 && coef.allowUnload;
    let tooltip = '';
    
    if (coef.coefficient === -1) {
      tooltip = 'Приемка недоступна';
    } else if (coef.coefficient === 0 && coef.allowUnload) {
      tooltip = 'Бесплатная приемка';
    } else if (coef.coefficient > 0 && coef.allowUnload) {
      tooltip = `Коэффициент: ${coef.coefficient}x`;
    } else {
      tooltip = 'Приемка не доступна';
    }
    
    return {
      available,
      coefficient: coef.coefficient,
      tooltip,
      deliveryCoef: coef.deliveryCoef,
      deliveryBaseLiter: coef.deliveryBaseLiter,
      deliveryAdditionalLiter: coef.deliveryAdditionalLiter,
      storageBaseLiter: coef.storageBaseLiter,
      storageAdditionalLiter: coef.storageAdditionalLiter
    };
  };
  
  const renderLogisticsDetails = (status: ReturnType<typeof getStatusForDate>) => {
    if (!showLogistics) return null;
    
    return (
      <div className="text-xs space-y-1 mt-1">
        {status.deliveryCoef && (
          <div className="flex items-center gap-1">
            <TruckIcon className="h-3 w-3 text-blue-500" />
            <span>Коэф. логистики: {status.deliveryCoef}</span>
          </div>
        )}
        {status.deliveryBaseLiter && (
          <div className="flex items-center gap-1">
            <PackageOpen className="h-3 w-3 text-orange-500" />
            <span>Первый литр: {status.deliveryBaseLiter} ₽</span>
          </div>
        )}
        {status.deliveryAdditionalLiter && (
          <div className="flex items-center gap-1">
            <PackageOpen className="h-3 w-3 text-green-500" />
            <span>За литр: {status.deliveryAdditionalLiter} ₽</span>
          </div>
        )}
        {status.storageBaseLiter && (
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-purple-500" />
            <span>Хранение: {status.storageBaseLiter} ₽</span>
          </div>
        )}
      </div>
    );
  };
  
  if (filteredCoefficients.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        {selectedWarehouseId ? (
          <p>Нет данных о коэффициентах приемки для выбранного склада на ближайшие 14 дней</p>
        ) : (
          <p>Выберите склад для просмотра коэффициентов приёмки</p>
        )}
      </div>
    );
  }
  
  // Get unique warehouses
  const uniqueWarehouses = Array.from(groupedByWarehouse.keys()).map(id => {
    const coefs = groupedByWarehouse.get(id) || [];
    return {
      id,
      name: coefs[0]?.warehouseName || `Склад ${id}`
    };
  });
  
  // Get unique box types
  const boxTypes = ["Короба", "Монопаллеты", "Суперсейф", "QR-поставка с коробами"];
  
  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">
          Коэффициенты приемки на ближайшие 14 дней
          {selectedWarehouseId && uniqueWarehouses.length > 0 && (
            <span className="ml-2 font-normal text-base">
              ({uniqueWarehouses[0].name})
            </span>
          )}
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowLogistics(!showLogistics)}
          className="text-xs h-8"
        >
          {showLogistics ? 'Скрыть детали' : 'Показать логистику'}
        </Button>
      </div>
      
      <div className="rounded border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[150px] font-medium">Дата</TableHead>
              {boxTypes.map(boxType => (
                <TableHead key={boxType} className="text-center font-medium">
                  {boxType}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {next14Days.map((date, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                <TableCell className="font-medium">
                  {format(date, 'EEEE, d MMMM', { locale: ru })}
                </TableCell>
                
                {boxTypes.map(boxType => {
                  // We're looking at just the first warehouse when a specific one is selected
                  const warehouseId = uniqueWarehouses[0]?.id;
                  if (!warehouseId) return <TableCell key={boxType}></TableCell>;
                  
                  const status = getStatusForDate(warehouseId, date, boxType);
                  
                  return (
                    <TableCell key={boxType} className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex items-center justify-center">
                              {status.available ? (
                                status.coefficient === 0 ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <div className="flex items-center">
                                    <CheckCircle className="h-5 w-5 text-amber-500 mr-1" />
                                    <span className="text-sm font-medium">{status.coefficient}x</span>
                                  </div>
                                )
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-2 max-w-[280px]">
                              <p className="font-semibold">{status.tooltip}</p>
                              
                              {/* Additional logistics info in tooltip */}
                              {status.deliveryCoef && (
                                <div className="text-xs">
                                  <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                    <div className="flex items-center">
                                      <TruckIcon className="h-3 w-3 mr-1 text-blue-500" />
                                      <span>Коэф. логистики:</span>
                                    </div>
                                    <div>{status.deliveryCoef}</div>
                                    
                                    {status.deliveryBaseLiter && (
                                      <>
                                        <div className="flex items-center">
                                          <PackageOpen className="h-3 w-3 mr-1 text-orange-500" />
                                          <span>Первый литр:</span>
                                        </div>
                                        <div>{status.deliveryBaseLiter} ₽</div>
                                      </>
                                    )}
                                    
                                    {status.deliveryAdditionalLiter && (
                                      <>
                                        <div className="flex items-center">
                                          <PackageOpen className="h-3 w-3 mr-1 text-green-500" />
                                          <span>За доп. литр:</span>
                                        </div>
                                        <div>{status.deliveryAdditionalLiter} ₽</div>
                                      </>
                                    )}
                                    
                                    {status.storageBaseLiter && (
                                      <>
                                        <div className="flex items-center">
                                          <DollarSign className="h-3 w-3 mr-1 text-purple-500" />
                                          <span>Хранение:</span>
                                        </div>
                                        <div>{status.storageBaseLiter} ₽</div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {renderLogisticsDetails(status)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-6 mt-2 flex-wrap">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
            <span>Бесплатная приемка</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-amber-500 mr-1" />
            <span>Платная приемка (коэффициент)</span>
          </div>
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-red-500 mr-1" />
            <span>Приемка недоступна</span>
          </div>
        </div>
        
        {showLogistics && (
          <div className="mt-3 border-t pt-2">
            <p className="font-medium mb-1">Пояснения к данным о логистике:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center">
                <TruckIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span>Коэффициент логистики - множитель стоимости доставки</span>
              </div>
              <div className="flex items-center">
                <PackageOpen className="h-4 w-4 text-orange-500 mr-1" />
                <span>Стоимость логистики первого литра</span>
              </div>
              <div className="flex items-center">
                <PackageOpen className="h-4 w-4 text-green-500 mr-1" />
                <span>Стоимость каждого следующего литра</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-purple-500 mr-1" />
                <span>Стоимость хранения (за литр или паллету)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseCoefficientsTable;

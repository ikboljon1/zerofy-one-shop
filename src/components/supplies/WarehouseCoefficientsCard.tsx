
import React, { useState, useMemo } from 'react';
import { WarehouseCoefficient, Warehouse } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, TrendingDown, Package, Search, CheckCircle, XCircle, Clock, ArrowDownUp, AlertCircle, Truck } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WarehouseCoefficientsCardProps {
  coefficients: WarehouseCoefficient[];
  warehouses: Warehouse[];
  selectedWarehouseId?: number;
}

const WarehouseCoefficientsCard: React.FC<WarehouseCoefficientsCardProps> = ({
  coefficients,
  warehouses,
  selectedWarehouseId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'coefficient' | 'date'>('coefficient');
  const [view, setView] = useState<'grid' | 'compact'>('grid');
  
  // Define the getWarehouseName helper function BEFORE using it in useMemo
  const getWarehouseName = (warehouseId: number): string => {
    const warehouse = warehouses.find(w => w.ID === warehouseId);
    return warehouse?.name || `Склад ${warehouseId}`;
  };
  
  // Filter coefficients if selectedWarehouseId is provided
  const filteredCoefficients = useMemo(() => {
    let filtered = selectedWarehouseId 
      ? coefficients.filter(coef => coef.warehouseID === selectedWarehouseId)
      : coefficients;
      
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(coef => {
        const warehouseName = getWarehouseName(coef.warehouseID).toLowerCase();
        const boxTypeName = coef.boxTypeName?.toLowerCase() || '';
        return warehouseName.includes(lowerSearch) || boxTypeName.includes(lowerSearch);
      });
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'coefficient') {
        return a.coefficient - b.coefficient;
      } else {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  }, [coefficients, selectedWarehouseId, searchTerm, sortBy, warehouses]);

  // Limit display to top items if no warehouse is selected
  const displayCoefficients = useMemo(() => {
    return selectedWarehouseId ? filteredCoefficients : filteredCoefficients.slice(0, view === 'compact' ? 6 : 12);
  }, [filteredCoefficients, selectedWarehouseId, view]);

  // Group coefficients by warehouse for a more organized display
  const groupedByWarehouse = useMemo(() => {
    const grouped = new Map<number, WarehouseCoefficient[]>();
    
    displayCoefficients.forEach(coef => {
      if (!grouped.has(coef.warehouseID)) {
        grouped.set(coef.warehouseID, []);
      }
      grouped.get(coef.warehouseID)?.push(coef);
    });
    
    return grouped;
  }, [displayCoefficients]);

  // Get unique warehouse IDs for display
  const uniqueWarehouseIds = Array.from(groupedByWarehouse.keys());

  return (
    <Card className="shadow-md h-full overflow-hidden border-primary/10 bg-gradient-to-b from-background to-background/80">
      <CardHeader className="space-y-1 pb-3 bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-primary" />
            Коэффициенты приемки
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'compact')} className="hidden sm:block">
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="px-3 text-xs">Сетка</TabsTrigger>
                <TabsTrigger value="compact" className="px-3 text-xs">Компактно</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <CardDescription>
          {selectedWarehouseId 
            ? `Информация о доступности приемки на выбранном складе` 
            : `Склады с наиболее выгодными условиями приемки`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Поиск по названию склада или типу коробов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 h-10 whitespace-nowrap"
            onClick={() => setSortBy(sortBy === 'coefficient' ? 'date' : 'coefficient')}
          >
            <ArrowDownUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {sortBy === 'coefficient' ? 'По коэф.' : 'По дате'}
            </span>
          </Button>
        </div>
        
        {filteredCoefficients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-3 opacity-30" />
            <h3 className="text-lg font-medium mb-1">Нет данных о коэффициентах</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {searchTerm 
                ? "Попробуйте изменить параметры поиска" 
                : selectedWarehouseId 
                  ? "У выбранного склада нет информации о коэффициентах приемки" 
                  : "Информация о коэффициентах приемки временно недоступна"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[480px] pr-4">
            {view === 'compact' ? (
              <div className="space-y-4">
                {uniqueWarehouseIds.map(warehouseId => {
                  const warehouseCoefs = groupedByWarehouse.get(warehouseId) || [];
                  const warehouseName = getWarehouseName(warehouseId);
                  const bestCoef = Math.min(...warehouseCoefs.map(c => c.coefficient));
                  const allowsUnload = warehouseCoefs.some(c => c.allowUnload);
                  
                  return (
                    <Card 
                      key={`warehouse-${warehouseId}`}
                      className={`overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 ${
                        allowsUnload 
                          ? (bestCoef === 0 ? "border-l-green-500" : "border-l-amber-500") 
                          : "border-l-red-500"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-base">{warehouseName}</h3>
                          <Badge 
                            variant={allowsUnload ? (bestCoef === 0 ? "success" : "outline") : "destructive"}
                          >
                            {allowsUnload 
                              ? (bestCoef === 0 ? "Бесплатно" : `от ${bestCoef}x`) 
                              : "Закрыт"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Package className="h-3.5 w-3.5" />
                              <span>Типы упаковки:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {warehouseCoefs.map((coef, idx) => (
                                <TooltipProvider key={`${warehouseId}-box-${idx}`}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="outline" className="text-xs py-0.5">
                                        {coef.boxTypeName}{' '}
                                        {coef.allowUnload ? (
                                          coef.coefficient === 0 ? 
                                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-1"></span> : 
                                            <span className="text-amber-500 ml-1">{coef.coefficient}x</span>
                                        ) : (
                                          <XCircle className="h-3 w-3 text-red-500 ml-1" />
                                        )}
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{coef.boxTypeName}: {coef.allowUnload 
                                        ? (coef.coefficient === 0 ? "Бесплатно" : `Коэффициент ${coef.coefficient}`) 
                                        : "Приемка закрыта"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Truck className="h-3.5 w-3.5" />
                              <span>Доставка:</span>
                            </div>
                            {warehouseCoefs.some(c => c.deliveryCoef) ? (
                              <div>
                                {warehouseCoefs.filter(c => c.deliveryCoef).map((coef, idx) => (
                                  <div key={`${warehouseId}-delivery-${idx}`} className="text-foreground">
                                    {coef.deliveryCoef}x
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-muted-foreground italic">Нет данных</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>Обновлено: {new Date(warehouseCoefs[0].date).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayCoefficients.map((coef) => (
                  <Card 
                    key={`${coef.warehouseID}-${coef.boxTypeID}`}
                    className={`overflow-hidden transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] border-l-4 ${
                      coef.allowUnload 
                        ? (coef.coefficient === 0 ? "border-l-green-500" : "border-l-amber-500") 
                        : "border-l-red-500"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{getWarehouseName(coef.warehouseID)}</h3>
                        <Badge 
                          variant={coef.allowUnload ? (coef.coefficient === 0 ? "success" : "outline") : "destructive"}
                          className="text-xs"
                        >
                          {coef.allowUnload 
                            ? (coef.coefficient === 0 ? "Бесплатно" : `Коэф: ${coef.coefficient}x`) 
                            : "Закрыт"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          <span>Тип упаковки:</span>
                        </div>
                        <div className="text-foreground">{coef.boxTypeName}</div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Дата обновления:</span>
                        </div>
                        <div className="text-foreground">
                          {new Date(coef.date).toLocaleDateString()}
                        </div>
                        
                        {coef.deliveryCoef && (
                          <>
                            <div className="flex items-center gap-1">
                              <TrendingDown className="h-3 w-3" />
                              <span>Доставка:</span>
                            </div>
                            <div className="text-foreground">{coef.deliveryCoef}x</div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {!selectedWarehouseId && filteredCoefficients.length > displayCoefficients.length && (
              <div className="mt-4 text-center text-sm text-muted-foreground py-2 border-t border-border/40">
                <p>Показаны {displayCoefficients.length} из {filteredCoefficients.length} доступных складов</p>
                <p>Выберите конкретный склад для просмотра всех деталей</p>
              </div>
            )}
          </ScrollArea>
        )}
        
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30 text-xs justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Бесплатно</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Платно</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Недоступно</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseCoefficientsCard;

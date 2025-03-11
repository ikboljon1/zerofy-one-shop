
import React, { useState, useMemo } from 'react';
import { WarehouseCoefficient, Warehouse } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Package, Search, CheckCircle, XCircle, Clock, ArrowDownUp, AlertCircle, Truck, Star, Filter, MapPin, RefreshCw, LayoutGrid, ListFilter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
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

  // Group coefficients by warehouse for a more organized display
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

  // Get unique warehouse IDs for display
  const uniqueWarehouseIds = Array.from(groupedByWarehouse.keys());

  const handleSearchClear = () => {
    setSearchTerm('');
  };

  // Function to get the best coefficient for a warehouse
  const getBestCoefficient = (warehouseCoefs: WarehouseCoefficient[]) => {
    const allowedCoefs = warehouseCoefs.filter(c => c.allowUnload);
    if (allowedCoefs.length === 0) return null;
    return Math.min(...allowedCoefs.map(c => c.coefficient));
  };

  // Animation variants for list items
  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <Card className="shadow-md h-full overflow-hidden border-primary/10 bg-gradient-to-b from-background to-background/80">
      <CardHeader className="space-y-1 pb-3 bg-muted/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-primary" />
            Коэффициенты приемки
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')}>
              <TabsList className="h-8">
                <TabsTrigger value="grid" className="px-3 text-xs flex items-center gap-1">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Карточки</span>
                </TabsTrigger>
                <TabsTrigger value="list" className="px-3 text-xs flex items-center gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Список</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <CardDescription>
          Актуальная информация о доступности складов и коэффициентах приемки
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
            {searchTerm && (
              <button 
                onClick={handleSearchClear}
                className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Нет данных о коэффициентах</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                {searchTerm 
                  ? "Попробуйте изменить параметры поиска" 
                  : selectedWarehouseId 
                    ? "У выбранного склада нет информации о коэффициентах приемки" 
                    : "Информация о коэффициентах приемки временно недоступна"}
              </p>
              {searchTerm && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleSearchClear} 
                  className="mt-2"
                >
                  Сбросить поиск
                </Button>
              )}
            </motion.div>
          </div>
        ) : (
          <ScrollArea className="h-[480px] pr-4">
            {view === 'list' ? (
              <div className="space-y-2">
                {uniqueWarehouseIds.map((warehouseId, index) => {
                  const warehouseCoefs = groupedByWarehouse.get(warehouseId) || [];
                  const warehouseName = getWarehouseName(warehouseId);
                  const bestCoef = getBestCoefficient(warehouseCoefs);
                  const allowsUnload = warehouseCoefs.some(c => c.allowUnload);
                  const warehouse = warehouses.find(w => w.ID === warehouseId);
                  
                  return (
                    <motion.div
                      key={`warehouse-${warehouseId}`}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={listItemVariants}
                      className={`p-4 rounded-lg border ${
                        allowsUnload 
                          ? (bestCoef === 0 ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : 
                             "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900") 
                          : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                      } hover:shadow-md transition-all duration-200 mb-2`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${
                            allowsUnload 
                              ? (bestCoef === 0 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700") 
                              : "bg-red-100 text-red-700"
                          }`}>
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium">{warehouseName}</h3>
                            {warehouse?.address && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                <span>{warehouse.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Badge 
                            variant={allowsUnload ? (bestCoef === 0 ? "success" : "outline") : "destructive"}
                            className="px-2 py-1"
                          >
                            {allowsUnload 
                              ? (bestCoef === 0 ? "Бесплатно" : `от ${bestCoef}x`) 
                              : "Закрыт"}
                          </Badge>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            <span>{new Date(warehouseCoefs[0].date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-1">
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Доступные типы упаковки:</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {warehouseCoefs.map((coef, idx) => (
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
                                    className="text-xs py-0.5 gap-1 cursor-default"
                                  >
                                    {coef.boxTypeName}{' '}
                                    {coef.allowUnload 
                                      ? (coef.coefficient === 0 
                                        ? <CheckCircle className="h-3 w-3" /> 
                                        : <span>{coef.coefficient}x</span>)
                                      : <XCircle className="h-3 w-3" />
                                    }
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="space-y-1 text-xs">
                                    <p className="font-medium">{coef.boxTypeName}</p>
                                    <p>
                                      {coef.allowUnload 
                                        ? (coef.coefficient === 0 
                                          ? "Бесплатная приемка" 
                                          : `Коэф. приемки: ${coef.coefficient}`) 
                                        : "Приемка недоступна"}
                                    </p>
                                    {coef.deliveryCoef && (
                                      <p>Коэф. логистики: {coef.deliveryCoef}</p>
                                    )}
                                    <p className="text-muted-foreground italic">
                                      Обновлено: {new Date(coef.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uniqueWarehouseIds.map((warehouseId, index) => {
                  const warehouseCoefs = groupedByWarehouse.get(warehouseId) || [];
                  const warehouseName = getWarehouseName(warehouseId);
                  const bestCoef = getBestCoefficient(warehouseCoefs);
                  const allowsUnload = warehouseCoefs.some(c => c.allowUnload);
                  
                  return (
                    <motion.div
                      key={`warehouse-${warehouseId}`}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={listItemVariants}
                    >
                      <Card 
                        className={`overflow-hidden transition-all duration-200 hover:shadow-lg border-l-4 ${
                          allowsUnload 
                            ? (bestCoef === 0 ? "border-l-green-500" : "border-l-amber-500") 
                            : "border-l-red-500"
                        }`}
                      >
                        <div className={`h-2 w-full ${
                          allowsUnload 
                            ? (bestCoef === 0 ? "bg-green-500/20" : "bg-amber-500/20") 
                            : "bg-red-500/20"
                        }`} />
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-medium text-base flex items-center gap-2">
                              {allowsUnload 
                                ? (bestCoef === 0 
                                  ? <Star className="h-4 w-4 text-green-500 fill-green-500" /> 
                                  : <Filter className="h-4 w-4 text-amber-500" />)
                                : <AlertCircle className="h-4 w-4 text-red-500" />
                              }
                              {warehouseName}
                            </h3>
                            <Badge 
                              variant={
                                allowsUnload 
                                  ? (bestCoef === 0 ? "success" : "outline") 
                                  : "destructive"
                              }
                              className="ml-2"
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
                                        <Badge 
                                          variant={
                                            coef.allowUnload
                                              ? coef.coefficient === 0 
                                                ? "success" 
                                                : "outline"
                                              : "destructive"
                                          } 
                                          className="text-xs py-0.5 cursor-default"
                                        >
                                          {coef.boxTypeName}{' '}
                                          {coef.allowUnload 
                                            ? (coef.coefficient === 0 
                                              ? null 
                                              : <span className="ml-1">{coef.coefficient}x</span>)
                                            : null
                                          }
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
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
                          
                          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border/20">
                            <Clock className="h-3 w-3" />
                            <span>Обновлено: {new Date(warehouseCoefs[0].date).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        )}
        
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/30 text-xs justify-center">
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
      </CardContent>
    </Card>
  );
};

export default WarehouseCoefficientsCard;

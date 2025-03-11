
import React, { useState } from 'react';
import { SupplyOptionsResponse, Warehouse, SupplyOption } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Warehouse as WarehouseIcon,
  Box,
  PackageCheck,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SupplyOptionsResultsProps {
  results: SupplyOptionsResponse;
  warehouses: Warehouse[];
}

const SupplyOptionsResults: React.FC<SupplyOptionsResultsProps> = ({ results, warehouses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  
  // Найти название склада по ID
  const getWarehouseName = (id: number): string => {
    const warehouse = warehouses.find(w => w.ID === id);
    return warehouse ? warehouse.name : `Склад #${id}`;
  };

  // Подсчет статистики
  const totalItems = results.result.length;
  const errorItems = results.result.filter(item => item.isError).length;
  const availableItems = totalItems - errorItems;
  
  // Получаем доступные склады и их статистику
  const warehouseStats = warehouses.reduce<{[key: number]: {available: number, total: number}}>((acc, warehouse) => {
    acc[warehouse.ID] = { available: 0, total: 0 };
    return acc;
  }, {});

  // Подсчет доступности складов
  results.result.forEach(item => {
    if (!item.isError && item.warehouses) {
      item.warehouses.forEach(wh => {
        if (warehouseStats[wh.warehouseID]) {
          warehouseStats[wh.warehouseID].available++;
          warehouseStats[wh.warehouseID].total++;
        }
      });
    }
  });

  // Фильтрация результатов по поисковому запросу и вкладке
  const filteredResults = results.result.filter(item => {
    const matchesSearch = searchTerm === '' || item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (currentTab === 'all') return matchesSearch;
    if (currentTab === 'available') return matchesSearch && !item.isError;
    if (currentTab === 'errors') return matchesSearch && item.isError;
    
    return matchesSearch;
  });

  // Найти склад с максимальной доступностью товаров
  const bestWarehouse = Object.entries(warehouseStats)
    .sort(([, statsA], [, statsB]) => statsB.available - statsA.available)
    .find(([, stats]) => stats.available > 0);

  // Get top warehouses for visualization
  const topWarehouses = Object.entries(warehouseStats)
    .sort(([, statsA], [, statsB]) => statsB.available - statsA.available)
    .slice(0, 5)
    .map(([warehouseId, stats]) => ({
      id: parseInt(warehouseId),
      name: getWarehouseName(parseInt(warehouseId)),
      available: stats.available,
      total: stats.total,
      percentage: Math.round((stats.available / stats.total) * 100) || 0
    }));

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center text-xl">
              <PackageCheck className="h-5 w-5 mr-2 text-primary" />
              Результаты проверки
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-normal">{totalItems} товаров</Badge>
              <Badge variant="success" className="font-normal">{availableItems} доступно</Badge>
              {errorItems > 0 && <Badge variant="destructive" className="font-normal">{errorItems} с ошибками</Badge>}
            </CardDescription>
          </div>
          
          {bestWarehouse && (
            <div className="flex items-center space-x-2 bg-accent/20 p-2 rounded-md">
              <WarehouseIcon className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Рекомендуемый склад:</div> 
                <div className="text-base font-semibold">{getWarehouseName(parseInt(bestWarehouse[0]))}</div>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {errorItems > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Внимание</AlertTitle>
            <AlertDescription>
              Обнаружены ошибки в {errorItems} товарах. Проверьте баркоды и доступность товаров.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по баркоду..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  Все <Badge variant="outline" className="ml-1.5">{totalItems}</Badge>
                </TabsTrigger>
                <TabsTrigger value="available" className="text-xs sm:text-sm">
                  Доступные <Badge variant="outline" className="ml-1.5">{availableItems}</Badge>
                </TabsTrigger>
                <TabsTrigger value="errors" className="text-xs sm:text-sm">
                  Ошибки <Badge variant="outline" className="ml-1.5">{errorItems}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Warehouse Availability Visualization */}
          {topWarehouses.length > 0 && (
            <div className="bg-background rounded-lg border p-4 mb-6">
              <h3 className="text-sm font-medium mb-4 flex items-center">
                <WarehouseIcon className="h-4 w-4 mr-2" /> 
                Доступность товаров по складам
              </h3>
              <div className="space-y-3">
                {topWarehouses.map(warehouse => (
                  <div key={warehouse.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{warehouse.name}</span>
                      <span className="text-muted-foreground">{warehouse.available} из {warehouse.total} ({warehouse.percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${warehouse.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-md border">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="min-w-[120px]">Баркод</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="min-w-[200px]">Доступные склады</TableHead>
                  <TableHead>Типы упаковки</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((item, index) => (
                  <TableRow key={index} className={item.isError ? "bg-destructive/5" : ""}>
                    <TableCell className="font-medium">{item.barcode}</TableCell>
                    <TableCell>
                      {item.isError ? (
                        <div className="flex items-center text-destructive">
                          <XCircle className="h-4 w-4 mr-1.5" />
                          <span className="text-sm">{item.error?.detail || "Ошибка"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1.5" />
                          <span className="text-sm">Доступен</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.warehouses ? (
                        <div className="flex flex-wrap gap-1">
                          {item.warehouses.map((wh, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-primary/5">
                              {getWarehouseName(wh.warehouseID)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Не доступно</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.warehouses ? (
                        <div className="space-x-1">
                          {item.warehouses.some(wh => wh.canBox) && (
                            <Badge variant="secondary" className="text-xs bg-accent">Короба</Badge>
                          )}
                          {item.warehouses.some(wh => wh.canMonopallet) && (
                            <Badge variant="secondary" className="text-xs bg-accent">Монопаллеты</Badge>
                          )}
                          {item.warehouses.some(wh => wh.canSupersafe) && (
                            <Badge variant="secondary" className="text-xs bg-accent">Суперсейф</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm 
                        ? "Не найдено товаров по вашему запросу" 
                        : "Нет данных о товарах"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
      
      {bestWarehouse && (
        <CardFooter className="flex border-t pt-6 bg-accent/10">
          <Button className="flex items-center mx-auto">
            <Box className="h-5 w-5 mr-2" />
            Создать поставку на склад {getWarehouseName(parseInt(bestWarehouse[0]))}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SupplyOptionsResults;

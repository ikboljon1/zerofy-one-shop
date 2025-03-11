
import React, { useState } from 'react';
import { SupplyOptionsResponse, Warehouse, SupplyOption } from '@/types/supplies';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Warehouse as WarehouseIcon,
  Box,
  PackageCheck 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center">
              <PackageCheck className="h-5 w-5 mr-2 text-primary" />
              Результаты проверки ({totalItems} товаров)
            </CardTitle>
            <CardDescription className="mt-1">
              {availableItems} товаров доступно для поставки, {errorItems} с ошибками
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={errorItems > 0 ? "destructive" : "success"} className="text-xs px-2 py-1">
              {errorItems > 0 
                ? `${errorItems} товаров с ошибками` 
                : "Все товары доступны"}
            </Badge>
            
            {bestWarehouse && (
              <Badge variant="outline" className="text-xs px-2 py-1 flex items-center">
                <WarehouseIcon className="h-3 w-3 mr-1" />
                Рекомендуемый склад: {getWarehouseName(parseInt(bestWarehouse[0]))}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {errorItems > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Внимание</AlertTitle>
            <AlertDescription>
              Обнаружены ошибки в {errorItems} товарах. Проверьте баркоды и доступность товаров.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Input
              placeholder="Поиск по баркоду..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  Все <span className="ml-1 text-xs">({totalItems})</span>
                </TabsTrigger>
                <TabsTrigger value="available" className="text-xs sm:text-sm">
                  Доступные <span className="ml-1 text-xs">({availableItems})</span>
                </TabsTrigger>
                <TabsTrigger value="errors" className="text-xs sm:text-sm">
                  Ошибки <span className="ml-1 text-xs">({errorItems})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {bestWarehouse && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle>Рекомендуемый склад для поставки</AlertTitle>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span>
                  {getWarehouseName(parseInt(bestWarehouse[0]))} - 
                  доступно {bestWarehouse[1].available} из {bestWarehouse[1].total} товаров 
                  ({Math.round(bestWarehouse[1].available/bestWarehouse[1].total*100)}%)
                </span>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Box className="h-4 w-4 mr-2" />
                  Создать поставку на этот склад
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Баркод</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="min-w-[200px]">Доступные склады</TableHead>
                <TableHead>Доступные типы упаковки</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((item, index) => (
                <TableRow key={index} className={item.isError ? "bg-red-50" : "bg-white"}>
                  <TableCell className="font-medium">{item.barcode}</TableCell>
                  <TableCell>
                    {item.isError ? (
                      <div className="flex items-center text-red-500">
                        <XCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">{item.error?.detail || "Ошибка"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Доступен</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.warehouses ? (
                      <div className="flex flex-wrap gap-1">
                        {item.warehouses.map((wh, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {getWarehouseName(wh.warehouseID)}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Нет доступных складов</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.warehouses ? (
                      <div className="space-y-1">
                        {item.warehouses.some(wh => wh.canBox) && (
                          <Badge variant="secondary" className="mr-1 text-xs">Короба</Badge>
                        )}
                        {item.warehouses.some(wh => wh.canMonopallet) && (
                          <Badge variant="secondary" className="mr-1 text-xs">Монопаллеты</Badge>
                        )}
                        {item.warehouses.some(wh => wh.canSupersafe) && (
                          <Badge variant="secondary" className="text-xs">Суперсейф</Badge>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplyOptionsResults;

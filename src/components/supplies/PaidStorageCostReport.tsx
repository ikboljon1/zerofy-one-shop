import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ArrowUpDown, Package, DollarSign, Calendar, RefreshCw, Truck, Warehouse, CalendarDays, Info } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { PaidStorageItem } from '@/types/supplies';
import { format, parseISO, isValid, subMonths } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchLastMonthStorageData } from '@/services/suppliesApi';
import { getAverageDailySales } from '@/components/analytics/data/demoData';

interface PaidStorageCostReportProps {
  apiKey: string;
  storageData: PaidStorageItem[];
  isLoading: boolean;
  onRefresh: (dateFrom: string, dateTo: string) => void;
}

const PaidStorageCostReport: React.FC<PaidStorageCostReportProps> = ({
  apiKey,
  storageData,
  isLoading,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PaidStorageItem | '';
    direction: 'asc' | 'desc'
  }>({ key: 'date', direction: 'desc' });
  const [selectedTab, setSelectedTab] = useState<'nmId' | 'warehouse' | 'detail'>('nmId');
  
  const [dateFrom, setDateFrom] = useState<Date>(
    subMonths(new Date(), 1)
  );
  const [dateTo, setDateTo] = useState<Date>(new Date());
  
  const [averageDailySales, setAverageDailySales] = useState<Record<number, number> | null>(null);
  
  useEffect(() => {
    const savedSalesData = getAverageDailySales();
    if (savedSalesData) {
      setAverageDailySales(savedSalesData);
      console.log('Загружены сохраненные данные о средних продажах:', savedSalesData);
    }
    
    const handleSalesDataUpdate = (event: CustomEvent) => {
      const { averageSalesPerDay } = event.detail;
      console.log('Получено событие обновления данных о продажах:', averageSalesPerDay);
      setAverageDailySales(averageSalesPerDay);
    };
    
    window.addEventListener('salesDataUpdated', handleSalesDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('salesDataUpdated', handleSalesDataUpdate as EventListener);
    };
  }, []);
  
  const filteredData = React.useMemo(() => {
    let results = [...storageData];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(item => 
        (item.brand?.toLowerCase().includes(search) ||
        item.subject?.toLowerCase().includes(search) ||
        item.vendorCode?.toLowerCase().includes(search) ||
        item.nmId?.toString().includes(search) ||
        item.warehouse?.toLowerCase().includes(search))
      );
    }
    
    if (sortConfig.key) {
      results.sort((a, b) => {
        if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) {
          return 0;
        }
        
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return results;
  }, [storageData, searchTerm, sortConfig]);
  
  const groupedData = React.useMemo(() => {
    const result = {
      byNmId: new Map<number, { 
        totalCost: number, 
        avgDailyCost: number, 
        item: PaidStorageItem, 
        totalItems: number,
        dates: Set<string>,
        avgDailySales: number | null,
      }>(),
      byWarehouse: new Map<string, { 
        totalCost: number, 
        avgDailyCost: number, 
        totalItems: number,
        itemsCount: number,
        dates: Set<string>
      }>()
    };
    
    storageData.forEach(item => {
      if (item.nmId) {
        if (!result.byNmId.has(item.nmId)) {
          result.byNmId.set(item.nmId, { 
            totalCost: 0, 
            avgDailyCost: 0, 
            item, 
            totalItems: 0,
            dates: new Set<string>(),
            avgDailySales: null
          });
        }
        
        const entry = result.byNmId.get(item.nmId)!;
        entry.totalCost += item.warehousePrice || 0;
        entry.totalItems += item.barcodesCount || 0;
        if (item.date) {
          entry.dates.add(item.date);
        }
        
        if (averageDailySales && averageDailySales[item.nmId]) {
          entry.avgDailySales = averageDailySales[item.nmId];
        }
      }
      
      if (item.warehouse) {
        if (!result.byWarehouse.has(item.warehouse)) {
          result.byWarehouse.set(item.warehouse, { 
            totalCost: 0, 
            avgDailyCost: 0, 
            totalItems: 0,
            itemsCount: 0,
            dates: new Set<string>()
          });
        }
        
        const entry = result.byWarehouse.get(item.warehouse)!;
        entry.totalCost += item.warehousePrice || 0;
        entry.totalItems += item.barcodesCount || 0;
        entry.itemsCount++;
        if (item.date) {
          entry.dates.add(item.date);
        }
      }
    });
    
    const daysDiff = Math.max(1, Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)));
    
    result.byNmId.forEach(entry => {
      entry.avgDailyCost = entry.totalCost / daysDiff;
    });
    
    result.byWarehouse.forEach(entry => {
      entry.avgDailyCost = entry.totalCost / daysDiff;
    });
    
    return result;
  }, [storageData, dateFrom, dateTo, averageDailySales]);
  
  const handleSort = (key: keyof PaidStorageItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const handleRefresh = () => {
    const dateFromStr = format(dateFrom, 'yyyy-MM-dd');
    const dateToStr = format(dateTo, 'yyyy-MM-dd');
    onRefresh(dateFromStr, dateToStr);
  };
  
  const renderDetailView = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Товар</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Дата
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('warehouse')}
              >
                <div className="flex items-center">
                  Склад
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('barcodesCount')}
              >
                <div className="flex items-center">
                  Количество
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('warehousePrice')}
              >
                <div className="flex items-center">
                  Стоимость
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Детали</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Нет данных для отображения</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, index) => (
                <TableRow key={`${item.nmId}-${item.date}-${index}-${item.warehouse}`}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {item.brand} - {item.subject}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Артикул: {item.vendorCode} | ID: {item.nmId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.date ? format(new Date(item.date), 'dd.MM.yyyy') : 'Н/Д'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Warehouse className="h-4 w-4 text-muted-foreground" />
                      {item.warehouse}
                    </div>
                  </TableCell>
                  <TableCell>{item.barcodesCount || 0} шт.</TableCell>
                  <TableCell>
                    <div className="font-medium text-primary">{formatCurrency(item.warehousePrice || 0)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>Объем: {item.volume?.toFixed(2)} л.</div>
                      <div>Коэф. склада: {item.warehouseCoef?.toFixed(2)}</div>
                      <div>Коэф. логистики: {item.logWarehouseCoef?.toFixed(2)}</div>
                      {item.loyaltyDiscount ? (
                        <div>Скидка: {formatCurrency(item.loyaltyDiscount)}</div>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  const renderProductSummary = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Товар</TableHead>
              <TableHead>Общая стоимость</TableHead>
              <TableHead>
                <div className="flex items-center gap-1.5">
                  Стоимость в день
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Средняя стоимость хранения в день, рассчитанная как общая стоимость, 
                        разделенная на количество дней в выбранном периоде ({Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))} дн.)
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1.5">
                  Продажи/день
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Среднее количество продаж товара в день по данным API Wildberries 
                        за последние 30 дней
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>Количество</TableHead>
              <TableHead>Период</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.byNmId.size === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Нет данных для отображения</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              Array.from(groupedData.byNmId.entries())
                .filter(([nmId, data]) => {
                  if (!searchTerm) return true;
                  
                  const search = searchTerm.toLowerCase();
                  const item = data.item;
                  
                  return (
                    (item.brand?.toLowerCase().includes(search) ||
                    item.subject?.toLowerCase().includes(search) ||
                    item.vendorCode?.toLowerCase().includes(search) ||
                    nmId.toString().includes(search))
                  );
                })
                .sort((a, b) => {
                  return b[1].totalCost - a[1].totalCost;
                })
                .map(([nmId, data]) => (
                  <TableRow key={nmId}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {data.item.brand} - {data.item.subject}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Артикул: {data.item.vendorCode} | ID: {nmId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-primary">{formatCurrency(data.totalCost)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-primary">{formatCurrency(data.avgDailyCost)}</div>
                      <div className="text-xs text-muted-foreground">
                        в день
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-primary">
                        {data.avgDailySales !== null 
                          ? `${data.avgDailySales.toFixed(2)} шт.` 
                          : "Нет данных"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-2 py-1">
                        {data.totalItems} шт.
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs bg-muted inline-block px-2 py-1 rounded-md">
                        {data.dates.size} {data.dates.size === 1 ? 'день' : 
                         (data.dates.size > 1 && data.dates.size < 5) ? 'дня' : 'дней'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  const renderWarehouseSummary = () => (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Склад</TableHead>
              <TableHead>Общая стоимость</TableHead>
              <TableHead>
                <div className="flex items-center gap-1.5">
                  Стоимость в день
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        Средняя стоимость хранения в день, рассчитанная как общая стоимость, 
                        разделенная на количество дней в выбранном периоде ({Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))} дн.)
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>Количество товаров</TableHead>
              <TableHead>Период</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.byWarehouse.size === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Нет данных для отображения</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              Array.from(groupedData.byWarehouse.entries())
                .filter(([warehouse, _]) => {
                  if (!searchTerm) return true;
                  return warehouse.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .sort((a, b) => {
                  return b[1].totalCost - a[1].totalCost;
                })
                .map(([warehouse, data]) => (
                  <TableRow key={warehouse}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-1">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                        {warehouse}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-primary">{formatCurrency(data.totalCost)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-primary">{formatCurrency(data.avgDailyCost)}</div>
                      <div className="text-xs text-muted-foreground">
                        в день
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="mb-1 px-2 py-1">
                          {data.totalItems} шт.
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {data.itemsCount} наименований
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs bg-muted inline-block px-2 py-1 rounded-md">
                        {data.dates.size} {data.dates.size === 1 ? 'день' : 
                         (data.dates.size > 1 && data.dates.size < 5) ? 'дня' : 'дней'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const totalStorageCost = storageData.reduce((sum, item) => sum + (item.warehousePrice || 0), 0);
  
  const daysDiff = Math.max(1, Math.round((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)));
  
  const averageDailyStorageCost = totalStorageCost / daysDiff;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-t-lg pb-4">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <DollarSign className="h-6 w-6" />
          Отчет о платном хранении
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Статистика расходов на хранение товаров на складах маркетплейса
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-800/30 rounded-full mb-3">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalStorageCost)}</div>
              <div className="text-sm text-muted-foreground">Общая стоимость хранения</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="p-3 bg-green-100 dark:bg-green-800/30 rounded-full mb-3">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-primary">{formatCurrency(averageDailyStorageCost)}</div>
              <div className="text-sm text-muted-foreground">Средняя стоимость в день</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-800/30 rounded-full mb-3">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-primary">{storageData.length}</div>
              <div className="text-sm text-muted-foreground">Количество записей</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-0 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-800/30 rounded-full mb-3">
                <CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-primary">
                {daysDiff} {daysDiff === 1 ? 'день' : 
                 (daysDiff > 1 && daysDiff < 5) ? 'дня' : 'дней'}
              </div>
              <div className="text-sm text-muted-foreground">Период отчета</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по бренду, артикулу или названию..."
                className="pl-8 bg-white dark:bg-gray-900"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-sm font-medium">С даты:</Label>
                  <DatePicker
                    value={dateFrom}
                    onValueChange={(date) => date && setDateFrom(date)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-sm font-medium">По дату:</Label>
                  <DatePicker
                    value={dateTo}
                    onValueChange={(date) => date && setDateTo(date)}
                  />
                </div>
              </div>
              <Button 
                variant="default" 
                className="h-10 px-4"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Обновить
              </Button>
            </div>
          </div>
        </div>

        <Tabs 
          defaultValue="nmId" 
          value={selectedTab} 
          onValueChange={(value) => setSelectedTab(value as 'nmId' | 'warehouse' | 'detail')}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="nmId" className="py-3">
              <Package className="h-4 w-4 mr-2" />
              По товарам
            </TabsTrigger>
            <TabsTrigger value="warehouse" className="py-3">
              <Warehouse className="h-4 w-4 mr-2" />
              По складам
            </TabsTrigger>
            <TabsTrigger value="detail" className="py-3">
              <Calendar className="h-4 w-4 mr-2" />
              Детализация
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="nmId" className="mt-0">
            {renderProductSummary()}
          </TabsContent>
          
          <TabsContent value="warehouse" className="mt-0">
            {renderWarehouseSummary()}
          </TabsContent>
          
          <TabsContent value="detail" className="mt-0">
            {renderDetailView()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaidStorageCostReport;

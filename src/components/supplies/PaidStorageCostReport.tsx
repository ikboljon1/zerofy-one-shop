import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ArrowUpDown, Package, DollarSign, Calendar, RefreshCw, Truck, Warehouse } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { PaidStorageItem } from '@/types/supplies';
import { format, parseISO, isValid } from 'date-fns';

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
  const [selectedTab, setSelectedTab] = useState<'nmId' | 'warehouse'>('nmId');
  const [dateFrom, setDateFrom] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Filter and sort data based on user input
  const filteredData = React.useMemo(() => {
    let results = [...storageData];
    
    // Apply search filter
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
    
    // Apply sorting
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
  
  // Group data by nmId or warehouse for the summary views
  const groupedData = React.useMemo(() => {
    const result = {
      byNmId: new Map<number, { 
        totalCost: number, 
        avgDailyCost: number, 
        item: PaidStorageItem, 
        totalItems: number,
        dates: Set<string>
      }>(),
      byWarehouse: new Map<string, { 
        totalCost: number, 
        avgDailyCost: number, 
        totalItems: number,
        itemsCount: number,
        dates: Set<string>
      }>()
    };
    
    // Group by nmId
    storageData.forEach(item => {
      // Group by nmId
      if (item.nmId) {
        if (!result.byNmId.has(item.nmId)) {
          result.byNmId.set(item.nmId, { 
            totalCost: 0, 
            avgDailyCost: 0, 
            item, 
            totalItems: 0,
            dates: new Set<string>()
          });
        }
        
        const entry = result.byNmId.get(item.nmId)!;
        entry.totalCost += item.warehousePrice || 0;
        entry.totalItems += item.barcodesCount || 0;
        if (item.date) {
          entry.dates.add(item.date);
        }
      }
      
      // Group by warehouse
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
    
    // Calculate average daily costs
    result.byNmId.forEach(entry => {
      const days = entry.dates.size || 1;
      entry.avgDailyCost = entry.totalCost / days;
    });
    
    result.byWarehouse.forEach(entry => {
      const days = entry.dates.size || 1;
      entry.avgDailyCost = entry.totalCost / days;
    });
    
    return result;
  }, [storageData]);
  
  // Request sort on column header click
  const handleSort = (key: keyof PaidStorageItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle refresh button click - request new data
  const handleRefresh = () => {
    onRefresh(dateFrom, dateTo);
  };
  
  // For detail view of a single item
  const renderDetailView = () => (
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
              Стоимость хранения
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
            <TableRow key={`${item.nmId}-${item.date}-${index}`}>
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
                <div className="font-medium">{formatCurrency(item.warehousePrice || 0)}</div>
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
  );
  
  // Summary view by product (nmId)
  const renderProductSummary = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Товар</TableHead>
          <TableHead>Общая стоимость хранения</TableHead>
          <TableHead>Стоимость в день</TableHead>
          <TableHead>Количество</TableHead>
          <TableHead>Период</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedData.byNmId.size === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6">
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
              // Sort by total cost descending by default
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
                  <div className="font-medium">{formatCurrency(data.totalCost)}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatCurrency(data.avgDailyCost)}</div>
                  <div className="text-xs text-muted-foreground">
                    в день
                  </div>
                </TableCell>
                <TableCell>{data.totalItems} шт.</TableCell>
                <TableCell>
                  <div className="text-xs">
                    {data.dates.size} {data.dates.size === 1 ? 'день' : 
                     (data.dates.size > 1 && data.dates.size < 5) ? 'дня' : 'дней'}
                  </div>
                </TableCell>
              </TableRow>
            ))
        )}
      </TableBody>
    </Table>
  );
  
  // Summary view by warehouse
  const renderWarehouseSummary = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Склад</TableHead>
          <TableHead>Общая стоимость хранения</TableHead>
          <TableHead>Стоимость в день</TableHead>
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
              // Sort by total cost descending by default
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
                  <div className="font-medium">{formatCurrency(data.totalCost)}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{formatCurrency(data.avgDailyCost)}</div>
                  <div className="text-xs text-muted-foreground">
                    в день
                  </div>
                </TableCell>
                <TableCell>
                  <div>{data.totalItems} шт.</div>
                  <div className="text-xs text-muted-foreground">
                    {data.itemsCount} наименований
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    {data.dates.size} {data.dates.size === 1 ? 'день' : 
                     (data.dates.size > 1 && data.dates.size < 5) ? 'дня' : 'дней'}
                  </div>
                </TableCell>
              </TableRow>
            ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Отчет о платном хранении
        </CardTitle>
        <CardDescription>
          Статистика расходов на хранение товаров на складах маркетплейса
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по бренду, артикулу или названию..."
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex flex-col gap-1">
                <Label htmlFor="dateFrom">С даты:</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="dateTo">По дату:</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button 
                variant="outline" 
                className="mt-5"
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

          <Tabs defaultValue="nmId" value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'nmId' | 'warehouse')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="detail">Детализация</TabsTrigger>
              <TabsTrigger value="nmId">По товарам</TabsTrigger>
              <TabsTrigger value="warehouse">По складам</TabsTrigger>
            </TabsList>
            
            <TabsContent value="detail" className="overflow-x-auto">
              {renderDetailView()}
            </TabsContent>
            
            <TabsContent value="nmId" className="overflow-x-auto">
              {renderProductSummary()}
            </TabsContent>
            
            <TabsContent value="warehouse" className="overflow-x-auto">
              {renderWarehouseSummary()}
            </TabsContent>
          </Tabs>
          
          <div className="text-sm text-muted-foreground">
            <p>Общая сумма: {formatCurrency(storageData.reduce((sum, item) => sum + (item.warehousePrice || 0), 0))}</p>
            <p>Период: {dateFrom} - {dateTo}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaidStorageCostReport;

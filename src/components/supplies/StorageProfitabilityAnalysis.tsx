
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Package, ArrowUpDown, Search, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils/formatCurrency';
import { WarehouseRemainItem, PaidStorageItem } from '@/types/supplies';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import SalesDataDialog from './SalesDataDialog';
import { getProductProfitabilityData } from '@/services/suppliesApi';

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  averageDailySalesRate?: Record<number, number>;
  dailyStorageCost?: Record<number, number>;
  apiKey?: string;
}

type SortField = 'subject' | 'brand' | 'quantity' | 'dailySales' | 'dailyStorage' | 'daysToSellOut' | 'profitability';
type SortDirection = 'asc' | 'desc';

type ItemAnalysis = {
  nmId: number;
  subject: string;
  brand: string;
  vendorCode: string;
  quantity: number;
  price: number;
  dailySales: number;
  dailyStorage: number;
  daysToSellOut: number;
  totalStorageCost: number;
  totalRevenue: number;
  profitability: number;
  daysToBreakEven: number;
  lastChangeDate: string;
  warehouseName: string;
  barcode: string;
  size: string;
  supplierArticle: string;
  supplierName: string;
  warehouses: {
    name: string;
    quantity: number;
  }[];
};

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({
  warehouseItems,
  paidStorageData,
  averageDailySalesRate,
  dailyStorageCost,
  apiKey
}) => {
  const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: SortDirection }>({
    field: 'profitability',
    direction: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'all' | 'profitable' | 'unprofitable'>('all');
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [realAverageDailySales, setRealAverageDailySales] = useState<Record<number, number> | null>(null);
  const [realDailyStorageCosts, setRealDailyStorageCosts] = useState<Record<number, number> | null>(null);

  // Calculate profit metrics for items
  const analyzedItems: ItemAnalysis[] = React.useMemo(() => {
    const itemsMap = new Map<number, ItemAnalysis>();
    
    // Use real data if available, otherwise fallback to provided data
    const dailySales = realAverageDailySales || averageDailySalesRate || {};
    const storageCosts = realDailyStorageCosts || dailyStorageCost || {};
    
    // Process warehouse items
    warehouseItems.forEach(item => {
      if (!itemsMap.has(item.nmId)) {
        const avgDailySales = dailySales[item.nmId] || 0;
        const avgDailyStorage = storageCosts[item.nmId] || 0;
        const daysToSellOut = avgDailySales > 0 ? item.quantity / avgDailySales : 9999;
        const totalStorageCost = daysToSellOut * avgDailyStorage;
        const totalRevenue = item.price * item.quantity;
        const profitability = totalRevenue > 0 ? 
          ((totalRevenue - totalStorageCost) / totalRevenue) * 100 : 0;
        const daysToBreakEven = avgDailyStorage > 0 ? 
          (item.price / avgDailyStorage) : 9999;
        
        // Create analysis object
        itemsMap.set(item.nmId, {
          nmId: item.nmId,
          subject: item.subject || 'Неизвестно',
          brand: item.brand || 'Неизвестно',
          vendorCode: item.vendorCode || '',
          quantity: item.quantity,
          price: item.price || 0,
          dailySales: avgDailySales,
          dailyStorage: avgDailyStorage,
          daysToSellOut: daysToSellOut,
          totalStorageCost: totalStorageCost,
          totalRevenue: totalRevenue,
          profitability: profitability,
          daysToBreakEven: daysToBreakEven,
          lastChangeDate: item.lastChangeDate || '',
          warehouseName: item.warehouseName || '',
          barcode: item.barcode || '',
          size: item.size || '',
          supplierArticle: item.supplierArticle || '',
          supplierName: item.supplierName || '',
          warehouses: [{
            name: item.warehouseName || 'Неизвестно',
            quantity: item.quantity
          }]
        });
      } else {
        // Update existing item (add warehouse)
        const existingItem = itemsMap.get(item.nmId)!;
        existingItem.quantity += item.quantity;
        existingItem.warehouses.push({
          name: item.warehouseName || 'Неизвестно',
          quantity: item.quantity
        });
      }
    });
    
    return Array.from(itemsMap.values());
  }, [warehouseItems, averageDailySalesRate, dailyStorageCost, realAverageDailySales, realDailyStorageCosts]);
  
  // Filter and sort analyzed items
  const filteredAndSortedItems = React.useMemo(() => {
    let items = [...analyzedItems];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.subject.toLowerCase().includes(searchLower) ||
        item.brand.toLowerCase().includes(searchLower) ||
        item.vendorCode.toLowerCase().includes(searchLower) ||
        item.nmId.toString().includes(searchLower)
      );
    }
    
    // Apply view filter
    if (view === 'profitable') {
      items = items.filter(item => item.profitability > 0);
    } else if (view === 'unprofitable') {
      items = items.filter(item => item.profitability <= 0);
    }
    
    // Apply sorting
    items.sort((a, b) => {
      let comparison = 0;
      
      switch (sortConfig.field) {
        case 'subject':
          comparison = a.subject.localeCompare(b.subject);
          break;
        case 'brand':
          comparison = a.brand.localeCompare(b.brand);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'dailySales':
          comparison = a.dailySales - b.dailySales;
          break;
        case 'dailyStorage':
          comparison = a.dailyStorage - b.dailyStorage;
          break;
        case 'daysToSellOut':
          comparison = a.daysToSellOut - b.daysToSellOut;
          break;
        case 'profitability':
          comparison = a.profitability - b.profitability;
          break;
        default:
          comparison = 0;
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    
    return items;
  }, [analyzedItems, searchTerm, sortConfig, view]);
  
  // Sort table columns
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Fetch real data from APIs
  const handleFetchRealData = async (
    salesDateFrom: string, 
    salesDateTo: string, 
    storageDateFrom: string, 
    storageDateTo: string
  ) => {
    if (!apiKey) {
      toast.error('Необходимо выбрать магазин для получения данных');
      return;
    }
    
    setIsLoadingRealData(true);
    toast.info('Запрос данных для анализа. Это может занять некоторое время...');
    
    try {
      const data = await getProductProfitabilityData(
        apiKey,
        salesDateFrom,
        salesDateTo,
        storageDateFrom,
        storageDateTo
      );
      
      setRealAverageDailySales(data.averageDailySales);
      setRealDailyStorageCosts(data.dailyStorageCosts);
      
      toast.success('Данные успешно загружены');
    } catch (error: any) {
      console.error('Ошибка при получении данных для анализа:', error);
      toast.error(`Не удалось получить данные: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsLoadingRealData(false);
    }
  };
  
  // Calculate summary metrics
  const summaryMetrics = React.useMemo(() => {
    let totalQuantity = 0;
    let totalStorageCost = 0;
    let totalRevenue = 0;
    let profitableItems = 0;
    let unprofitableItems = 0;
    
    analyzedItems.forEach(item => {
      totalQuantity += item.quantity;
      totalStorageCost += item.totalStorageCost;
      totalRevenue += item.totalRevenue;
      
      if (item.profitability > 0) {
        profitableItems++;
      } else {
        unprofitableItems++;
      }
    });
    
    const overallProfitability = totalRevenue > 0 ? 
      ((totalRevenue - totalStorageCost) / totalRevenue) * 100 : 0;
    
    return {
      totalQuantity,
      totalStorageCost,
      totalRevenue,
      overallProfitability,
      profitableItems,
      unprofitableItems,
      totalItems: analyzedItems.length
    };
  }, [analyzedItems]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Анализ рентабельности хранения
        </CardTitle>
        <CardDescription>
          Оценка рентабельности товаров на складе с учетом среднедневных продаж и стоимости хранения
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{summaryMetrics.totalItems}</div>
              <p className="text-sm text-muted-foreground">Всего товаров</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryMetrics.totalRevenue)}</div>
              <p className="text-sm text-muted-foreground">Потенциальная выручка</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(summaryMetrics.totalStorageCost)}</div>
              <p className="text-sm text-muted-foreground">Стоимость хранения</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className={`text-2xl font-bold ${summaryMetrics.overallProfitability > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summaryMetrics.overallProfitability.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground">Общая рентабельность</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию, бренду или артикулу..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Tabs defaultValue="all" value={view} onValueChange={(value) => setView(value as 'all' | 'profitable' | 'unprofitable')}>
                <TabsList>
                  <TabsTrigger value="all">Все товары</TabsTrigger>
                  <TabsTrigger value="profitable" className="text-green-600">Рентабельные</TabsTrigger>
                  <TabsTrigger value="unprofitable" className="text-red-600">Нерентабельные</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {apiKey && (
            <div className="flex justify-end">
              <SalesDataDialog 
                onFetchData={handleFetchRealData}
                isLoading={isLoadingRealData}
              />
            </div>
          )}
          
          {(realAverageDailySales || realDailyStorageCosts) && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md text-sm">
              <p className="flex items-center text-blue-600 dark:text-blue-400">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Используются актуальные данные о продажах и стоимости хранения
              </p>
            </div>
          )}
          
          {isLoadingRealData && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Товар</TableHead>
                <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center">
                    Остаток
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('dailySales')}>
                  <div className="flex items-center">
                    Продажи/день
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('dailyStorage')}>
                  <div className="flex items-center">
                    Хранение/день
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px] cursor-pointer" onClick={() => handleSort('daysToSellOut')}>
                  <div className="flex items-center">
                    Дней до продажи
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[150px] cursor-pointer" onClick={() => handleSort('profitability')}>
                  <div className="flex items-center">
                    Рентабельность
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">Склады</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Нет данных для отображения</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedItems.map(item => (
                  <TableRow key={item.nmId}>
                    <TableCell>
                      <div className="font-medium">{item.brand} - {item.subject}</div>
                      <div className="text-xs text-muted-foreground">
                        Артикул: {item.vendorCode} | ID: {item.nmId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="px-2 py-1">
                        {item.quantity} шт.
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.dailySales.toFixed(2)} шт.
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.dailyStorage)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.daysToSellOut > 30 ? 'destructive' : 'default'} className="px-2 py-1">
                        {item.daysToSellOut > 9000 ? '∞' : Math.round(item.daysToSellOut)} дн.
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.profitability > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={item.profitability > 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.profitability.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(item.totalRevenue - item.totalStorageCost)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1 max-h-16 overflow-auto">
                        {item.warehouses.map((wh, idx) => (
                          <div key={idx}>
                            {wh.name}: {wh.quantity} шт.
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;

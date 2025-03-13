
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BarChart, 
  ShoppingCart,
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  ListFilter
} from 'lucide-react';
import { 
  WarehouseRemainItem,
  PaidStorageItem
} from '@/types/supplies';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ensureStoreSelectionPersistence } from '@/utils/storeUtils';
import { fetchAverageSalesAndStorageCosts } from '@/services/salesStorageApi';
import { SalesDataDialog } from './SalesDataDialog';

export interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  paidStorageData: PaidStorageItem[];
  averageDailySalesRate?: Record<number, number>;
  dailyStorageCost?: Record<number, number>;
}

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({
  warehouseItems,
  paidStorageData,
  averageDailySalesRate: propAverageDailySalesRate,
  dailyStorageCost: propDailyStorageCost
}) => {
  const { toast } = useToast();
  const [salesDataDialogOpen, setSalesDataDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('profitability');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Состояния для хранения данных о продажах и стоимости хранения
  const [dailySalesRates, setDailySalesRates] = useState<Record<number, number>>(
    propAverageDailySalesRate || {}
  );
  const [storageCostRates, setStorageCostRates] = useState<Record<number, number>>(
    propDailyStorageCost || {}
  );
  const [sellingPrices, setSellingPrices] = useState<Record<number, number>>({});

  // Получение данных о продажах и стоимости хранения из API
  const fetchSalesAndStorageData = async (
    salesDateFrom: Date,
    salesDateTo: Date,
    storageDateFrom: Date,
    storageDateTo: Date
  ) => {
    try {
      setIsLoading(true);
      
      // Получение выбранного магазина
      const stores = ensureStoreSelectionPersistence();
      const selectedStore = stores.find(store => store.isSelected);
      
      if (!selectedStore) {
        throw new Error('Не выбран магазин');
      }
      
      console.log(`Получение данных для магазина ${selectedStore.name} (${selectedStore.id})`);
      
      // Получение данных из API
      const { averageDailySales, storageDaily } = await fetchAverageSalesAndStorageCosts(
        selectedStore.apiKey,
        salesDateFrom,
        salesDateTo,
        storageDateFrom,
        storageDateTo
      );
      
      // Обновляем цены продажи на основе данных из warehouseItems
      const newSellingPrices: Record<number, number> = {};
      warehouseItems.forEach(item => {
        newSellingPrices[item.nmId] = item.price || 0;
      });
      
      setDailySalesRates(averageDailySales);
      setStorageCostRates(storageDaily);
      setSellingPrices(newSellingPrices);
      
      // Закрываем диалог
      setSalesDataDialogOpen(false);
      
      toast({
        title: "Данные получены",
        description: `Данные о продажах и хранении успешно загружены`,
      });
    } catch (error: any) {
      console.error("Ошибка при получении данных:", error);
      toast({
        title: "Ошибка получения данных",
        description: error.message || "Не удалось получить данные. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Расчеты для анализа рентабельности хранения
  const storageProfitabilityData = useMemo(() => {
    return warehouseItems.map(item => {
      const nmId = item.nmId;
      const quantity = item.quantityFull || 0;
      const dailySales = dailySalesRates[nmId] || 0.1; // По умолчанию 0.1 продаж в день, чтобы избежать деления на 0
      const dailyStorage = storageCostRates[nmId] || 5; // По умолчанию 5 рублей в день
      const sellingPrice = sellingPrices[nmId] || item.price || 0;
      
      // Дней до полной продажи
      const daysToSellOut = dailySales > 0 ? Math.ceil(quantity / dailySales) : 999;
      
      // Общая стоимость хранения до полной продажи
      const totalStorageCost = daysToSellOut * dailyStorage * quantity;
      
      // Общая выручка от продажи всех товаров
      const totalRevenue = quantity * sellingPrice;
      
      // Рентабельность хранения (отношение выручки к стоимости хранения)
      const profitability = totalStorageCost > 0 ? (totalRevenue / totalStorageCost) : 0;
      
      // Срок окупаемости дневного хранения (в днях)
      const daysToBreakEven = dailyStorage > 0 ? (sellingPrice / dailyStorage) : 0;
      
      return {
        ...item,
        dailySales,
        dailyStorage,
        daysToSellOut,
        totalStorageCost,
        totalRevenue,
        profitability,
        daysToBreakEven
      };
    });
  }, [warehouseItems, dailySalesRates, storageCostRates, sellingPrices]);

  // Фильтрация и сортировка данных
  const filteredAndSortedData = useMemo(() => {
    let filtered = storageProfitabilityData;
    
    // Фильтрация по поисковому запросу
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.subjectName?.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.nmId.toString().includes(searchLower)
      );
    }
    
    // Сортировка данных
    return filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'profitability':
          valueA = a.profitability;
          valueB = b.profitability;
          break;
        case 'dailySales':
          valueA = a.dailySales;
          valueB = b.dailySales;
          break;
        case 'daysToSellOut':
          valueA = a.daysToSellOut;
          valueB = b.daysToSellOut;
          break;
        case 'totalStorageCost':
          valueA = a.totalStorageCost;
          valueB = b.totalStorageCost;
          break;
        case 'quantity':
          valueA = a.quantityFull;
          valueB = b.quantityFull;
          break;
        default:
          valueA = a.profitability;
          valueB = b.profitability;
      }
      
      return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }, [storageProfitabilityData, searchTerm, sortBy, sortOrder]);

  // Расчет статистики по рентабельности хранения
  const statistics = useMemo(() => {
    const itemsWithProfitability = storageProfitabilityData.filter(item => item.profitability > 0);
    const profitableItems = itemsWithProfitability.filter(item => item.profitability >= 2);
    const unprofitableItems = itemsWithProfitability.filter(item => item.profitability < 2);
    
    const totalItems = itemsWithProfitability.length;
    const totalQuantity = itemsWithProfitability.reduce((sum, item) => sum + (item.quantityFull || 0), 0);
    const totalStorageCost = itemsWithProfitability.reduce((sum, item) => sum + item.totalStorageCost, 0);
    
    return {
      totalItems,
      profitableCount: profitableItems.length,
      unprofitableCount: unprofitableItems.length,
      profitablePercentage: totalItems > 0 ? (profitableItems.length / totalItems) * 100 : 0,
      totalQuantity,
      totalStorageCost,
      averageProfitability: totalItems > 0 
        ? itemsWithProfitability.reduce((sum, item) => sum + item.profitability, 0) / totalItems 
        : 0
    };
  }, [storageProfitabilityData]);

  // Обработчик изменения сортировки
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); // По умолчанию сортировка по убыванию
    }
  };

  // Рендер иконки сортировки
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;
  };

  // Классификация рентабельности
  const getProfitabilityClass = (profitability: number): string => {
    if (profitability >= 5) return "text-green-600 font-semibold";
    if (profitability >= 2) return "text-green-500";
    if (profitability >= 1) return "text-yellow-500";
    return "text-red-500 font-semibold";
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                <span>Анализ рентабельности хранения</span>
              </CardTitle>
              <CardDescription>
                Анализ окупаемости затрат на хранение товаров на складах
              </CardDescription>
            </div>
            <Button onClick={() => setSalesDataDialogOpen(true)}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Получить данные о продажах
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="statistics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="statistics">Общая статистика</TabsTrigger>
              <TabsTrigger value="items">По товарам</TabsTrigger>
            </TabsList>
            
            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Всего товаров
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statistics.totalItems}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Общее количество: {statistics.totalQuantity} шт.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Рентабельные товары
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">
                      {statistics.profitableCount} 
                      <span className="text-sm font-normal ml-1 text-muted-foreground">
                        ({Math.round(statistics.profitablePercentage)}%)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Рентабельность &gt;= 2
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Нерентабельные товары
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {statistics.unprofitableCount} 
                      <span className="text-sm font-normal ml-1 text-muted-foreground">
                        ({Math.round(100 - statistics.profitablePercentage)}%)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Рентабельность &lt; 2
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Средняя рентабельность
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getProfitabilityClass(statistics.averageProfitability)}`}>
                      {statistics.averageProfitability.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Выручка / Стоимость хранения
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Общие затраты на хранение</CardTitle>
                  <CardDescription>
                    Прогноз общих затрат на хранение до полной продажи товаров
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {Math.round(statistics.totalStorageCost).toLocaleString()} ₽
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Эта сумма представляет общие затраты на хранение всех товаров до их полной продажи при текущих темпах продаж и стоимости хранения.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Рекомендации по оптимизации</CardTitle>
                  <CardDescription>
                    Как улучшить рентабельность хранения и снизить затраты
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">1. Оптимизация остатков</h4>
                    <p className="text-sm text-muted-foreground">
                      Сократите количество товаров с низкой рентабельностью хранения и низким темпом продаж.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">2. Увеличение цены</h4>
                    <p className="text-sm text-muted-foreground">
                      Рассмотрите возможность повышения цены на товары с рентабельностью хранения ниже 2.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">3. Акции и продвижение</h4>
                    <p className="text-sm text-muted-foreground">
                      Используйте акции и рекламу для увеличения скорости продаж нерентабельных товаров.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="items">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="relative w-full max-w-sm">
                    <Input
                      placeholder="Поиск товаров..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    <ListFilter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Найдено товаров:</span>
                    <span className="font-semibold ml-1">{filteredAndSortedData.length}</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Товар</TableHead>
                        <TableHead className="w-[120px]">
                          <div 
                            className="flex items-center cursor-pointer" 
                            onClick={() => handleSortChange('quantity')}
                          >
                            Количество {renderSortIcon('quantity')}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div 
                            className="flex items-center cursor-pointer" 
                            onClick={() => handleSortChange('dailySales')}
                          >
                            Продажи в день {renderSortIcon('dailySales')}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div 
                            className="flex items-center cursor-pointer" 
                            onClick={() => handleSortChange('daysToSellOut')}
                          >
                            Дней до продажи {renderSortIcon('daysToSellOut')}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div 
                            className="flex items-center cursor-pointer" 
                            onClick={() => handleSortChange('totalStorageCost')}
                          >
                            Затраты на хранение {renderSortIcon('totalStorageCost')}
                          </div>
                        </TableHead>
                        <TableHead>
                          <div 
                            className="flex items-center cursor-pointer" 
                            onClick={() => handleSortChange('profitability')}
                          >
                            Рентабельность {renderSortIcon('profitability')}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                            {isLoading ? 'Загрузка данных...' : 'Нет данных для отображения'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredAndSortedData.map((item) => (
                          <TableRow key={item.nmId}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.subjectName || "Неизвестный товар"}</div>
                                <div className="text-xs text-muted-foreground">
                                  {item.brand}, ID: {item.nmId}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{item.quantityFull || 0}</TableCell>
                            <TableCell>{item.dailySales.toFixed(2)}</TableCell>
                            <TableCell>
                              <span className={item.daysToSellOut > 100 ? "text-red-500" : ""}>
                                {item.daysToSellOut} {item.daysToSellOut === 999 ? "+" : ""}
                              </span>
                            </TableCell>
                            <TableCell>{Math.round(item.totalStorageCost).toLocaleString()} ₽</TableCell>
                            <TableCell>
                              <span className={getProfitabilityClass(item.profitability)}>
                                {item.profitability.toFixed(1)}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <SalesDataDialog
        open={salesDataDialogOpen}
        onOpenChange={setSalesDataDialogOpen}
        onFetchData={fetchSalesAndStorageData}
        isLoading={isLoading}
      />
    </>
  );
};

export default StorageProfitabilityAnalysis;

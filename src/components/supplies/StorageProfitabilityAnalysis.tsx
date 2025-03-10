
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Search, ArrowUpDown, Package, TrendingDown, Banknote, WarehouseIcon, AlertTriangle, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { WarehouseRemainItem, PaidStorageItem } from '@/types/supplies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  paidStorageData?: PaidStorageItem[];
  averageDailySalesRate?: Record<number, number>;
  dailyStorageCost?: Record<number, number>;
}

interface AnalysisResult {
  remainItem: WarehouseRemainItem;
  costPrice: number;
  sellingPrice: number;
  dailySales: number;
  dailyStorageCost: number;
  dailyStorageCostTotal: number;
  daysOfInventory: number;
  totalStorageCost: number;
  recommendedDiscount: number;
  profitWithoutDiscount: number;
  profitWithDiscount: number;
  savingsWithDiscount: number;
  action: 'sell' | 'discount' | 'keep';
  lowStock: boolean;
  stockLevel: 'low' | 'medium' | 'high';
  stockLevelPercentage: number;
  lastReplanishmentDate?: Date;
  projectedStockoutDate?: Date;
}

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({
  warehouseItems,
  paidStorageData = [],
  averageDailySalesRate = {},
  dailyStorageCost = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'discount' | 'keep' | 'low-stock'>('all');
  const [costPrices, setCostPrices] = useState<Record<number, number>>({});
  const [sellingPrices, setSellingPrices] = useState<Record<number, number>>({});
  const [dailySalesRates, setDailySalesRates] = useState<Record<number, number>>({});
  const [storageCostRates, setStorageCostRates] = useState<Record<number, number>>({});
  const [discountLevels, setDiscountLevels] = useState<Record<number, number>>({});
  const [lowStockThreshold, setLowStockThreshold] = useState<Record<number, number>>({});
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AnalysisResult | '',
    direction: 'asc' | 'desc'
  }>({ key: '', direction: 'asc' });

  useEffect(() => {
    const storedCostPrices = localStorage.getItem('product_cost_prices');
    if (storedCostPrices) {
      setCostPrices(JSON.parse(storedCostPrices));
    }

    const storedSellingPrices = localStorage.getItem('product_selling_prices');
    if (storedSellingPrices) {
      setSellingPrices(JSON.parse(storedSellingPrices));
    }

    const storedLowStockThresholds = localStorage.getItem('product_low_stock_thresholds');
    if (storedLowStockThresholds) {
      setLowStockThreshold(JSON.parse(storedLowStockThresholds));
    }

    const initialDailySales: Record<number, number> = {};
    const initialStorageCosts: Record<number, number> = {};
    const initialDiscountLevels: Record<number, number> = {};
    const initialLowStockThresholds: Record<number, number> = {};

    warehouseItems.forEach(item => {
      let itemStorageCost = dailyStorageCost[item.nmId] || 5;
      
      const matchingStorageItems = paidStorageData.filter(psi => psi.nmId === item.nmId);
      if (matchingStorageItems.length > 0) {
        const totalCost = matchingStorageItems.reduce((sum, psi) => sum + psi.warehousePrice, 0);
        itemStorageCost = totalCost / matchingStorageItems.length;
      }
      
      initialDailySales[item.nmId] = averageDailySalesRate[item.nmId] || 0.1;
      initialStorageCosts[item.nmId] = itemStorageCost;
      initialDiscountLevels[item.nmId] = 30;
      
      const salesRate = averageDailySalesRate[item.nmId] || 0.1;
      initialLowStockThresholds[item.nmId] = Math.max(3, Math.ceil(salesRate * 7));
    });

    setDailySalesRates(prevState => ({...prevState, ...initialDailySales}));
    setStorageCostRates(prevState => ({...prevState, ...initialStorageCosts}));
    setDiscountLevels(prevState => ({...prevState, ...initialDiscountLevels}));
    setLowStockThreshold(prevState => ({...prevState, ...initialLowStockThresholds}));
  }, [warehouseItems, averageDailySalesRate, dailyStorageCost, paidStorageData]);

  const formatDaysOfInventory = (days: number): string => {
    if (days >= 300) {
      return `${Math.round(days / 30)} мес.`;
    } else if (days > 60) {
      return `${Math.round(days / 7)} нед.`;
    } else {
      return `${days} дн.`;
    }
  };

  const analysisResults = useMemo(() => {
    return warehouseItems.map(item => {
      const nmId = item.nmId;
      const costPrice = costPrices[nmId] || 0;
      const sellingPrice = sellingPrices[nmId] || (item.price || 0);
      const dailySales = dailySalesRates[nmId] || 0.1;
      const storageCost = storageCostRates[nmId] || 5;
      const currentStock = item.quantityWarehousesFull || 0;
      const threshold = lowStockThreshold[nmId] || Math.ceil(dailySales * 7);
      
      // Ежедневные затраты на хранение полного запаса
      const dailyStorageCostTotal = storageCost * currentStock;
      
      // Время полной распродажи запаса (дни)
      const daysOfInventory = dailySales > 0 ? Math.round(currentStock / dailySales) : 999;
      
      // Изменение: Уточненный расчет общих затрат на хранение
      // Учитываем, что количество товара постепенно уменьшается
      // Используем формулу: среднее количество × дни × стоимость единицы
      // Среднее количество = (начальное + конечное) / 2 = (текущее + 0) / 2 = текущее / 2
      const averageStock = currentStock / 2;
      const totalStorageCost = averageStock * daysOfInventory * storageCost;
      
      const profitPerItem = sellingPrice - costPrice;
      
      // Рассчитываем общую прибыль за весь период хранения
      const totalProfit = (profitPerItem * currentStock) - totalStorageCost;
      
      // Порог для определения необходимости скидки
      const totalSalesValue = sellingPrice * currentStock;
      const profitabilityRatio = totalProfit / totalSalesValue;
      
      // Если прибыльность выше 15%, сохраняем цену, иначе рекомендуем скидку
      const shouldKeepPrice = profitabilityRatio >= 0.15;
      
      const discountPercentage = shouldKeepPrice ? 0 : (discountLevels[nmId] || 30);
      
      const discountedPrice = sellingPrice * (1 - discountPercentage / 100);
      const profitWithDiscountPerItem = discountedPrice - costPrice;
      
      // Предположим, что со скидкой товар будет продаваться в 2 раза быстрее
      const discountedDaysOfInventory = Math.round(daysOfInventory * 0.5);
      
      // Изменение: Пересчитываем затраты на хранение при ускоренных продажах
      // Используем ту же формулу среднего, но с ускоренным периодом
      const discountedAverageStock = averageStock; // Среднее не меняется
      const discountedStorageCost = discountedAverageStock * discountedDaysOfInventory * storageCost;
      
      const profitWithoutDiscount = (profitPerItem * currentStock) - totalStorageCost;
      const profitWithDiscount = (profitWithDiscountPerItem * currentStock) - discountedStorageCost;
      const savingsWithDiscount = profitWithDiscount - profitWithoutDiscount;
      
      let action: 'sell' | 'discount' | 'keep';
      if (shouldKeepPrice) {
        action = 'keep';
      } else if (profitWithDiscountPerItem < 0) {
        action = 'sell';
      } else {
        action = 'discount';
      }
      
      const lowStock = currentStock <= threshold;
      const stockLevelPercentage = Math.min(100, Math.max(0, Math.round((currentStock / (threshold * 2)) * 100)));
      
      let stockLevel: 'low' | 'medium' | 'high';
      if (currentStock <= threshold) {
        stockLevel = 'low';
      } else if (currentStock <= threshold * 3) {
        stockLevel = 'medium';
      } else {
        stockLevel = 'high';
      }
      
      const projectedStockoutDate = dailySales > 0 
        ? new Date(Date.now() + (daysOfInventory * 24 * 60 * 60 * 1000))
        : undefined;

      return {
        remainItem: item,
        costPrice,
        sellingPrice,
        dailySales,
        dailyStorageCost: storageCost,
        dailyStorageCostTotal,
        daysOfInventory,
        totalStorageCost,
        recommendedDiscount: discountPercentage,
        profitWithoutDiscount,
        profitWithDiscount,
        savingsWithDiscount,
        action,
        lowStock,
        stockLevel,
        stockLevelPercentage,
        projectedStockoutDate
      };
    });
  }, [warehouseItems, costPrices, sellingPrices, dailySalesRates, storageCostRates, discountLevels, lowStockThreshold]);

  const filteredResults = useMemo(() => {
    let results = [...analysisResults];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      results = results.filter(result => 
        result.remainItem.brand.toLowerCase().includes(search) ||
        (result.remainItem.subjectName && result.remainItem.subjectName.toLowerCase().includes(search)) ||
        (result.remainItem.vendorCode && result.remainItem.vendorCode.toLowerCase().includes(search)) ||
        result.remainItem.nmId.toString().includes(search)
      );
    }
    
    if (selectedTab === 'discount') {
      results = results.filter(result => result.action === 'discount' || result.action === 'sell');
    } else if (selectedTab === 'keep') {
      results = results.filter(result => result.action === 'keep');
    } else if (selectedTab === 'low-stock') {
      results = results.filter(result => result.lowStock);
    }
    
    if (sortConfig.key) {
      results.sort((a, b) => {
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
  }, [analysisResults, searchTerm, selectedTab, sortConfig]);

  const analysisSummary = useMemo(() => {
    const totalItems = analysisResults.length;
    const lowStockItems = analysisResults.filter(item => item.lowStock).length;
    const discountItems = analysisResults.filter(item => item.action === 'discount').length;
    const sellItems = analysisResults.filter(item => item.action === 'sell').length;
    const keepItems = analysisResults.filter(item => item.action === 'keep').length;
    
    const totalStorageCost = analysisResults.reduce((sum, item) => sum + item.totalStorageCost, 0);
    const potentialSavings = analysisResults.reduce((sum, item) => {
      return sum + (item.savingsWithDiscount > 0 ? item.savingsWithDiscount : 0);
    }, 0);

    const itemsStockingOutBeforeTarget = targetDate ? 
      analysisResults.filter(item => 
        item.projectedStockoutDate && item.projectedStockoutDate <= targetDate
      ).length : 0;
    
    return {
      totalItems,
      lowStockItems,
      discountItems,
      sellItems,
      keepItems,
      totalStorageCost,
      potentialSavings,
      itemsStockingOutBeforeTarget
    };
  }, [analysisResults, targetDate]);

  const requestSort = (key: keyof AnalysisResult) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const savePriceData = () => {
    localStorage.setItem('product_cost_prices', JSON.stringify(costPrices));
    localStorage.setItem('product_selling_prices', JSON.stringify(sellingPrices));
    localStorage.setItem('product_low_stock_thresholds', JSON.stringify(lowStockThreshold));
  };

  const updateCostPrice = (nmId: number, value: number) => {
    setCostPrices(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateSellingPrice = (nmId: number, value: number) => {
    setSellingPrices(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateDailySales = (nmId: number, value: number) => {
    setDailySalesRates(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateStorageCost = (nmId: number, value: number) => {
    setStorageCostRates(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateDiscountLevel = (nmId: number, value: number[]) => {
    setDiscountLevels(prev => ({
      ...prev,
      [nmId]: value[0]
    }));
  };

  const updateLowStockThreshold = (nmId: number, value: number) => {
    setLowStockThreshold(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const getActionBadge = (action: 'sell' | 'discount' | 'keep') => {
    switch (action) {
      case 'sell':
        return <Badge variant="destructive">Быстрая продажа</Badge>;
      case 'discount':
        return <Badge variant="warning" className="bg-amber-500">Снизить цену</Badge>;
      case 'keep':
        return <Badge variant="outline">Сохранить цену</Badge>;
      default:
        return null;
    }
  };

  const getStockLevelIndicator = (result: AnalysisResult) => {
    switch (result.stockLevel) {
      case 'low':
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-500 font-medium flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" /> Низкий запас
              </span>
              <span className="text-xs">{result.stockLevelPercentage}%</span>
            </div>
            <Progress value={result.stockLevelPercentage} className="h-1.5 bg-rose-100" indicatorClassName="bg-rose-500" />
          </div>
        );
      case 'medium':
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-500 font-medium">Средний запас</span>
              <span className="text-xs">{result.stockLevelPercentage}%</span>
            </div>
            <Progress value={result.stockLevelPercentage} className="h-1.5 bg-amber-100" indicatorClassName="bg-amber-500" />
          </div>
        );
      case 'high':
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-500 font-medium">Высокий запас</span>
              <span className="text-xs">{result.stockLevelPercentage}%</span>
            </div>
            <Progress value={result.stockLevelPercentage} className="h-1.5 bg-emerald-100" indicatorClassName="bg-emerald-500" />
          </div>
        );
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "Не определено";
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
      <CardHeader className="bg-white/50 dark:bg-background/50 backdrop-blur-sm border-b pb-8">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Banknote className="h-6 w-6 text-primary" />
          Анализ рентабельности хранения товаров
        </CardTitle>
        <CardDescription className="text-base">
          Оптимизация запасов и анализ затрат на хранение для максимизации прибыли
        </CardDescription>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-blue-900/10 border border-blue-100 dark:border-blue-800/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Всего товаров</p>
                  <h3 className="text-2xl font-bold mt-1">{analysisSummary.totalItems}</h3>
                </div>
                <div className="bg-blue-100 dark:bg-blue-800/30 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-100 dark:border-blue-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs">На складах</span>
                  <span className="text-xs font-medium">{warehouseItems.reduce((sum, item) => sum + (item.quantityWarehousesFull || 0), 0)} шт.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-amber-900/10 border border-amber-100 dark:border-amber-800/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Товары на скидку</p>
                  <h3 className="text-2xl font-bold mt-1">{analysisSummary.discountItems}</h3>
                </div>
                <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-amber-100 dark:border-amber-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Потенциальная экономия</span>
                  <span className="text-xs font-medium text-green-600">{formatCurrency(analysisSummary.potentialSavings)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-rose-900/10 border border-rose-100 dark:border-rose-800/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Низкий запас</p>
                  <h3 className="text-2xl font-bold mt-1">{analysisSummary.lowStockItems}</h3>
                </div>
                <div className="bg-rose-100 dark:bg-rose-800/30 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-rose-100 dark:border-rose-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Требуется докупка</span>
                  <span className="text-xs font-medium text-rose-600">{analysisSummary.lowStockItems} шт.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-purple-900/10 border border-purple-100 dark:border-purple-800/30 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Затраты на хранение</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(analysisSummary.totalStorageCost)}</h3>
                </div>
                <div className="bg-purple-100 dark:bg-purple-800/30 p-2 rounded-lg">
                  <WarehouseIcon className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs">В среднем на товар</span>
                  <span className="text-xs font-medium">{formatCurrency(analysisSummary.totalStorageCost / Math.max(1, analysisSummary.totalItems))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {analysisSummary.lowStockItems > 0 && (
          <Alert variant="destructive" className="mt-6 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Внимание! Низкий уровень запаса</AlertTitle>
            <AlertDescription>
              У вас {analysisSummary.lowStockItems} товаров с низким уровнем запаса. Рекомендуется пополнить запасы.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по бренду, артикулу или названию..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex w-full md:w-auto items-end">
                <div className="w-full md:w-auto">
                  <Label htmlFor="targetDate" className="text-xs mb-1 block">Показать товары с запасом до</Label>
                  <DatePicker 
                    value={targetDate} 
                    onValueChange={setTargetDate} 
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={savePriceData} className="whitespace-nowrap">
                Сохранить изменения
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Все товары</TabsTrigger>
              <TabsTrigger value="low-stock">Низкий запас ({analysisSummary.lowStockItems})</TabsTrigger>
              <TabsTrigger value="discount">Товары для скидки ({analysisSummary.discountItems})</TabsTrigger>
              <TabsTrigger value="keep">Сохранить цены ({analysisSummary.keepItems})</TabsTrigger>
            </TabsList>
          </Tabs>

          {targetDate && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-amber-500 mr-2" />
                <span>
                  К {formatDate(targetDate)} требуется пополнить запасы по {analysisSummary.itemsStockingOutBeforeTarget} товарам
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => setTargetDate(undefined)}>
                Сбросить
              </Button>
            </div>
          )}

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/80 dark:bg-gray-900/20">
                <TableRow>
                  <TableHead className="w-[300px]">Товар</TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => requestSort('daysOfInventory')}
                  >
                    <div className="flex items-center">
                      Остаток запаса
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => requestSort('totalStorageCost')}
                  >
                    <div className="flex items-center">
                      Расходы на хранение
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => requestSort('savingsWithDiscount')}
                  >
                    <div className="flex items-center">
                      Выгода от скидки
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Рекомендация</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Нет данных для отображения</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.remainItem.nmId} className={`group ${
                      result.lowStock ? 'bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/60 dark:hover:bg-rose-950/20' : ''
                    }`}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium truncate max-w-[300px]">
                            {result.remainItem.brand} - {result.remainItem.subjectName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Артикул: {result.remainItem.vendorCode} | ID: {result.remainItem.nmId}
                          </div>
                          
                          <div className="mt-1">
                            {getStockLevelIndicator(result)}
                          </div>
                          
                          <div className="pt-2 space-y-3 opacity-70 group-hover:opacity-100 transition-opacity">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Себестоимость:</Label>
                                <Input
                                  type="number"
                                  value={result.costPrice}
                                  onChange={(e) => updateCostPrice(result.remainItem.nmId, parseFloat(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Цена продажи:</Label>
                                <Input
                                  type="number"
                                  value={result.sellingPrice}
                                  onChange={(e) => updateSellingPrice(result.remainItem.nmId, parseFloat(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Продажи в день:</Label>
                                <Input
                                  type="number"
                                  value={result.dailySales}
                                  step="0.1"
                                  min="0.1"
                                  onChange={(e) => updateDailySales(result.remainItem.nmId, parseFloat(e.target.value) || 0.1)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Стоимость хранения в день:</Label>
                                <Input
                                  type="number"
                                  value={result.dailyStorageCost}
                                  onChange={(e) => updateStorageCost(result.remainItem.nmId, parseFloat(e.target.value) || 0)}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Порог низкого запаса (шт):</Label>
                                <Input
                                  type="number"
                                  value={lowStockThreshold[result.remainItem.nmId] || Math.ceil(result.dailySales * 7)}
                                  onChange={(e) => updateLowStockThreshold(result.remainItem.nmId, parseInt(e.target.value) || 1)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              
                              {(result.action === 'discount' || result.action === 'sell') && (
                                <div>
                                  <Label className="text-xs">Рекомендуемая скидка: {discountLevels[result.remainItem.nmId] || 30}%</Label>
                                  <Slider
                                    defaultValue={[discountLevels[result.remainItem.nmId] || 30]}
                                    max={90}
                                    step={5}
                                    onValueChange={(value) => updateDiscountLevel(result.remainItem.nmId, value)}
                                    className="py-2"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {result.remainItem.quantityWarehousesFull || 0} шт
                            </span>
                            <span className="text-xs text-muted-foreground">
                              <Badge variant={result.daysOfInventory > 90 ? "warning" : "outline"} className="text-[10px] h-5 font-normal">
                                {formatDaysOfInventory(result.daysOfInventory)}
                              </Badge>
                            </span>
                          </div>
                          
                          {result.projectedStockoutDate && (
                            <div className="text-xs text-muted-foreground">
                              <span className="inline-flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Закончится: {formatDate(result.projectedStockoutDate)}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatCurrency(result.totalStorageCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(result.dailyStorageCostTotal)} в день
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`font-medium ${result.savingsWithDiscount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {result.savingsWithDiscount > 0 ? '+' : ''}{formatCurrency(result.savingsWithDiscount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.action === 'discount' && `Со скидкой ${result.recommendedDiscount}%`}
                            {result.action === 'sell' && 'Распродать быстрее'}
                            {result.action === 'keep' && 'Сохранить цену'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getActionBadge(result.action)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  Search, ArrowUpDown, Package, TrendingDown, Banknote, WarehouseIcon, AlertTriangle, 
  Clock, ArrowDown, ArrowUp, BarChart4, TrendingUp, Calculator, Truck, Percent, ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { WarehouseRemainItem, PaidStorageItem } from '@/types/supplies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  paidStorageData?: PaidStorageItem[];
  averageDailySalesRate?: { [nmId: number]: number };
  dailyStorageCost?: { [nmId: number]: number };
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
  action: 'keep' | 'discount' | 'sell';
  lowStock: boolean;
  stockLevel: 'low' | 'medium' | 'high';
  stockLevelPercentage: number;
  projectedStockoutDate: Date | null;
  profitMarginPercentage: number;
  newSalesRate: number;
  newDaysOfInventory: number;
  discountedStorageCost: number;
  discountedPrice: number;
  storageCostToRevenueRatio: number;
  logisticsCost: number;
  wbCommission: number;
}

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({
  warehouseItems,
  paidStorageData = [],
  averageDailySalesRate = {},
  dailyStorageCost = {},
}) => {
  const [costPrices, setCostPrices] = useState<{ [nmId: number]: number }>({});
  const [sellingPrices, setSellingPrices] = useState<{ [nmId: number]: number }>({});
  const [dailySalesRates, setDailySalesRates] = useState<{ [nmId: number]: number }>({});
  const [storageCostRates, setStorageCostRates] = useState<{ [nmId: number]: number }>({});
  const [discountLevels, setDiscountLevels] = useState<{ [nmId: number]: number }>({});
  const [lowStockThreshold, setLowStockThreshold] = useState<{ [nmId: number]: number }>({});
  const [logisticsCosts, setLogisticsCosts] = useState<{ [nmId: number]: number }>({});
  const [wbCommissions, setWbCommissions] = useState<{ [nmId: number]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof AnalysisResult>('stockLevelPercentage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTab, setSelectedTab] = useState<'all' | 'discount' | 'keep' | 'low-stock'>('all');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedCostPrices = localStorage.getItem('costPrices') ? JSON.parse(localStorage.getItem('costPrices')!) : {};
    const storedSellingPrices = localStorage.getItem('sellingPrices') ? JSON.parse(localStorage.getItem('sellingPrices')!) : {};
    const storedDailySalesRates = localStorage.getItem('dailySalesRates') ? JSON.parse(localStorage.getItem('dailySalesRates')!) : {};
    const storedStorageCostRates = localStorage.getItem('storageCostRates') ? JSON.parse(localStorage.getItem('storageCostRates')!) : {};
    const storedLowStockThreshold = localStorage.getItem('lowStockThreshold') ? JSON.parse(localStorage.getItem('lowStockThreshold')!) : {};
    const storedLogisticsCosts = localStorage.getItem('logisticsCosts') ? JSON.parse(localStorage.getItem('logisticsCosts')!) : {};
    const storedWbCommissions = localStorage.getItem('wbCommissions') ? JSON.parse(localStorage.getItem('wbCommissions')!) : {};

    setCostPrices(storedCostPrices);
    setSellingPrices(storedSellingPrices);
    setDailySalesRates(storedDailySalesRates);
    setStorageCostRates(storedStorageCostRates);
    setLowStockThreshold(storedLowStockThreshold);
    setLogisticsCosts(storedLogisticsCosts);
    setWbCommissions(storedWbCommissions);
  }, []);

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
      const logisticsCost = logisticsCosts[nmId] || 150;
      const wbCommission = wbCommissions[nmId] || 15;

      const dailyStorageCostTotal = storageCost * currentStock;
      const daysOfInventory = dailySales > 0 ? currentStock / dailySales : Infinity;
      const totalStorageCost = dailyStorageCostTotal * daysOfInventory;

      const profitMarginPercentage = ((sellingPrice - costPrice - logisticsCost) / sellingPrice) * 100;

      const recommendedDiscount = Math.max(0, Math.min(50, Math.round(profitMarginPercentage)));
      const discountedPrice = sellingPrice * (1 - recommendedDiscount / 100);
      const profitWithoutDiscount = (sellingPrice - costPrice - logisticsCost) * dailySales * daysOfInventory;
      const profitWithDiscount = (discountedPrice - costPrice - logisticsCost) * dailySales * daysOfInventory;
      const savingsWithDiscount = profitWithDiscount - profitWithoutDiscount;

      const newSalesRate = dailySales * (1 + recommendedDiscount / 100);
      const newDaysOfInventory = currentStock / newSalesRate;
      const discountedStorageCost = storageCost * newDaysOfInventory;

      const storageCostToRevenueRatio = totalStorageCost / (sellingPrice * currentStock);

      let action: 'keep' | 'discount' | 'sell' = 'keep';
      if (profitMarginPercentage < 15) {
        action = 'discount';
      } else if (daysOfInventory > 90) {
        action = 'sell';
      }

      const lowStock = currentStock <= threshold;
      const stockLevelPercentage = Math.min(100, (currentStock / threshold) * 100);

      const projectedStockoutDate = daysOfInventory !== Infinity ?
        new Date(Date.now() + daysOfInventory * 24 * 60 * 60 * 1000) : null;

      let stockLevel: 'low' | 'medium' | 'high' = 'high';
      if (stockLevelPercentage < 30) {
        stockLevel = 'low';
      } else if (stockLevelPercentage < 70) {
        stockLevel = 'medium';
      }

      return {
        remainItem: item,
        costPrice,
        sellingPrice,
        dailySales,
        dailyStorageCost: storageCost,
        dailyStorageCostTotal,
        daysOfInventory,
        totalStorageCost,
        recommendedDiscount,
        profitWithoutDiscount,
        profitWithDiscount,
        savingsWithDiscount,
        action,
        lowStock,
        stockLevel,
        stockLevelPercentage,
        projectedStockoutDate,
        profitMarginPercentage,
        newSalesRate,
        newDaysOfInventory,
        discountedStorageCost,
        discountedPrice,
        storageCostToRevenueRatio,
        logisticsCost,
        wbCommission
      };
    });
  }, [warehouseItems, costPrices, sellingPrices, dailySalesRates, storageCostRates, discountLevels, lowStockThreshold, logisticsCosts, wbCommissions]);

  const filteredResults = useMemo(() => {
    let results = [...analysisResults];

    if (searchTerm) {
      results = results.filter(item =>
        item.remainItem.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.remainItem.vendorCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTab !== 'all') {
      if (selectedTab === 'discount') {
        results = results.filter(item => item.action === 'discount' || item.action === 'sell');
      } else if (selectedTab === 'keep') {
        results = results.filter(item => item.action === 'keep');
      } else if (selectedTab === 'low-stock') {
        results = results.filter(item => item.lowStock);
      }
    }

    results.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return 0;
      }
    });

    return results;
  }, [analysisResults, searchTerm, selectedTab, sortKey, sortDirection]);

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
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const savePriceData = () => {
    localStorage.setItem('costPrices', JSON.stringify(costPrices));
    localStorage.setItem('sellingPrices', JSON.stringify(sellingPrices));
    localStorage.setItem('dailySalesRates', JSON.stringify(dailySalesRates));
    localStorage.setItem('storageCostRates', JSON.stringify(storageCostRates));
    localStorage.setItem('lowStockThreshold', JSON.stringify(lowStockThreshold));
    localStorage.setItem('logisticsCosts', JSON.stringify(logisticsCosts));
    localStorage.setItem('wbCommissions', JSON.stringify(wbCommissions));
    toast({
      title: "Успешно",
      description: "Данные успешно сохранены",
    });
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

  const updateLogisticsCost = (nmId: number, value: number) => {
    setLogisticsCosts(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const updateWbCommission = (nmId: number, value: number) => {
    setWbCommissions(prev => ({
      ...prev,
      [nmId]: value
    }));
  };

  const getActionBadge = (action: 'keep' | 'discount' | 'sell') => {
    switch (action) {
      case 'keep':
        return <Badge variant="outline">Оставить как есть</Badge>;
      case 'discount':
        return <Badge className="bg-amber-500 hover:bg-amber-600 border-0">Снизить цену</Badge>;
      case 'sell':
        return <Badge className="bg-rose-500 hover:bg-rose-600 border-0">Быстро продать</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Неизвестно';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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
      default:
        return null;
    }
  };

  const getAnalysisStatusIndicator = (result: AnalysisResult) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Запас:</span>
          <span className="text-xs font-medium">{result.remainItem.quantityWarehousesFull} шт.</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Продажи в день:</span>
          <span className="text-xs font-medium">{result.dailySales.toFixed(1)} шт.</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Дней до распродажи:</span>
          <span className="text-xs font-medium">{formatDaysOfInventory(result.daysOfInventory)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Затраты на хранение:</span>
          <span className="text-xs font-medium">{formatCurrency(result.totalStorageCost)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Рекомендуемая скидка:</span>
          <span className="text-xs font-medium">{result.recommendedDiscount}%</span>
        </div>
      </div>
    );
  };

  const DetailedAnalysis = ({ result }: { result: AnalysisResult }) => {
    return (
      <div className="grid gap-4 p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Анализ текущей ситуации</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Цена:</p>
              <p className="text-sm font-medium">{formatCurrency(result.sellingPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Себестоимость:</p>
              <p className="text-sm font-medium">{formatCurrency(result.costPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Продажи в день:</p>
              <p className="text-sm font-medium">{result.dailySales.toFixed(1)} шт.</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Запас:</p>
              <p className="text-sm font-medium">{result.remainItem.quantityWarehousesFull} шт.</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Дней до распродажи:</p>
              <p className="text-sm font-medium">{formatDaysOfInventory(result.daysOfInventory)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Затраты на хранение:</p>
              <p className="text-sm font-medium">{formatCurrency(result.totalStorageCost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Маржа:</p>
              <p className={`text-sm font-medium ${result.profitMarginPercentage < 15 ? "text-amber-600" : "text-emerald-600"}`}>
                {result.profitMarginPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Рекомендации</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Рекомендуемая скидка:</p>
              <p className="text-sm font-medium">{result.recommendedDiscount}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Цена со скидкой:</p>
              <p className="text-sm font-medium">{formatCurrency(result.discountedPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Новая скорость продаж:</p>
              <p className="text-sm font-medium">{result.newSalesRate.toFixed(1)} шт.</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Дней до распродажи (со скидкой):</p>
              <p className="text-sm font-medium">{formatDaysOfInventory(result.newDaysOfInventory)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Затраты на хранение (со скидкой):</p>
              <p className="text-sm font-medium">{formatCurrency(result.discountedStorageCost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Экономия:</p>
              <p className="text-sm font-medium">{formatCurrency(result.savingsWithDiscount)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Анализ рентабельности хранения</h2>
        <Button onClick={savePriceData}>Сохранить изменения</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Общая информация</CardTitle>
          <CardDescription>
            Всего товаров: {analysisSummary.totalItems}, из них: {analysisSummary.keepItems} оставить, {analysisSummary.discountItems} снизить цену, {analysisSummary.sellItems} быстро продать
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Товары с низким запасом</h3>
              <div className="flex items-center gap-2">
                <div className="bg-rose-100 p-3 rounded-md">
                  <AlertTriangle className="h-6 w-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analysisSummary.lowStockItems}</p>
                  <p className="text-xs text-muted-foreground">товаров</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Потенциальная экономия</h3>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 p-3 rounded-md">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(analysisSummary.potentialSavings)}</p>
                  <p className="text-xs text-muted-foreground">при применении рекомендаций</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Затраты на хранение</h3>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-3 rounded-md">
                  <WarehouseIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(analysisSummary.totalStorageCost)}</p>
                  <p className="text-xs text-muted-foreground">до полной распродажи запасов</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Товары на складах</CardTitle>
            <div className="flex items-center gap-2">
              <DatePicker date={targetDate} setDate={setTargetDate} />
              <div className="text-sm text-muted-foreground">
                Товаров с риском окончания запаса до {targetDate?.toLocaleDateString()}: 
                <span className="font-medium text-rose-500 ml-1">{analysisSummary.itemsStockingOutBeforeTarget}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Tabs defaultValue="all" value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
              <TabsList>
                <TabsTrigger value="all">Все товары ({analysisSummary.totalItems})</TabsTrigger>
                <TabsTrigger value="discount">Снизить цену ({analysisSummary.discountItems + analysisSummary.sellItems})</TabsTrigger>
                <TabsTrigger value="keep">Оставить как есть ({analysisSummary.keepItems})</TabsTrigger>
                <TabsTrigger value="low-stock">Низкий запас ({analysisSummary.lowStockItems})</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('stockLevelPercentage')}>
                      Запас
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('sellingPrice')}>
                      Цена
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('costPrice')}>
                      Себестоимость
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('profitMarginPercentage')}>
                      Маржа
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('dailySales')}>
                      Продажи в день
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('daysOfInventory')}>
                      Дней до распродажи
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('totalStorageCost')}>
                      Затраты на хранение
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('recommendedDiscount')}>
                      Рекомендуемая скидка
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => requestSort('action')}>
                      Рекомендация
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Детали</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.remainItem.nmId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{result.remainItem.brand}</span>
                        <span className="text-xs text-muted-foreground">{result.remainItem.vendorCode || result.remainItem.nmId}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStockLevelIndicator(result)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="mb-1">
                          <Input
                            type="number"
                            value={result.sellingPrice}
                            onChange={(e) => updateSellingPrice(result.remainItem.nmId, Number(e.target.value))}
                            className="h-8 w-24"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {result.recommendedDiscount > 0 && (
                            <>Со скидкой: {formatCurrency(result.discountedPrice)}</>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={result.costPrice}
                        onChange={(e) => updateCostPrice(result.remainItem.nmId, Number(e.target.value))}
                        className="h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <span className={result.profitMarginPercentage < 15 ? "text-amber-600" : "text-emerald-600"}>
                        {result.profitMarginPercentage.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={result.dailySales}
                        onChange={(e) => updateDailySales(result.remainItem.nmId, Number(e.target.value))}
                        className="h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDaysOfInventory(result.daysOfInventory)}</span>
                        <span className="text-xs text-muted-foreground">
                          До: {formatDate(result.projectedStockoutDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatCurrency(result.totalStorageCost)}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Input
                            type="number"
                            value={result.dailyStorageCost}
                            onChange={(e) => updateStorageCost(result.remainItem.nmId, Number(e.target.value))}
                            className="h-6 w-14"
                          />
                          <span>₽/день</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={result.recommendedDiscount}
                          className="h-8 w-16"
                          disabled
                        />
                        <span>%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(result.action)}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Calculator className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <DetailedAnalysis result={result} />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageProfitabilityAnalysis;

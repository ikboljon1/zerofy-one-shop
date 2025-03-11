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
  Clock, ArrowDown, ArrowUp, BarChart4, TrendingUp, Calculator, Truck, Percent
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'discount' | 'keep' | 'low-stock'>('all');
  const [costPrices, setCostPrices] = useState<Record<number, number>>({});
  const [sellingPrices, setSellingPrices] = useState<Record<number, number>>({});
  const [dailySalesRates, setDailySalesRates] = useState<Record<number, number>>({});
  const [storageCostRates, setStorageCostRates] = useState<Record<number, number>>({});
  const [discountLevels, setDiscountLevels] = useState<Record<number, number>>({});
  const [lowStockThreshold, setLowStockThreshold] = useState<Record<number, number>>({});
  const [logisticsCosts, setLogisticsCosts] = useState<Record<number, number>>({});
  const [wbCommissions, setWbCommissions] = useState<Record<number, number>>({});
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AnalysisResult | '',
    direction: 'asc' | 'desc'
  }>({ key: '', direction: 'asc' });
  const { toast } = useToast();

  useEffect(() => {
    // Load data from localStorage
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

    const storedLogisticsCosts = localStorage.getItem('product_logistics_costs');
    if (storedLogisticsCosts) {
      setLogisticsCosts(JSON.parse(storedLogisticsCosts));
    }

    const storedWbCommissions = localStorage.getItem('product_wb_commissions');
    if (storedWbCommissions) {
      setWbCommissions(JSON.parse(storedWbCommissions));
    }

    // Initialize data for new products that don't have saved values
    const initialDailySales: Record<number, number> = {};
    const initialStorageCosts: Record<number, number> = {};
    const initialDiscountLevels: Record<number, number> = {};
    const initialLowStockThresholds: Record<number, number> = {};
    const initialCostPrices: Record<number, number> = {};
    const initialSellingPrices: Record<number, number> = {};
    const initialLogisticsCosts: Record<number, number> = {};
    const initialWbCommissions: Record<number, number> = {};

    warehouseItems.forEach(item => {
      // Only set initial values if they don't already exist in state
      if (!costPrices[item.nmId]) {
        initialCostPrices[item.nmId] = 0;
      }
      
      if (!sellingPrices[item.nmId]) {
        initialSellingPrices[item.nmId] = item.price || 0;
      }
      
      let itemStorageCost = dailyStorageCost[item.nmId] || 5;
      
      const matchingStorageItems = paidStorageData.filter(psi => psi.nmId === item.nmId);
      if (matchingStorageItems.length > 0) {
        const totalCost = matchingStorageItems.reduce((sum, psi) => sum + psi.warehousePrice, 0);
        itemStorageCost = totalCost / matchingStorageItems.length;
      }
      
      if (!dailySalesRates[item.nmId]) {
        initialDailySales[item.nmId] = averageDailySalesRate[item.nmId] || 0.1;
      }
      
      if (!storageCostRates[item.nmId]) {
        initialStorageCosts[item.nmId] = itemStorageCost;
      }
      
      if (!discountLevels[item.nmId]) {
        initialDiscountLevels[item.nmId] = 30;
      }
      
      if (!logisticsCosts[item.nmId]) {
        initialLogisticsCosts[item.nmId] = 150; // Дефолтная стоимость логистики
      }
      
      if (!wbCommissions[item.nmId]) {
        initialWbCommissions[item.nmId] = 15; // Дефолтная комиссия WB (%)
      }
      
      const salesRate = averageDailySalesRate[item.nmId] || 0.1;
      if (!lowStockThreshold[item.nmId]) {
        initialLowStockThresholds[item.nmId] = Math.max(3, Math.ceil(salesRate * 7));
      }
    });

    setCostPrices(prevState => ({...prevState, ...initialCostPrices}));
    setSellingPrices(prevState => ({...prevState, ...initialSellingPrices}));
    setDailySalesRates(prevState => ({...prevState, ...initialDailySales}));
    setStorageCostRates(prevState => ({...prevState, ...initialStorageCosts}));
    setDiscountLevels(prevState => ({...prevState, ...initialDiscountLevels}));
    setLowStockThreshold(prevState => ({...prevState, ...initialLowStockThresholds}));
    setLogisticsCosts(prevState => ({...prevState, ...initialLogisticsCosts}));
    setWbCommissions(prevState => ({...prevState, ...initialWbCommissions}));
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
      const costPrice = costPrices[nmId] ||.0;
      const sellingPrice = sellingPrices[nmId] || (item.price || 0);
      const dailySales = dailySalesRates[nmId] || 0.1;
      const storageCost = storageCostRates[nmId] || 5;
      const currentStock = item.quantityWarehousesFull || 0;
      const threshold = lowStockThreshold[nmId] || Math.ceil(dailySales * 7);
      const logisticsCost = logisticsCosts[nmId] || 150;
      const wbCommission = wbCommissions[nmId] || 15;
      
      const dailyStorageCostTotal = storageCost * currentStock;
      
      const daysOfInventory = dailySales > 0 ? Math.round(currentStock / dailySales) : 999;
      
      const averageStock = currentStock / 2;
      const totalStorageCost = averageStock * daysOfInventory * storageCost;
      
      // Учитываем комиссию WB и логистику в расчётах
      const commissionAmount = sellingPrice * (wbCommission / 100);
      const totalLogisticsCost = currentStock * logisticsCost;
      
      const profitPerItem = sellingPrice - costPrice - commissionAmount - logisticsCost;
      const profitMarginPercentage = sellingPrice > 0 ? (profitPerItem / sellingPrice) * 100 : 0;
      
      const grossProfit = profitPerItem * currentStock;
      
      const netProfit = grossProfit - totalStorageCost;
      
      const stockTurnoverDays = daysOfInventory;
      
      const storageROI = totalStorageCost > 0 ? netProfit / totalStorageCost : 0;
      
      const storageCostToRevenueRatio = (sellingPrice * currentStock) > 0 ? 
        totalStorageCost / (sellingPrice * currentStock) : 0;
      
      let recommendedDiscount = 0;
      let action: 'sell' | 'discount' | 'keep' = 'keep';
      
      const isLowMargin = profitMarginPercentage < 15;
      const isHighStorageCost = storageCostToRevenueRatio > 0.1;
      const isSlowMoving = stockTurnoverDays > 60;
      
      if (isSlowMoving && isHighStorageCost) {
        recommendedDiscount = 40;
        action = 'sell';
      } 
      else if (isLowMargin && isHighStorageCost) {
        recommendedDiscount = discountLevels[nmId] || 25;
        action = 'discount';
      }
      else if (isSlowMoving && !isLowMargin) {
        recommendedDiscount = discountLevels[nmId] || 15;
        action = 'discount';
      }
      else {
        recommendedDiscount = 0;
        action = 'keep';
      }
      
      const discountedPrice = sellingPrice * (1 - recommendedDiscount / 100);
      
      // Пересчитываем прибыль с учетом скидки и комиссии WB
      const discountedCommissionAmount = discountedPrice * (wbCommission / 100);
      const profitWithDiscountPerItem = discountedPrice - costPrice - discountedCommissionAmount - logisticsCost;
      
      const salesAccelerationFactor = 1 + (recommendedDiscount / 100);
      
      const newSalesRate = dailySales * salesAccelerationFactor;
      
      const newDaysOfInventory = Math.round(daysOfInventory / salesAccelerationFactor);
      
      const discountedStorageCost = averageStock * newDaysOfInventory * storageCost;
      
      const profitWithoutDiscount = grossProfit - totalStorageCost;
      const profitWithDiscount = (profitWithDiscountPerItem * currentStock) - discountedStorageCost;
      const savingsWithDiscount = profitWithDiscount - profitWithoutDiscount;
      
      if (profitWithDiscount < 0 && recommendedDiscount > 0) {
        if (Math.abs(profitWithDiscount) > profitWithDiscountPerItem * currentStock * 0.5) {
          action = 'sell';
          recommendedDiscount = Math.min(50, discountLevels[nmId] || 50);
        }
      }
      
      if (savingsWithDiscount > 0 && action === 'keep') {
        action = 'discount';
        recommendedDiscount = discountLevels[nmId] || 15;
      }
      
      const lowStock = currentStock <= threshold;
      if (lowStock && stockTurnoverDays < 90) {
        action = 'keep';
        recommendedDiscount = 0;
      }
      
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
    localStorage.setItem('product_logistics_costs', JSON.stringify(logisticsCosts));
    localStorage.setItem('product_wb_commissions', JSON.stringify(wbCommissions));
    
    toast({
      title: "Данные сохранены",
      description: "Все изменения успешно сохранены в локальное хранилище",
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

  const getAnalysisStatusIndicator = (result: AnalysisResult) => {
    const factors = [];
    
    if (result.profitMarginPercentage < 15) {
      factors.push({
        label: "Низкая маржа",
        description: "Маржинальность товара ниже 15%",
        value: `${result.profitMarginPercentage.toFixed(1)}%`,
        status: "warning",
        icon: <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
      });
    } else {
      factors.push({
        label: "Высокая маржа",
        description: "Маржинальность товара выше 15%",
        value: `${result.profitMarginPercentage.toFixed(1)}%`,
        status: "positive",
        icon: <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
      });
    }
    
    if (result.storageCostToRevenueRatio > 0.1) {
      factors.push({
        label: "Высокие затраты на хранение",
        description: "Затраты на хранение >10% от выручки",
        value: `${(result.storageCostToRevenueRatio * 100).toFixed(1)}%`,
        status: "warning",
        icon: <WarehouseIcon className="h-3.5 w-3.5 text-amber-500" />
      });
    } else {
      factors.push({
        label: "Оптимальные затраты на хранение",
        description: "Затраты на хранение <10% от выручки",
        value: `${(result.storageCostToRevenueRatio * 100).toFixed(1)}%`,
        status: "positive",
        icon: <WarehouseIcon className="h-3.5 w-3.5 text-emerald-500" />
      });
    }
    
    if (result.daysOfInventory > 60) {
      factors.push({
        label: "Медленные продажи",
        description: "Более 60 дней на распродажу запаса",
        value: formatDaysOfInventory(result.daysOfInventory),
        status: "warning",
        icon: <Clock className="h-3.5 w-3.5 text-amber-500" />
      });
    } else {
      factors.push({
        label: "Быстрые продажи",
        description: "Менее 60 дней на распродажу запаса",
        value: formatDaysOfInventory(result.daysOfInventory),
        status: "positive",
        icon: <Clock className="h-3.5 w-3.5 text-emerald-500" />
      });
    }
    
    return (
      <div className="space-y-2">
        {factors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {factor.icon}
              <span className={`font-medium ${factor.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {factor.label}
              </span>
            </div>
            <span className={`${factor.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'} font-medium`}>
              {factor.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const DetailedAnalysis = ({ result }: { result: AnalysisResult }) => {
    return (
      <div className="p-5 max-w-md space-y-6 text-sm">
        <div>
          <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Расчет рентабельности хранения
          </h3>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mb-4">
            {getAnalysisStatusIndicator(result)}
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2 text-xs text-muted-foreground">СРАВНЕНИЕ СЦЕНАРИЕВ</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2 border rounded-lg p-3 bg-white dark:bg-slate-950">
                <div className="text-xs text-muted-foreground">Текущая цена</div>
                <div className="font-medium">{formatCurrency(result.sellingPrice)}</div>
              </div>
              
              <div className="space-y-2 border border-amber-200 dark:border-amber-800 rounded-lg p-3 bg-amber-50 dark:bg-amber-950/30">
                <div className="text-xs text-amber-600 dark:text-amber-400">Со скидкой {result.recommendedDiscount}%</div>
                <div className="font-medium">{formatCurrency(result.discountedPrice)}</div>
              </div>
              
              <div className="space-y-2 border rounded-lg p-3 bg-white dark:bg-slate-950">
                <div className="text-xs text-muted-foreground">Себестоимость</div>
                <div className="font-medium">{formatCurrency(result.costPrice)}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-muted-foreground mb-1">ПРОДАЖИ И ОБОРАЧИВАЕМОСТЬ</h4>
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="py-1 text-muted-foreground">Текущие продажи в день</td>
                      <td className="py-1 text-right font-medium">{result.dailySales.toFixed(2)} шт</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-muted-foreground">Продажи со скидкой</td>
                      <td className="py-1 text-right font-medium">{result.newSalesRate.toFixed(2)} шт</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-muted-foreground">Текущий запас</td>
                      <td className="py-1 text-right font-medium">{result.remainItem.quantityWarehousesFull} шт</td>
                    </tr>
                    <tr className="border-t">
                      <td className="py-1 text-muted-foreground">Дней до распродажи</td>
                      <td className="py-1 text-right font-medium">{formatDaysOfInventory(result.daysOfInventory)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-muted-foreground">Со скидкой</td>
                      <td className="py-1 text-right font-medium">{formatDaysOfInventory(result.newDaysOfInventory)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h4 className="text-xs text-muted-foreground mb-1">ЗАТРАТЫ НА ХРАНЕНИЕ</h4>
                <table className="w-full text-xs">
                  <tbody>
                    <tr>
                      <td className="py-1 text-muted-foreground">Стоимость хранения в день</td>
                      <td className="py-1 text-right font-medium">{formatCurrency(result.dailyStorageCost)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-muted-foreground">В день на весь запас</td>
                      <td className="py-1 text-right font-medium">{formatCurrency(result.dailyStorageCostTotal)}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="py-1 text-muted-foreground">Общие затраты на хранение</td>
                      <td className="py-1 text-right font-medium">{formatCurrency(result.totalStorageCost)}</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-muted-foreground">Со скидкой</td>
                      <td className="py-1 text-right font-medium">{formatCurrency(result.discountedStorageCost)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-xs text-muted-foreground mb-1">ДОПОЛНИТЕЛЬНЫЕ ЗАТРАТЫ</h4>
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="py-1 text-muted-foreground">Логистика (за единицу)</td>
                    <td className="py-1 text-right font-medium">{formatCurrency(result.logisticsCost)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted-foreground">Комиссия WB</td>
                    <td className="py-1 text-right font-medium">{result.wbCommission}%</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted-foreground">Комиссия в деньгах</td>
                    <td className="py-1 text-right font-medium">{formatCurrency(result.sellingPrice * (result.wbCommission / 100))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Separator />
            
            <div>
              <h4 className="text-xs text-muted-foreground mb-1">ИТОГОВЫЕ ФИНАНСОВЫЕ РЕЗУЛЬТАТЫ</h4>
              <table className="w-full text-xs">
                <tbody>
                  <tr>
                    <td className="py-1 text-muted-foreground">Прибыль без скидки</td>
                    <td className="py-1 text-right font-medium">{formatCurrency(result.profitWithoutDiscount)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted-foreground">Прибыль со скидкой</td>
                    <td className="py-1 text-right font-medium">{formatCurrency(result.profitWithDiscount)}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-1 font-medium">Разница</td>
                    <td className={`py-1 text-right font-medium ${result.savingsWithDiscount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {result.savingsWithDiscount > 0 ? '+' : ''}{formatCurrency(result.savingsWithDiscount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <h4 className="font-medium mb-2">Рекомендация</h4>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {result.action === 'sell' && <TrendingDown className="h-5 w-5 text-rose-500" />}
                {result.action === 'discount' && <TrendingDown className="h-5 w-5 text-amber-500" />}
                {result.action === 'keep' && <BarChart4 className="h-5 w-5 text-blue-500" />}
              </div>
              <div>
                <p className="font-medium">
                  {result.action === 'sell' && 'Распродать товар со значительной скидкой'}
                  {result.action === 'discount' && `Снизить цену на ${result.recommendedDiscount}%`}
                  {result.action === 'keep' && 'Сохранить текущую цену'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.action === 'sell' && 'Товар слишком долго хранится, затраты на хранение слишком высоки'}
                  {result.action === 'discount' && 'Скидка повысит оборачиваемость и снизит расходы на хранение'}
                  {result.action === 'keep' && 'Товар имеет хорошую оборачиваемость и рентабельность'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white dark:bg-gray-950 border">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Calculator className="mr-2 h-5 w-5" />
          Анализ рентабельности хранения
        </CardTitle>
        <CardDescription>
          Анализ затрат на хранение товаров и рекомендации по ценообразованию
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-800/40">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Общее количество товаров</p>
                  <h3 className="text-2xl font-bold mt-1">{analysisSummary.totalItems}</h3>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-full">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">
                На складах WB
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-800/40">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Рекомендовано снизить цены</p>
                  <h3 className="text-2xl font-bold mt-1">{analysisSummary.discountItems + analysisSummary.sellItems}</h3>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-full">
                  <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-2">
                Низкая оборачиваемость или высокие затраты
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Потенциальная экономия</p>
                  <h3 className="text-2xl font-bold mt-1">{formatCurrency(analysisSummary.potentialSavings)}</h3>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/60 p-2 rounded-full">
                  <Banknote className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-2">
                При оптимизации цен и хранения
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 items-start justify-between">
          <div className="flex space-x-2 w-full md:w-auto">
            <div className="relative grow md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Поиск товаров..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="shrink-0" onClick={savePriceData}>
              Сохранить изменения
            </Button>
          </div>
          
          <div className="w-full md:w-auto">
            <Tabs 
              defaultValue="all" 
              value={selectedTab} 
              onValueChange={(value) => setSelectedTab(value as any)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">
                  Все ({filteredResults.length})
                </TabsTrigger>
                <TabsTrigger value="discount">
                  Снизить цены ({analysisSummary.discountItems + analysisSummary.sellItems})
                </TabsTrigger>
                <TabsTrigger value="keep">
                  Сохранить цены ({analysisSummary.keepItems})
                </TabsTrigger>
                <TabsTrigger value="low-stock">
                  Низкий запас ({analysisSummary.lowStockItems})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {filteredResults.length === 0 ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Товары не найдены</AlertTitle>
            <AlertDescription>
              По заданным критериям не найдено ни одного товара. Измените параметры поиска.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Товар</TableHead>
                <TableHead className="w-[130px]">
                  <Button
                    variant="ghost"
                    className="flex items-center p-0 h-auto font-semibold"
                    onClick={() => requestSort('sellingPrice')}
                  >
                    Цена продажи
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="w-[130px]">
                  <Button
                    variant="ghost"
                    className="flex items-center p-0 h-auto font-semibold"
                    onClick={() => requestSort('costPrice')}
                  >
                    Себестоимость
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="w-[110px]">
                  <Button
                    variant="ghost"
                    className="flex items-center p-0 h-auto font-semibold"
                    onClick={() => requestSort('dailySales')}
                  >
                    Продажи/день
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="w-[150px]">
                  <Button
                    variant="ghost"
                    className="flex items-center p-0 h-auto font-semibold"
                    onClick={() => requestSort('daysOfInventory')}
                  >
                    Дней до распродажи
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    className="flex items-center p-0 h-auto font-semibold whitespace-nowrap"
                    onClick={() => requestSort('totalStorageCost')}
                  >
                    Затраты на хранение
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Рекомендация</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.map((result) => (
                <TableRow key={result.remainItem.nmId}>
                  <TableCell className="font-medium">
                    <div className="flex items-start space-x-2">
                      <div 
                        className="w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800"
                        style={{ minWidth: '3.5rem' }}
                      >
                        {result.remainItem.photoLink ? (
                          <img
                            src={result.remainItem.photoLink}
                            alt={result.remainItem.subjectName || "Фото товара"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/56?text=WB';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-2">
                          {result.remainItem.subjectName || 'Товар ' + result.remainItem.nmId}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {result.remainItem.brand || '?'} • Артикул: {result.remainItem.vendorCode || '?'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          В наличии: <span className={`font-medium ${result.lowStock ? 'text-rose-500' : ''}`}>
                            {result.remainItem.quantityWarehousesFull} шт.
                          </span>
                        </div>
                        {getStockLevelIndicator(result)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      value={result.sellingPrice}
                      onChange={(e) => updateSellingPrice(result.remainItem.nmId, Number(e.target.value))}
                      className="h-9 w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="10"
                      value={result.costPrice}
                      onChange={(e) => updateCostPrice(result.remainItem.nmId, Number(e.target.value))}
                      className="h-9 w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={result.dailySales}
                      onChange={(e) => updateDailySales(result.remainItem.nmId, Number(e.target.value))}
                      className="h-9 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium">{formatDaysOfInventory(result.daysOfInventory)}</span>
                      {result.projectedStockoutDate && (
                        <span className="text-xs text-muted-foreground">
                          До: {formatDate(result.projectedStockoutDate)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between space-x-1">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">{formatCurrency(result.totalStorageCost)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(result.dailyStorageCostTotal)} / день
                          </p>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Calculator className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="end" sideOffset={5}>
                            <DetailedAnalysis result={result} />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`logistics-${result.remainItem.nmId}`} className="text-xs mb-1 block">
                              Логистика
                            </Label>
                            <Input
                              id={`logistics-${result.remainItem.nmId}`}
                              type="number"
                              min="0"
                              value={result.logisticsCost}
                              onChange={(e) => updateLogisticsCost(result.remainItem.nmId, Number(e.target.value))}
                              className="h-7 text-xs"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`commission-${result.remainItem.nmId}`} className="text-xs mb-1 block">
                              WB %
                            </Label>
                            <Input
                              id={`commission-${result.remainItem.nmId}`}
                              type="number"
                              min="0"
                              max="100"
                              value={result.wbCommission}
                              onChange={(e) => updateWbCommission(result.remainItem.nmId, Number(e.target.value))}
                              className="h-7 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {getActionBadge(result.action)}
                    {result.action !== 'keep' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-end mb-1">
                          <Label htmlFor={`discount-${result.remainItem.nmId}`} className="text-xs mr-2">
                            Скидка {result.recommendedDiscount}%
                          </Label>
                        </div>
                        <Slider
                          id={`discount-${result.remainItem.nmId}`}
                          value={[result.recommendedDiscount]}
                          onValueChange={([value]) => {
                            setDiscountLevels(prev => ({
                              ...prev,
                              [result.remainItem.nmId]: value
                            }));
                          }}
                          max={80}
                          step={5}
                          className="w-32"
                        />
                        <div className="mt-1 text-xs">
                          Цена со скидкой: <span className="font-medium">{formatCurrency(result.discountedPrice)}</span>
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;


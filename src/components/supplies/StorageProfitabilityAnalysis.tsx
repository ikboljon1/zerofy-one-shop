
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
      
      // Комиссия WB - процент от цены продажи
      const commissionAmount = sellingPrice * (wbCommission / 100);
      
      // Логистика умножается на количество товара
      const totalLogisticsCost = logisticsCost * currentStock;
      
      // Прибыль за единицу с учётом комиссии и логистики
      const profitPerItem = sellingPrice - costPrice - commissionAmount - (logisticsCost);
      const profitMarginPercentage = sellingPrice > 0 ? (profitPerItem / sellingPrice) * 100 : 0;
      
      // Общая прибыль (учитывая количество)
      const grossProfit = profitPerItem * currentStock;
      
      // Чистая прибыль с учетом затрат на хранение
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
      
      // Комиссия WB для цены со скидкой
      const discountedCommissionAmount = discountedPrice * (wbCommission / 100);
      
      // Прибыль за единицу с учетом скидки и комиссии
      const profitWithDiscountPerItem = discountedPrice - costPrice - discountedCommissionAmount - (logisticsCost);
      
      const salesAccelerationFactor = 1 + (recommendedDiscount / 100);
      
      const newSalesRate = dailySales * salesAccelerationFactor;
      
      const newDaysOfInventory = Math.round(daysOfInventory / salesAccelerationFactor);
      
      const discountedStorageCost = averageStock * newDaysOfInventory * storageCost;
      
      // Общая прибыль без скидки учитывает все факторы
      const profitWithoutDiscount = profitPerItem * currentStock - totalStorageCost;
      
      // Общая прибыль со скидкой
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
                    <td className="py-1 text-muted-foreground">Логистика (на весь запас)</td>
                    <td className="py-1 text-right font-medium">{formatCurrency(result.logisticsCost * result.remainItem.quantityWarehousesFull)}</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted-foreground">Комиссия WB</td>
                    <td className="py-1 text-right font-medium">{result.wbCommission}%</td>
                  </tr>
                  <tr>
                    <td className="py-1 text-muted-foreground">Комиссия в деньгах (за единицу)</td>
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
                {result.action === 'discount' && <Percent className="h-5 w-5 text-amber-500" />}
                {result.action === 'keep' && <ArrowRight className="h-5 w-5 text-emerald-500" />}
              </div>
              <div>
                {result.action === 'sell' && (
                  <div>
                    <div className="font-medium text-rose-600">Срочная распродажа</div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Рекомендуется быстро распродать товар со скидкой {result.recommendedDiscount}%, 
                      так как затраты на хранение значительно снижают прибыльность.
                    </p>
                  </div>
                )}
                {result.action === 'discount' && (
                  <div>
                    <div className="font-medium text-amber-600">Установить скидку {result.recommendedDiscount}%</div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Снижение цены ускорит продажи и сократит затраты на хранение, 
                      что принесет дополнительную прибыль {formatCurrency(result.savingsWithDiscount)}.
                    </p>
                  </div>
                )}
                {result.action === 'keep' && (
                  <div>
                    <div className="font-medium text-emerald-600">Сохранить текущую цену</div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Товар имеет хорошую оборачиваемость и прибыльность при текущей цене. 
                      Скидка в данном случае не принесет дополнительной выгоды.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="mb-8 mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart4 className="h-5 w-5" />
          Анализ рентабельности хранения
        </CardTitle>
        <CardDescription>
          Анализ товаров и рекомендации по оптимизации хранения и ценообразования
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-50 dark:bg-slate-900/50 border-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted-foreground">Всего товаров</h3>
                <Package className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-2xl font-bold">{analysisSummary.totalItems}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400">Рекомендуется скидка</h3>
                <Percent className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{analysisSummary.discountItems}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-rose-50 dark:bg-rose-900/20 border-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-rose-600 dark:text-rose-400">Срочная распродажа</h3>
                <TrendingDown className="h-4 w-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold">{analysisSummary.sellItems}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-none">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Низкий запас</h3>
                <AlertTriangle className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold">{analysisSummary.lowStockItems}</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="w-full md:w-1/2">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Затраты на хранение</h3>
                <WarehouseIcon className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(analysisSummary.totalStorageCost)}</p>
              <div className="text-xs text-muted-foreground">
                Общие расчетные затраты на хранение всех товаров до полной распродажи
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-1/2">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Потенциальная экономия</h3>
                <Banknote className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(analysisSummary.potentialSavings)}</p>
              <div className="text-xs text-muted-foreground">
                Дополнительная прибыль при применении рекомендуемых скидок
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2 w-full md:w-auto">
              <Label htmlFor="search" className="text-sm">Поиск товаров</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Поиск по названию, артикулу или бренду..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2 w-full md:w-auto">
              <Label htmlFor="targetDate" className="text-sm">Целевая дата</Label>
              <DatePicker
                id="targetDate"
                date={targetDate}
                onSelect={setTargetDate}
                className="w-full"
              />
            </div>
            
            <div className="w-full md:w-auto">
              <Button onClick={savePriceData} className="w-full md:w-auto">
                Сохранить изменения
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList>
              <TabsTrigger value="all">
                Все товары
                <Badge variant="outline" className="ml-2">{analysisSummary.totalItems}</Badge>
              </TabsTrigger>
              <TabsTrigger value="discount">
                Рекомендуемые скидки
                <Badge variant="outline" className="ml-2">{analysisSummary.discountItems + analysisSummary.sellItems}</Badge>
              </TabsTrigger>
              <TabsTrigger value="keep">
                Без скидок
                <Badge variant="outline" className="ml-2">{analysisSummary.keepItems}</Badge>
              </TabsTrigger>
              <TabsTrigger value="low-stock">
                Низкий запас
                <Badge variant="outline" className="ml-2">{analysisSummary.lowStockItems}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Товар</TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('sellingPrice')}>
                      Цена
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('costPrice')}>
                      Себестоимость
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('dailySales')}>
                      Продажи/день
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('daysOfInventory')}>
                      Дней запаса
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('recommendedDiscount')}>
                      Скидка
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort('savingsWithDiscount')}>
                      Выгода
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.remainItem.nmId}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="flex-none w-10 h-10 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                          {result.remainItem.nmId % 5 === 0 ? (
                            <img 
                              src={`https://picsum.photos/seed/${result.remainItem.nmId}/40/40`} 
                              alt={result.remainItem.brand} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm truncate max-w-[170px]">
                            {result.remainItem.brand} {result.remainItem.subjectName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[170px]">
                            Арт: {result.remainItem.vendorCode || result.remainItem.nmId}
                          </div>
                          {getStockLevelIndicator(result)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={result.sellingPrice}
                        onChange={(e) => updateSellingPrice(result.remainItem.nmId, Number(e.target.value))}
                        className="w-24 h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={result.costPrice}
                        onChange={(e) => updateCostPrice(result.remainItem.nmId, Number(e.target.value))}
                        className="w-24 h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.1"
                        value={result.dailySales}
                        onChange={(e) => updateDailySales(result.remainItem.nmId, Number(e.target.value))}
                        className="w-24 h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatDaysOfInventory(result.daysOfInventory)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.remainItem.quantityWarehousesFull} шт. на складе
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[result.recommendedDiscount]}
                          min={0}
                          max={70}
                          step={5}
                          className="w-16"
                          onValueChange={(value) => {
                            setDiscountLevels(prev => ({
                              ...prev,
                              [result.remainItem.nmId]: value[0]
                            }));
                          }}
                        />
                        <div className="text-sm font-medium">
                          {result.recommendedDiscount}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${result.savingsWithDiscount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {result.savingsWithDiscount > 0 ? '+' : ''}{formatCurrency(result.savingsWithDiscount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionBadge(result.action)}
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <BarChart4 className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent side="left" align="start" className="p-0">
                            <DetailedAnalysis result={result} />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-6 w-6 mb-2" />
                        <p>Не найдено товаров по указанным критериям</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Обратите внимание</AlertTitle>
            <AlertDescription>
              Данные расчеты являются приблизительными и основаны на текущих данных о продажах и 
              затратах на хранение. Рекомендуется проверять и корректировать входные параметры 
              для получения более точных результатов.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;


import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Search, ArrowUpDown, Package, TrendingDown, Banknote, AlertTriangle, Clock, ArrowDown, ArrowUp, Download, RefreshCw } from 'lucide-react';
import { 
  formatCurrency, 
  calculateDiscountSavings, 
  calculateOptimalDiscount, 
  determineRecommendedAction,
  roundToTwoDecimals
} from '@/utils/formatCurrency';
import { WarehouseRemainItem, PaidStorageItem } from '@/types/supplies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  paidStorageData?: PaidStorageItem[]; 
  averageDailySalesRate?: Record<number, number>;
  dailyStorageCost?: Record<number, number>;
  selectedStore?: { 
    id: string;
    apiKey: string;
  } | null;
}

interface AnalysisResult {
  remainItem: WarehouseRemainItem;
  costPrice: number;
  sellingPrice: number;
  dailySales: number;
  dailyStorageCost: number;
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
  selectedStore = null,
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
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const { toast } = useToast();

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
      
      if ((!itemStorageCost || itemStorageCost === 5) && paidStorageData.length > 0) {
        const matchingStorageItems = paidStorageData.filter(psi => psi.nmId === item.nmId);
        if (matchingStorageItems.length > 0) {
          const totalCost = matchingStorageItems.reduce((sum, psi) => sum + psi.warehousePrice, 0);
          itemStorageCost = totalCost / matchingStorageItems.length;
        }
      }
      
      initialDailySales[item.nmId] = averageDailySalesRate[item.nmId] || 0.1;
      initialStorageCosts[item.nmId] = itemStorageCost;
      
      const optimalDiscount = calculateOptimalDiscount(
        item.price || 0,
        costPrices[item.nmId] || 0,
        item.quantityWarehousesFull || 0,
        itemStorageCost,
        averageDailySalesRate[item.nmId] || 0.1
      );
      initialDiscountLevels[item.nmId] = optimalDiscount;
      
      const salesRate = averageDailySalesRate[item.nmId] || 0.1;
      initialLowStockThresholds[item.nmId] = Math.max(3, Math.ceil(salesRate * 7));
    });

    setDailySalesRates(prevState => ({...prevState, ...initialDailySales}));
    setStorageCostRates(prevState => ({...prevState, ...initialStorageCosts}));
    setDiscountLevels(prevState => ({...prevState, ...initialDiscountLevels}));
    setLowStockThreshold(prevState => ({...prevState, ...initialLowStockThresholds}));
  }, [warehouseItems, averageDailySalesRate, dailyStorageCost, paidStorageData, costPrices]);

  const fetchProductPrices = async () => {
    if (!selectedStore?.apiKey || warehouseItems.length === 0) {
      toast({
        title: "Ошибка",
        description: "Не выбран магазин или нет данных о товарах",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoadingPrices(true);
    try {
      toast({
        title: "Загрузка цен товаров",
        description: "Это может занять некоторое время...",
      });
      
      const nmIds = warehouseItems.map(item => item.nmId);
      const chunkSize = 20;
      const priceMap: Record<number, number> = {};
      
      for (let i = 0; i < nmIds.length; i += chunkSize) {
        const chunk = nmIds.slice(i, i + chunkSize);
        const url = new URL("https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter");
        url.searchParams.append("limit", "1000");
        url.searchParams.append("nmId", chunk.join(','));
        
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Authorization": selectedStore.apiKey,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка при загрузке цен: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.data?.listGoods) {
          data.data.listGoods.forEach((item: any) => {
            if (item.sizes && item.sizes.length > 0) {
              const firstSize = item.sizes[0];
              const discountedPrice = firstSize.discountedPrice || 0;
              priceMap[item.nmID] = discountedPrice;
            }
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setSellingPrices(prevPrices => ({...prevPrices, ...priceMap}));
      localStorage.setItem('product_selling_prices', JSON.stringify({...JSON.parse(localStorage.getItem('product_selling_prices') || '{}'), ...priceMap}));
      
      toast({
        title: "Успешно",
        description: `Загружены цены для ${Object.keys(priceMap).length} товаров`,
      });
    } catch (error) {
      console.error("Ошибка при загрузке цен:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить цены товаров",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPrices(false);
    }
  };
  
  const fetchAverageSales = async () => {
    if (!selectedStore?.apiKey || warehouseItems.length === 0) {
      toast({
        title: "Ошибка",
        description: "Не выбран магазин или нет данных о товарах",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoadingSales(true);
    try {
      toast({
        title: "Расчет среднего числа продаж",
        description: "Анализ данных о продажах за последние 30 дней...",
      });
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const url = new URL("https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod");
      url.searchParams.append("dateFrom", startDate.toISOString().split('T')[0]);
      url.searchParams.append("dateTo", endDate.toISOString().split('T')[0]);
      url.searchParams.append("limit", "100000");
      
      const response = await fetch(url.toString(), {
        headers: {
          "Authorization": selectedStore.apiKey,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка при загрузке данных о продажах: ${response.status}`);
      }
      
      const data = await response.json();
      
      const salesMap: Record<number, number> = {};
      const salesDates: Record<number, Set<string>> = {};

      data.forEach((item: any) => {
        if (item.doc_type_name === "Продажа") {
          const nmId = item.nm_id;
          
          if (!salesMap[nmId]) {
            salesMap[nmId] = 0;
            salesDates[nmId] = new Set();
          }
          
          salesMap[nmId] += (item.quantity || 0);
          salesDates[nmId].add(item.doc_date.split('T')[0]);
        }
      });
      
      const averageDailySales: Record<number, number> = {};
      
      warehouseItems.forEach(item => {
        const nmId = item.nmId;
        const totalSales = salesMap[nmId] || 0;
        
        const uniqueSalesDays = salesDates[nmId] ? salesDates[nmId].size : 0;
        
        const divisor = uniqueSalesDays > 0 ? uniqueSalesDays : 30;
        
        const average = totalSales / divisor;
        averageDailySales[nmId] = Math.max(0.01, parseFloat(average.toFixed(2)));
      });
      
      setDailySalesRates(prevRates => ({...prevRates, ...averageDailySales}));
      
      toast({
        title: "Успешно",
        description: `Рассчитаны средние продажи для ${Object.keys(averageDailySales).length} товаров`,
      });
    } catch (error) {
      console.error("Ошибка при расчете средних продаж:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось рассчитать средние продажи",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSales(false);
    }
  };

  const analysisResults = useMemo(() => {
    return warehouseItems.map(item => {
      const nmId = item.nmId;
      const costPrice = costPrices[nmId] || 0;
      const sellingPrice = sellingPrices[nmId] || (item.price || 0);
      const dailySales = dailySalesRates[nmId] || 0.1;
      const storageCost = storageCostRates[nmId] || 5;
      const discountPercentage = discountLevels[nmId] || 30;
      const threshold = lowStockThreshold[nmId] || Math.ceil(dailySales * 7);
      
      const currentStock = item.quantityWarehousesFull || 0;
      
      const daysOfInventory = dailySales > 0 ? Math.round(currentStock / dailySales) : 999;
      
      const totalStorageCost = storageCost * daysOfInventory;
      
      const profitPerItem = sellingPrice - costPrice;
      const profitWithoutDiscount = profitPerItem * currentStock - totalStorageCost;
      
      const discountedPrice = sellingPrice * (1 - discountPercentage / 100);
      const profitWithDiscountPerItem = discountedPrice - costPrice;
      
      const salesAccelerationFactor = 1.5;
      const discountedDaysOfInventory = Math.round(daysOfInventory / salesAccelerationFactor);
      const discountedStorageCost = storageCost * discountedDaysOfInventory;
      
      const profitWithDiscount = profitWithDiscountPerItem * currentStock - discountedStorageCost;
      
      const storageSavings = totalStorageCost - discountedStorageCost;
      
      const savingsWithDiscount = calculateDiscountSavings(
        sellingPrice,
        discountPercentage,
        currentStock,
        storageCost,
        dailySales,
        salesAccelerationFactor
      );
      
      const lowStock = currentStock <= threshold;
      
      let stockLevelPercentage = Math.min(100, (currentStock / (threshold * 2)) * 100);
      stockLevelPercentage = Math.max(0, Math.round(stockLevelPercentage));
      
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
      
      const action = determineRecommendedAction(
        daysOfInventory,
        savingsWithDiscount,
        profitWithDiscount,
        profitWithoutDiscount
      );
      
      return {
        remainItem: item,
        costPrice,
        sellingPrice,
        dailySales,
        dailyStorageCost: storageCost,
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
    
    const totalInvestment = analysisResults.reduce((sum, item) => {
      return sum + (item.costPrice * (item.remainItem.quantityWarehousesFull || 0));
    }, 0);
    
    const currentROI = totalInvestment > 0 ? 
      (analysisResults.reduce((sum, item) => sum + item.profitWithoutDiscount, 0) / totalInvestment) * 100 : 0;
    
    const optimizedROI = totalInvestment > 0 ? 
      (analysisResults.reduce((sum, item) => {
        const profit = (item.action === 'discount' || item.action === 'sell') ? 
          item.profitWithDiscount : item.profitWithoutDiscount;
        return sum + profit;
      }, 0) / totalInvestment) * 100 : 0;
    
    const roiImprovement = optimizedROI - currentROI;
    
    return {
      totalItems,
      lowStockItems,
      discountItems,
      sellItems,
      keepItems,
      totalStorageCost,
      potentialSavings,
      itemsStockingOutBeforeTarget,
      currentROI: roundToTwoDecimals(currentROI),
      optimizedROI: roundToTwoDecimals(optimizedROI),
      roiImprovement: roundToTwoDecimals(roiImprovement)
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
    
    toast({
      title: "Данные успешно сохранены"
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

  const calculateROIimprovement = (result: AnalysisResult) => {
    const investment = result.costPrice * (result.remainItem.quantityWarehousesFull || 0);
    if (investment <= 0) return 0;
    
    const currentROI = (result.profitWithoutDiscount / investment) * 100;
    const optimizedROI = (result.profitWithDiscount / investment) * 100;
    
    return roundToTwoDecimals(optimizedROI - currentROI);
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
                  <p className="text-sm text-muted-foreground">Рентабельность</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {analysisSummary.optimizedROI.toFixed(2)}%
                    {analysisSummary.roiImprovement > 0 && (
                      <span className="text-sm text-green-600 ml-2">+{analysisSummary.roiImprovement.toFixed(2)}%</span>
                    )}
                  </h3>
                </div>
                <div className="bg-purple-100 dark:bg-purple-800/30 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-800/30">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Текущая</span>
                  <span className="text-xs font-medium">{analysisSummary.currentROI.toFixed(2)}%</span>
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
                    placeholder="Выберите дату"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchProductPrices}
                disabled={isLoadingPrices || !selectedStore}
                className="whitespace-nowrap"
              >
                {isLoadingPrices ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Загрузить цены
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchAverageSales}
                disabled={isLoadingSales || !selectedStore}
                className="whitespace-nowrap"
              >
                {isLoadingSales ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Рассчитать продажи
                  </>
                )}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={savePriceData}
                className="whitespace-nowrap"
              >
                Сохранить данные
              </Button>
            </div>
          </div>
          
          <Tabs value={selectedTab} onValueChange={(value: string) => setSelectedTab(value as any)} className="w-full">
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all">Все товары ({analysisSummary.totalItems})</TabsTrigger>
              <TabsTrigger value="discount">На скидку ({analysisSummary.discountItems + analysisSummary.sellItems})</TabsTrigger>
              <TabsTrigger value="keep">Без скидки ({analysisSummary.keepItems})</TabsTrigger>
              <TabsTrigger value="low-stock">Низкий запас ({analysisSummary.lowStockItems})</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedTab} className="mt-4">
              {filteredResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Товар</TableHead>
                      <TableHead className="w-[100px]">Цены</TableHead>
                      <TableHead className="w-[100px]">Остаток</TableHead>
                      <TableHead className="w-[120px]">Продажи</TableHead>
                      <TableHead className="w-[140px]">Прибыль</TableHead>
                      <TableHead className="w-[100px]">Скидка</TableHead>
                      <TableHead className="w-[140px]">Действие</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.remainItem.nmId}>
                        <TableCell className="align-top">
                          <div className="font-medium text-sm">{result.remainItem.subjectName || result.remainItem.brand}</div>
                          <div className="text-xs text-muted-foreground mt-1">Артикул: {result.remainItem.vendorCode || "Нет"}</div>
                          <div className="text-xs text-muted-foreground mt-1">NM: {result.remainItem.nmId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Себестоимость</div>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="number" 
                                  className="h-8 w-full" 
                                  value={result.costPrice || ''} 
                                  onChange={e => updateCostPrice(result.remainItem.nmId, Number(e.target.value))}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Цена продажи</div>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="number" 
                                  className="h-8 w-full" 
                                  value={result.sellingPrice || ''} 
                                  onChange={e => updateSellingPrice(result.remainItem.nmId, Number(e.target.value))}
                                />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{result.remainItem.quantityWarehousesFull || 0} шт.</div>
                          <div className="mt-2">
                            {getStockLevelIndicator(result)}
                          </div>
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground">Хранение в день</div>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="number" 
                                className="h-8 w-full" 
                                value={result.dailyStorageCost || ''} 
                                onChange={e => updateStorageCost(result.remainItem.nmId, Number(e.target.value))}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Продажи в день</div>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="number" 
                                  className="h-8 w-full" 
                                  value={result.dailySales || ''} 
                                  onChange={e => updateDailySales(result.remainItem.nmId, Number(e.target.value))}
                                  step="0.01"
                                />
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Порог низкого запаса</div>
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="number" 
                                  className="h-8 w-full" 
                                  value={lowStockThreshold[result.remainItem.nmId] || ''} 
                                  onChange={e => updateLowStockThreshold(result.remainItem.nmId, Number(e.target.value))}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Хватит на</span>
                                <span className="text-xs font-medium">{result.daysOfInventory} дн.</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Закончится</span>
                                <span className="text-xs font-medium">{formatDate(result.projectedStockoutDate)}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Без скидки</span>
                                <span className="text-xs font-medium">{formatCurrency(result.profitWithoutDiscount)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Со скидкой</span>
                                <span className="text-xs font-medium">{formatCurrency(result.profitWithDiscount)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Улучшение</span>
                                <span className={`text-xs font-medium ${result.savingsWithDiscount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {result.savingsWithDiscount > 0 ? '+' : ''}{formatCurrency(result.savingsWithDiscount)}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">ROI</span>
                                <span className={`text-xs font-medium ${calculateROIimprovement(result) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {calculateROIimprovement(result) > 0 ? '+' : ''}{calculateROIimprovement(result)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Рекомендуемая скидка</div>
                              <div className="my-2">
                                <Slider
                                  defaultValue={[result.recommendedDiscount]}
                                  max={70}
                                  step={1}
                                  onValueChange={val => updateDiscountLevel(result.remainItem.nmId, val)}
                                  value={[discountLevels[result.remainItem.nmId] || 0]}
                                />
                                <div className="text-center text-sm font-medium">
                                  {discountLevels[result.remainItem.nmId] || 0}%
                                </div>
                              </div>
                            </div>
                            <div className="mt-3">
                              {getActionBadge(result.action)}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Нет данных для отображения</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;

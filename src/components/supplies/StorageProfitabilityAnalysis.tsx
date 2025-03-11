
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
  Clock, ArrowDown, ArrowUp, BarChart4, TrendingUp, Calculator, Truck, Percent, ArrowRight,
  Download, DownloadCloud, LineChart
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { WarehouseRemainItem, PaidStorageItem } from '@/types/supplies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from 'axios';

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

// Define interface for average daily sales data
interface AverageDailySalesData {
  nm_id: number;
  sa_name: string;
  total_sales_quantity: number;
  average_daily_sales_quantity: number;
  retail_price_withdisc_rub?: number;
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
  
  // Sales data fetch settings
  const [dateFrom, setDateFrom] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSalesFetchDialogOpen, setIsSalesFetchDialogOpen] = useState<boolean>(false);
  const [averageSalesData, setAverageSalesData] = useState<AverageDailySalesData[]>([]);

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

    const storedLogisticsCosts = localStorage.getItem('product_logistics_costs');
    if (storedLogisticsCosts) {
      setLogisticsCosts(JSON.parse(storedLogisticsCosts));
    }

    const storedWbCommissions = localStorage.getItem('product_wb_commissions');
    if (storedWbCommissions) {
      setWbCommissions(JSON.parse(storedWbCommissions));
    }

    const initialDailySales: Record<number, number> = {};
    const initialStorageCosts: Record<number, number> = {};
    const initialDiscountLevels: Record<number, number> = {};
    const initialLowStockThresholds: Record<number, number> = {};
    const initialCostPrices: Record<number, number> = {};
    const initialSellingPrices: Record<number, number> = {};
    const initialLogisticsCosts: Record<number, number> = {};
    const initialWbCommissions: Record<number, number> = {};

    warehouseItems.forEach(item => {
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
        initialLogisticsCosts[item.nmId] = 150;
      }
      
      if (!wbCommissions[item.nmId]) {
        initialWbCommissions[item.nmId] = 15;
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

  // Функция для получения данных о продажах из API Wildberries
  const fetchSalesData = async () => {
    try {
      setIsLoading(true);
      
      // Получаем выбранный магазин из localStorage
      const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
      const selectedStore = stores.find((store: any) => store.isSelected);
      
      if (!selectedStore || !selectedStore.apiKey) {
        toast({
          title: "Ошибка",
          description: "Не удалось получить API-ключ выбранного магазина",
          variant: "destructive"
        });
        return;
      }

      // В реальном приложении здесь будет запрос к API Wildberries
      // Для демонстрации просто эмулируем ответ
      toast({
        title: "Запрос данных",
        description: "Получаем данные о продажах с Wildberries. Это может занять некоторое время...",
      });

      // Эмуляция задержки запроса
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Формируем даты для запроса
      const formattedDateFrom = dateFrom.toISOString().split('T')[0];
      const formattedDateTo = dateTo.toISOString().split('T')[0];
      
      // В реальном приложении вместо этого будет запрос к API
      // const response = await axios.get('https://statistics-api.wildberries.ru/api/v5/supplier/reportDetailByPeriod', {
      //   headers: { Authorization: selectedStore.apiKey },
      //   params: { dateFrom: formattedDateFrom, dateTo: formattedDateTo, rrdid: 0, limit: 100000 }
      // });
      
      // Создаем симуляцию данных для демонстрации
      const mockSalesData: AverageDailySalesData[] = [];
      
      // Рассчитываем количество дней в периоде
      const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      
      // Создаем случайные данные для каждого товара
      warehouseItems.forEach(item => {
        const totalSales = Math.floor(Math.random() * 20) + 1; // Случайное число от 1 до 20
        mockSalesData.push({
          nm_id: item.nmId,
          sa_name: item.vendorCode || String(item.nmId),
          total_sales_quantity: totalSales,
          average_daily_sales_quantity: Number((totalSales / diffDays).toFixed(2)),
          retail_price_withdisc_rub: item.price || Math.floor(Math.random() * 5000) + 500
        });
      });
      
      setAverageSalesData(mockSalesData);
      
      // Обновляем данные о продажах и ценах
      const newDailySalesRates: Record<number, number> = {};
      const newSellingPrices: Record<number, number> = {};
      
      mockSalesData.forEach(data => {
        newDailySalesRates[data.nm_id] = data.average_daily_sales_quantity;
        if (data.retail_price_withdisc_rub && data.retail_price_withdisc_rub > 0) {
          newSellingPrices[data.nm_id] = data.retail_price_withdisc_rub;
        }
      });
      
      setDailySalesRates(prevState => ({...prevState, ...newDailySalesRates}));
      
      // Обновляем цены продажи только если они не были установлены вручную
      const updatedSellingPrices: Record<number, number> = {};
      Object.keys(newSellingPrices).forEach(nmId => {
        const numericNmId = Number(nmId);
        const currentPrice = sellingPrices[numericNmId];
        // Если текущая цена равна 0 или равна цене из Warehouse, используем цену из API
        if (currentPrice === 0 || currentPrice === warehouseItems.find(item => item.nmId === numericNmId)?.price) {
          updatedSellingPrices[numericNmId] = newSellingPrices[numericNmId];
        }
      });
      
      if (Object.keys(updatedSellingPrices).length > 0) {
        setSellingPrices(prevState => ({...prevState, ...updatedSellingPrices}));
      }
      
      // Обновляем пороги низкого запаса на основе данных о продажах
      const newLowStockThresholds: Record<number, number> = {};
      Object.keys(newDailySalesRates).forEach(nmId => {
        const numericNmId = Number(nmId);
        const salesRate = newDailySalesRates[numericNmId];
        newLowStockThresholds[numericNmId] = Math.max(3, Math.ceil(salesRate * 7)); // 7-дневный запас
      });
      
      setLowStockThreshold(prevState => ({...prevState, ...newLowStockThresholds}));
      
      toast({
        title: "Данные получены",
        description: `Загружены данные о продажах за период ${formattedDateFrom} - ${formattedDateTo}`,
      });
      
      // Закрываем диалог после успешной загрузки
      setIsSalesFetchDialogOpen(false);
      
    } catch (error) {
      console.error('Ошибка при получении данных о продажах:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить данные о продажах",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      
      const daysOfInventory = dailySales > 0 ? Math.round(currentStock / dailySales) : 999;
      
      const averageStock = currentStock / 2;
      const totalStorageCost = averageStock * daysOfInventory * storageCost;
      
      const commissionAmount = sellingPrice * (wbCommission / 100);
      
      const totalLogisticsCost = logisticsCost * currentStock;
      
      const profitPerItem = sellingPrice - costPrice - commissionAmount - (logisticsCost);
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
      
      const discountedCommissionAmount = discountedPrice * (wbCommission / 100);
      
      const profitWithDiscountPerItem = discountedPrice - costPrice - discountedCommissionAmount - (logisticsCost);
      
      const salesAccelerationFactor = 1 + (recommendedDiscount / 100);
      
      const newSalesRate = dailySales * salesAccelerationFactor;
      
      const newDaysOfInventory = Math.round(daysOfInventory / salesAccelerationFactor);
      
      const discountedStorageCost = averageStock * newDaysOfInventory * storageCost;
      
      const profitWithoutDiscount = profitPerItem * currentStock - totalStorageCost;
      
      const profitWithDiscount = (profitWithDiscountPerItem * currentStock) - discountedStorageCost;
      
      const savingsWithDiscount = profitWithDiscount - profitWithoutDiscount;
      
      if (profitWithDiscount < 0 && profitWithoutDiscount < 0 && profitWithDiscount < profitWithoutDiscount) {
        action = 'keep';
        recommendedDiscount = 0;
      }
      
      if (savingsWithDiscount < 0) {
        if (isSlowMoving && daysOfInventory > 180) {
          action = 'discount';
          recommendedDiscount = Math.min(15, discountLevels[nmId] || 15);
        } else {
          action = 'keep';
          recommendedDiscount = 0;
        }
      }
      
      if (profitWithoutDiscount < 0 && profitWithDiscount > 0) {
        action = 'discount';
      }
      
      if (profitWithDiscount < 0 && recommendedDiscount > 0) {
        if (Math.abs(profitWithDiscount) > profitWithDiscountPerItem * currentStock * 0.5) {
          if (profitWithDiscount > profitWithoutDiscount) {
            action = 'sell';
            recommendedDiscount = Math.min(50, discountLevels[nmId] || 50);
          } else {
            action = 'keep';
            recommendedDiscount = 0;
          }
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
      default:
        return null;
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
                <div className="font-semibold">{formatCurrency(result.sellingPrice)}</div>
                <div className="text-xs">Срок продажи: {formatDaysOfInventory(result.daysOfInventory)}</div>
                <div className="text-xs">Хранение: {formatCurrency(result.totalStorageCost)}</div>
                <div className={`font-medium text-xs ${result.profitWithoutDiscount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Прибыль: {formatCurrency(result.profitWithoutDiscount)}
                </div>
              </div>

              <div className="space-y-2 border rounded-lg p-3 bg-white dark:bg-slate-950">
                <div className="text-xs text-muted-foreground">Со скидкой {result.recommendedDiscount}%</div>
                <div className="font-semibold">{formatCurrency(result.discountedPrice)}</div>
                <div className="text-xs">Срок продажи: {formatDaysOfInventory(result.newDaysOfInventory)}</div>
                <div className="text-xs">Хранение: {formatCurrency(result.discountedStorageCost)}</div>
                <div className={`font-medium text-xs ${result.profitWithDiscount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Прибыль: {formatCurrency(result.profitWithDiscount)}
                </div>
              </div>

              <div className="space-y-2 border rounded-lg p-3 bg-white dark:bg-slate-950">
                <div className="text-xs text-muted-foreground">Экономия</div>
                <div className="font-semibold text-emerald-600">
                  {result.savingsWithDiscount > 0 ? (
                    <span className="flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      {formatCurrency(result.savingsWithDiscount)}
                    </span>
                  ) : (
                    <span className="flex items-center text-rose-600">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      {formatCurrency(Math.abs(result.savingsWithDiscount))}
                    </span>
                  )}
                </div>
                <div className="text-xs">
                  {formatDaysOfInventory(result.daysOfInventory - result.newDaysOfInventory)} быстрее
                </div>
                <div className="text-xs">
                  {formatCurrency(result.totalStorageCost - result.discountedStorageCost)} экономия на хранении
                </div>
                <div className="mt-2">
                  {getActionBadge(result.action)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-xs text-muted-foreground">ОСНОВНЫЕ ПАРАМЕТРЫ</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Себестоимость</span>
                  <span className="font-medium">{formatCurrency(result.costPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Цена продажи</span>
                  <span className="font-medium">{formatCurrency(result.sellingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Продажи/день</span>
                  <span className="font-medium">{result.dailySales.toFixed(2)} шт.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Дней до продажи</span>
                  <span className="font-medium">{formatDaysOfInventory(result.daysOfInventory)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Стоимость хранения/день</span>
                  <span className="font-medium">{formatCurrency(result.dailyStorageCost)} за ед.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Комиссия WB</span>
                  <span className="font-medium">{result.wbCommission}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Логистика</span>
                  <span className="font-medium">{formatCurrency(result.logisticsCost)} за ед.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Маржинальность</span>
                  <span className="font-medium">{result.profitMarginPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-xs text-muted-foreground">ЗАПАСЫ</h4>
              <div className="border rounded-lg p-3 mb-2 bg-white dark:bg-slate-950">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Текущий запас</span>
                  <span className="font-medium">{result.remainItem.quantityWarehousesFull} шт.</span>
                </div>
                {getStockLevelIndicator(result)}
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Порог низкого запаса</span>
                  <span className="font-medium">{lowStockThreshold[result.remainItem.nmId] || Math.ceil(result.dailySales * 7)} шт.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Прогноз закончится</span>
                  <span className="font-medium">{formatDate(result.projectedStockoutDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <BarChart4 className="h-5 w-5 mr-2" />
          Анализ рентабельности хранения
        </CardTitle>
        <CardDescription>
          Расчет оптимальной стратегии продаж для сокращения издержек на хранение
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Товары</p>
                      <p className="text-2xl font-bold">{analysisSummary.totalItems}</p>
                    </div>
                    <Package className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                  <div className="mt-3 grid grid-cols-3 divide-x">
                    <div className="flex flex-col items-center px-2">
                      <span className="text-xs text-muted-foreground">Без скидки</span>
                      <span className="font-medium">{analysisSummary.keepItems}</span>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <span className="text-xs text-muted-foreground">Со скидкой</span>
                      <span className="font-medium">{analysisSummary.discountItems}</span>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <span className="text-xs text-muted-foreground">Продать</span>
                      <span className="font-medium">{analysisSummary.sellItems}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Стоимость хранения</p>
                      <p className="text-2xl font-bold">{formatCurrency(analysisSummary.totalStorageCost)}</p>
                    </div>
                    <WarehouseIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Потенциальная экономия:</span>
                      <span className="text-sm font-medium text-emerald-600">{formatCurrency(analysisSummary.potentialSavings)}</span>
                    </div>
                    <Progress value={Math.min(100, (analysisSummary.potentialSavings / analysisSummary.totalStorageCost) * 100)} 
                              className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Низкий запас</p>
                      <p className="text-2xl font-bold">{analysisSummary.lowStockItems}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Закончатся до:</span>
                      <div className="flex items-center gap-2">
                        <DatePicker
                          value={targetDate}
                          onValueChange={setTargetDate}
                          placeholder="Выберите дату"
                          className="w-32"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span>Закончатся до выбранной даты:</span>
                      <span className="font-medium">{analysisSummary.itemsStockingOutBeforeTarget}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-between gap-2">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию, артикулу или бренду"
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Dialog open={isSalesFetchDialogOpen} onOpenChange={setIsSalesFetchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="whitespace-nowrap">
                      <DownloadCloud className="h-4 w-4 mr-2" />
                      Данные о продажах
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Получение данных о продажах</DialogTitle>
                      <DialogDescription>
                        Выберите период, за который нужно получить данные о продажах с Wildberries.
                        Эта информация будет использована для расчета средней скорости продаж.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateFrom">Дата начала</Label>
                          <DatePicker
                            value={dateFrom}
                            onValueChange={setDateFrom}
                            placeholder="Выберите дату"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateTo">Дата окончания</Label>
                          <DatePicker
                            value={dateTo}
                            onValueChange={setDateTo}
                            placeholder="Выберите дату"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Важно</AlertTitle>
                          <AlertDescription>
                            Будет использован API-ключ выбранного магазина. Получение данных за большой период может занять некоторое время.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsSalesFetchDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={fetchSalesData} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="spinner mr-2" /> Загрузка...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" /> Получить данные
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <Button onClick={savePriceData}>
                Сохранить изменения
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
          <TabsList>
            <TabsTrigger value="all">Все товары ({analysisResults.length})</TabsTrigger>
            <TabsTrigger value="discount">Рекомендуемые скидки ({analysisSummary.discountItems + analysisSummary.sellItems})</TabsTrigger>
            <TabsTrigger value="keep">Без скидки ({analysisSummary.keepItems})</TabsTrigger>
            <TabsTrigger value="low-stock">Низкий запас ({analysisSummary.lowStockItems})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedTab} className="mt-6">
            <Table className="border">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Товар</TableHead>
                  <TableHead className="w-[100px]" onClick={() => requestSort('sellingPrice')}>
                    <div className="flex items-center cursor-pointer hover:text-primary">
                      Цена
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]" onClick={() => requestSort('costPrice')}>
                    <div className="flex items-center cursor-pointer hover:text-primary">
                      Себестоимость
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]" onClick={() => requestSort('dailySales')}>
                    <div className="flex items-center cursor-pointer hover:text-primary">
                      Продажи/день
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]" onClick={() => requestSort('dailyStorageCost')}>
                    <div className="flex items-center cursor-pointer hover:text-primary">
                      Хранение/день
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]" onClick={() => requestSort('profitMarginPercentage')}>
                    <div className="flex items-center cursor-pointer hover:text-primary">
                      Маржа
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]" onClick={() => requestSort('daysOfInventory')}>
                    <div className="flex items-center cursor-pointer hover:text-primary">
                      Дней до продажи
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]" onClick={() => requestSort('totalStorageCost')}>
                    <div className="flex items-center cursor-pointer hover:text-primary">
                      Стоимость хранения
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[100px]" onClick={() => requestSort('recommendedDiscount')}>
                    <div className="flex items-center cursor-pointer hover:text-primary">
                      Рекомендация
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[120px]">Запас</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                      {searchTerm 
                        ? "Нет товаров, соответствующих условиям поиска" 
                        : "Нет товаров для отображения"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result) => (
                    <TableRow key={result.remainItem.nmId}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-medium">{result.remainItem.brand}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[230px]">
                            {result.remainItem.subjectName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Арт: {result.remainItem.vendorCode || result.remainItem.nmId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={sellingPrices[result.remainItem.nmId] || 0}
                          onChange={(e) => updateSellingPrice(result.remainItem.nmId, Number(e.target.value))}
                          className="h-8 w-full text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={costPrices[result.remainItem.nmId] || 0}
                          onChange={(e) => updateCostPrice(result.remainItem.nmId, Number(e.target.value))}
                          className="h-8 w-full text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={dailySalesRates[result.remainItem.nmId] || 0}
                          onChange={(e) => updateDailySales(result.remainItem.nmId, Number(e.target.value))}
                          className="h-8 w-full text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          step="0.1"
                          value={storageCostRates[result.remainItem.nmId] || 0}
                          onChange={(e) => updateStorageCost(result.remainItem.nmId, Number(e.target.value))}
                          className="h-8 w-full text-right"
                        />
                      </TableCell>
                      <TableCell className={`font-medium ${result.profitMarginPercentage < 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {result.profitMarginPercentage.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {formatDaysOfInventory(result.daysOfInventory)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(result.totalStorageCost)}
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="h-8 w-full flex items-center justify-between gap-2">
                              {getActionBadge(result.action)}
                              <span className={`${result.recommendedDiscount > 0 ? 'text-amber-600' : 'text-muted-foreground'} font-medium`}>
                                {result.recommendedDiscount > 0 ? `-${result.recommendedDiscount}%` : '0%'}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0">
                            <DetailedAnalysis result={result} />
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Кол-во: {result.remainItem.quantityWarehousesFull} шт.</span>
                          </div>
                          {getStockLevelIndicator(result)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StorageProfitabilityAnalysis;

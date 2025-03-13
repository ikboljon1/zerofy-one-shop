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
  RefreshCw, Download
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { WarehouseRemainItem, PaidStorageItem } from '@/types/supplies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchFullPaidStorageReport } from '@/services/suppliesApi';
import { format } from 'date-fns';
import { SearchInput } from '@/components/ui/search-input';

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  paidStorageData?: PaidStorageItem[];
  averageDailySalesRate?: Record<string, number>;
  dailyStorageCost?: Record<string, number>;
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

interface SalesDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFetchData: (startDate: Date, endDate: Date) => Promise<void>;
  isLoading: boolean;
}

const SalesDataDialog: React.FC<SalesDataDialogProps> = ({ 
  open, 
  onOpenChange, 
  onFetchData,
  isLoading 
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 7))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  
  const handleFetchData = async () => {
    if (startDate && endDate) {
      await onFetchData(startDate, endDate);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Получение данных о продажах</DialogTitle>
          <DialogDescription>
            Выберите период для получения средних показателей продаж
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="startDate">Дата начала</Label>
              <DatePicker 
                value={startDate}
                onValueChange={setStartDate}
                placeholder="Выберите дату начала"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="endDate">Дата окончания</Label>
              <DatePicker 
                value={endDate}
                onValueChange={setEndDate}
                placeholder="Выберите дату окончания"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleFetchData} disabled={isLoading || !startDate || !endDate}>
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Получить данные
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StorageProfitabilityAnalysis: React.FC<StorageProfitabilityAnalysisProps> = ({
  warehouseItems,
  paidStorageData = [],
  averageDailySalesRate = {},
  dailyStorageCost = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'discount' | 'keep' | 'low-stock'>('all');
  const [costPrices, setCostPrices] = useState<Record<string, number | null>>({});
  const [sellingPrices, setSellingPrices] = useState<Record<string, number | null>>({});
  const [dailySalesRates, setDailySalesRates] = useState<Record<string, number | null>>({});
  const [storageCostRates, setStorageCostRates] = useState<Record<string, number | null>>({});
  const [discountLevels, setDiscountLevels] = useState<Record<string, number>>({});
  const [lowStockThreshold, setLowStockThreshold] = useState<Record<string, number>>({});
  const [logisticsCosts, setLogisticsCosts] = useState<Record<string, number | null>>({});
  const [wbCommissions, setWbCommissions] = useState<Record<string, number | null>>({});
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AnalysisResult | '',
    direction: 'asc' | 'desc'
  }>({ key: '', direction: 'asc' });
  const [salesDataDialogOpen, setSalesDataDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getItemKey = (item: WarehouseRemainItem): string => {
    const nmId = item?.nmId ? item.nmId.toString() : '0';
    return nmId;
  };

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

    console.log("Полученные данные склада:", warehouseItems);

    const initialDailySales: Record<string, number | null> = {};
    const initialStorageCosts: Record<string, number | null> = {};
    const initialDiscountLevels: Record<string, number> = {};
    const initialLowStockThresholds: Record<string, number> = {};
    const initialCostPrices: Record<string, number | null> = {};
    const initialSellingPrices: Record<string, number | null> = {};
    const initialLogisticsCosts: Record<string, number | null> = {};
    const initialWbCommissions: Record<string, number | null> = {};

    warehouseItems.forEach(item => {
      if (!item) {
        console.error("Получен undefined элемент в warehouseItems");
        return;
      }

      const nmId = item.nmId ? item.nmId.toString() : '0';
      const itemKey = getItemKey(item);
      
      console.log(`Обработка элемента: nmId=${nmId}, itemKey=${itemKey}, price=${item.price}`);
      
      if (!costPrices[itemKey]) {
        initialCostPrices[itemKey] = 0;
      }
      
      if (!sellingPrices[itemKey]) {
        initialSellingPrices[itemKey] = item.price || 0;
      }
      
      let itemStorageCost = dailyStorageCost[nmId] || 5;
      
      const matchingStorageItems = paidStorageData.filter(psi => psi.nmId === item.nmId);
      if (matchingStorageItems.length > 0) {
        const totalCost = matchingStorageItems.reduce((sum, psi) => sum + psi.warehousePrice, 0);
        itemStorageCost = totalCost / matchingStorageItems.length;
      }
      
      if (!dailySalesRates[itemKey]) {
        initialDailySales[itemKey] = averageDailySalesRate[nmId] || 0.1;
      }
      
      if (!storageCostRates[itemKey]) {
        initialStorageCosts[itemKey] = itemStorageCost;
      }
      
      if (!discountLevels[itemKey]) {
        initialDiscountLevels[itemKey] = 30;
      }
      
      if (!logisticsCosts[itemKey]) {
        initialLogisticsCosts[itemKey] = 150;
      }
      
      if (!wbCommissions[itemKey]) {
        initialWbCommissions[itemKey] = 15;
      }
      
      const salesRate = averageDailySalesRate[nmId] || 0.1;
      if (!lowStockThreshold[itemKey]) {
        initialLowStockThresholds[itemKey] = Math.max(3, Math.ceil(salesRate * 7));
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
    console.log("Расчет результатов анализа для элементов:", warehouseItems.length);
    return warehouseItems.map(item => {
      if (!item) {
        console.error("Обнаружен null или undefined элемент в warehouseItems при анализе");
        return null;
      }

      const nmId = item.nmId ? item.nmId.toString() : '0';
      const itemKey = getItemKey(item);
      
      console.log(`Анализ элемента: nmId=${nmId}, itemKey=${itemKey}`);
      
      const costPrice = costPrices[itemKey] || 0;
      const sellingPrice = sellingPrices[itemKey] || (item.price || 0);
      const dailySales = dailySalesRates[itemKey] || 0.1;
      const storageCost = storageCostRates[itemKey] || 5;
      const currentStock = item.quantityWarehousesFull || 0;
      const threshold = lowStockThreshold[itemKey] || Math.ceil(dailySales * 7);
      const logisticsCost = logisticsCosts[itemKey] || 150;
      const wbCommission = wbCommissions[itemKey] || 15;
      
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
        recommendedDiscount = discountLevels[itemKey] || 25;
        action = 'discount';
      }
      else if (isSlowMoving && !isLowMargin) {
        recommendedDiscount = discountLevels[itemKey] || 15;
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
          recommendedDiscount = Math.min(15, discountLevels[itemKey] || 15);
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
            recommendedDiscount = Math.min(50, discountLevels[itemKey] || 50);
          } else {
            action = 'keep';
            recommendedDiscount = 0;
          }
        }
      }
      
      if (savingsWithDiscount > 0 && action === 'keep') {
        action = 'discount';
        recommendedDiscount = discountLevels[itemKey] || 15;
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
    }).filter(Boolean) as AnalysisResult[];
  }, [
    warehouseItems, 
    costPrices, 
    sellingPrices, 
    dailySalesRates, 
    storageCostRates, 
    discountLevels, 
    lowStockThreshold,
    logisticsCosts,
    wbCommissions
  ]);

  const saveChangesToLocalStorage = () => {
    localStorage.setItem('product_cost_prices', JSON.stringify(costPrices));
    localStorage.setItem('product_selling_prices', JSON.stringify(sellingPrices));
    localStorage.setItem('product_low_stock_thresholds', JSON.stringify(lowStockThreshold));
    localStorage.setItem('product_logistics_costs', JSON.stringify(logisticsCosts));
    localStorage.setItem('product_wb_commissions', JSON.stringify(wbCommissions));
    
    toast({
      title: "Изменения сохранены",
      description: "Данные успешно сохранены в локальное хранилище",
    });
  };

  const handleFetchSalesData = async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    try {
      const apiKey = localStorage.getItem('current_api_key') || '';
      const report = await fetchFullPaidStorageReport(apiKey, startDate, endDate);
      if (report && report.length > 0) {
        toast({
          title: "Данные получены",
          description: `Загружено ${report.length} записей о продажах`,
        });
      } else {
        toast({
          title: "Нет данных",
          description: "За выбранный период данные о продажах не найдены",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ошибка при получении данных о продажах:", error);
      toast({
        title: "Ошибка получения данных",
        description: "Не удалось получить данные о продажах. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSalesDataDialogOpen(false);
    }
  };

  const handleDiscountLevelChange = (itemKey: string, level: number[]) => {
    setDiscountLevels(prev => ({
      ...prev,
      [itemKey]: level[0] || 0
    }));
  };

  const handleCostPriceChange = (itemKey: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setCostPrices(prev => ({
      ...prev,
      [itemKey]: numValue
    }));
  };

  const handleSellingPriceChange = (itemKey: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setSellingPrices(prev => ({
      ...prev,
      [itemKey]: numValue
    }));
  };

  const handleLogisticsCostChange = (itemKey: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setLogisticsCosts(prev => ({
      ...prev,
      [itemKey]: numValue
    }));
  };

  const handleWbCommissionChange = (itemKey: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setWbCommissions(prev => ({
      ...prev,
      [itemKey]: numValue
    }));
  };

  const handleDailySalesRateChange = (itemKey: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setDailySalesRates(prev => ({
      ...prev,
      [itemKey]: numValue
    }));
  };

  const handleStorageCostRateChange = (itemKey: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setStorageCostRates(prev => ({
      ...prev,
      [itemKey]: numValue
    }));
  };

  const handleLowStockThresholdChange = (itemKey: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setLowStockThreshold(prev => ({
        ...prev,
        [itemKey]: numValue
      }));
    }
  };

  const requestSort = (key: keyof AnalysisResult) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedResults = () => {
    if (!sortConfig.key) {
      return analysisResults;
    }

    return [...analysisResults].sort((a, b) => {
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;
      
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'remainItem') {
        aValue = a.remainItem.barcode;
        bValue = b.remainItem.barcode;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredResults = getSortedResults().filter(result => {
    const searchMatch = 
      result.remainItem.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.remainItem.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (result.remainItem.brand && result.remainItem.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (result.remainItem.subjectName && result.remainItem.subjectName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!searchMatch) return false;
    
    switch (selectedTab) {
      case 'discount':
        return result.action === 'discount' || result.action === 'sell';
      case 'keep':
        return result.action === 'keep';
      case 'low-stock':
        return result.lowStock;
      default:
        return true;
    }
  });
  
  const summaryStats = useMemo(() => {
    const totalItems = filteredResults.reduce((sum, item) => 
      sum + (item.remainItem.quantityWarehousesFull || 0), 0);
    
    const totalValue = filteredResults.reduce((sum, item) => 
      sum + (item.remainItem.quantityWarehousesFull || 0) * item.sellingPrice, 0);
    
    const totalStorageCost = filteredResults.reduce((sum, item) => 
      sum + item.totalStorageCost, 0);
    
    const totalProfitWithoutDiscount = filteredResults.reduce((sum, item) => 
      sum + item.profitWithoutDiscount, 0);
    
    const totalProfitWithDiscount = filteredResults.reduce((sum, item) => 
      sum + item.profitWithDiscount, 0);

    const totalSavings = totalProfitWithDiscount - totalProfitWithoutDiscount;
    
    const itemsToDiscount = filteredResults.filter(item => 
      item.action === 'discount' || item.action === 'sell').length;
    
    const lowStockItems = filteredResults.filter(item => item.lowStock).length;
    
    return {
      totalItems,
      totalValue,
      totalStorageCost,
      totalProfitWithoutDiscount,
      totalProfitWithDiscount,
      totalSavings,
      itemsToDiscount,
      lowStockItems
    };
  }, [filteredResults]);

  const DetailedAnalysis = ({ result }: { result: AnalysisResult }) => {
    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Основная информация</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Артикул</div>
              <div className="text-sm font-medium">{result.remainItem.vendorCode}</div>
              
              <div className="text-sm text-gray-500">Баркод</div>
              <div className="text-sm font-medium">{result.remainItem.barcode}</div>
              
              <div className="text-sm text-gray-500">Бренд</div>
              <div className="text-sm font-medium">{result.remainItem.brand}</div>
              
              <div className="text-sm text-gray-500">Категория</div>
              <div className="text-sm font-medium">{result.remainItem.subjectName}</div>
              
              <div className="text-sm text-gray-500">Текущая цена</div>
              <div className="text-sm font-medium">{formatCurrency(result.sellingPrice)}</div>
              
              <div className="text-sm text-gray-500">Себестоимость</div>
              <div className="text-sm font-medium">{formatCurrency(result.costPrice)}</div>
              
              <div className="text-sm text-gray-500">Склад</div>
              <div className="text-sm font-medium">{result.remainItem.warehouseName}</div>
              
              <div className="text-sm text-gray-500">Остаток</div>
              <div className="text-sm font-medium">{result.remainItem.quantityWarehousesFull}</div>
              
              <div className="text-sm text-gray-500">В пути к клиенту</div>
              <div className="text-sm font-medium">{result.remainItem.inWayToClient}</div>
              
              <div className="text-sm text-gray-500">Возвраты</div>
              <div className="text-sm font-medium">{result.remainItem.inWayFromClient}</div>
              
              <div className="text-sm text-gray-500">Прогноз дней до 0</div>
              <div className="text-sm font-medium">{formatDaysOfInventory(result.daysOfInventory)}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Параметры затрат и продаж</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-gray-500">Себестоимость</div>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={costPrices[getItemKey(result.remainItem)] || ''}
                  onChange={(e) => handleCostPriceChange(getItemKey(result.remainItem), e.target.value)}
                  className="w-24 text-sm"
                />
                <span className="ml-1 text-xs">₽</span>
              </div>
              
              <div className="text-sm text-gray-500">Продажная цена</div>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={sellingPrices[getItemKey(result.remainItem)] || ''}
                  onChange={(e) => handleSellingPriceChange(getItemKey(result.remainItem), e.target.value)}
                  className="w-24 text-sm"
                />
                <span className="ml-1 text-xs">₽</span>
              </div>
              
              <div className="text-sm text-gray-500">Продажи в день</div>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={dailySalesRates[getItemKey(result.remainItem)] || ''}
                  onChange={(e) => handleDailySalesRateChange(getItemKey(result.remainItem), e.target.value)}
                  className="w-24 text-sm"
                />
                <span className="ml-1 text-xs">шт.</span>
              </div>
              
              <div className="text-sm text-gray-500">Стоимость хранения</div>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={storageCostRates[getItemKey(result.remainItem)] || ''}
                  onChange={(e) => handleStorageCostRateChange(getItemKey(result.remainItem), e.target.value)}
                  className="w-24 text-sm"
                />
                <span className="ml-1 text-xs">₽/день</span>
              </div>
              
              <div className="text-sm text-gray-500">Логистика</div>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={logisticsCosts[getItemKey(result.remainItem)] || ''}
                  onChange={(e) => handleLogisticsCostChange(getItemKey(result.remainItem), e.target.value)}
                  className="w-24 text-sm"
                />
                <span className="ml-1 text-xs">₽/шт.</span>
              </div>
              
              <div className="text-sm text-gray-500">Комиссия WB</div>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={wbCommissions[getItemKey(result.remainItem)] || ''}
                  onChange={(e) => handleWbCommissionChange(getItemKey(result.remainItem), e.target.value)}
                  className="w-24 text-sm"
                />
                <span className="ml-1 text-xs">%</span>
              </div>
              
              <div className="text-sm text-gray-500">Мин. запас</div>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={lowStockThreshold[getItemKey(result.remainItem)] || ''}
                  onChange={(e) => handleLowStockThresholdChange(getItemKey(result.remainItem), e.target.value)}
                  className="w-24 text-sm"
                />
                <span className="ml-1 text-xs">шт.</span>
              </div>
              
              <div className="text-sm text-gray-500">Рекомендуемая скидка</div>
              <div className="flex items-center">
                <Slider
                  value={[discountLevels[getItemKey(result.remainItem)] || 0]}
                  min={0}
                  max={80}
                  step={5}
                  className="w-24"
                  onValueChange={(value) => handleDiscountLevelChange(getItemKey(result.remainItem), value)}
                />
                <span className="ml-2 text-xs">{discountLevels[getItemKey(result.remainItem)] || 0}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Анализ доходности</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Маржинальность</p>
                  <p className="text-lg font-semibold">
                    {result.profitMarginPercentage.toFixed(1)}%
                  </p>
                </div>
                <Badge className={
                  result.profitMarginPercentage > 30 ? "bg-green-500" : 
                  result.profitMarginPercentage > 15 ? "bg-amber-500" : "bg-red-500"
                }>
                  {result.profitMarginPercentage > 30 ? "Высокая" : 
                   result.profitMarginPercentage > 15 ? "Средняя" : "Низкая"}
                </Badge>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Затраты на хранение</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(result.totalStorageCost)}
                  </p>
                </div>
                <Badge className={
                  result.storageCostToRevenueRatio < 0.05 ? "bg-green-500" : 
                  result.storageCostToRevenueRatio < 0.1 ? "bg-amber-500" : "bg-red-500"
                }>
                  {result.storageCostToRevenueRatio < 0.05 ? "Низкие" : 
                   result.storageCostToRevenueRatio < 0.1 ? "Средние" : "Высокие"}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(result.storageCostToRevenueRatio * 100).toFixed(1)}% от выручки
              </p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Оборачиваемость</p>
                  <p className="text-lg font-semibold">
                    {formatDaysOfInventory(result.daysOfInventory)}
                  </p>
                </div>
                <Badge className={
                  result.daysOfInventory < 30 ? "bg-green-500" : 
                  result.daysOfInventory < 60 ? "bg-amber-500" : "bg-red-500"
                }>
                  {result.daysOfInventory < 30 ? "Быстрая" : 
                   result.daysOfInventory < 60 ? "Средняя" : "Медленная"}
                </Badge>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Прибыль без скидки</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(result.profitWithoutDiscount)}
                  </p>
                </div>
                <Badge className={
                  result.profitWithoutDiscount > 0 ? "bg-green-500" : "bg-red-500"
                }>
                  {result.profitWithoutDiscount > 0 ? "Прибыль" : "Убыток"}
                </Badge>
              </div>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Прибыль со скидкой {result.recommendedDiscount}%</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(result.profitWithDiscount)}
                  </p>
                </div>
                <Badge className={
                  result.profitWithDiscount > result.profitWithoutDiscount ? "bg-green-500" : 
                  result.profitWithDiscount > 0 ? "bg-amber-500" : "bg-red-500"
                }>
                  {result.profitWithDiscount > result.profitWithoutDiscount ? "Выгодно" : 
                   result.profitWithDiscount > 0 ? "Нейтрально" : "Невыгодно"}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {result.savingsWithDiscount > 0 ? "Экономия " : "Потеря "}
                {formatCurrency(Math.abs(result.savingsWithDiscount))}
              </p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-md">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Рекомендация</p>
                  <p className="text-lg font-semibold">
                    {result.action === 'keep' ? 'Оставить как есть' : 
                     result.action === 'discount' ? `Снизить цену на ${result.recommendedDiscount}%` : 
                     `Распродать со скидкой ${result.recommendedDiscount}%`}
                  </p>
                </div>
                <Badge className={
                  result.action === 'keep' ? "bg-blue-500" : 
                  result.action === 'discount' ? "bg-amber-500" : "bg-red-500"
                }>
                  {result.action === 'keep' ? "Держать" : 
                   result.action === 'discount' ? "Скидка" : "Распродажа"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Остатки по складам</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-slate-100">
                  <th className="text-sm text-left px-2 py-1">Склад</th>
                  <th className="text-sm text-right px-2 py-1">Количество</th>
                </tr>
                {result.remainItem.warehouses.map((warehouse, idx) => (
                  <tr key={idx} className="border-t border-gray-200">
                    <td className="text-sm px-2 py-1">{warehouse.warehouseName}</td>
                    <td className="text-sm text-right px-2 py-1">{warehouse.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Анализ рентабельности хранения</h2>
          <p className="text-gray-500">
            Оптимизируйте ваш склад и максимизируйте прибыль с помощью рекомендаций по управлению запасами
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setSalesDataDialogOpen(true)}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Расчет продаж
          </Button>
          <Button onClick={saveChangesToLocalStorage}>
            Сохранить изменения
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Товаров на складе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{summaryStats.totalItems.toLocaleString()}</div>
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Общее количество единиц товара
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Стоимость запасов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalValue)}</div>
              <Banknote className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              По текущим ценам продажи
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Затраты на хранение</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalStorageCost)}</div>
              <WarehouseIcon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Прогнозируемые расходы на хранение
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Экономия от скидок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalSavings)}</div>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {summaryStats.itemsToDiscount} товаров рекомендуется к скидке
            </p>
          </CardContent>
        </Card>
      </div>
      
      <SalesDataDialog 
        open={salesDataDialogOpen} 
        onOpenChange={setSalesDataDialogOpen}
        onFetchData={handleFetchSalesData}
        isLoading={isLoading}
      />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Tabs 
            value={selectedTab} 
            onValueChange={(value) => setSelectedTab(value as any)}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="all">
                Все товары
                <Badge variant="outline" className="ml-2">
                  {analysisResults.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="discount">
                Рекомендуемые скидки
                <Badge variant="outline" className="ml-2">
                  {analysisResults.filter(r => r.action === 'discount' || r.action === 'sell').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="keep">
                Оставить как есть
                <Badge variant="outline" className="ml-2">
                  {analysisResults.filter(r => r.action === 'keep').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="low-stock">
                Низкий запас
                <Badge variant="outline" className="ml-2">
                  {analysisResults.filter(r => r.lowStock).length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <SearchInput
          placeholder="Поиск по артикулу, баркоду, бренду..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          clearable
          onClear={() => setSearchTerm('')}
        />
        
        {filteredResults.length === 0 ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Нет данных</AlertTitle>
            <AlertDescription>
              По выбранным фильтрам не найдено товаров. Попробуйте изменить параметры поиска.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Фото</TableHead>
                  <TableHead>
                    <button 
                      className="flex items-center"
                      onClick={() => requestSort('remainItem')}
                    >
                      Товар
                      {sortConfig.key === 'remainItem' && (
                        sortConfig.direction === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button 
                      className="flex items-center justify-end w-full"
                      onClick={() => requestSort('sellingPrice')}
                    >
                      Цена
                      {sortConfig.key === 'sellingPrice' && (
                        sortConfig.direction === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button 
                      className="flex items-center justify-end w-full"
                      onClick={() => requestSort('daysOfInventory')}
                    >
                      Остаток
                      {sortConfig.key === 'daysOfInventory' && (
                        sortConfig.direction === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button 
                      className="flex items-center justify-end w-full"
                      onClick={() => requestSort('profitMarginPercentage')}
                    >
                      Маржа
                      {sortConfig.key === 'profitMarginPercentage' && (
                        sortConfig.direction === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button 
                      className="flex items-center justify-end w-full"
                      onClick={() => requestSort('totalStorageCost')}
                    >
                      Хранение
                      {sortConfig.key === 'totalStorageCost' && (
                        sortConfig.direction === 'asc' ? 
                        <ArrowUp className="ml-1 h-4 w-4" /> : 
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <Popover key={getItemKey(result.remainItem)}>
                    <PopoverTrigger asChild>
                      <TableRow className="cursor-pointer">
                        <TableCell>
                          {result.remainItem.photoLink ? (
                            <img 
                              src={result.remainItem.photoLink} 
                              alt={result.remainItem.vendorCode}
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded">
                              <Package className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {result.remainItem.vendorCode}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            {result.remainItem.barcode}
                            {result.lowStock && (
                              <AlertTriangle className="h-3 w-3 text-amber-500 ml-1" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>{formatCurrency(result.sellingPrice)}</div>
                          {result.recommendedDiscount > 0 && (
                            <div className="text-sm text-red-500">
                              -{result.recommendedDiscount}% = {formatCurrency(result.discountedPrice)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <div>
                              {result.remainItem.quantityWarehousesFull}
                              <span className="text-xs text-gray-500 ml-1">шт.</span>
                            </div>
                            <div className="w-24">
                              <Progress value={result.stockLevelPercentage} className="h-1" />
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDaysOfInventory(result.daysOfInventory)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={
                            result.profitMarginPercentage > 30 ? "text-green-600" : 
                            result.profitMarginPercentage > 15 ? "text-amber-600" : "text-red-600"
                          }>
                            {result.profitMarginPercentage.toFixed(1)}%
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>{formatCurrency(result.totalStorageCost)}</div>
                          <div className="text-xs text-gray-500">
                            {(result.storageCostToRevenueRatio * 100).toFixed(1)}% от выручки
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={
                            result.action === 'keep' ? "bg-blue-500" : 
                            result.action === 'discount' ? "bg-amber-500" : "bg-red-500"
                          }>
                            {result.action === 'keep' ? "Держать" : 
                             result.action === 'discount' ? "Скидка" : "Распродажа"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </PopoverTrigger>
                    <PopoverContent className="w-full max-w-screen-lg p-0" align="center">
                      <DetailedAnalysis result={result} />
                    </PopoverContent>
                  </Popover>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageProfitabilityAnalysis;

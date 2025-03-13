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
  Search, ArrowUpDown, Package, TrendingDown, Banknote, Warehouse as WarehouseIcon, AlertTriangle, 
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
import { fetchFullPaidStorageReport, fetchSalesData, fetchProductPrices } from '@/services/suppliesApi';
import { format } from 'date-fns';

interface StorageProfitabilityAnalysisProps {
  warehouseItems: WarehouseRemainItem[];
  paidStorageData?: PaidStorageItem[];
  averageDailySalesRate?: Record<number, number>;
  dailyStorageCost?: Record<number, number>;
  apiKey?: string;
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
  apiKey = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'discount' | 'keep' | 'low-stock'>('all');
  const [costPrices, setCostPrices] = useState<Record<number, number | null>>({});
  const [sellingPrices, setSellingPrices] = useState<Record<number, number | null>>({});
  const [dailySalesRates, setDailySalesRates] = useState<Record<number, number | null>>({});
  const [storageCostRates, setStorageCostRates] = useState<Record<number, number | null>>({});
  const [discountLevels, setDiscountLevels] = useState<Record<number, number>>({});
  const [lowStockThreshold, setLowStockThreshold] = useState<Record<number, number>>({});
  const [logisticsCosts, setLogisticsCosts] = useState<Record<number, number | null>>({});
  const [wbCommissions, setWbCommissions] = useState<Record<number, number | null>>({});
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() + 30))
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AnalysisResult | '',
    direction: 'asc' | 'desc'
  }>({ key: '', direction: 'asc' });
  const [salesDataDialogOpen, setSalesDataDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const [storageData, setStorageData] = useState<PaidStorageItem[]>([]);
  const [localApiKey, setLocalApiKey] = useState<string>(() => apiKey || localStorage.getItem('wb_api_key') || '');
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

    const storedLogisticsCosts = localStorage.getItem('product_logistics_costs');
    if (storedLogisticsCosts) {
      setLogisticsCosts(JSON.parse(storedLogisticsCosts));
    }

    const storedWbCommissions = localStorage.getItem('product_wb_commissions');
    if (storedWbCommissions) {
      setWbCommissions(JSON.parse(storedWbCommissions));
    }

    const initialDailySales: Record<number, number | null> = {};
    const initialStorageCosts: Record<number, number | null> = {};
    const initialDiscountLevels: Record<number, number> = {};
    const initialLowStockThresholds: Record<number, number> = {};
    const initialCostPrices: Record<number, number | null> = {};
    const initialSellingPrices: Record<number, number | null> = {};
    const initialLogisticsCosts: Record<number, number | null> = {};
    const initialWbCommissions: Record<number, number | null> = {};

    warehouseItems.forEach(item => {
      const nmId = item.nmId;
      
      if (!costPrices[nmId]) {
        initialCostPrices[nmId] = 0;
      }
      
      if (!sellingPrices[nmId]) {
        initialSellingPrices[nmId] = item.price || 0;
      }
      
      let itemStorageCost = dailyStorageCost[nmId] || 5;
      
      const matchingStorageItems = paidStorageData.filter(psi => psi.nmId === nmId);
      if (matchingStorageItems.length > 0) {
        const totalCost = matchingStorageItems.reduce((sum, psi) => sum + psi.warehousePrice, 0);
        itemStorageCost = totalCost / matchingStorageItems.length;
      }
      
      if (!dailySalesRates[nmId]) {
        initialDailySales[nmId] = averageDailySalesRate[nmId] || 0.1;
      }
      
      if (!storageCostRates[nmId]) {
        initialStorageCosts[nmId] = itemStorageCost;
      }
      
      if (!discountLevels[nmId]) {
        initialDiscountLevels[nmId] = 30;
      }
      
      if (!logisticsCosts[nmId]) {
        initialLogisticsCosts[nmId] = 150;
      }
      
      if (!wbCommissions[nmId]) {
        initialWbCommissions[nmId] = 15;
      }
      
      const salesRate = averageDailySalesRate[nmId] || 0.1;
      if (!lowStockThreshold[nmId]) {
        initialLowStockThresholds[nmId] = Math.max(3, Math.ceil(salesRate * 7));
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

  const updateCostPrice = (nmId: number, value: string) => {
    setCostPrices(prev => {
      const newPrices = { ...prev };
      newPrices[nmId] = value === "" ? null : Number(value);
      return newPrices;
    });
  };

  const updateSellingPrice = (nmId: number, value: string) => {
    setSellingPrices(prev => {
      const newPrices = { ...prev };
      newPrices[nmId] = value === "" ? null : Number(value);
      return newPrices;
    });
  };

  const updateDailySales = (nmId: number, value: string) => {
    setDailySalesRates(prev => {
      const newRates = { ...prev };
      newRates[nmId] = value === "" ? null : Number(value);
      return newRates;
    });
  };

  const updateStorageCost = (nmId: number, value: string) => {
    setStorageCostRates(prev => {
      const newRates = { ...prev };
      newRates[nmId] = value === "" ? null : Number(value);
      return newRates;
    });
  };

  const updateLogisticsCost = (nmId: number, value: string) => {
    setLogisticsCosts(prev => {
      const newCosts = { ...prev };
      newCosts[nmId] = value === "" ? null : Number(value);
      return newCosts;
    });
  };

  const updateWbCommission = (nmId: number, value: string) => {
    setWbCommissions(prev => {
      const newCommissions = { ...prev };
      newCommissions[nmId] = value === "" ? null : Number(value);
      return newCommissions;
    });
  };

  const loadPaidStorageData = async () => {
    if (!localApiKey) {
      toast({
        title: "Ошибка авторизации",
        description: 'Необходима авторизация для загрузки данных о платном хранении',
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoadingStorage(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const dateFrom = startDate.toISOString().split('T')[0];
      const dateTo = new Date().toISOString().split('T')[0];
      
      const data = await fetchFullPaidStorageReport(localApiKey, dateFrom, dateTo);
      setStorageData(data);
      
      toast({
        title: "Данные загружены",
        description: `Загружено ${data.length} записей о платном хранении`
      });
    } catch (error: any) {
      console.error('Ошибка при загрузке данных о платном хранении:', error);
      toast({
        title: "Ошибка загрузки",
        description: `Не удалось загрузить данные: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoadingStorage(false);
    }
  };

  const fetchSalesAndStorageData = async (startDate: Date, endDate: Date) => {
    if (!localApiKey) {
      toast({
        title: "Ошибка авторизации",
        description: 'Необходим API-ключ Wildberries для получения данных',
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const dateFrom = format(startDate, 'yyyy-MM-dd');
      const dateTo = format(endDate, 'yyyy-MM-dd');
      
      toast({
        title: "Загрузка данных",
        description: "Получение данных о продажах и хранении...",
      });
      
      console.log(`Запрос данных за период: ${dateFrom} - ${dateTo}`);
      
      // Получаем данные о продажах
      const salesData = await fetchSalesData(localApiKey, dateFrom, dateTo);
      
      // Получаем коды всех товаров
      const nmIds = warehouseItems.map(item => item.nmId);
      
      // Получаем актуальные цены
      const pricesData = await fetchProductPrices(localApiKey, nmIds);
      
      // Обновляем состояние компонента с полученными данными
      setDailySalesRates(prevRates => {
        const newRates = { ...prevRates };
        
        Object.entries(salesData).forEach(([nmId, salesRate]) => {
          newRates[Number(nmId)] = Math.max(0.01, salesRate);
        });
        
        return newRates;
      });
      
      setSellingPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        
        Object.entries(pricesData).forEach(([nmId, price]) => {
          if (price > 0) {
            newPrices[Number(nmId)] = price;
          }
        });
        
        return newPrices;
      });
      
      // Пробуем загрузить данные о платном хранении за тот же период
      try {
        const storageData = await fetchFullPaidStorageReport(localApiKey, dateFrom, dateTo);
        
        // Группируем данные о хранении по nmId
        const storageByNmId: Record<number, number[]> = {};
        
        storageData.forEach(item => {
          const nmId = item.nmId;
          if (!storageByNmId[nmId]) {
            storageByNmId[nmId] = [];
          }
          storageByNmId[nmId].push(item.warehousePrice);
        });
        
        // Рассчитываем среднюю стоимость хранения для каждого товара
        const avgStorageCosts: Record<number, number> = {};
        
        Object.entries(storageByNmId).forEach(([nmId, costs]) => {
          const sum = costs.reduce((total, cost) => total + cost, 0);
          avgStorageCosts[Number(nmId)] = costs.length > 0 ? sum / costs.length : 5; // По умолчанию 5, если нет данных
        });
        
        // Обновляем состояние с полученными данными о стоимости хранения
        setStorageCostRates(prevRates => {
          const newRates = { ...prevRates };
          
          Object.entries(avgStorageCosts).forEach(([nmId, cost]) => {
            newRates[Number(nmId)] = Math.max(0.1, cost);
          });
          
          return newRates;
        });
      } catch (storageError) {
        console.error("Ошибка при загрузке данных о платном хранении:", storageError);
        // Продолжаем выполнение даже если данные о хранении не загрузились
      }
      
      setSalesDataDialogOpen(false);
      
      toast({
        title: "Данные получены",
        description: `Данными о продажах за период ${format(startDate, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')} успешно загружены`,
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
        label: "Медленная оборачиваемость",
        description: "Товар продается медленнее, чем за 60 дней",
        value: formatDaysOfInventory(result.daysOfInventory),
        status: "warning",
        icon: <Clock className="h-3.5 w-3.5 text-amber-500" />
      });
    } else {
      factors.push({
        label: "Хорошая оборачиваемость",
        description: "Товар продается быстрее, чем за 60 дней",
        value: formatDaysOfInventory(result.daysOfInventory),
        status: "positive",
        icon: <Clock className="h-3.5 w-3.5 text-emerald-500" />
      });
    }
    
    return (
      <div className="space-y-2">
        {factors.map((factor, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1">
              {factor.icon}
              <span>{factor.label}</span>
            </div>
            <span className={factor.status === "warning" ? "text-amber-500" : "text-emerald-500"}>
              {factor.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
            <div>
              <CardTitle>Анализ прибыльности хранения</CardTitle>
              <CardDescription>
                Оценка хранения товаров и рекомендации по управлению запасами
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSalesDataDialogOpen(true)}
                disabled={isLoading}
              >
                <Download className="mr-1 h-4 w-4" />
                Получить данные о продажах
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={loadPaidStorageData}
                disabled={isLoadingStorage}
              >
                {isLoadingStorage ? (
                  <>
                    <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Banknote className="mr-1 h-4 w-4" />
                    Данные о платном хранении
                  </>
                )}
              </Button>
              <Button size="sm" onClick={savePriceData}>
                <ArrowDown className="mr-1 h-4 w-4" />
                Сохранить данные
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Всего товаров</div>
                        <div className="text-2xl font-bold">{analysisSummary.totalItems}</div>
                      </div>
                    </div>
                    <Badge variant="outline">{analysisSummary.lowStockItems} с низким запасом</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-rose-50 rounded p-2">
                      <div className="text-rose-600 text-xs font-medium">Продать</div>
                      <div className="text-xl font-bold">{analysisSummary.sellItems}</div>
                    </div>
                    <div className="bg-amber-50 rounded p-2">
                      <div className="text-amber-600 text-xs font-medium">Скидка</div>
                      <div className="text-xl font-bold">{analysisSummary.discountItems}</div>
                    </div>
                    <div className="bg-emerald-50 rounded p-2">
                      <div className="text-emerald-600 text-xs font-medium">Держать</div>
                      <div className="text-xl font-bold">{analysisSummary.keepItems}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <WarehouseIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Затраты на хранение</div>
                        <div className="text-2xl font-bold">{formatCurrency(analysisSummary.totalStorageCost)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Ожидаемый срок окупаемости</span>
                      <span className="font-medium">30 дней</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Доля в общих затратах</span>
                      <span className="font-medium">12%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Потенциальная экономия</div>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(analysisSummary.potentialSavings)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Процент от общих затрат</span>
                      <span className="font-medium text-emerald-600">
                        {analysisSummary.totalStorageCost > 0 
                          ? `${Math.round((analysisSummary.potentialSavings / analysisSummary.totalStorageCost) * 100)}%` 
                          : '0%'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Товары со скидкой</span>
                      <span className="font-medium">{analysisSummary.discountItems} шт.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Заканчивается запас</div>
                        <div className="text-2xl font-bold">{analysisSummary.itemsStockingOutBeforeTarget}</div>
                      </div>
                    </div>
                    <DatePicker 
                      value={targetDate} 
                      onValueChange={setTargetDate}
                      placeholder="Выберите дату"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Товары с низким запасом</span>
                      <span className="font-medium">{analysisSummary.lowStockItems} шт.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <Tabs 
                  value={selectedTab} 
                  onValueChange={(value) => setSelectedTab(value as any)}
                  className="w-full md:w-auto"
                >
                  <TabsList className="grid w-full md:w-auto grid-cols-4">
                    <TabsTrigger value="all">Все товары</TabsTrigger>
                    <TabsTrigger value="discount">Скидки</TabsTrigger>
                    <TabsTrigger value="keep">Держать</TabsTrigger>
                    <TabsTrigger value="low-stock">Низкий запас</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по артикулу или названию..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Товар</TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => requestSort('stockLevelPercentage')}
                        >
                          Остаток
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => requestSort('daysOfInventory')}
                        >
                          Дней хранения
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => requestSort('dailySales')}
                        >
                          Продаж/день
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => requestSort('dailyStorageCost')}
                        >
                          Стоимость хранения
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => requestSort('totalStorageCost')}
                        >
                          Всего за хранение
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => requestSort('action')}
                        >
                          Рекомендация
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Package className="h-8 w-8 mb-2" />
                            <p>Нет данных для отображения</p>
                            <p className="text-sm">Попробуйте изменить параметры фильтрации</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResults.map((result) => (
                        <TableRow key={result.remainItem.nmId}>
                          <TableCell>
                            <div className="flex items-start space-x-2">
                              <div className="flex-1 space-y-1">
                                <div className="font-medium">{result.remainItem.brand}</div>
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {result.remainItem.subjectName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Артикул: {result.remainItem.vendorCode || 'N/A'} | NM: {result.remainItem.nmId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{result.remainItem.quantityWarehousesFull || 0} шт.</div>
                              {getStockLevelIndicator(result)}
                              <div className="text-xs text-muted-foreground">
                                {result.lowStock ? (
                                  <span className="text-rose-500 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Дефицит скоро
                                  </span>
                                ) : (
                                  <span>
                                    Достаточный запас до {formatDate(result.projectedStockoutDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{formatDaysOfInventory(result.daysOfInventory)}</div>
                              <div className="text-xs">
                                {result.daysOfInventory > 60 ? (
                                  <span className="text-amber-500">Медленная оборачиваемость</span>
                                ) : (
                                  <span className="text-emerald-500">Быстрая оборачиваемость</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <div className="font-medium">{result.dailySales.toFixed(2)} шт.</div>
                              <div className="w-28">
                                <Input 
                                  size={5}
                                  type="number"
                                  value={dailySalesRates[result.remainItem.nmId] || ''}
                                  onChange={(e) => updateDailySales(result.remainItem.nmId, e.target.value)}
                                  step="0.1"
                                  min="0.1"
                                  className="h-7 text-sm"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <div className="font-medium">{formatCurrency(result.dailyStorageCost)} / день</div>
                              <div className="w-28">
                                <Input 
                                  size={5}
                                  type="number"
                                  value={storageCostRates[result.remainItem.nmId] || ''}
                                  onChange={(e) => updateStorageCost(result.remainItem.nmId, e.target.value)}
                                  step="0.1"
                                  min="0.1"
                                  className="h-7 text-sm"
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" className="px-2 hover:bg-transparent">
                                  <div className="text-left mr-2">
                                    <div className="font-medium">{formatCurrency(result.totalStorageCost)}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {(result.storageCostToRevenueRatio * 100).toFixed(1)}% от выручки
                                    </div>
                                  </div>
                                  <BarChart4 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4" align="end">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Экономика хранения</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm">Себестоимость:</span>
                                        <div className="w-28">
                                          <Input 
                                            size={5}
                                            type="number"
                                            value={costPrices[result.remainItem.nmId] || ''}
                                            onChange={(e) => updateCostPrice(result.remainItem.nmId, e.target.value)}
                                            className="h-7 text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Цена продажи:</span>
                                        <div className="w-28">
                                          <Input 
                                            size={5}
                                            type="number"
                                            value={sellingPrices[result.remainItem.nmId] || ''}
                                            onChange={(e) => updateSellingPrice(result.remainItem.nmId, e.target.value)}
                                            className="h-7 text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Комиссия WB, %:</span>
                                        <div className="w-28">
                                          <Input 
                                            size={5}
                                            type="number"
                                            value={wbCommissions[result.remainItem.nmId] || ''}
                                            onChange={(e) => updateWbCommission(result.remainItem.nmId, e.target.value)}
                                            className="h-7 text-sm"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm">Логистика:</span>
                                        <div className="w-28">
                                          <Input 
                                            size={5}
                                            type="number"
                                            value={logisticsCosts[result.remainItem.nmId] || ''}
                                            onChange={(e) => updateLogisticsCost(result.remainItem.nmId, e.target.value)}
                                            className="h-7 text-sm"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Факторы анализа</h4>
                                    {getAnalysisStatusIndicator(result)}
                                  </div>
                                  
                                  <Separator />
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Экономический эффект скидки</h4>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>Рекомендуемая скидка:</span>
                                        <span className="font-medium">{result.recommendedDiscount}%</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Slider 
                                          value={[discountLevels[result.remainItem.nmId] || 0]}
                                          onValueChange={(value) => {
                                            setDiscountLevels(prev => ({
                                              ...prev,
                                              [result.remainItem.nmId]: value[0]
                                            }))
                                          }}
                                          max={50}
                                          step={1}
                                          className="flex-1"
                                        />
                                        <span className="w-6 text-sm">{discountLevels[result.remainItem.nmId] || 0}%</span>
                                      </div>
                                      
                                      <div className="flex justify-between text-sm">
                                        <span>Прибыль без скидки:</span>
                                        <span className="font-medium">{formatCurrency(result.profitWithoutDiscount)}</span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Прибыль со скидкой:</span>
                                        <span className={result.profitWithDiscount >= result.profitWithoutDiscount ? "font-medium text-emerald-600" : "font-medium text-rose-500"}>
                                          {formatCurrency(result.profitWithDiscount)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span>Экономия:</span>
                                        <span className={result.savingsWithDiscount > 0 ? "font-medium text-emerald-600" : "font-medium text-rose-500"}>
                                          {formatCurrency(result.savingsWithDiscount)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {getActionBadge(result.action)}
                              <div className="text-xs text-muted-foreground">
                                {result.action === 'sell' && 'Стоимость хранения превышает прибыль'}
                                {result.action === 'discount' && 'Скидка ускорит оборачиваемость'}
                                {result.action === 'keep' && 'Оптимальная оборачиваемость'}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SalesDataDialog 
        open={salesDataDialogOpen} 
        onOpenChange={setSalesDataDialogOpen}
        onFetchData={fetchSalesAndStorageData}
        isLoading={isLoading}
      />
    </div>
  );
};

export default StorageProfitabilityAnalysis;



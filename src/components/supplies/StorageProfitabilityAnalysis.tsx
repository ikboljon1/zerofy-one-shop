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



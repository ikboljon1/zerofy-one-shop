import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { subDays } from "date-fns";
import { AlertCircle, Target, PackageX, Tag, Loader2, BadgePercent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

import DateRangePicker from "./components/DateRangePicker";
import KeyMetrics from "./components/KeyMetrics";
import SalesChart from "./components/SalesChart";
import DeductionsChart from "./components/DeductionsChart";
import PieChartCard from "./components/PieChartCard";
import ExpenseBreakdown from "./components/ExpenseBreakdown";
import ProductList from "./components/ProductList";

import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { getAdvertCosts, getAdvertBalance, getAdvertPayments } from "@/services/advertisingApi";
import { formatCurrency, roundToTwoDecimals } from "@/utils/formatCurrency";
import { getAnalyticsData } from "@/utils/storeUtils";

interface AnalyticsData {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
      deductions?: number;
    };
    netProfit: number;
    acceptance: number;
  };
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
  }>;
  productSales: Array<{
    subject_name: string;
    quantity: number;
  }>;
  productReturns: Array<{
    name: string;
    value: number;
    count?: number;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
}

interface AdvertisingBreakdown {
  search: number;
}

interface DeductionsTimelineItem {
  date: string;
  logistic: number;
  storage: number;
  penalties: number;
  acceptance: number;
  advertising: number;
  deductions?: number;
}

const emptyAnalyticsData: AnalyticsData = {
  currentPeriod: {
    sales: 0,
    transferred: 0,
    expenses: {
      total: 0,
      logistics: 0,
      storage: 0,
      penalties: 0,
      advertising: 0,
      acceptance: 0,
      deductions: 0
    },
    netProfit: 0,
    acceptance: 0
  },
  dailySales: [],
  productSales: [],
  productReturns: []
};

const AnalyticsSection = () => {
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<AnalyticsData>(emptyAnalyticsData);
  const [penalties, setPenalties] = useState<Array<{name: string, value: number}>>([]);
  const [deductions, setDeductions] = useState<Array<{name: string, value: number}>>([]);
  const [returns, setReturns] = useState<Array<{name: string, value: number}>>([]);
  const [deductionsTimeline, setDeductionsTimeline] = useState<DeductionsTimelineItem[]>([]);
  const [productAdvertisingData, setProductAdvertisingData] = useState<Array<{name: string, value: number}>>([]);
  const [advertisingBreakdown, setAdvertisingBreakdown] = useState<AdvertisingBreakdown>({
    search: 0
  });
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [dataTimestamp, setDataTimestamp] = useState<number>(Date.now());
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const getSelectedStore = () => {
    const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
    const store = stores.find((store: any) => store.isSelected) || null;
    
    if (store && store.id !== selectedStoreId) {
      setSelectedStoreId(store.id);
      return store;
    }
    
    return store;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const selectedStore = getSelectedStore();
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'"
        });
        setIsLoading(false);
        setHasError(true);
        return;
      }

      const cachedData = getAnalyticsData(selectedStore.id);
      const shouldRefresh = !cachedData.data || 
                           (Date.now() - cachedData.timestamp > 5 * 60 * 1000);
      
      if (!shouldRefresh && cachedData.data) {
        console.log('Using cached analytics data');
        setData(cachedData.data);
        setPenalties(cachedData.penalties || []);
        setDeductions(cachedData.deductions || []);
        setReturns(cachedData.returns || []);
        setDeductionsTimeline(cachedData.deductionsTimeline || []);
        setProductAdvertisingData(cachedData.productAdvertisingData || []);
        setAdvertisingBreakdown(cachedData.advertisingBreakdown || { search: 0 });
        setDataTimestamp(cachedData.timestamp);
        setIsLoading(false);
        return;
      }

      const statsData = await fetchWildberriesStats(selectedStore.apiKey, dateFrom, dateTo);
      
      let totalAdvertisingCost = 0;
      try {
        const advertCosts = await getAdvertCosts(dateFrom, dateTo, selectedStore.apiKey);
        
        if (advertCosts && advertCosts.length > 0) {
          totalAdvertisingCost = advertCosts.reduce((sum, cost) => sum + cost.updSum, 0);
          totalAdvertisingCost = roundToTwoDecimals(totalAdvertisingCost);
          
          setAdvertisingBreakdown({
            search: totalAdvertisingCost
          });
          
          const campaignCosts: Record<string, number> = {};
          
          advertCosts.forEach(cost => {
            if (!campaignCosts[cost.campName]) {
              campaignCosts[cost.campName] = 0;
            }
            campaignCosts[cost.campName] += cost.updSum;
          });
          
          const advertisingDataArray = Object.entries(campaignCosts)
            .map(([name, value]) => ({ name, value: roundToTwoDecimals(value) }))
            .sort((a, b) => b.value - a.value);
          
          let topProducts = advertisingDataArray.slice(0, 4);
          const otherProducts = advertisingDataArray.slice(4);
          
          if (otherProducts.length > 0) {
            const otherSum = roundToTwoDecimals(otherProducts.reduce((sum, item) => sum + item.value, 0));
            topProducts.push({ name: "Другие товары", value: otherSum });
          }
          
          setProductAdvertisingData(topProducts);
        } else {
          setProductAdvertisingData([]);
          setAdvertisingBreakdown({
            search: 0
          });
        }
      } catch (error) {
        console.error('Error fetching advertising data:', error);
        setProductAdvertisingData([]);
        setAdvertisingBreakdown({
          search: 0
        });
      }
      
      if (statsData) {
        const sales = roundToTwoDecimals(statsData.currentPeriod.sales);
        const logistics = roundToTwoDecimals(statsData.currentPeriod.expenses.logistics);
        const storage = roundToTwoDecimals(statsData.currentPeriod.expenses.storage);
        const penalties = roundToTwoDecimals(statsData.currentPeriod.expenses.penalties);
        const acceptance = roundToTwoDecimals(statsData.currentPeriod.expenses.acceptance || 0);
        const deductionsValue = roundToTwoDecimals(statsData.currentPeriod.expenses.deductions || 0);
        const returns = statsData.productReturns ? 
          roundToTwoDecimals(statsData.productReturns.reduce((sum, item) => sum + item.value, 0)) : 0;
        
        const forPay = roundToTwoDecimals(statsData.currentPeriod.transferred || 0);
        const netProfit = roundToTwoDecimals(
          forPay - logistics - storage - penalties - totalAdvertisingCost - acceptance - deductionsValue - returns
        );
        
        const modifiedData: AnalyticsData = {
          currentPeriod: {
            ...statsData.currentPeriod,
            sales: sales,
            transferred: roundToTwoDecimals(statsData.currentPeriod.transferred),
            netProfit: netProfit,
            expenses: {
              ...statsData.currentPeriod.expenses,
              logistics: logistics,
              storage: storage,
              penalties: penalties,
              advertising: totalAdvertisingCost,
              acceptance: acceptance,
              deductions: deductionsValue
            }
          },
          dailySales: statsData.dailySales,
          productSales: statsData.productSales,
          productReturns: statsData.productReturns || [],
          topProfitableProducts: statsData.topProfitableProducts,
          topUnprofitableProducts: statsData.topUnprofitableProducts
        };
        
        modifiedData.currentPeriod.expenses.total = roundToTwoDecimals(
          logistics + storage + penalties + totalAdvertisingCost + acceptance + deductionsValue
        );
        
        setData(modifiedData);
        
        if (statsData.penaltiesData && statsData.penaltiesData.length > 0) {
          const roundedPenalties = statsData.penaltiesData.map(item => ({
            ...item,
            value: roundToTwoDecimals(item.value)
          }));
          setPenalties(roundedPenalties);
        } else {
          setPenalties([]);
        }
        
        if (statsData.deductionsData && statsData.deductionsData.length > 0) {
          const roundedDeductions = statsData.deductionsData.map(item => ({
            ...item,
            value: roundToTwoDecimals(item.value)
          }));
          setDeductions(roundedDeductions);
        } else {
          setDeductions([]);
        }
        
        if (statsData.productReturns && statsData.productReturns.length > 0) {
          const roundedReturns = statsData.productReturns.map(item => ({
            ...item,
            value: roundToTwoDecimals(item.value)
          }));
          setReturns(roundedReturns);
        } else {
          setReturns([]);
        }
        
        let newDeductionsTimeline = [];
        if (statsData.dailySales && statsData.dailySales.length > 0) {
          const daysCount = statsData.dailySales.length;
          newDeductionsTimeline = statsData.dailySales.map((day: any) => {
            const logistic = roundToTwoDecimals(modifiedData.currentPeriod.expenses.logistics / daysCount);
            const storage = roundToTwoDecimals(modifiedData.currentPeriod.expenses.storage / daysCount);
            const penalties = roundToTwoDecimals(modifiedData.currentPeriod.expenses.penalties / daysCount);
            const acceptance = roundToTwoDecimals(modifiedData.currentPeriod.expenses.acceptance / daysCount || 0);
            const advertising = roundToTwoDecimals(modifiedData.currentPeriod.expenses.advertising / daysCount || 0);
            const deductions = roundToTwoDecimals(modifiedData.currentPeriod.expenses.deductions / daysCount || 0);
            
            return {
              date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date().toISOString().split('T')[0],
              logistic,
              storage,
              penalties,
              acceptance,
              advertising,
              deductions
            };
          });
        } else {
          newDeductionsTimeline = Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            logistic: 0,
            storage: 0, 
            penalties: 0,
            acceptance: 0,
            advertising: 0,
            deductions: 0
          }));
        }
        
        setDeductionsTimeline(newDeductionsTimeline);
        
        const analyticsDataToCache = {
          data: modifiedData,
          penalties: roundedPenalties || [],
          deductions: roundedDeductions || [],
          returns: roundedReturns || [],
          deductionsTimeline: newDeductionsTimeline,
          productAdvertisingData: topProducts || [],
          advertisingBreakdown: { search: totalAdvertisingCost },
          timestamp: Date.now(),
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString()
        };
        
        localStorage.setItem(`marketplace_analytics_${selectedStore.id}`, JSON.stringify(analyticsDataToCache));
        
        setDataTimestamp(Date.now());
        
        toast({
          title: "Успех",
          description: "Аналитические данные успешно обновлены",
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setHasError(true);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аналитические данные",
      });
      
      setData(emptyAnalyticsData);
      setDeductionsTimeline(Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logistic: 0, 
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0,
        deductions: 0
      })));
      
      setPenalties([]);
      setDeductions([]);
      setReturns([]);
      setProductAdvertisingData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selectedStore = getSelectedStore();
    if (selectedStore) {
      fetchData();
    } else {
      setIsLoading(false);
      setHasError(true);
      
      setData(emptyAnalyticsData);
      setDeductionsTimeline(Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        logistic: 0, 
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0,
        deductions: 0
      })));
      
      setPenalties([]);
      setDeductions([]);
      setProductAdvertisingData([]);
      setReturns([]);
    }
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchData();
    }
  }, [selectedStoreId]);

  const hasAdvertisingData = productAdvertisingData && productAdvertisingData.length > 0;
  const hasPenaltiesData = penalties && penalties.length > 0;
  const hasDeductionsData = deductions && deductions.length > 0;
  const hasReturnsData = returns && returns.length > 0;

  const handleDateChange = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Загрузка аналитики...</p>
        </div>
      </div>
    );
  }
  
  if (hasError) {
    return (
      <div className="space-y-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800/30 shadow-lg">
          <DateRangePicker 
            dateFrom={dateFrom}
            dateTo={dateTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            onApplyDateRange={handleDateChange}
            onUpdate={handleDateChange}
          />
        </div>
        
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Ошибка загрузки данных</h3>
          <p className="text-muted-foreground max-w-md">
            Не удалось загрузить аналитические данные. Возможно, превышен лимит запросов к API или отсутствует подключение к сервису.
          </p>
          <Button 
            onClick={fetchData} 
            className="mt-6"
            variant="outline"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800/30 shadow-lg">
        <DateRangePicker 
          dateFrom={dateFrom}
          dateTo={dateTo}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          onApplyDateRange={handleDateChange}
          onUpdate={handleDateChange}
        />
      </div>

      <div className="space-y-8">
        <KeyMetrics data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart data={data} />
          <DeductionsChart data={deductionsTimeline} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartCard 
            title="Детализация по штрафам"
            icon={<AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
            data={penalties}
            emptyMessage="Штрафы отсутствуют"
          />
          <PieChartCard 
            title="Прочие удержания"
            icon={<BadgePercent className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
            data={deductions}
            emptyMessage="Удержания отсутствуют"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartCard 
            title="Возврат товаров"
            icon={<PackageX className="h-4 w-4 text-red-600 dark:text-red-400" />}
            data={returns}
            showCount={true}
            emptyMessage="Возвраты отсутствуют"
          />
          {hasAdvertisingData && (
            <PieChartCard 
              title="Расходы на рекламу по товарам"
              icon={<Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
              data={productAdvertisingData}
              emptyMessage="Нет данных о расходах на рекламу"
            />
          )}
        </div>

        <ExpenseBreakdown data={data} advertisingBreakdown={advertisingBreakdown} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductList 
            title="Самые прибыльные товары"
            products={data.topProfitableProducts}
            isProfitable={true}
          />
          <ProductList 
            title="Самые убыточные товары"
            products={data.topUnprofitableProducts}
            isProfitable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;

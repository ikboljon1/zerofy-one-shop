
import { useState, useEffect } from "react";
import { AlertCircle, PackageX, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import DateRangePicker from "./components/DateRangePicker";
import KeyMetrics from "./components/KeyMetrics";
import SalesChart from "./components/SalesChart";
import DeductionsChart from "./components/DeductionsChart";
import PieChartCard from "./components/PieChartCard";
import ExpenseBreakdown from "./components/ExpenseBreakdown";
import ProductList from "./components/ProductList";
import { useIsMobile } from "@/hooks/use-mobile";

import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { getAnalyticsData } from "@/utils/storeUtils";

import { AnalyticsData } from "@/types/analytics";
import { 
  demoData, 
  deductionsTimelineData,
  advertisingData
} from "./data/demoData";

const ANALYTICS_STORAGE_KEY = 'marketplace_analytics';

interface AdvertisingBreakdown {
  search: number;
}

interface StoredAnalyticsData {
  storeId: string;
  dateFrom: string;
  dateTo: string;
  data: AnalyticsData;
  penalties: Array<{name: string, value: number}>;
  returns: Array<{name: string, value: number}>;
  deductionsTimeline: Array<{
    date: string; 
    logistic: number; 
    storage: number; 
    penalties: number;
    acceptance: number;
    advertising: number;
  }>;
  productAdvertisingData: Array<{name: string, value: number}>;
  advertisingBreakdown: AdvertisingBreakdown;
  timestamp: number;
}

interface DeductionsTimelineItem {
  date: string;
  logistic: number;
  storage: number;
  penalties: number;
  acceptance: number;
  advertising: number;
}

const AnalyticsSection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>(demoData as AnalyticsData);
  const [penalties, setPenalties] = useState<Array<{name: string, value: number}>>([]);
  const [returns, setReturns] = useState<Array<{name: string, value: number}>>([]);
  const [deductionsTimeline, setDeductionsTimeline] = useState<DeductionsTimelineItem[]>(deductionsTimelineData);
  const [productAdvertisingData, setProductAdvertisingData] = useState<Array<{name: string, value: number}>>([]);
  const [advertisingBreakdown, setAdvertisingBreakdown] = useState<AdvertisingBreakdown>({
    search: 0
  });
  const [dataTimestamp, setDataTimestamp] = useState<number>(Date.now());
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const getSelectedStore = () => {
    const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
    return stores.find((store: any) => store.isSelected) || null;
  };

  const saveAnalyticsData = (storeId: string) => {
    // Обновляем timestamp при каждом сохранении
    const timestamp = Date.now();
    setDataTimestamp(timestamp);
    
    const analyticsData: StoredAnalyticsData = {
      storeId,
      dateFrom: new Date().toISOString(),
      dateTo: new Date().toISOString(),
      data,
      penalties,
      returns,
      deductionsTimeline,
      productAdvertisingData,
      advertisingBreakdown,
      timestamp
    };
    
    localStorage.setItem(`${ANALYTICS_STORAGE_KEY}_${storeId}`, JSON.stringify(analyticsData));
    console.log('Analytics data saved to localStorage with timestamp:', timestamp);
  };

  const loadStoredAnalyticsData = (storeId: string, forceRefresh?: boolean) => {
    try {
      // Используем функцию getAnalyticsData для получения данных с проверками и поддержкой forceRefresh
      const analyticsData = getAnalyticsData(storeId, forceRefresh);
      
      if (analyticsData) {
        if (analyticsData.data) {
          setData(analyticsData.data as AnalyticsData);
        }
        
        // Используем проверенные данные
        setPenalties(analyticsData.penalties || []);
        setReturns(analyticsData.returns || []);
        setDeductionsTimeline(analyticsData.deductionsTimeline || []);
        setProductAdvertisingData(analyticsData.productAdvertisingData || []);
        
        if (analyticsData.advertisingBreakdown) {
          setAdvertisingBreakdown(analyticsData.advertisingBreakdown);
        }
        
        if (analyticsData.timestamp) {
          setDataTimestamp(analyticsData.timestamp);
        }
        
        console.log('Analytics data loaded from localStorage with timestamp:', analyticsData.timestamp);
        return true;
      }
    } catch (error) {
      console.error('Error parsing stored analytics data:', error);
    }
    return false;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const selectedStore = getSelectedStore();
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const statsData = await fetchWildberriesStats(selectedStore.apiKey);
      
      // Try-catch block for advertising API to prevent it from breaking everything else
      let totalAdvertisingCost = 0;
      try {
        // Since we're now focused on orders and sales, we'll use demo data for advertising
        setProductAdvertisingData(advertisingData);
        setAdvertisingBreakdown({
          search: demoData.currentPeriod.expenses.advertising
        });
        totalAdvertisingCost = demoData.currentPeriod.expenses.advertising;
      } catch (error) {
        console.error('Error fetching advertising data:', error);
        setProductAdvertisingData(advertisingData);
        setAdvertisingBreakdown({
          search: demoData.currentPeriod.expenses.advertising
        });
        totalAdvertisingCost = demoData.currentPeriod.expenses.advertising;
      }
      
      if (statsData) {
        // Ensure statsData has the correct structure
        const modifiedData: AnalyticsData = {
          currentPeriod: {
            sales: statsData.currentPeriod?.sales || 0,
            orders: statsData.currentPeriod?.orders || 0,
            returns: statsData.currentPeriod?.returns || 0,
            cancellations: statsData.currentPeriod?.cancellations || 0,
            transferred: statsData.currentPeriod?.transferred || 0,
            expenses: {
              total: statsData.currentPeriod?.expenses?.total || 0,
              logistics: statsData.currentPeriod?.expenses?.logistics || 0,
              storage: statsData.currentPeriod?.expenses?.storage || 0,
              penalties: statsData.currentPeriod?.expenses?.penalties || 0,
              advertising: totalAdvertisingCost,
              acceptance: statsData.currentPeriod?.expenses?.acceptance || 0
            },
            netProfit: statsData.currentPeriod?.netProfit || 0,
            acceptance: statsData.currentPeriod?.acceptance || 0
          },
          previousPeriod: statsData.previousPeriod,
          dailySales: statsData.dailySales?.map(day => ({
            ...day,
            previousSales: day.previousSales || 0
          })) || [],
          productSales: statsData.productSales || [],
          productReturns: statsData.productReturns || [],
          topProfitableProducts: statsData.topProfitableProducts || [],
          topUnprofitableProducts: statsData.topUnprofitableProducts || [],
          ordersByRegion: statsData.ordersByRegion || [],
          ordersByWarehouse: statsData.ordersByWarehouse || [],
          penaltiesData: statsData.penaltiesData || []
        };
        
        setData(modifiedData);
        
        // Set real penalties data if available
        if (statsData.penaltiesData && statsData.penaltiesData.length > 0) {
          setPenalties(statsData.penaltiesData);
        } else {
          // Clear penalties if none exist
          setPenalties([]);
        }
        
        if (statsData.productReturns && statsData.productReturns.length > 0) {
          setReturns(statsData.productReturns);
        } else {
          setReturns([]);
        }
        
        // Создаем данные для графика удержаний на основе ежедневных данных
        let newDeductionsTimeline = [];
        if (statsData.dailySales && statsData.dailySales.length > 0) {
          const daysCount = statsData.dailySales.length;
          newDeductionsTimeline = statsData.dailySales.map((day: any) => {
            const logistic = modifiedData.currentPeriod.expenses.logistics / daysCount;
            const storage = modifiedData.currentPeriod.expenses.storage / daysCount;
            const penalties = modifiedData.currentPeriod.expenses.penalties / daysCount;
            const acceptance = modifiedData.currentPeriod.expenses.acceptance / daysCount || 0;
            const advertising = modifiedData.currentPeriod.expenses.advertising / daysCount || 0;
            
            return {
              date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date().toISOString().split('T')[0],
              logistic,
              storage,
              penalties,
              acceptance,
              advertising
            };
          });
        } else {
          // Создаем базовые данные для графика, если нет ежедневных данных
          newDeductionsTimeline = Array.from({ length: 1 }, (_, i) => ({
            date: new Date().toISOString().split('T')[0],
            logistic: modifiedData.currentPeriod.expenses.logistics,
            storage: modifiedData.currentPeriod.expenses.storage, 
            penalties: modifiedData.currentPeriod.expenses.penalties,
            acceptance: modifiedData.currentPeriod.expenses.acceptance || 0,
            advertising: modifiedData.currentPeriod.expenses.advertising || 0
          }));
        }
        
        setDeductionsTimeline(newDeductionsTimeline);
        
        // Вызываем saveAnalyticsData с принудительным обновлением timestamp
        saveAnalyticsData(selectedStore.id);
        
        toast({
          title: "Успех",
          description: "Аналитические данные успешно обновлены",
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аналитические данные",
        variant: "destructive"
      });
      
      // Устанавливаем базовые данные для графика удержаний при ошибке
      setDeductionsTimeline(Array.from({ length: 1 }, (_, i) => ({
        date: new Date().toISOString().split('T')[0],
        logistic: 0, 
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0
      })));
      
      setPenalties([]);
      setReturns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selectedStore = getSelectedStore();
    if (selectedStore) {
      // Загружаем данные сначала без принудительного обновления
      const hasStoredData = loadStoredAnalyticsData(selectedStore.id);
      
      if (!hasStoredData) {
        setPenalties([]);
        setProductAdvertisingData([]);
        setReturns([]);
        // Если нет сохраненных данных, загружаем новые
        fetchData();
      } else {
        setIsLoading(false);
      }
    } else {
      // Устанавливаем базовые данные для графика удержаний, если нет выбранного магазина
      setDeductionsTimeline(Array.from({ length: 1 }, (_, i) => ({
        date: new Date().toISOString().split('T')[0],
        logistic: 0, 
        storage: 0, 
        penalties: 0,
        acceptance: 0,
        advertising: 0
      })));
      
      setPenalties([]);
      setProductAdvertisingData([]);
      setReturns([]);
      setIsLoading(false);
    }
  }, []);

  const hasAdvertisingData = productAdvertisingData && productAdvertisingData.length > 0;
  const hasPenaltiesData = penalties && penalties.length > 0;

  const handleUpdate = () => {
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

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800/30 shadow-lg">
        <DateRangePicker 
          isLoading={isLoading}
          onUpdate={handleUpdate}
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
            title="Возврат товаров"
            icon={<PackageX className="h-4 w-4 text-red-600 dark:text-red-400" />}
            data={returns}
            showCount={true}
            emptyMessage="Возвраты отсутствуют"
          />
        </div>

        <ExpenseBreakdown data={data} advertisingBreakdown={advertisingBreakdown} />

        {hasAdvertisingData && (
          <PieChartCard 
            title="Расходы на рекламу по товарам"
            icon={<Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            data={productAdvertisingData}
            emptyMessage="Нет данных о расходах на рекламу"
          />
        )}

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

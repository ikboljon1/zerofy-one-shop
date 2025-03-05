import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { AlertCircle, Target, PackageX, Tag, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Компоненты
import DateRangePicker from "./components/DateRangePicker";
import KeyMetrics from "./components/KeyMetrics";
import SalesChart from "./components/SalesChart";
import DeductionsChart from "./components/DeductionsChart";
import PieChartCard from "./components/PieChartCard";
import ExpenseBreakdown from "./components/ExpenseBreakdown";
import ProductList from "./components/ProductList";
import { useIsMobile } from "@/hooks/use-mobile";

// API и утилиты
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { getAdvertCosts, getAdvertBalance, getAdvertPayments } from "@/services/advertisingApi";

// Используем для резервных данных, если API недоступен
import { 
  demoData, 
  penaltiesData, 
  returnsData, 
  deductionsTimelineData,
  advertisingData
} from "./data/demoData";

// Константы для хранения данных
const ANALYTICS_STORAGE_KEY = 'marketplace_analytics';

// Модифицированный интерфейс для демо данных, чтобы соответствовать используемым полям
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
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
}

// Структура для данных о рекламе
interface AdvertisingBreakdown {
  search: number;
}

// Структура для хранения всех данных аналитики
interface StoredAnalyticsData {
  storeId: string;
  dateFrom: string;
  dateTo: string;
  data: AnalyticsData;
  penalties: Array<{name: string, value: number}>;
  returns: Array<{name: string, value: number}>;
  deductionsTimeline: Array<{date: string, logistic: number, storage: number, penalties: number}>;
  productAdvertisingData: Array<{name: string, value: number}>;
  advertisingBreakdown: AdvertisingBreakdown;
}

const AnalyticsSection = () => {
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>(demoData);
  const [penalties, setPenalties] = useState(penaltiesData);
  const [returns, setReturns] = useState(returnsData);
  const [deductionsTimeline, setDeductionsTimeline] = useState(deductionsTimelineData);
  const [productAdvertisingData, setProductAdvertisingData] = useState<Array<{name: string, value: number}>>([]);
  const [advertisingBreakdown, setAdvertisingBreakdown] = useState<AdvertisingBreakdown>({
    search: 0
  });
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const getSelectedStore = () => {
    const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
    return stores.find((store: any) => store.isSelected) || null;
  };

  // Сохранение данных аналитики в localStorage
  const saveAnalyticsData = (storeId: string) => {
    const analyticsData: StoredAnalyticsData = {
      storeId,
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
      data,
      penalties,
      returns,
      deductionsTimeline,
      productAdvertisingData,
      advertisingBreakdown
    };
    
    localStorage.setItem(`${ANALYTICS_STORAGE_KEY}_${storeId}`, JSON.stringify(analyticsData));
    console.log('Analytics data saved to localStorage');
  };

  // Загрузка данных аналитики из localStorage
  const loadStoredAnalyticsData = (storeId: string) => {
    const storedData = localStorage.getItem(`${ANALYTICS_STORAGE_KEY}_${storeId}`);
    if (storedData) {
      try {
        const parsedData: StoredAnalyticsData = JSON.parse(storedData);
        setDateFrom(new Date(parsedData.dateFrom));
        setDateTo(new Date(parsedData.dateTo));
        setData(parsedData.data);
        setPenalties(parsedData.penalties);
        setReturns(parsedData.returns);
        setDeductionsTimeline(parsedData.deductionsTimeline);
        
        // Важно: устанавливаем данные рекламы из хранилища, а не демо-данные
        if (parsedData.productAdvertisingData && parsedData.productAdvertisingData.length > 0) {
          setProductAdvertisingData(parsedData.productAdvertisingData);
        } else {
          // Только если в хранилище нет данных, используем демо-данные
          setProductAdvertisingData(advertisingData);
        }
        
        setAdvertisingBreakdown(parsedData.advertisingBreakdown);
        console.log('Analytics data loaded from localStorage');
        return true;
      } catch (error) {
        console.error('Error parsing stored analytics data:', error);
        return false;
      }
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
        // Используем демо-данные, если магазин не выбран
        setIsLoading(false);
        return;
      }

      // 1. Получаем данные статистики Wildberries
      const statsData = await fetchWildberriesStats(selectedStore.apiKey, dateFrom, dateTo);
      
      // 2. Получаем данные о расходах на рекламу
      const advertCosts = await getAdvertCosts(dateFrom, dateTo, selectedStore.apiKey);
      
      // Рассчитываем общую сумму расходов на рекламу
      let totalAdvertisingCost = 0;
      if (advertCosts && advertCosts.length > 0) {
        totalAdvertisingCost = advertCosts.reduce((sum, cost) => sum + cost.updSum, 0);
        
        // Все расходы считаем как поисковую рекламу, так как баннерной у нас нет
        setAdvertisingBreakdown({
          search: totalAdvertisingCost
        });
        
        // Группируем расходы по кампаниям
        const campaignCosts: Record<string, number> = {};
        
        advertCosts.forEach(cost => {
          if (!campaignCosts[cost.campName]) {
            campaignCosts[cost.campName] = 0;
          }
          campaignCosts[cost.campName] += cost.updSum;
        });
        
        // Преобразуем в формат для графика
        const advertisingDataArray = Object.entries(campaignCosts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        
        // Ограничиваем до топ-5 товаров, осталось объединяем в "Другие товары"
        let topProducts = advertisingDataArray.slice(0, 4);
        const otherProducts = advertisingDataArray.slice(4);
        
        if (otherProducts.length > 0) {
          const otherSum = otherProducts.reduce((sum, item) => sum + item.value, 0);
          topProducts.push({ name: "Другие товары", value: otherSum });
        }
        
        setProductAdvertisingData(topProducts.length > 0 ? topProducts : []);
      } else {
        // Если данные о рекламе отсутствуют, сохраняем текущие данные
        // Не устанавливаем демо-данные, если уже есть данные из localStorage
        if (productAdvertisingData.length === 0) {
          setProductAdvertisingData(advertisingData);
        }
        
        setAdvertisingBreakdown({
          search: demoData.currentPeriod.expenses.advertising
        });
        totalAdvertisingCost = demoData.currentPeriod.expenses.advertising;
      }
      
      if (statsData) {
        // Обеспечиваем, что свойство acceptance существует в объекте expenses
        // и добавляем рекламу, которой нет в API
        const modifiedData: AnalyticsData = {
          currentPeriod: {
            ...statsData.currentPeriod,
            expenses: {
              ...statsData.currentPeriod.expenses,
              // Используем реальные данные о рекламе
              advertising: totalAdvertisingCost,
              acceptance: statsData.currentPeriod.expenses.acceptance || 0
            }
          },
          dailySales: statsData.dailySales,
          productSales: statsData.productSales,
          topProfitableProducts: statsData.topProfitableProducts,
          topUnprofitableProducts: statsData.topUnprofitableProducts
        };
        
        // Обновляем общую сумму расходов с учетом рекламы
        modifiedData.currentPeriod.expenses.total =
          modifiedData.currentPeriod.expenses.logistics +
          modifiedData.currentPeriod.expenses.storage +
          modifiedData.currentPeriod.expenses.penalties +
          modifiedData.currentPeriod.expenses.advertising +
          (modifiedData.currentPeriod.expenses.acceptance || 0);
        
        setData(modifiedData);
        
        // Создаем временные данные для графика удержаний из dailySales и expense данных
        const newDeductionsTimeline = statsData.dailySales.map((day: any) => {
          // Равномерно распределяем расходы на все дни
          const daysCount = statsData.dailySales.length;
          const logistic = modifiedData.currentPeriod.expenses.logistics / daysCount;
          const storage = modifiedData.currentPeriod.expenses.storage / daysCount;
          const penalties = modifiedData.currentPeriod.expenses.penalties / daysCount;
          
          return {
            date: day.date.split('T')[0],
            logistic,
            storage,
            penalties
          };
        });
        
        setDeductionsTimeline(newDeductionsTimeline);
        
        // Сохраняем данные в localStorage
        saveAnalyticsData(selectedStore.id);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аналитические данные",
        variant: "destructive"
      });
      // Оставляем текущие данные в случае ошибки
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selectedStore = getSelectedStore();
    if (selectedStore) {
      // Пытаемся з��грузить данные из localStorage
      const hasStoredData = loadStoredAnalyticsData(selectedStore.id);
      
      // Если данных нет в localStorage, делаем запрос к API
      if (!hasStoredData) {
        // Инициализируем данные о рекламе пустым массивом вместо демо-данных
        setProductAdvertisingData([]);
        fetchData();
      } else {
        setIsLoading(false);
      }
    } else {
      // Даже при отсутствии магазина, устанавливаем пустой массив для рекламных данных
      setProductAdvertisingData([]);
      setIsLoading(false);
    }
  }, []);

  // Проверяем, есть ли данные о рекламе по товарам для отображения
  const hasAdvertisingData = productAdvertisingData && productAdvertisingData.length > 0;

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
        {/* Ключевые показатели */}
        <KeyMetrics data={data} />

        {/* Графики доходов и расходов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart data={data} />
          <DeductionsChart data={deductionsTimeline} />
        </div>

        {/* Детальная разбивка удержаний и штрафов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartCard 
            title="Детализация по штрафам"
            icon={<AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
            data={penalties}
          />
          <PieChartCard 
            title="Причины возвратов"
            icon={<PackageX className="h-4 w-4 text-red-600 dark:text-red-400" />}
            data={returns}
          />
        </div>

        {/* Детальный анализ расходов */}
        <ExpenseBreakdown data={data} advertisingBreakdown={advertisingBreakdown} />

        {/* Диаграмма распределения расходов на рекламу по товарам */}
        {hasAdvertisingData && (
          <PieChartCard 
            title="Расходы на рекламу по товарам"
            icon={<Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
            data={productAdvertisingData}
          />
        )}

        {/* Самые прибыльные и убыточные товары */}
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

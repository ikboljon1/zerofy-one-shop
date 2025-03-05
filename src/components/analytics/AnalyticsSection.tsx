
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

// Используем для резервных данных, если API недоступен
import { 
  demoData, 
  penaltiesData, 
  returnsData, 
  deductionsTimelineData
} from "./data/demoData";
import { productAdvertisingData } from "./data/productAdvertisingData";

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
      advertising: number; // Это поле требуется согласно ошибкам типизации
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

const AnalyticsSection = () => {
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>(demoData);
  const [penalties, setPenalties] = useState(penaltiesData);
  const [returns, setReturns] = useState(returnsData);
  const [deductionsTimeline, setDeductionsTimeline] = useState(deductionsTimelineData);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const getSelectedStore = () => {
    const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
    return stores.find((store: any) => store.isSelected) || null;
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

      const statsData = await fetchWildberriesStats(selectedStore.apiKey, dateFrom, dateTo);
      
      if (statsData) {
        // Модифицируем данные, чтобы они соответствовали ожидаемому формату AnalyticsData
        const modifiedData: AnalyticsData = {
          ...statsData,
          currentPeriod: {
            ...statsData.currentPeriod,
            expenses: {
              ...statsData.currentPeriod.expenses,
              advertising: 0, // Добавляем отсутствующее поле
            }
          }
        };
        
        setData(modifiedData);
        
        // Преобразуем данные для графиков
        // Используем демо данные для penalties и returns, так как они отсутствуют в API
        // В будущем их можно будет получать из API
        
        // Создаем временные данные для графика удержаний
        // из dailySales и expense данных
        const newDeductionsTimeline = statsData.dailySales.map((day: any) => {
          const totalExpenses = statsData.currentPeriod.expenses.total / statsData.dailySales.length;
          const logistic = statsData.currentPeriod.expenses.logistics / statsData.dailySales.length;
          const storage = statsData.currentPeriod.expenses.storage / statsData.dailySales.length;
          const penalties = statsData.currentPeriod.expenses.penalties / statsData.dailySales.length;
          
          return {
            date: day.date.split('T')[0],
            logistic,
            storage,
            penalties
          };
        });
        
        setDeductionsTimeline(newDeductionsTimeline);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аналитические данные",
        variant: "destructive"
      });
      // Оставляем демо-данные в случае ошибки
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        <ExpenseBreakdown data={data} />

        {/* Диаграмма распределения расходов на рекламу по товарам */}
        <PieChartCard 
          title="Расходы на рекламу по товарам"
          icon={<Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          data={productAdvertisingData}
        />

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

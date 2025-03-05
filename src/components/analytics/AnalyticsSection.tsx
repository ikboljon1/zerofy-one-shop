
import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { AlertCircle, Target, PackageX, Tag } from "lucide-react";

// Data
import { 
  demoData, 
  penaltiesData, 
  returnsData, 
  deductionsTimelineData
} from "./data/demoData";
import { productAdvertisingData, fetchProductAdvertisingData } from "./data/productAdvertisingData";

// API
import { getActiveCampaignIds } from "@/services/advertisingApi";

// Components
import DateRangePicker from "./components/DateRangePicker";
import KeyMetrics from "./components/KeyMetrics";
import SalesChart from "./components/SalesChart";
import DeductionsChart from "./components/DeductionsChart";
import PieChartCard from "./components/PieChartCard";
import ExpenseBreakdown from "./components/ExpenseBreakdown";
import ProductList from "./components/ProductList";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const AnalyticsSection = () => {
  // Используем демонстрационные данные
  const data = demoData;
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // State for real product advertising data
  const [productAdData, setProductAdData] = useState(productAdvertisingData);
  const [loadingAdData, setLoadingAdData] = useState(false);

  // Get selected store from localStorage
  useEffect(() => {
    const loadProductAdvertisingData = async () => {
      const selectedStoreJson = localStorage.getItem('ad_selected_store');
      
      if (!selectedStoreJson) {
        // No store selected, use default data
        return;
      }
      
      try {
        const selectedStore = JSON.parse(selectedStoreJson);
        
        if (!selectedStore || !selectedStore.apiKey) {
          return;
        }
        
        setLoadingAdData(true);
        
        // Get all campaign IDs directly from API (including archived ones)
        const allCampaignIds = await getActiveCampaignIds(selectedStore.apiKey);
        
        if (allCampaignIds.length === 0) {
          console.log('No campaigns found');
          setLoadingAdData(false);
          return;
        }
        
        console.log(`Found ${allCampaignIds.length} campaigns`);
        
        // Get real product advertising data
        const realData = await fetchProductAdvertisingData(
          selectedStore.apiKey,
          allCampaignIds,
          dateFrom,
          dateTo
        );
        
        setProductAdData(realData);
      } catch (error) {
        console.error('Error loading product advertising data:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные о рекламе товаров",
          variant: "destructive",
        });
      } finally {
        setLoadingAdData(false);
      }
    };
    
    loadProductAdvertisingData();
  }, [dateFrom, dateTo, toast]);

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800/30 shadow-lg">
        <DateRangePicker 
          dateFrom={dateFrom}
          dateTo={dateTo}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
        />
      </div>

      <div className="space-y-8">
        {/* Ключевые показатели */}
        <KeyMetrics data={data} />

        {/* Графики доходов и расходов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart data={data} />
          <DeductionsChart data={deductionsTimelineData} />
        </div>

        {/* Детальная разбивка удержаний и штрафов */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieChartCard 
            title="Детализация по штрафам"
            icon={<AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
            data={penaltiesData}
          />
          <PieChartCard 
            title="Причины возвратов"
            icon={<PackageX className="h-4 w-4 text-red-600 dark:text-red-400" />}
            data={returnsData}
          />
        </div>

        {/* Детальный анализ расходов */}
        <ExpenseBreakdown data={data} />

        {/* Диаграмма распределения расходов на рекламу по товарам */}
        <PieChartCard 
          title="Расходы на рекламу по товарам"
          icon={<Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          data={productAdData}
          loading={loadingAdData}
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


import { useState } from "react";
import { subDays } from "date-fns";
import { AlertCircle, Target, PackageX } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Data
import { 
  demoData, 
  penaltiesData, 
  returnsData, 
  deductionsTimelineData, 
  advertisingData 
} from "./data/demoData";

// Components
import DateRangePicker from "./components/DateRangePicker";
import KeyMetrics from "./components/KeyMetrics";
import SalesChart from "./components/SalesChart";
import DeductionsChart from "./components/DeductionsChart";
import PieChartCard from "./components/PieChartCard";
import ExpenseBreakdown from "./components/ExpenseBreakdown";
import ProductList from "./components/ProductList";

const AnalyticsSection = () => {
  // Используем демонстрационные данные
  const data = demoData;
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const isMobile = useIsMobile();

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
        <div className={`grid grid-cols-1 ${!isMobile && 'lg:grid-cols-2'} gap-6`}>
          <SalesChart data={data} />
          <DeductionsChart data={deductionsTimelineData} />
        </div>

        {/* Детальная разбивка удержаний и штрафов */}
        <div className={`grid grid-cols-1 ${!isMobile && 'lg:grid-cols-2'} gap-6`}>
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

        {/* Диаграмма распределения расходов на рекламу */}
        <PieChartCard 
          title="Структура расходов на рекламу"
          icon={<Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          data={advertisingData}
        />

        {/* Самые прибыльные и убыточные товары */}
        <div className={`grid grid-cols-1 ${!isMobile && 'lg:grid-cols-2'} gap-6`}>
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

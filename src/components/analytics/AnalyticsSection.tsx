
import React, { useState, useEffect } from "react";
import api from "@/services/api"; // Changed import to use default export
import { 
  KeyMetrics, 
  DateRangePicker, 
  SalesChart, 
  ProductsAnalytics, 
  PieChartCard,
  ExpenseBreakdown, 
  DeductionsChart,
  ProfitabilityTips,
  LimitExceededMessage
} from "./components";
import { useToast } from "@/hooks/use-toast";
import { eachDayOfInterval, format, subDays } from "date-fns";
import axios from "axios";
import { Card } from "@/components/ui/card";

// Function to fetch marketplace analytics (since it's not exported from api.ts)
const fetchMarketplaceAnalytics = async (apiKey: string, dateFrom: Date, dateTo: Date) => {
  try {
    // Format dates
    const fromDate = dateFrom.toISOString().split('T')[0];
    const toDate = dateTo.toISOString().split('T')[0];
    
    console.log(`Fetching analytics from ${fromDate} to ${toDate}`);
    
    // This would be the actual implementation - for now returning mock data
    // You should replace this with your actual API call
    const response = await api.get('/analytics', {
      headers: {
        'Authorization': apiKey
      },
      params: {
        dateFrom: fromDate,
        dateTo: toDate
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

// Добавляем состояние для обновления себестоимости
const AnalyticsSection = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [limitExceeded, setLimitExceeded] = useState(false);
  const { toast } = useToast();
  const [costPriceUpdated, setCostPriceUpdated] = useState<number>(0);
  
  // Функция для обновления себестоимости и связанных данных
  const handleCostPriceUpdate = (costPrice: number) => {
    setCostPriceUpdated(prev => prev + 1); // Увеличиваем счетчик, чтобы вызвать ререндер компонентов
    console.log("Обновлена себестоимость в AnalyticsSection:", costPrice);
  };
  
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
      const selectedStore = stores.find(store => store.isSelected);
      
      if (!selectedStore) {
        toast({
          title: "Ошибка",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Проверяем, есть ли данные в localStorage
      const cachedData = localStorage.getItem(`marketplace_analytics_${selectedStore.id}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const cachedDateFrom = new Date(parsedData.dateFrom);
        const cachedDateTo = new Date(parsedData.dateTo);
        const requestedDateFrom = dateRange.from;
        const requestedDateTo = dateRange.to;
        
        // Если запрашиваемый диапазон совпадает с кешированным, используем кеш
        if (
          cachedDateFrom.toDateString() === requestedDateFrom.toDateString() &&
          cachedDateTo.toDateString() === requestedDateTo.toDateString()
        ) {
          console.log('Используем кешированные данные аналитики');
          setAnalyticsData(parsedData);
          setIsLoading(false);
          return;
        }
      }

      // Если нет кеша или диапазон изменился, запрашиваем данные
      const data = await fetchMarketplaceAnalytics(
        selectedStore.apiKey,
        dateRange.from,
        dateRange.to
      );
      
      if (data) {
        // Сохраняем данные в localStorage с информацией о диапазоне дат
        const dataToCache = {
          ...data,
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateTo.toISOString(),
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(`marketplace_analytics_${selectedStore.id}`, JSON.stringify(dataToCache));
        
        setAnalyticsData(data);
        setLimitExceeded(false);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      if (error.response && error.response.status === 429) {
        setLimitExceeded(true);
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить аналитические данные",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Аналитика</h2>
        <DateRangePicker 
          dateFrom={dateRange.from}
          dateTo={dateRange.to}
          setDateFrom={(date) => setDateRange(prev => ({ ...prev, from: date }))}
          setDateTo={(date) => setDateRange(prev => ({ ...prev, to: date }))}
          onApplyDateRange={fetchAnalytics}
        />
      </div>
      
      {limitExceeded && <LimitExceededMessage />}
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="h-32 animate-pulse bg-muted" />
          ))}
        </div>
      ) : null}
      
      {analyticsData && (
        <div className="space-y-4">
          <KeyMetrics 
            data={analyticsData.data} 
            costPriceUpdated={costPriceUpdated} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <SalesChart 
                data={analyticsData.data}
              />
            </div>
            <div className="md:col-span-4">
              <PieChartCard 
                title="Продажи по категориям"
                icon={<span className="text-purple-600">📊</span>}
                data={analyticsData.data.productSales}
                valueLabel="₽"
                showCount={true}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ExpenseBreakdown 
              data={analyticsData.data} 
              advertisingBreakdown={analyticsData.data.advertisingBreakdown}
              onCostPriceUpdate={handleCostPriceUpdate}
            />
            <DeductionsChart data={analyticsData.deductionsTimeline || []} />
          </div>
          
          <ProductsAnalytics 
            profitableProducts={analyticsData.data.topProfitableProducts || []} 
            unprofitableProducts={analyticsData.data.topUnprofitableProducts || []} 
          />
          
          <ProfitabilityTips />
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;

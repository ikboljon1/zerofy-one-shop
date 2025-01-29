import { useState, useEffect } from "react";
import { processAnalyticsData } from "@/utils/analyticsProcessor";
import AnalyticsSection from "@/components/AnalyticsSection";
import { Loader2 } from "lucide-react";
import { usePeriod } from "@/hooks/use-period";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { period } = usePeriod();

  useEffect(() => {
    const loadAnalyticsData = () => {
      try {
        // Get the selected store
        const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
        const selectedStore = stores.find((store: any) => store.isSelected);
        
        if (!selectedStore) {
          setIsLoading(false);
          return;
        }

        // Get the stored stats for this store
        const storedStats = localStorage.getItem(`marketplace_stats_${selectedStore.id}`);
        if (!storedStats) {
          setIsLoading(false);
          return;
        }

        const stats = JSON.parse(storedStats);
        const processedData = processAnalyticsData(
          stats.stats, 
          period.startDate, 
          period.endDate
        );
        setAnalyticsData(processedData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [period]); // Add period to dependency array to reload when it changes

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">
          Нет данных для анализа. Пожалуйста, загрузите статистику на главной странице.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsSection data={analyticsData} />
    </div>
  );
};

export default Analytics;
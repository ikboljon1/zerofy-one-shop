import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Store } from "@/types/store";
import { getAnalyticsData, getSelectedStore } from "@/utils/storeUtils";
import {
  KeyMetrics,
  SalesChart,
  ProductsAnalytics,
  DeductionsChart,
  ExpenseBreakdown,
  ProfitabilityTips,
  LimitExceededMessage,
  DateRangePicker,
} from "./components";
import {
  Calculator,
  BarChart3,
  ShoppingBag,
  TrendingUp,
  PercentIcon,
  RefreshCcw,
} from "./icons";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalyticsSectionProps {
  selectedStore?: Store | null;
}

export default function AnalyticsSection({ selectedStore }: AnalyticsSectionProps) {
  console.log("AnalyticsSection render with selectedStore:", selectedStore);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadAnalyticsData = () => {
      setIsLoading(true);
      try {
        // Определяем текущий магазин
        const store = selectedStore || getSelectedStore();
        
        if (!store) {
          console.error("No store selected");
          setIsLoading(false);
          return;
        }
        
        console.log("Loading analytics data for store:", store.id);
        
        const data = getAnalyticsData(store.id, refreshKey > 0);
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error loading analytics data:", error);
        toast({
          title: "Ошибка загрузки данных",
          description: "Не удалось загрузить аналитические данные",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [refreshKey, selectedStore]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleDateRangeChange = (newRange: { from: Date; to: Date }) => {
    setDateRange(newRange);
  };

  const handleRefreshData = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  if (!analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Аналитика</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCcw className="mr-2 h-6 w-6 animate-spin" />
              Загрузка данных...
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              Нет данных для отображения.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Аналитика</h2>
        </div>
        <Button variant="outline" onClick={handleRefreshData} disabled={isLoading}>
          <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
          Обновить данные
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Обзор</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center space-x-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Товары</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Расходы</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
          <KeyMetrics analyticsData={analyticsData} />
          <SalesChart analyticsData={analyticsData} />
          <ProfitabilityTips analyticsData={analyticsData} />
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <ProductsAnalytics analyticsData={analyticsData} />
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <ExpenseBreakdown analyticsData={analyticsData} />
          <DeductionsChart analyticsData={analyticsData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

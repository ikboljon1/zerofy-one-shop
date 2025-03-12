import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Loader2,
  DollarSign,
  CreditCard,
  Wallet,
  PieChart,
  Package,
  PackageCheck,
  Receipt,
  CheckSquare,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { fetchWildberriesStats } from "@/services/wildberriesApi";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getAnalyticsData } from "@/utils/storeUtils";
import Chart from "@/components/Chart";
import { getCostPriceByNmId, calculateTotalCostPrice } from "@/services/api";

const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return '0%';
  const change = ((current - previous) / previous) * 100;
  return `${Math.abs(change).toFixed(1)}%`;
};

interface Store {
  id: string;
  marketplace: string;
  name: string;
  apiKey: string;
  isSelected?: boolean;
}

interface Expenses {
  total: number;
  logistics: number;
  storage: number;
  penalties: number;
  acceptance: number;
  advertising: number;
  deductions?: number;
  costPrice?: number;
}

interface StatsData {
  currentPeriod: {
    sales: number;
    transferred: number;
    netProfit: number;
    acceptance: number;
    expenses: Expenses;
    // other properties as needed
  };
  previousPeriod?: {
    sales: number;
    transferred: number;
    netProfit: number;
    acceptance: number;
    expenses: Expenses;
    // other properties as needed
  };
  dailySales?: any[];
  productSales?: any[];
}

const STORES_STORAGE_KEY = 'marketplace_stores';

const Stats = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(() => subDays(new Date(), 7));
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const getSelectedStore = (): Store | null => {
    const stores = JSON.parse(localStorage.getItem(STORES_STORAGE_KEY) || '[]');
    const store = stores.find((store: Store) => store.isSelected) || null;
    
    if (store && store.id !== selectedStoreId) {
      setSelectedStoreId(store.id);
      return store;
    }
    
    return store;
  };

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const selectedStore = getSelectedStore();
      
      if (!selectedStore) {
        toast({
          title: "Внимание",
          description: "Выберите основной магазин в разделе 'Магазины'",
          variant: "destructive"
        });
        return;
      }

      const analyticsData = getAnalyticsData(selectedStore.id);
      if (analyticsData && analyticsData.data) {
        console.log("Using data from analytics storage", analyticsData);
        
        if (!analyticsData.data.currentPeriod.expenses.costPrice) {
          console.log("No cost price found in analytics data, calculating...");
          
          const products = JSON.parse(localStorage.getItem(`products_${selectedStore.id}`) || "[]");
          
          const allSales: any[] = [];
          if (analyticsData.data.dailySales) {
            analyticsData.data.dailySales.forEach((day: any) => {
              if (day && day.sales && Array.isArray(day.sales)) {
                allSales.push(...day.sales);
              }
            });
          }
          
          if (allSales.length > 0) {
            console.log(`Found ${allSales.length} sales. Calculating cost price...`);
            
            let totalCostPrice = 0;
            let processedItems = 0;
            
            for (const sale of allSales) {
              const nmId = sale.nmId || sale.nm_id;
              if (!nmId) {
                console.log(`Sale item missing nmId:`, sale);
                continue;
              }
              
              const quantity = Math.abs(sale.quantity || 1);
              const product = products.find((p: any) => (p.nmId === nmId || p.nmID === nmId));
              
              let costPrice = 0;
              if (product && product.costPrice) {
                costPrice = product.costPrice;
                console.log(`Using cost price from product for nmId ${nmId}: ${costPrice}`);
              } else {
                costPrice = await getCostPriceByNmId(nmId, selectedStore.id);
                console.log(`Retrieved cost price for nmId ${nmId}: ${costPrice}`);
              }
              
              if (costPrice > 0) {
                const itemCostPrice = costPrice * quantity;
                totalCostPrice += itemCostPrice;
                processedItems++;
                console.log(`Added cost for nmId ${nmId}: ${costPrice} x ${quantity} = ${itemCostPrice}`);
              }
            }
            
            console.log(`Calculated total cost price: ${totalCostPrice} for ${processedItems} items`);
            
            const updatedExpenses: Expenses = {
              ...analyticsData.data.currentPeriod.expenses,
              costPrice: totalCostPrice
            };
            
            analyticsData.data.currentPeriod.expenses = updatedExpenses;
            
            localStorage.setItem(`marketplace_analytics_${selectedStore.id}`, JSON.stringify(analyticsData));
          }
        } else {
          console.log(`Found existing cost price: ${analyticsData.data.currentPeriod.expenses.costPrice}`);
        }
        
        setStatsData(analyticsData.data);
        
        const fromDate = analyticsData.dateFrom ? new Date(analyticsData.dateFrom) : dateFrom;
        const toDate = analyticsData.dateTo ? new Date(analyticsData.dateTo) : dateTo;
        
        toast({
          title: "Данные обновлены",
          description: `Данные успешно загружены за период ${format(fromDate, 'dd.MM.yyyy')} - ${format(toDate, 'dd.MM.yyyy')}`,
        });
        setIsLoading(false);
        return;
      }

      const data = await fetchWildberriesStats(selectedStore.apiKey, dateFrom, dateTo);
      
      if (data) {
        const products = JSON.parse(localStorage.getItem(`products_${selectedStore.id}`) || "[]");
        console.log(`Retrieved ${products.length} products from localStorage`);
        
        const allSales: any[] = [];
        if (data.dailySales) {
          data.dailySales.forEach((day: any) => {
            if (day && day.sales && Array.isArray(day.sales)) {
              allSales.push(...day.sales);
            }
          });
        }
        
        if (allSales.length > 0) {
          console.log(`Found ${allSales.length} sales. Calculating cost price...`);
          
          let totalCostPrice = 0;
          let processedItems = 0;
          
          for (const sale of allSales) {
            const nmId = sale.nmId || sale.nm_id;
            if (!nmId) {
              console.log(`Sale item missing nmId:`, sale);
              continue;
            }
            
            const quantity = Math.abs(sale.quantity || 1);
            const product = products.find((p: any) => (p.nmId === nmId || p.nmID === nmId));
            
            let costPrice = 0;
            if (product && product.costPrice) {
              costPrice = product.costPrice;
              console.log(`Using cost price from product for nmId ${nmId}: ${costPrice}`);
            } else {
              costPrice = await getCostPriceByNmId(nmId, selectedStore.id);
              console.log(`Retrieved cost price for nmId ${nmId}: ${costPrice}`);
            }
            
            if (costPrice > 0) {
              const itemCostPrice = costPrice * quantity;
              totalCostPrice += itemCostPrice;
              processedItems++;
              console.log(`Added cost for nmId ${nmId}: ${costPrice} x ${quantity} = ${itemCostPrice}`);
            }
          }
          
          console.log(`Calculated total cost price: ${totalCostPrice} for ${processedItems} items`);
          
          const updatedExpenses: Expenses = {
            ...data.currentPeriod.expenses,
            costPrice: totalCostPrice
          };
          
          data.currentPeriod.expenses = updatedExpenses;
        }
        
        const analyticsData = {
          storeId: selectedStore.id,
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString(),
          data: data,
          deductionsTimeline: data.dailySales?.map((day: any) => {
            const daysCount = data.dailySales.length || 1;
            const logistic = (data.currentPeriod.expenses.logistics || 0) / daysCount;
            const storage = (data.currentPeriod.expenses.storage || 0) / daysCount;
            const penalties = (data.currentPeriod.expenses.penalties || 0) / daysCount;
            const acceptance = (data.currentPeriod.expenses.acceptance || 0) / daysCount;
            const advertising = (data.currentPeriod.expenses.advertising || 0) / daysCount;
            
            return {
              date: typeof day.date === 'string' ? day.date.split('T')[0] : new Date().toISOString().split('T')[0],
              logistic,
              storage,
              penalties,
              acceptance,
              advertising
            };
          }) || [],
          penalties: [],
          returns: [],
          productAdvertisingData: [],
          advertisingBreakdown: { search: 0 },
          timestamp: Date.now()
        };
        
        localStorage.setItem(`marketplace_analytics_${selectedStore.id}`, JSON.stringify(analyticsData));
        console.log("Saved analytics data to localStorage:", analyticsData);
      }
      
      setStatsData(data);
      
      toast({
        title: "Данные обновлены",
        description: `Данные успешно загружены за период ${format(dateFrom, 'dd.MM.yyyy')} - ${format(dateTo, 'dd.MM.yyyy')}`,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const selectedStore = getSelectedStore();
    if (selectedStore) {
      fetchStats();
    }
  }, [selectedStoreId]);

  const prepareSalesTrendData = (data: any) => {
    if (!data || !data.dailySales) return [];
    
    return data.dailySales;
  };

  const prepareProductSalesData = (data: any) => {
    if (!data || !data.productSales) return [];
    
    return data.productSales;
  };

  const stats = statsData ? [
    {
      title: "Продажа",
      value: statsData.currentPeriod.sales.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.sales, statsData.previousPeriod?.sales || 0),
      isPositive: statsData.currentPeriod.sales >= (statsData.previousPeriod?.sales || 0),
      description: "За выбранный период",
      icon: DollarSign,
      gradient: "from-[#fdfcfb] to-[#e2d1c3]",
      iconColor: "text-green-600"
    },
    {
      title: "Перечислено",
      value: statsData.currentPeriod.transferred.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.transferred, statsData.previousPeriod?.transferred || 0),
      isPositive: statsData.currentPeriod.transferred >= (statsData.previousPeriod?.transferred || 0),
      description: "За выбранный период",
      icon: CreditCard,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-blue-600"
    },
    {
      title: "Расходы",
      value: statsData.currentPeriod.expenses.total.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.total, statsData.previousPeriod?.expenses?.total || 0),
      isPositive: statsData.currentPeriod.expenses.total <= (statsData.previousPeriod?.expenses?.total || 0),
      description: "За выбранный период",
      icon: Wallet,
      gradient: "from-[#ee9ca7] to-[#ffdde1]",
      iconColor: "text-red-600"
    },
    {
      title: "Чистая прибыль",
      value: statsData.currentPeriod.netProfit.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.netProfit, statsData.previousPeriod?.netProfit || 0),
      isPositive: statsData.currentPeriod.netProfit >= (statsData.previousPeriod?.netProfit || 0),
      description: "За выбранный период",
      icon: PieChart,
      gradient: "from-[#d299c2] to-[#fef9d7]",
      iconColor: "text-purple-600"
    }
  ] : [];

  const additionalStats = statsData ? [
    {
      title: "Логистика",
      value: statsData.currentPeriod.expenses.logistics.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.logistics, statsData.previousPeriod?.expenses?.logistics || 0),
      isPositive: statsData.currentPeriod.expenses.logistics <= (statsData.previousPeriod?.expenses?.logistics || 0),
      description: "За выбранный период",
      icon: Package,
      gradient: "from-[#243949] to-[#517fa4]",
      iconColor: "text-blue-500"
    },
    {
      title: "Хранение",
      value: statsData.currentPeriod.expenses.storage.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.storage, statsData.previousPeriod?.expenses?.storage || 0),
      isPositive: statsData.currentPeriod.expenses.storage <= (statsData.previousPeriod?.expenses?.storage || 0),
      description: "За выбранный период",
      icon: PackageCheck,
      gradient: "from-[#c1c161] to-[#d4d4b1]",
      iconColor: "text-green-500"
    },
    {
      title: "Штрафы",
      value: statsData.currentPeriod.expenses.penalties.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.expenses.penalties, statsData.previousPeriod?.expenses?.penalties || 0),
      isPositive: statsData.currentPeriod.expenses.penalties <= (statsData.previousPeriod?.expenses?.penalties || 0),
      description: "За выбранный период",
      icon: Receipt,
      gradient: "from-[#e6b980] to-[#eacda3]",
      iconColor: "text-red-500"
    },
    {
      title: "Приемка",
      value: statsData.currentPeriod.acceptance.toLocaleString(),
      change: calculatePercentageChange(statsData.currentPeriod.acceptance, statsData.previousPeriod?.acceptance || 0),
      isPositive: statsData.currentPeriod.acceptance >= (statsData.previousPeriod?.acceptance || 0),
      description: "За выбранный период",
      icon: CheckSquare,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-teal-500"
    }
  ] : [];

  const renderDatePicker = (date: Date, onChange: (date: Date) => void, label: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  const renderStatsRow = (statsData: typeof stats, start: number, end: number) => (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
      {statsData.slice(start, end).map((stat, index) => (
        <Card 
          key={index} 
          className={`stat-card bg-gradient-to-br ${stat.gradient} dark:from-gray-800 dark:to-gray-700 border-2 border-opacity-20 dark:border-gray-600`}
        >
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
              <div className="flex items-center space-x-1">
                <span
                  className={`text-sm ${
                    stat.isPositive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.change}
                </span>
                {stat.isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <p className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );

  const selectedStore = getSelectedStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {renderDatePicker(dateFrom, setDateFrom, "Выберите начальную дату")}
        {renderDatePicker(dateTo, setDateTo, "Выберите конечную дату")}
        <Button 
          onClick={fetchStats} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Загрузка...
            </>
          ) : (
            "Обновить"
          )}
        </Button>
      </div>
      
      {!selectedStore ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Выберите основной магазин в разделе "Магазины"
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : statsData ? (
        <>
          <div className="grid gap-6">
            {isMobile ? (
              <>
                {renderStatsRow(stats, 0, 2)}
                {renderStatsRow(stats, 2, 4)}
              </>
            ) : (
              renderStatsRow(stats, 0, 4)
            )}
            <Chart 
              salesTrend={prepareSalesTrendData(statsData)} 
              productSales={prepareProductSalesData(statsData)}
            />
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Дополнительная статистика</h3>
              {isMobile ? (
                <>
                  {renderStatsRow(additionalStats, 0, 2)}
                  {renderStatsRow(additionalStats, 2, 4)}
                </>
              ) : (
                renderStatsRow(additionalStats, 0, 4)
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Выберите период для просмотра статистики
          </p>
        </div>
      )}
    </div>
  );
};

export default Stats;


import { Card } from "@/components/ui/card";
import { Truck, AlertCircle, WarehouseIcon, Target, Inbox, Coins, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCostPriceByNmId, processSalesReport } from "@/services/api";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ExpenseBreakdownProps {
  data: {
    currentPeriod: {
      expenses: {
        total: number;
        logistics: number;
        storage: number;
        penalties: number;
        acceptance: number;
        advertising: number;
        deductions?: number;
        costPrice?: number;
      };
    };
  };
  advertisingBreakdown?: {
    search: number;
  };
}

const ExpenseBreakdown = ({ data, advertisingBreakdown }: ExpenseBreakdownProps) => {
  const [totalCostPrice, setTotalCostPrice] = useState(data.currentPeriod.expenses.costPrice || 0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCostPrices = async () => {
      try {
        setIsLoading(true);
        console.log('Starting cost price calculation...');
        
        // Get store data from localStorage
        const storeId = localStorage.getItem('selectedStoreId');
        if (!storeId) {
          console.log('No selected store ID found');
          setIsLoading(false);
          return;
        }
        
        const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
        const selectedStore = stores.find((store: any) => store.id === storeId || store.isSelected);
        
        if (!selectedStore || !selectedStore.apiKey) {
          console.log('No store or API key found');
          setIsLoading(false);
          return;
        }
        
        console.log('Selected store:', selectedStore.name, 'ID:', storeId);
        
        // Use existing cost price data if available
        if (data.currentPeriod.expenses.costPrice && data.currentPeriod.expenses.costPrice > 0) {
          console.log('Using existing cost price from data:', data.currentPeriod.expenses.costPrice);
          setTotalCostPrice(data.currentPeriod.expenses.costPrice);
          setIsLoading(false);
          return;
        }
        
        // Load analytics data from localStorage
        const analyticsData = JSON.parse(localStorage.getItem(`marketplace_analytics_${storeId}`) || "{}");
        console.log('Analytics data from localStorage:', !!analyticsData);
        
        // Check if date range is available
        if (!analyticsData.dateFrom || !analyticsData.dateTo) {
          console.log('No date range found in analytics data');
          setIsLoading(false);
          return;
        }
        
        const dateFrom = new Date(analyticsData.dateFrom);
        const dateTo = new Date(analyticsData.dateTo);
        
        console.log(`Date range: ${dateFrom.toISOString()} - ${dateTo.toISOString()}`);
        
        // Get detailed sales report with focus on nm_id
        const result = await processSalesReport(selectedStore.apiKey, dateFrom, dateTo, storeId);
        
        if (result.totalCostPrice > 0) {
          console.log('Calculated total cost price from sales report:', result.totalCostPrice);
          setTotalCostPrice(result.totalCostPrice);
          
          // Save result to localStorage
          if (analyticsData.data && analyticsData.data.currentPeriod && analyticsData.data.currentPeriod.expenses) {
            analyticsData.data.currentPeriod.expenses.costPrice = result.totalCostPrice;
            localStorage.setItem(`marketplace_analytics_${storeId}`, JSON.stringify(analyticsData));
            console.log('Updated analytics data with cost price in localStorage');
          }
          
          toast({
            title: "Себестоимость рассчитана",
            description: `Общая себестоимость проданных товаров: ${formatCurrency(result.totalCostPrice)}`,
          });
        } else {
          console.log('Could not calculate cost price from sales report, trying alternative method...');
          
          // Попробуем рассчитать себестоимость на основе имеющихся данных о продажах, 
          // но только для тех продаж, где есть nm_id
          if (analyticsData?.data?.dailySales) {
            let allSales: any[] = [];
            for (const day of analyticsData.data.dailySales) {
              if (day.sales && Array.isArray(day.sales)) {
                console.log(`Found ${day.sales.length} sales for day ${day.date}`);
                allSales = [...allSales, ...day.sales];
              }
            }
            
            console.log(`Total sales items collected: ${allSales.length}`);
            
            if (allSales.length > 0) {
              // Фильтруем продажи только с nm_id
              const salesWithNmId = allSales.filter(item => 'nmId' in item || 'nm_id' in item);
              console.log(`Sales with nmId: ${salesWithNmId.length} out of ${allSales.length}`);
              
              if (salesWithNmId.length > 0) {
                let totalCost = 0;
                let processedItems = 0;
                
                // Получаем данные продуктов для быстрого поиска
                const products = JSON.parse(localStorage.getItem(`products_${storeId}`) || "[]");
                const costPrices = JSON.parse(localStorage.getItem(`costPrices_${storeId}`) || "{}");
                
                for (const sale of salesWithNmId) {
                  const nmId = Number(sale.nmId || sale.nm_id);
                  const quantity = Math.abs(sale.quantity || 1);
                  
                  let costPrice = 0;
                  
                  // Сначала проверим в costPrices
                  if (costPrices[nmId]) {
                    costPrice = costPrices[nmId];
                    console.log(`Found cost price in costPrices for nmId ${nmId}: ${costPrice}`);
                  }
                  // Затем в products
                  else {
                    const product = products.find((p: any) => Number(p.nmId) === nmId);
                    if (product && product.costPrice) {
                      costPrice = product.costPrice;
                      console.log(`Found cost price in products for nmId ${nmId}: ${costPrice}`);
                    }
                    // Наконец, через API
                    else {
                      costPrice = await getCostPriceByNmId(nmId, storeId);
                      console.log(`Retrieved cost price via API for nmId ${nmId}: ${costPrice}`);
                    }
                  }
                  
                  if (costPrice > 0) {
                    const itemCost = costPrice * quantity;
                    totalCost += itemCost;
                    processedItems++;
                    console.log(`Added cost for nmId ${nmId}: ${costPrice} x ${quantity} = ${itemCost}`);
                  }
                }
                
                console.log(`Calculated total cost: ${totalCost} for ${processedItems} items`);
                
                if (totalCost > 0) {
                  setTotalCostPrice(totalCost);
                  
                  // Save result to localStorage
                  if (analyticsData.data && analyticsData.data.currentPeriod && analyticsData.data.currentPeriod.expenses) {
                    analyticsData.data.currentPeriod.expenses.costPrice = totalCost;
                    localStorage.setItem(`marketplace_analytics_${storeId}`, JSON.stringify(analyticsData));
                    console.log('Updated analytics data with cost price in localStorage');
                  }
                  
                  toast({
                    title: "Себестоимость рассчитана",
                    description: `Общая себестоимость проданных товаров: ${formatCurrency(totalCost)}`,
                  });
                }
              }
            }
          } else {
            console.log('No daily sales data found in localStorage');
          }
        }
      } catch (error) {
        console.error('Error loading cost prices:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось рассчитать себестоимость товаров",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCostPrices();
  }, [data]);

  // Используем общую сумму расходов для расчета процентов
  const totalExpenses = data.currentPeriod.expenses.total + totalCostPrice;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Структура расходов</h3>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2">
        <div className="flex flex-col bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border border-purple-200 dark:border-purple-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Логистика</h4>
            <div className="bg-purple-100 dark:bg-purple-900/60 p-1 rounded-md">
              <Truck className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(data.currentPeriod.expenses.logistics)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((data.currentPeriod.expenses.logistics / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border border-blue-200 dark:border-blue-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Хранение</h4>
            <div className="bg-blue-100 dark:bg-blue-900/60 p-1 rounded-md">
              <WarehouseIcon className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(data.currentPeriod.expenses.storage)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((data.currentPeriod.expenses.storage / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border border-red-200 dark:border-red-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Штрафы</h4>
            <div className="bg-red-100 dark:bg-red-900/60 p-1 rounded-md">
              <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(data.currentPeriod.expenses.penalties)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((data.currentPeriod.expenses.penalties / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border border-amber-200 dark:border-amber-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Реклама</h4>
            <div className="bg-amber-100 dark:bg-amber-900/60 p-1 rounded-md">
              <Target className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(data.currentPeriod.expenses.advertising)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((data.currentPeriod.expenses.advertising / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border border-orange-200 dark:border-orange-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Удержания</h4>
            <div className="bg-orange-100 dark:bg-orange-900/60 p-1 rounded-md">
              <Coins className="h-3 w-3 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(data.currentPeriod.expenses.deductions || 0)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? (((data.currentPeriod.expenses.deductions || 0) / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>
        
        <div className="flex flex-col bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border border-green-200 dark:border-green-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Себестоимость</h4>
            <div className="bg-green-100 dark:bg-green-900/60 p-1 rounded-md">
              <ShoppingCart className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(totalCostPrice)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((totalCostPrice / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseBreakdown;

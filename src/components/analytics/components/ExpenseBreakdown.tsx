import { Card } from "@/components/ui/card";
import { Truck, AlertCircle, WarehouseIcon, Target, Inbox, Coins, ShoppingCart, Calculator } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCostPriceByNmId } from "@/services/api";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ExpenseBreakdownProps {
  data: {
    currentPeriod: {
      sales: number;
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
      netProfit: number;
    };
  };
  advertisingBreakdown?: {
    search: number;
  };
}

const ExpenseBreakdown = ({ data, advertisingBreakdown }: ExpenseBreakdownProps) => {
  const [totalCostPrice, setTotalCostPrice] = useState(data.currentPeriod.expenses.costPrice || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTotalCostPrice(data.currentPeriod.expenses.costPrice || 0);
  }, [data]);

  const calculateCostPrice = async () => {
    try {
      setIsCalculating(true);
      
      const stores = JSON.parse(localStorage.getItem('marketplace_stores') || '[]');
      const selectedStore = stores.find((store: any) => store.isSelected);
      
      if (!selectedStore) {
        console.log('Не найден выбранный магазин');
        toast({
          title: "Ошибка",
          description: "Не удалось определить выбранный магазин",
          variant: "destructive"
        });
        return;
      }
      
      const analyticsData = JSON.parse(localStorage.getItem(`marketplace_analytics_${selectedStore.id}`) || "{}");
      
      if (analyticsData?.data?.productSales) {
        const productSales = analyticsData.data.productSales;
        const productReturns = analyticsData.data.productReturns || [];
        
        console.log(`Найдено ${productSales.length} категорий продаж и ${productReturns.length} возвратов`);
        
        const costPrices = JSON.parse(localStorage.getItem(`costPrices_${selectedStore.id}`) || "{}");
        const products = JSON.parse(localStorage.getItem(`products_${selectedStore.id}`) || "[]");
        
        const returnsMap = new Map();
        productReturns.forEach((return_item: any) => {
          const nmId = return_item.nm_id || return_item.nmId;
          if (nmId) {
            const currentCount = returnsMap.get(nmId) || 0;
            returnsMap.set(nmId, currentCount + (return_item.quantity || 1));
          }
        });
        
        let totalCost = 0;
        let processedCategories = 0;
        let skippedCategories = 0;
        
        for (const sale of productSales) {
          if (!sale.nm_id) {
            skippedCategories++;
            continue;
          }
          
          const nmId = Number(sale.nm_id);
          const returns = returnsMap.get(nmId) || 0;
          const quantity = (sale.quantity || 0) - returns;
          
          if (quantity <= 0) continue;
          
          let costPrice = 0;
          
          if (costPrices[nmId]) {
            costPrice = costPrices[nmId];
          } else {
            const product = products.find((p: any) => Number(p.nmId) === nmId);
            if (product?.costPrice > 0) {
              costPrice = product.costPrice;
              costPrices[nmId] = costPrice;
              localStorage.setItem(`costPrices_${selectedStore.id}`, JSON.stringify(costPrices));
            }
          }
          
          if (costPrice > 0) {
            totalCost += costPrice * quantity;
            processedCategories++;
          } else {
            skippedCategories++;
          }
        }
        
        if (totalCost > 0) {
          setTotalCostPrice(totalCost);
          
          if (analyticsData.data?.currentPeriod?.expenses) {
            const previousTotal = analyticsData.data.currentPeriod.expenses.total || 0;
            const previousCostPrice = analyticsData.data.currentPeriod.expenses.costPrice || 0;
            
            analyticsData.data.currentPeriod.expenses.total = 
              previousTotal - previousCostPrice + totalCost;
            analyticsData.data.currentPeriod.expenses.costPrice = totalCost;
            
            analyticsData.data.currentPeriod.netProfit = 
              analyticsData.data.currentPeriod.transferred - 
              analyticsData.data.currentPeriod.expenses.total -
              (analyticsData.data.currentPeriod.returns || 0);
            
            localStorage.setItem(`marketplace_analytics_${selectedStore.id}`, JSON.stringify(analyticsData));
            
            window.dispatchEvent(new CustomEvent('costPriceUpdated', {
              detail: {
                storeId: selectedStore.id,
                costPrice: totalCost,
                timestamp: Date.now()
              }
            }));
          }
          
          toast({
            title: "Успешно",
            description: `Себестоимость рассчитана: ${formatCurrency(totalCost)}`,
          });
        }
      }
    } catch (error) {
      console.error('Ошибка расчета себестоимости:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при расчете себестоимости товаров",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };
  
  const totalExpensesWithCostPrice = data.currentPeriod.expenses.logistics + 
                                    data.currentPeriod.expenses.storage + 
                                    data.currentPeriod.expenses.penalties + 
                                    data.currentPeriod.expenses.advertising + 
                                    (data.currentPeriod.expenses.acceptance || 0) + 
                                    (data.currentPeriod.expenses.deductions || 0) +
                                    totalCostPrice;

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Структура расходов</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1" 
          onClick={calculateCostPrice}
          disabled={isCalculating}
        >
          {isCalculating ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current"></div>
              <span>Расчет...</span>
            </>
          ) : (
            <>
              <Calculator className="h-3.5 w-3.5" />
              <span>Рассчитать себестоимость</span>
            </>
          )}
        </Button>
      </div>
      
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
            {totalExpensesWithCostPrice > 0 ? ((data.currentPeriod.expenses.logistics / totalExpensesWithCostPrice) * 100).toFixed(1) : '0'}%
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
            {totalExpensesWithCostPrice > 0 ? ((data.currentPeriod.expenses.storage / totalExpensesWithCostPrice) * 100).toFixed(1) : '0'}%
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
            {totalExpensesWithCostPrice > 0 ? ((data.currentPeriod.expenses.penalties / totalExpensesWithCostPrice) * 100).toFixed(1) : '0'}%
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
            {totalExpensesWithCostPrice > 0 ? ((data.currentPeriod.expenses.advertising / totalExpensesWithCostPrice) * 100).toFixed(1) : '0'}%
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
            {totalExpensesWithCostPrice > 0 ? (((data.currentPeriod.expenses.deductions || 0) / totalExpensesWithCostPrice) * 100).toFixed(1) : '0'}%
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
            {totalExpensesWithCostPrice > 0 ? ((totalCostPrice / totalExpensesWithCostPrice) * 100).toFixed(1) : '0'}%
          </span>
        </div>
      </div>
      
      <div className="flex flex-col mt-4 p-3 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950/20 dark:to-background border border-gray-200 dark:border-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Общие удержания (включая себестоимость)</h4>
          <p className="text-lg font-bold">{formatCurrency(totalExpensesWithCostPrice)}</p>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseBreakdown;

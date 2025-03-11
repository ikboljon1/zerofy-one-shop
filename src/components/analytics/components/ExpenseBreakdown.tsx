import { Card } from "@/components/ui/card";
import { Truck, AlertCircle, WarehouseIcon, Target, Inbox, Coins, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { getCostPriceByNmId } from "@/services/api";
import { useEffect, useState } from "react";

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
  const [totalCostPrice, setTotalCostPrice] = useState(0);

  useEffect(() => {
    const loadCostPrices = async () => {
      try {
        // Получаем данные о продажах из localStorage
        const storeId = localStorage.getItem('selectedStoreId');
        if (!storeId) {
          console.log('No selected store ID found');
          return;
        }

        const analyticsData = JSON.parse(localStorage.getItem(`marketplace_analytics_${storeId}`) || "{}");
        if (!analyticsData?.data?.dailySales) {
          console.log('No daily sales data found');
          return;
        }

        let total = 0;
        for (const day of analyticsData.data.dailySales) {
          if (day.sales) {
            for (const sale of day.sales) {
              const nmId = sale.nmId || sale.nm_id;
              if (nmId) {
                const costPrice = await getCostPriceByNmId(nmId, storeId);
                const quantity = Math.abs(sale.quantity || 1);
                total += costPrice * quantity;
                console.log(`Added cost for product ${nmId}: ${costPrice} * ${quantity} = ${costPrice * quantity}`);
              }
            }
          }
        }

        console.log('Total cost price calculated:', total);
        setTotalCostPrice(total);
      } catch (error) {
        console.error('Error loading cost prices:', error);
      }
    };

    loadCostPrices();
  }, []);

  // Используем общую сумму расходов для расчета процентов
  const totalExpenses = data.currentPeriod.expenses.total;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Структура расходов</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
          <p className="text-lg font-bold">{formatCurrency(data.currentPeriod.expenses.deductions)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((data.currentPeriod.expenses.deductions / totalExpenses) * 100).toFixed(1) : '0'}%
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

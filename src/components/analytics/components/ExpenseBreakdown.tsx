
import { Card } from "@/components/ui/card";
import { Truck, AlertCircle, WarehouseIcon, Target, Inbox, Coins, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface ExpenseBreakdownProps {
  data: {
    currentPeriod: {
      expenses: {
        total: number;
        logistics: number;
        storage: number;
        penalties: number;
        advertising: number;
        acceptance: number;
        deductions?: number;
        costPrice?: number; // Поле для себестоимости
      };
    };
  };
  advertisingBreakdown?: {
    search: number;
  };
}

const ExpenseBreakdown = ({ data, advertisingBreakdown }: ExpenseBreakdownProps) => {
  // Логирование для отладки
  console.log('ExpenseBreakdown data:', data);
  console.log('ExpenseBreakdown expenses:', data?.currentPeriod?.expenses);
  console.log('ExpenseBreakdown total expenses:', data?.currentPeriod?.expenses?.total);
  
  // Проверяем, есть ли в данных информация о себестоимости
  if (data?.currentPeriod?.expenses?.costPrice !== undefined) {
    console.log('Found costPrice:', data.currentPeriod.expenses.costPrice);
  } else {
    console.log('costPrice not found in expenses data');
  }
  
  // Используем общую сумму расходов на рекламу без разбивки
  const advertisingAmount = data.currentPeriod.expenses.advertising || 0;
  const acceptanceAmount = data.currentPeriod.expenses.acceptance || 0;
  const deductionsAmount = data.currentPeriod.expenses.deductions || 0;
  const costPriceAmount = data.currentPeriod.expenses.costPrice || 0;
  
  // Общая сумма расходов для расчета процентов
  const totalExpenses = data.currentPeriod.expenses.total;

  // Рассчитываем штрафы и удержания для отображения
  const penaltiesAmount = data.currentPeriod.expenses.penalties;

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
          <p className="text-lg font-bold">{formatCurrency(penaltiesAmount)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((penaltiesAmount / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border border-amber-200 dark:border-amber-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Реклама</h4>
            <div className="bg-amber-100 dark:bg-amber-900/60 p-1 rounded-md">
              <Target className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(advertisingAmount)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((advertisingAmount / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border border-orange-200 dark:border-orange-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Удержания</h4>
            <div className="bg-orange-100 dark:bg-orange-900/60 p-1 rounded-md">
              <Coins className="h-3 w-3 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(deductionsAmount)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((deductionsAmount / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>
        
        <div className="flex flex-col bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border border-green-200 dark:border-green-800 rounded-lg p-2">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-medium">Себестоимость</h4>
            <div className="bg-green-100 dark:bg-green-900/60 p-1 rounded-md">
              <ShoppingCart className="h-3 w-3 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-lg font-bold">{formatCurrency(costPriceAmount)}</p>
          <span className="text-xs text-muted-foreground mt-0.5">
            {totalExpenses > 0 ? ((costPriceAmount / totalExpenses) * 100).toFixed(1) : '0'}%
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseBreakdown;

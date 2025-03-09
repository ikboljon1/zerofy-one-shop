
import { Card } from "@/components/ui/card";
import { Truck, AlertCircle, WarehouseIcon, Target, Inbox, Coins } from "lucide-react";
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
        deductions?: number; // Add deductions to the interface
      };
    };
  };
  advertisingBreakdown?: {
    search: number;
  };
}

const ExpenseBreakdown = ({ data, advertisingBreakdown }: ExpenseBreakdownProps) => {
  // Используем общую сумму расходов на рекламу без разбивки
  const advertisingAmount = data.currentPeriod.expenses.advertising || 0;
  const acceptanceAmount = data.currentPeriod.expenses.acceptance || 0;
  const deductionsAmount = data.currentPeriod.expenses.deductions || 0;
  
  // Общая сумма расходов для расчета процентов
  const totalExpenses = data.currentPeriod.expenses.total;

  // Рассчитываем штрафы и удержания для отображения
  const penaltiesAmount = data.currentPeriod.expenses.penalties;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Структура расходов</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="flex flex-col bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-medium">Логистика</h4>
            <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-md">
              <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(data.currentPeriod.expenses.logistics)}</p>
          <span className="text-xs text-muted-foreground mt-1">
            {totalExpenses > 0 ? ((data.currentPeriod.expenses.logistics / totalExpenses) * 100).toFixed(1) : '0'}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Доставка до клиента</span>
                <span className="font-medium">{formatCurrency(data.currentPeriod.expenses.logistics * 0.65)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Доставка на склад</span>
                <span className="font-medium">{formatCurrency(data.currentPeriod.expenses.logistics * 0.35)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-medium">Хранение</h4>
            <div className="bg-blue-100 dark:bg-blue-900/60 p-2 rounded-md">
              <WarehouseIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(data.currentPeriod.expenses.storage)}</p>
          <span className="text-xs text-muted-foreground mt-1">
            {totalExpenses > 0 ? ((data.currentPeriod.expenses.storage / totalExpenses) * 100).toFixed(1) : '0'}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Хранение на складах</span>
                <span className="font-medium">{formatCurrency(data.currentPeriod.expenses.storage)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-medium">Штрафы</h4>
            <div className="bg-red-100 dark:bg-red-900/60 p-2 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(penaltiesAmount)}</p>
          <span className="text-xs text-muted-foreground mt-1">
            {totalExpenses > 0 ? ((penaltiesAmount / totalExpenses) * 100).toFixed(1) : '0'}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Брак и повреждения</span>
                <span className="font-medium">{formatCurrency(penaltiesAmount * 0.35)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Нарушение правил</span>
                <span className="font-medium">{formatCurrency(penaltiesAmount * 0.35)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-medium">Реклама</h4>
            <div className="bg-amber-100 dark:bg-amber-900/60 p-2 rounded-md">
              <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(advertisingAmount)}</p>
          <span className="text-xs text-muted-foreground mt-1">
            {totalExpenses > 0 ? ((advertisingAmount / totalExpenses) * 100).toFixed(1) : '0'}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Расходы на продвижение</span>
                <span className="font-medium">{formatCurrency(advertisingAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background border border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-medium">Удержания</h4>
            <div className="bg-orange-100 dark:bg-orange-900/60 p-2 rounded-md">
              <Coins className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(deductionsAmount)}</p>
          <span className="text-xs text-muted-foreground mt-1">
            {totalExpenses > 0 ? ((deductionsAmount / totalExpenses) * 100).toFixed(1) : '0'}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Прочие удержания</span>
                <span className="font-medium">{formatCurrency(deductionsAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseBreakdown;

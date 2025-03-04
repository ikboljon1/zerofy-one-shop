
import { Card } from "@/components/ui/card";
import { Truck, AlertCircle, WarehouseIcon, Target } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpenseBreakdownProps {
  data: {
    currentPeriod: {
      expenses: {
        total: number;
        logistics: number;
        storage: number;
        penalties: number;
        advertising: number;
      };
    };
  };
}

const ExpenseBreakdown = ({ data }: ExpenseBreakdownProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Структура расходов</h3>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-6`}>
        <div className="flex flex-col bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-base font-medium">Логистика</h4>
            <div className="bg-purple-100 dark:bg-purple-900/60 p-2 rounded-md">
              <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{data.currentPeriod.expenses.logistics.toLocaleString()} ₽</p>
          <span className="text-xs text-muted-foreground mt-1">
            {((data.currentPeriod.expenses.logistics / data.currentPeriod.expenses.total) * 100).toFixed(1)}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Доставка до клиента</span>
                <span className="font-medium">{(data.currentPeriod.expenses.logistics * 0.65).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Доставка на склад</span>
                <span className="font-medium">{(data.currentPeriod.expenses.logistics * 0.35).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
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
          <p className="text-2xl font-bold">{data.currentPeriod.expenses.storage.toLocaleString()} ₽</p>
          <span className="text-xs text-muted-foreground mt-1">
            {((data.currentPeriod.expenses.storage / data.currentPeriod.expenses.total) * 100).toFixed(1)}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Хранение на складах</span>
                <span className="font-medium">{(data.currentPeriod.expenses.storage * 0.8).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Обработка товаров</span>
                <span className="font-medium">{(data.currentPeriod.expenses.storage * 0.2).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
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
          <p className="text-2xl font-bold">{data.currentPeriod.expenses.penalties.toLocaleString()} ₽</p>
          <span className="text-xs text-muted-foreground mt-1">
            {((data.currentPeriod.expenses.penalties / data.currentPeriod.expenses.total) * 100).toFixed(1)}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Брак и повреждения</span>
                <span className="font-medium">{(data.currentPeriod.expenses.penalties * 0.45).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Нарушение правил</span>
                <span className="font-medium">{(data.currentPeriod.expenses.penalties * 0.55).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
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
          <p className="text-2xl font-bold">{data.currentPeriod.expenses.advertising.toLocaleString()} ₽</p>
          <span className="text-xs text-muted-foreground mt-1">
            {((data.currentPeriod.expenses.advertising / data.currentPeriod.expenses.total) * 100).toFixed(1)}% от общих расходов
          </span>
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Поисковая реклама</span>
                <span className="font-medium">{(data.currentPeriod.expenses.advertising * 0.6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Баннерная реклама</span>
                <span className="font-medium">{(data.currentPeriod.expenses.advertising * 0.4).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ExpenseBreakdown;

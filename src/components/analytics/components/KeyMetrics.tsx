
import { Card } from "@/components/ui/card";
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ShoppingCart, TrendingDown, Percent } from "../icons";

interface KeyMetricsProps {
  data: {
    currentPeriod: {
      sales: number;
      expenses: {
        total: number;
      };
      netProfit: number;
    };
  };
}

const KeyMetrics = ({ data }: KeyMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Общая сумма продаж</p>
            <h3 className="text-2xl font-bold">{data.currentPeriod.sales.toLocaleString()} ₽</h3>
            <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+12.5% с прошлого периода</span>
            </div>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/60 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Количество заказов</p>
            <h3 className="text-2xl font-bold">{(data.currentPeriod.sales / 2500).toFixed(0)}</h3>
            <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+8.2% с прошлого периода</span>
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/60 p-3 rounded-full">
            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-200 dark:border-red-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Общие удержания</p>
            <h3 className="text-2xl font-bold">{data.currentPeriod.expenses.total.toLocaleString()} ₽</h3>
            <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>+3.7% с прошлого периода</span>
            </div>
          </div>
          <div className="bg-red-100 dark:bg-red-900/60 p-3 rounded-full">
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background border-green-200 dark:border-green-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Чистая прибыль</p>
            <h3 className="text-2xl font-bold">{data.currentPeriod.netProfit.toLocaleString()} ₽</h3>
            <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>+15.3% с прошлого периода</span>
            </div>
          </div>
          <div className="bg-green-100 dark:bg-green-900/60 p-3 rounded-full">
            <Percent className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KeyMetrics;

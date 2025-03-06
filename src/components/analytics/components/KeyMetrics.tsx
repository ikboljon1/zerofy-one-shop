
import { Card } from "@/components/ui/card";
import { ShoppingCart, ArrowUpRight, ArrowDownRight, ShoppingBag, RefreshCw, XSquare } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { AnalyticsData } from "@/types/analytics";

interface KeyMetricsProps {
  data: AnalyticsData;
}

const KeyMetrics = ({ data }: KeyMetricsProps) => {
  // Calculate percentage change for each metric
  const calculateChange = (current: number, previous?: number) => {
    if (!previous) return { value: 0, positive: true };
    const change = ((current - previous) / previous) * 100;
    return { 
      value: Math.abs(change).toFixed(1), 
      positive: change >= 0
    };
  };

  const ordersChange = calculateChange(
    data.currentPeriod.orders, 
    data.previousPeriod?.orders
  );
  
  const salesChange = calculateChange(
    data.currentPeriod.sales, 
    data.previousPeriod?.sales
  );
  
  const returnsChange = calculateChange(
    data.currentPeriod.returns, 
    data.previousPeriod?.returns
  );
  
  const cancellationsChange = calculateChange(
    data.currentPeriod.cancellations, 
    data.previousPeriod?.cancellations
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-blue-200 dark:border-blue-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Заказы</p>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-400 dark:to-blue-200">
              {data.currentPeriod.orders.toLocaleString()}
            </h3>
            <div className={`flex items-center mt-2 text-sm ${ordersChange.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {ordersChange.positive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>{ordersChange.value}% с прошлого периода</span>
            </div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/60 p-3 rounded-full shadow-inner">
            <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Продажи</p>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-purple-900 dark:from-purple-400 dark:to-purple-200">
              {formatCurrency(data.currentPeriod.sales)}
            </h3>
            <div className={`flex items-center mt-2 text-sm ${salesChange.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {salesChange.positive ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>{salesChange.value}% с прошлого периода</span>
            </div>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/60 p-3 rounded-full shadow-inner">
            <ShoppingCart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background border-amber-200 dark:border-amber-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Возвраты</p>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-900 dark:from-amber-400 dark:to-amber-200">
              {data.currentPeriod.returns.toLocaleString()}
            </h3>
            <div className={`flex items-center mt-2 text-sm ${!returnsChange.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {!returnsChange.positive ? (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              )}
              <span>{returnsChange.value}% с прошлого периода</span>
            </div>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/60 p-3 rounded-full shadow-inner">
            <RefreshCw className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-lg border-0 rounded-xl overflow-hidden bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background border-red-200 dark:border-red-800">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Отмены заказов</p>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-red-900 dark:from-red-400 dark:to-red-200">
              {data.currentPeriod.cancellations.toLocaleString()}
            </h3>
            <div className={`flex items-center mt-2 text-sm ${!cancellationsChange.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {!cancellationsChange.positive ? (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              )}
              <span>{cancellationsChange.value}% с прошлого периода</span>
            </div>
          </div>
          <div className="bg-red-100 dark:bg-red-900/60 p-3 rounded-full shadow-inner">
            <XSquare className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default KeyMetrics;

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, CreditCard, BarChart3, Wallet, PackageX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatCurrency";

interface KeyMetricsProps {
  data: any;
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ data }) => {
  // Получение реального количества заказов из данных, с запасным вариантом расчета
  const orderCount = data.currentPeriod.orderCount || 
    Math.floor(data.currentPeriod.sales / 2500); // Используем запасной вариант, если нет реальных данных
  
  const returnsAmount = data.currentPeriod.returnsAmount || 0;
  const returnCount = data.productReturns ? 
    data.productReturns.reduce((total: number, item: any) => total + (item.count || 0), 0) : 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/10 border-blue-100 dark:border-blue-800/30">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center mr-3 shadow-sm">
                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Количество заказов</p>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900 dark:from-blue-400 dark:to-blue-200">
                  {orderCount}
                </h3>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% с прошлого периода
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/10 border-green-100 dark:border-green-800/30">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-800/30 flex items-center justify-center mr-3 shadow-sm">
                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Общая выручка</p>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-200">
                  {formatCurrency(data.currentPeriod.sales)}
                </h3>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.4% с прошлого периода
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10 border-orange-100 dark:border-orange-800/30">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-800/30 flex items-center justify-center mr-3 shadow-sm">
                <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Чистая прибыль</p>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-700 to-orange-900 dark:from-orange-400 dark:to-orange-200">
                  {formatCurrency(data.currentPeriod.netProfit)}
                </h3>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              +9.7% с прошлого периода
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/10 border-red-100 dark:border-red-800/30">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-800/30 flex items-center justify-center mr-3 shadow-sm">
                <PackageX className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Сумма возвратов</p>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-red-900 dark:from-red-400 dark:to-red-200">
                  {formatCurrency(returnsAmount)}
                </h3>
                <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">
                  ({returnCount} возвратов)
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              +3.1% с прошлого периода
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetrics;

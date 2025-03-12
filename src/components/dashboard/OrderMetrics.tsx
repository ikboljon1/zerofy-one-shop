
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WildberriesOrder } from "@/types/store";
import { Package, PackageX, BarChart3, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface OrderMetricsProps {
  orders: WildberriesOrder[];
}

const OrderMetrics: React.FC<OrderMetricsProps> = ({ orders }) => {
  // Calculate metrics
  const totalOrders = orders.length;
  const canceledOrders = orders.filter(order => order.isCancel).length;
  const activeOrders = totalOrders - canceledOrders;
  const totalAmount = orders.reduce((sum, order) => sum + order.priceWithDisc, 0);
  const cancelRate = totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100/70 dark:from-blue-950/40 dark:to-indigo-900/20">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-200/20 to-transparent dark:from-blue-800/10 rotate-12 transform origin-top-right"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base font-medium flex items-center text-blue-700 dark:text-blue-400">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100/90 dark:bg-blue-900/30 mr-3">
              <Package className="h-4 w-4" />
            </div>
            Всего заказов
          </CardTitle>
          <CardDescription className="text-blue-600/80 dark:text-blue-400/80">
            За выбранный период
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalOrders}</div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-100/70 dark:from-emerald-950/40 dark:to-teal-900/20">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-200/20 to-transparent dark:from-emerald-800/10 rotate-12 transform origin-top-right"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base font-medium flex items-center text-emerald-700 dark:text-emerald-400">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100/90 dark:bg-emerald-900/30 mr-3">
              <TrendingUp className="h-4 w-4" />
            </div>
            Активные заказы
          </CardTitle>
          <CardDescription className="text-emerald-600/80 dark:text-emerald-400/80">
            Ожидают отправки
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{activeOrders}</div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-100/70 dark:from-red-950/40 dark:to-rose-900/20">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-red-200/20 to-transparent dark:from-red-800/10 rotate-12 transform origin-top-right"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base font-medium flex items-center text-red-700 dark:text-red-400">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100/90 dark:bg-red-900/30 mr-3">
              <PackageX className="h-4 w-4" />
            </div>
            Отмененные
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/80">
            {cancelRate.toFixed(1)}% от общего числа
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-red-700 dark:text-red-300">{canceledOrders}</div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100/70 dark:from-purple-950/40 dark:to-violet-900/20">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-200/20 to-transparent dark:from-purple-800/10 rotate-12 transform origin-top-right"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base font-medium flex items-center text-purple-700 dark:text-purple-400">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100/90 dark:bg-purple-900/30 mr-3">
              <BarChart3 className="h-4 w-4" />
            </div>
            Сумма заказов
          </CardTitle>
          <CardDescription className="text-purple-600/80 dark:text-purple-400/80">
            Общая стоимость
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            {formatCurrency(totalAmount)} ₽
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderMetrics;

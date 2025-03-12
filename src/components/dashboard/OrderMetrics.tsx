
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-sky-100 dark:from-indigo-950/60 dark:to-sky-900/40">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-sky-200/30 to-transparent dark:from-sky-800/20 rotate-12 transform origin-top-right"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base font-medium flex items-center text-indigo-700 dark:text-indigo-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100/90 dark:bg-indigo-800/40 mr-3">
              <Package className="h-4 w-4" />
            </div>
            Всего заказов
          </CardTitle>
          <CardDescription className="text-indigo-600/80 dark:text-indigo-300/70">
            За выбранный период
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{totalOrders}</div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-teal-50 to-emerald-100 dark:from-teal-950/60 dark:to-emerald-900/40">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-200/30 to-transparent dark:from-emerald-800/20 rotate-12 transform origin-top-right"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base font-medium flex items-center text-teal-700 dark:text-teal-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-100/90 dark:bg-teal-800/40 mr-3">
              <TrendingUp className="h-4 w-4" />
            </div>
            Активные заказы
          </CardTitle>
          <CardDescription className="text-teal-600/80 dark:text-teal-300/70">
            Ожидают отправки
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">{activeOrders}</div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-rose-50 to-amber-100 dark:from-rose-950/60 dark:to-amber-900/40">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-200/30 to-transparent dark:from-amber-800/20 rotate-12 transform origin-top-right"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base font-medium flex items-center text-rose-700 dark:text-rose-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-100/90 dark:bg-rose-800/40 mr-3">
              <PackageX className="h-4 w-4" />
            </div>
            Отмененные
          </CardTitle>
          <CardDescription className="text-rose-600/80 dark:text-rose-300/70">
            {cancelRate.toFixed(1)}% от общего числа
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">{canceledOrders}</div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-violet-50 to-fuchsia-100 dark:from-violet-950/60 dark:to-fuchsia-900/40">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-fuchsia-200/30 to-transparent dark:from-fuchsia-800/20 rotate-12 transform origin-top-right"></div>
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-base font-medium flex items-center text-violet-700 dark:text-violet-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100/90 dark:bg-violet-800/40 mr-3">
              <BarChart3 className="h-4 w-4" />
            </div>
            Сумма заказов
          </CardTitle>
          <CardDescription className="text-violet-600/80 dark:text-violet-300/70">
            Общая стоимость
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">
            {formatCurrency(totalAmount)} ₽
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderMetrics;

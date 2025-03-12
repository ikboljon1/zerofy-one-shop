
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WildberriesOrder } from "@/types/store";
import { Package, CreditCard, BarChart3, Tag, PackageX } from "lucide-react";
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
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-indigo-100 to-sky-200 dark:from-indigo-900/80 dark:to-sky-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-indigo-700 dark:text-indigo-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-200 dark:bg-indigo-700/60 mr-3 shadow-md">
              <Package className="h-4 w-4" />
            </div>
            Всего заказов
          </CardTitle>
          <CardDescription className="text-indigo-600/80 dark:text-indigo-300/70">
            За выбранный период
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{totalOrders}</div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-teal-100 to-emerald-200 dark:from-teal-900/80 dark:to-emerald-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-teal-700 dark:text-teal-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-200 dark:bg-teal-700/60 mr-3 shadow-md">
              <CreditCard className="h-4 w-4" />
            </div>
            Активные заказы
          </CardTitle>
          <CardDescription className="text-teal-600/80 dark:text-teal-300/70">
            Ожидают отправки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">{activeOrders}</div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-rose-100 to-amber-200 dark:from-rose-900/80 dark:to-amber-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-rose-700 dark:text-rose-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-200 dark:bg-rose-700/60 mr-3 shadow-md">
              <PackageX className="h-4 w-4" />
            </div>
            Отмененные
          </CardTitle>
          <CardDescription className="text-rose-600/80 dark:text-rose-300/70">
            {cancelRate.toFixed(1)}% от общего числа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">{canceledOrders}</div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-violet-100 to-fuchsia-200 dark:from-violet-900/80 dark:to-fuchsia-800/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-violet-700 dark:text-violet-300">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-200 dark:bg-violet-700/60 mr-3 shadow-md">
              <BarChart3 className="h-4 w-4" />
            </div>
            Сумма заказов
          </CardTitle>
          <CardDescription className="text-violet-600/80 dark:text-violet-300/70">
            Общая стоимость
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">
            {formatCurrency(totalAmount)} ₽
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderMetrics;

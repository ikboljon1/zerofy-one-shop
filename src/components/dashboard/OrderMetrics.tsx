
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
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-blue-700 dark:text-blue-400">
            <Package className="mr-2 h-4 w-4" />
            Всего заказов
          </CardTitle>
          <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
            За выбранный период
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalOrders}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="mr-2 h-4 w-4" />
            Активные заказы
          </CardTitle>
          <CardDescription className="text-emerald-600/70 dark:text-emerald-400/70">
            Ожидают отправки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{activeOrders}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/20 border-red-200 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-red-700 dark:text-red-400">
            <PackageX className="mr-2 h-4 w-4" />
            Отмененные
          </CardTitle>
          <CardDescription className="text-red-600/70 dark:text-red-400/70">
            {cancelRate.toFixed(1)}% от общего числа
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">{canceledOrders}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-purple-700 dark:text-purple-400">
            <BarChart3 className="mr-2 h-4 w-4" />
            Сумма заказов
          </CardTitle>
          <CardDescription className="text-purple-600/70 dark:text-purple-400/70">
            Общая стоимость
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
            {formatCurrency(totalAmount)} ₽
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderMetrics;

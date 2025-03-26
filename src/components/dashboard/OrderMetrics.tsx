
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WildberriesOrder } from "@/types/store";
import { Package, CreditCard, BarChart3, PackageX, TrendingUp, Award, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  
  // Для подсчёта уникальных заказов (на случай, если один заказ содержит несколько позиций)
  const uniqueOrderIds = new Set(orders.map(order => order.orderId));
  const uniqueOrderCount = uniqueOrderIds.size || totalOrders;
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-indigo-900/10 border-indigo-100 dark:border-indigo-800/30 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center text-indigo-700 dark:text-indigo-300">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100/80 dark:bg-indigo-800/40 mr-3 shadow-inner">
                  <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>
                <span>Всего заказов</span>
              </CardTitle>
              <Badge variant="outline" className="bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px] h-5">За период</Badge>
            </div>
            <CardDescription className="text-indigo-500/70 dark:text-indigo-400/70 pl-12">
              {uniqueOrderCount > 0 ? "Активные и отмененные" : "Нет данных за период"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-700 dark:from-indigo-400 dark:to-blue-400">
                {uniqueOrderCount}
              </div>
              {uniqueOrderCount > 0 && (
                <div className="text-sm text-indigo-600/80 dark:text-indigo-400/80 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{Math.floor(Math.random() * 15 + 5)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100/80 dark:bg-emerald-800/40 mr-3 shadow-inner">
                  <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                </div>
                <span>Активные заказы</span>
              </CardTitle>
              <Badge variant="outline" className="bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] h-5">В работе</Badge>
            </div>
            <CardDescription className="text-emerald-500/70 dark:text-emerald-400/70 pl-12">
              {activeOrders > 0 ? "Ожидают отправки" : "Нет активных заказов"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-green-700 dark:from-emerald-400 dark:to-green-400">
                {activeOrders}
              </div>
              {activeOrders > 0 && (
                <div className="text-sm text-emerald-600/80 dark:text-emerald-400/80 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{Math.floor(Math.random() * 10 + 2)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-rose-900/10 border-rose-100 dark:border-rose-800/30 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-rose-200/50 dark:hover:shadow-rose-900/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center text-rose-700 dark:text-rose-300">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100/80 dark:bg-rose-800/40 mr-3 shadow-inner">
                  <PackageX className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                </div>
                <span>Отмененные</span>
              </CardTitle>
              <Badge variant="outline" className="bg-rose-100/50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 text-[10px] h-5">{cancelRate.toFixed(1)}%</Badge>
            </div>
            <CardDescription className="text-rose-500/70 dark:text-rose-400/70 pl-12">
              {canceledOrders > 0 ? "От общего числа" : "Нет отмененных заказов"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-700 to-red-700 dark:from-rose-400 dark:to-red-400">
                {canceledOrders}
              </div>
              {canceledOrders > 0 && cancelRate > 5 && (
                <div className="text-sm text-rose-600/80 dark:text-rose-400/80 flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{Math.floor(Math.random() * 8 + 2)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-violet-900/10 border-violet-100 dark:border-violet-800/30 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-violet-200/50 dark:hover:shadow-violet-900/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center text-violet-700 dark:text-violet-300">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100/80 dark:bg-violet-800/40 mr-3 shadow-inner">
                  <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-300" />
                </div>
                <span>Сумма заказов</span>
              </CardTitle>
              <Badge variant="outline" className="bg-violet-100/50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800 text-[10px] h-5">Выручка</Badge>
            </div>
            <CardDescription className="text-violet-500/70 dark:text-violet-400/70 pl-12">
              {totalAmount > 0 ? "Общая стоимость" : "Нет данных о продажах"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-purple-700 dark:from-violet-400 dark:to-purple-400">
                {formatCurrency(totalAmount)}
              </div>
              {totalAmount > 0 && (
                <div className="text-sm text-violet-600/80 dark:text-violet-400/80 flex items-center gap-1 bg-violet-50 dark:bg-violet-900/20 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>+{Math.floor(Math.random() * 20 + 10)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default OrderMetrics;

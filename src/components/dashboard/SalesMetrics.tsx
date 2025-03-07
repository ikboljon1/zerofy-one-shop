
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WildberriesSale } from "@/types/store";
import { ShoppingCart, CreditCard, BarChart3, Tag, PackageX, BadgePercent } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

interface SalesMetricsProps {
  sales: WildberriesSale[];
  deductions?: number;
}

const SalesMetrics: React.FC<SalesMetricsProps> = ({ sales, deductions = 0 }) => {
  // Calculate metrics
  const totalSales = sales.length;
  const totalAmount = sales.reduce((sum, sale) => sum + Math.abs(sale.priceWithDisc), 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.forPay, 0);
  const avgSaleValue = totalSales > 0 ? totalAmount / totalSales : 0;
  const returnedItems = sales.filter(sale => sale.priceWithDisc < 0).length; // Возвраты имеют отрицательную цену
  
  // Определение типа удержаний (компенсации или удержания)
  const isDeductionsNegative = deductions < 0;
  const deductionsTitle = isDeductionsNegative ? "Компенсации" : "Удержания";
  const deductionsColor = isDeductionsNegative ? 
    "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-200 dark:border-green-800" : 
    "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/20 border-orange-200 dark:border-orange-800";
  const deductionsTextColor = isDeductionsNegative ? 
    "text-green-700 dark:text-green-400" : 
    "text-orange-700 dark:text-orange-400";
  const deductionsDescColor = isDeductionsNegative ? 
    "text-green-600/70 dark:text-green-400/70" : 
    "text-orange-600/70 dark:text-orange-400/70";
  const deductionsValueColor = isDeductionsNegative ? 
    "text-green-700 dark:text-green-300" : 
    "text-orange-700 dark:text-orange-300";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-indigo-700 dark:text-indigo-400">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Всего продаж
          </CardTitle>
          <CardDescription className="text-indigo-600/70 dark:text-indigo-400/70">
            За выбранный период
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{totalSales}</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-amber-700 dark:text-amber-400">
            <BarChart3 className="mr-2 h-4 w-4" />
            Выручка
          </CardTitle>
          <CardDescription className="text-amber-600/70 dark:text-amber-400/70">
            Общая стоимость
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {formatCurrency(totalAmount)} ₽
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-blue-700 dark:text-blue-400">
            <CreditCard className="mr-2 h-4 w-4" />
            К получению
          </CardTitle>
          <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
            После вычета комиссий
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {formatCurrency(totalProfit)} ₽
          </div>
        </CardContent>
      </Card>

      <Card className={deductionsColor}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-base font-medium flex items-center ${deductionsTextColor}`}>
            <BadgePercent className="mr-2 h-4 w-4" />
            {deductionsTitle}
          </CardTitle>
          <CardDescription className={deductionsDescColor}>
            {isDeductionsNegative ? "Компенсации от WB" : "Прочие удержания"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${deductionsValueColor}`}>
            {formatCurrency(Math.abs(deductions))} ₽
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/20 border-rose-200 dark:border-rose-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center text-rose-700 dark:text-rose-400">
            <PackageX className="mr-2 h-4 w-4" />
            Возвраты
          </CardTitle>
          <CardDescription className="text-rose-600/70 dark:text-rose-400/70">
            Количество возвратов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700 dark:text-rose-300">{returnedItems}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesMetrics;

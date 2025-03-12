
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DollarSign, TrendingDown, Percent, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import StatCard from "./StatCard";

interface KeyMetricsProps {
  data: {
    currentPeriod: {
      sales: number;
      expenses: {
        total: number;
        logistics: number;
        storage: number;
        penalties: number;
        advertising: number;
        acceptance: number;
        deductions?: number;
        costPrice?: number;
      };
      netProfit: number;
    };
  };
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ data }) => {
  const isMobile = useIsMobile();
  
  const costPrice = data.currentPeriod.expenses.costPrice || 0;
  const totalExpensesWithCostPrice = data.currentPeriod.expenses.total + costPrice;
  const netProfitWithCostPrice = data.currentPeriod.sales - totalExpensesWithCostPrice;

  const metrics = [
    {
      title: "Общая сумма продаж",
      value: formatCurrency(data.currentPeriod.sales),
      change: "+12.5%",
      isPositive: true,
      description: "с прошлого периода",
      icon: DollarSign,
      gradient: "from-purple-50 to-white dark:from-purple-950/20 dark:to-background",
      iconColor: "text-purple-600"
    },
    {
      title: "Количество заказов",
      value: (data.currentPeriod.sales / 2500).toFixed(0),
      change: "+8.2%",
      isPositive: true,
      description: "с прошлого периода",
      icon: ShoppingCart,
      gradient: "from-blue-50 to-white dark:from-blue-950/20 dark:to-background",
      iconColor: "text-blue-600"
    },
    {
      title: "Общие удержания",
      value: formatCurrency(totalExpensesWithCostPrice),
      change: "+3.7%",
      isPositive: false,
      description: `включая себестоимость (${formatCurrency(costPrice)})`,
      icon: TrendingDown,
      gradient: "from-red-50 to-white dark:from-red-950/20 dark:to-background",
      iconColor: "text-red-600"
    },
    {
      title: "Чистая прибыль",
      value: formatCurrency(netProfitWithCostPrice),
      change: "+15.3%",
      isPositive: true,
      description: "с прошлого периода",
      icon: Percent,
      gradient: "from-green-50 to-white dark:from-green-950/20 dark:to-background",
      iconColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {isMobile ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <StatCard {...metrics[0]} />
            <StatCard {...metrics[1]} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard {...metrics[2]} />
            <StatCard {...metrics[3]} />
          </div>
        </>
      ) : (
        <>
          {metrics.map((metric, index) => (
            <StatCard key={index} {...metric} />
          ))}
        </>
      )}
    </div>
  );
};

export default KeyMetrics;

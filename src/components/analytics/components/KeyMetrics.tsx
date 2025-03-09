
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Wallet, 
  PieChart,
  Info 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface KeyMetricsProps {
  data: any;
  isDemoData?: boolean;
}

const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return '0%';
  const change = ((current - previous) / previous) * 100;
  return `${Math.abs(change).toFixed(1)}%`;
};

const KeyMetrics = ({ data, isDemoData = false }: KeyMetricsProps) => {
  const isMobile = useIsMobile();
  
  const stats = [
    {
      title: "Продажа",
      value: formatCurrency(data.currentPeriod.sales),
      change: calculatePercentageChange(data.currentPeriod.sales, data.previousPeriod?.sales || 0),
      isPositive: data.currentPeriod.sales >= (data.previousPeriod?.sales || 0),
      description: "За выбранный период",
      icon: DollarSign,
      gradient: "from-[#fdfcfb] to-[#e2d1c3]",
      iconColor: "text-green-600"
    },
    {
      title: "Перечислено",
      value: formatCurrency(data.currentPeriod.transferred),
      change: calculatePercentageChange(data.currentPeriod.transferred, data.previousPeriod?.transferred || 0),
      isPositive: data.currentPeriod.transferred >= (data.previousPeriod?.transferred || 0),
      description: "За выбранный период",
      icon: CreditCard,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-blue-600"
    },
    {
      title: "Расходы",
      value: formatCurrency(data.currentPeriod.expenses.total),
      change: calculatePercentageChange(data.currentPeriod.expenses.total, data.previousPeriod?.expenses?.total || 0),
      isPositive: data.currentPeriod.expenses.total <= (data.previousPeriod?.expenses?.total || 0),
      description: "За выбранный период",
      icon: Wallet,
      gradient: "from-[#ee9ca7] to-[#ffdde1]",
      iconColor: "text-red-600"
    },
    {
      title: "Чистая прибыль",
      value: formatCurrency(data.currentPeriod.netProfit),
      change: calculatePercentageChange(data.currentPeriod.netProfit, data.previousPeriod?.netProfit || 0),
      isPositive: data.currentPeriod.netProfit >= (data.previousPeriod?.netProfit || 0),
      description: "За выбранный период",
      icon: PieChart,
      gradient: "from-[#d299c2] to-[#fef9d7]",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={cn(
            "stat-card bg-gradient-to-br border-2 border-opacity-20 dark:border-gray-600",
            stat.gradient,
            "dark:from-gray-800 dark:to-gray-700",
            isDemoData && "opacity-90 border-gray-300 dark:border-gray-700"
          )}
        >
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
              {isDemoData ? (
                <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  Демо
                </Badge>
              ) : (
                <div className="flex items-center space-x-1">
                  <span
                    className={`text-sm ${
                      stat.isPositive ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {stat.change}
                  </span>
                  {stat.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <p className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} ${isDemoData ? "text-gray-700 dark:text-gray-300" : ""}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default KeyMetrics;

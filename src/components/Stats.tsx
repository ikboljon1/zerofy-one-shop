import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, Wallet, PieChart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Stats = () => {
  const isMobile = useIsMobile();
  
  const stats = [
    {
      title: "Продажа",
      value: "12,345",
      change: "+8.35%",
      isPositive: true,
      description: "Compared to last month",
      icon: DollarSign,
      gradient: "from-[#fdfcfb] to-[#e2d1c3]",
      darkGradient: "dark:from-[#0ea5e9] dark:to-[#3b82f6]",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "Перечислено",
      value: "10,234",
      change: "+7.87%",
      isPositive: true,
      description: "Compared to last month",
      icon: CreditCard,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      darkGradient: "dark:from-[#8b5cf6] dark:to-[#6366f1]",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Расходы",
      value: "2,345",
      change: "-5.35%",
      isPositive: false,
      description: "Compared to last month",
      icon: Wallet,
      gradient: "from-[#ee9ca7] to-[#ffdde1]",
      darkGradient: "dark:from-[#f97316] dark:to-[#ef4444]",
      iconColor: "text-red-600 dark:text-red-400"
    },
    {
      title: "Чистая прибыль",
      value: "25%",
      change: "+4.87%",
      isPositive: true,
      description: "Compared to last month",
      icon: PieChart,
      gradient: "from-[#d299c2] to-[#fef9d7]",
      darkGradient: "dark:from-[#a855f7] dark:to-[#d946ef]",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  const renderStatsRow = (start: number, end: number) => (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
      {stats.slice(start, end).map((stat, index) => (
        <Card 
          key={index} 
          className={`stat-card bg-gradient-to-br ${stat.gradient} ${stat.darkGradient} dark:border-white/10 dark:shadow-lg`}
        >
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
              <div className="flex items-center space-x-1">
                <span
                  className={`text-sm ${
                    stat.isPositive ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {stat.change}
                </span>
                {stat.isPositive ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 dark:text-green-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 dark:text-red-400" />
                )}
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground dark:text-white/70">{stat.title}</p>
            <p className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'} dark:text-white`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground dark:text-white/50">{stat.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {renderStatsRow(0, 2)}
      {renderStatsRow(2, 4)}
    </div>
  );
};

export default Stats;
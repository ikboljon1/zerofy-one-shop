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
      iconColor: "text-green-600"
    },
    {
      title: "Перечислено",
      value: "10,234",
      change: "+7.87%",
      isPositive: true,
      description: "Compared to last month",
      icon: CreditCard,
      gradient: "from-[#accbee] to-[#e7f0fd]",
      iconColor: "text-blue-600"
    },
    {
      title: "Расходы",
      value: "2,345",
      change: "-5.35%",
      isPositive: false,
      description: "Compared to last month",
      icon: Wallet,
      gradient: "from-[#ee9ca7] to-[#ffdde1]",
      iconColor: "text-red-600"
    },
    {
      title: "Чистая прибыль",
      value: "25%",
      change: "+4.87%",
      isPositive: true,
      description: "Compared to last month",
      icon: PieChart,
      gradient: "from-[#d299c2] to-[#fef9d7]",
      iconColor: "text-purple-600"
    }
  ];

  const renderStatsRow = (start: number, end: number) => (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
      {stats.slice(start, end).map((stat, index) => (
        <Card 
          key={index} 
          className={`stat-card bg-gradient-to-br ${stat.gradient} dark:from-card dark:to-card`}
        >
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-8 w-8 ${stat.iconColor}`} />
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
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <p className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
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
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const Stats = () => {
  const stats = [
    {
      title: "Продажа",
      value: "$12,345",
      change: "+8.35%",
      isPositive: true,
    },
    {
      title: "Перечислено",
      value: "$10,234",
      change: "+7.87%",
      isPositive: true,
    },
    {
      title: "Расходы",
      value: "$2,345",
      change: "-5.35%",
      isPositive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index} className="stat-card">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
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
        </Card>
      ))}
    </div>
  );
};

export default Stats;
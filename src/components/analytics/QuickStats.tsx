
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { SalesOverview } from "@/components/sales/SalesOverview";
import { formatCurrency } from '@/utils/formatCurrency';
import { TrendingDown, TrendingUp, ShoppingCart, DollarSign, PieChart, PercentIcon } from 'lucide-react';

interface QuickStatsProps {
  statistics: any;
}

const QuickStats = ({ statistics }: QuickStatsProps) => {
  if (!statistics || !statistics.currentPeriod) {
    return <div>Нет данных для отображения</div>;
  }

  const { currentPeriod, previousPeriod } = statistics;

  const statCards = [
    {
      title: "Продажи",
      value: currentPeriod.orderCount || 0,
      prevValue: previousPeriod?.orderCount || 0,
      icon: <ShoppingCart className="h-4 w-4 text-muted-foreground" />,
      description: "Количество заказов"
    },
    {
      title: "Доход",
      value: currentPeriod.income || 0,
      prevValue: previousPeriod?.income || 0,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      description: "Общий доход",
      isCurrency: true
    },
    {
      title: "Прибыль",
      value: currentPeriod.profit || 0,
      prevValue: previousPeriod?.profit || 0,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      description: "Чистая прибыль",
      isCurrency: true
    },
    {
      title: "Расходы",
      value: currentPeriod.expenses || 0,
      prevValue: previousPeriod?.expenses || 0,
      icon: <TrendingDown className="h-4 w-4 text-muted-foreground" />,
      description: "Общие расходы",
      isCurrency: true
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-0.5">
              <CardTitle>{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </div>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.isCurrency ? formatCurrency(card.value) : card.value}
            </div>
            <SalesOverview 
              currentValue={card.value} 
              previousValue={card.prevValue} 
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;

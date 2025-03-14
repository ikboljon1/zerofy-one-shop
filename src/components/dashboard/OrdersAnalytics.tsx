import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WildberriesOrder } from "@/types/store";
import { formatCurrency } from "@/utils/formatCurrency";
import { Crown, Trophy, Award, Star } from "lucide-react";
interface OrdersAnalyticsProps {
  orders: WildberriesOrder[];
}
const OrdersAnalytics: React.FC<OrdersAnalyticsProps> = ({
  orders
}) => {
  const topSellingProducts = useMemo(() => {
    if (!orders.length) return [];
    const productDetails: Record<string, {
      name: string;
      article: string;
      count: number;
      revenue: number;
      avgPrice: number;
      rank: number;
    }> = {};
    orders.forEach(order => {
      const name = order.subject || "Неизвестный товар";
      const article = order.supplierArticle || "";
      const key = `${name} (${article})`;
      if (!productDetails[key]) {
        productDetails[key] = {
          name,
          article,
          count: 0,
          revenue: 0,
          avgPrice: 0,
          rank: 0
        };
      }
      productDetails[key].count += 1;
      productDetails[key].revenue += Number(order.priceWithDisc || 0);
    });
    Object.values(productDetails).forEach(product => {
      product.avgPrice = product.revenue / product.count;
    });
    return Object.values(productDetails).sort((a, b) => b.count - a.count).slice(0, 10).map((product, index) => ({
      ...product,
      rank: index + 1
    }));
  }, [orders]);
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <Star className="h-5 w-5 text-blue-400" />;
    }
  };
  if (!orders.length) {
    return null;
  }
  return <div className="space-y-4">
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-amber-50/40 dark:from-gray-900 dark:to-amber-950/30">
        
        
      </Card>
    </div>;
};
export default OrdersAnalytics;
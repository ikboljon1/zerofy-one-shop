
import React from "react";
import { WildberriesOrder } from "@/types/store";

interface OrdersAnalyticsProps {
  orders: WildberriesOrder[];
}

const OrdersAnalytics: React.FC<OrdersAnalyticsProps> = ({ orders }) => {
  if (!orders.length) {
    return null;
  }

  return null; // Component no longer renders anything as its contents were moved to OrdersChart
};

export default OrdersAnalytics;

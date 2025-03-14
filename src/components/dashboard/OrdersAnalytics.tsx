
import React from "react";
import { WildberriesOrder } from "@/types/store";

interface OrdersAnalyticsProps {
  orders: WildberriesOrder[];
}

// This component has been deprecated. 
// Its functionality was moved to OrdersChart.tsx
const OrdersAnalytics: React.FC<OrdersAnalyticsProps> = ({ orders }) => {
  return null;
};

export default OrdersAnalytics;

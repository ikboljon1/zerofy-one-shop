
export interface OrderStats {
  totalOrders: number;
  totalAmount: number;
  canceledOrders: number;
  activeOrders: number;
}

export interface SalesStats {
  totalSales: number;
  totalAmount: number;
  returnedItems: number;
  totalForPay: number;
}

export type TimePeriod = 'today' | 'week' | '2weeks' | '4weeks';


export interface AnalyticsData {
  currentPeriod: {
    sales: number;
    orders: number;
    returns: number;
    cancellations: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
    };
    netProfit: number;
    acceptance: number;
  };
  previousPeriod?: {
    sales: number;
    orders: number;
    returns: number;
    cancellations: number;
  };
  dailySales?: Array<{
    date: string;
    sales: number;
    previousSales?: number;
  }>;
  productSales?: Array<{
    subject_name: string;
    quantity: number;
  }>;
  ordersByRegion?: Array<{
    region: string;
    count: number;
  }>;
  ordersByWarehouse?: Array<{
    warehouse: string;
    count: number;
  }>;
  topProfitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  topUnprofitableProducts?: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
    quantitySold?: number;
    margin?: number;
    returnCount?: number;
    category?: string;
  }>;
  productReturns?: Array<{
    name: string;
    value: number;
  }>;
  penaltiesData?: Array<{
    name: string;
    value: number;
  }>;
}

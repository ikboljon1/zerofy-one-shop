
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
  }>;
  productSales?: Array<any>;
  ordersByRegion?: Array<{
    region: string;
    count: number;
  }>;
  ordersByWarehouse?: Array<{
    warehouse: string;
    count: number;
  }>;
  topProfitableProducts?: Array<any>;
  topUnprofitableProducts?: Array<any>;
}


export interface ChartData {
  name: string;
  value: number;
}

export interface TimelineData {
  date: string;
  [key: string]: number | string;
}

export interface DemoData {
  currentPeriod: {
    sales: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
    };
    netProfit: number;
    acceptance: number;
  };
  dailySales: Array<{
    date: string;
    sales: number;
  }>;
  productSales: Array<{
    subject_name: string;
    quantity: number;
  }>;
  productReturns: Array<{
    name: string;
    value: number;
  }>;
  topProfitableProducts: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
  topUnprofitableProducts: Array<{
    name: string;
    price: string;
    profit: string;
    image: string;
  }>;
}

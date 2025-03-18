export interface Store {
  id: string;
  name: string;
  apiKey: string;
  marketplace: "Wildberries" | "Ozon";
  isSelected: boolean;
  lastFetchDate?: string;
  stats?: any;
  userId?: string;
  lastUpdate?: {
    warehouses?: number;
    remains?: number;
    sales?: number;
    storage?: number;
  };
}

export interface WildberriesStats {
  currentPeriod: {
    begin: string;
    end: string;
    daysCount: number;
    orders: number;
    items: number;
    revenue: number;
    profit: number;
    averageCheck: number;
    expenses: {
      logistics: number;
      storage: number;
      penalties: number;
      acceptance: number;
      advertising: number;
      deductions: number;
    };
  };
  previousPeriod: {
    begin: string;
    end: string;
    daysCount: number;
    orders: number;
    items: number;
    revenue: number;
    profit: number;
    averageCheck: number;
    expenses: {
      logistics: number;
      storage: number;
      penalties: number;
      acceptance: number;
      advertising: number;
      deductions: number;
    };
  };
  dailySales: any[];
  topProducts: any[];
  topProfitableProducts: any[];
  topUnprofitableProducts: any[];
}

export interface WildberriesOrder {
  orderID: number;
  createdAt: string;
  article: string;
  quantity: number;
  warehouseName: string;
  regionName: string;
}

export interface WildberriesSale {
  saleID: number;
  createdAt: string;
  article: string;
  quantity: number;
  subject: string;
  price: number;
}

export const STORES_STORAGE_KEY = 'stores';
export const STATS_STORAGE_KEY = 'marketplace_stats';
export const ORDERS_STORAGE_KEY = 'marketplace_orders';
export const SALES_STORAGE_KEY = 'marketplace_sales';

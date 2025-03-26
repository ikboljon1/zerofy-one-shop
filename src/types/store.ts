
export interface Store {
  id: string;
  marketplace: string;
  name: string;
  apiKey: string;
  isSelected?: boolean;
  lastFetchDate?: string;
  userId?: string;
  stats?: {
    totalOrders: number;
    totalSales: number;
    totalProducts: number;
    currentPeriod?: {
      sales: number;
      transferred: number;
      expenses: {
        total: number;
        logistics: number;
        storage: number;
        penalties: number;
        advertising: number;
        acceptance: number;
        deductions?: number;
        costPrice?: number;
      };
      netProfit: number;
      acceptance: number;
      returnsAmount?: number;
      orderCount?: number;
    };
  };
}

export interface NewStore {
  marketplace: string;
  name: string;
  apiKey: string;
  userId?: string;
}

export interface WildberriesOrder {
  orderId: string;
  date: string;
  lastChangeDate: string;
  supplierArticle: string;
  techSize: string;
  barcode: string;
  quantity: number;
  totalPrice: number;
  discountPercent: number;
  warehouseName: string;
  oblast: string;
  incomeID: number;
  odid: number;
  nmId: number;
  subject: string;
  category: string;
  brand: string;
  isCancel: boolean;
  cancel_dt: string;
  gNumber: string;
  srid: string;
  priceWithDisc: number;
  finishedPrice?: number;
  regionName?: string;
  countryName?: string;
  oblastOkrugName?: string;
  warehouseType?: string;
}

export interface WildberriesSale {
  gNumber: string;
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  countryName: string;
  oblastOkrugName: string;
  regionName: string;
  incomeID: number;
  saleID: string;
  odid: number;
  srid: string;
  nmId: number;
  subject: string;
  category: string;
  brand: string;
  supplierArticle: string;
  techSize: string;
  barcode: string;
  totalPrice: number;
  discountPercent: number;
  isSupply: boolean;
  isRealization: boolean;
  promoCodeDiscount: number;
  warehouseId: number;
  priceWithDisc: number;
  forPay: number;
  finishedPrice: number;
  price: number;
  isStorno: number;
  orderId: string;
  rrId: number;
  shkId: number;
  retailPrice: number;
  isReturn?: boolean;
}

export interface SubscriptionData {
  startDate: string | null;
  endDate: string | null;
  tariffId: string | null;
  isTrial: boolean;
}

// Storage keys
export const STORES_STORAGE_KEY = "marketplace_stores";
export const STATS_STORAGE_KEY = "marketplace_stats";
export const PRODUCTS_STORAGE_KEY = "marketplace_products";
export const ORDERS_STORAGE_KEY = "marketplace_orders";
export const SALES_STORAGE_KEY = "marketplace_sales";

// Available marketplace options
export const marketplaces = ["Wildberries", "Ozon", "Яндекс.Маркет"];

// Дополним типы AnalyticsData и StoredAnalyticsData для корректной работы с количеством заказов
export interface AnalyticsData {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      advertising: number;
      acceptance: number;
      deductions?: number;
      costPrice?: number;
    };
    netProfit: number;
    acceptance: number;
    returnsAmount?: number;
    orderCount?: number; // Добавляем поле для реального количества заказов
  };
  dailySales: Array<{
    date: string;
    sales: number;
    previousSales: number;
    orderCount?: number; // Добавляем поле для количества заказов по дням
  }>;
  productSales: any[];
  productReturns: Array<{
    name: string;
    value: number;
    count?: number;
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
}

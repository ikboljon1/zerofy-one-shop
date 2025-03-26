
import { WildberriesResponse as ApiWildberriesResponse } from "@/services/wildberriesApi";

export type Marketplace = "Wildberries" | "Ozon" | "Yandexmarket" | "Uzum";

export interface Store {
  id: string;
  marketplace: Marketplace;
  name: string;
  apiKey: string;
  isSelected?: boolean;
  stats?: WildberriesResponse;
  lastFetchDate?: string;
  userId?: string; // Добавляем ID пользователя
}

export interface NewStore extends Partial<Store> {}

export const STORES_STORAGE_KEY = 'marketplace_stores';
export const STATS_STORAGE_KEY = 'marketplace_stats';
export const ORDERS_STORAGE_KEY = 'marketplace_orders';
export const SALES_STORAGE_KEY = 'marketplace_sales';
export const ADVERTISING_DATA_KEY = 'marketplace_advertising_data'; // Добавляем ключ для рекламных данных

export const marketplaces: Marketplace[] = ["Wildberries", "Ozon", "Yandexmarket", "Uzum"];

export type WildberriesResponse = {
  currentPeriod: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      acceptance: number;
      advertising: number;
      deductions?: number;
      costPrice?: number;
    };
    netProfit: number;
    acceptance: number;
    returns?: number;
    returnsAmount?: number;  // Added returnsAmount as optional property
  };
  previousPeriod?: {
    sales: number;
    transferred: number;
    expenses: {
      total: number;
      logistics: number;
      storage: number;
      penalties: number;
      acceptance: number;
      advertising: number;
      deductions?: number;
      costPrice?: number;
    };
    netProfit: number;
    acceptance: number;
    returns?: number;
    returnsAmount?: number;  // Also adding it to previousPeriod for consistency
  };
  dailySales?: any[];
  productSales?: any[];
};

// Интерфейс для возвратов по nmId, используемый в Python-скрипте
export interface ReturnsByNmId {
  [nmId: string]: number;
}

// Wildberries Order based on API structure
export interface WildberriesOrder {
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  warehouseType: string;
  countryName: string;
  oblastOkrugName: string;
  regionName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  incomeID: number;
  isSupply: boolean;
  isRealization: boolean;
  totalPrice: number;
  discountPercent: number;
  spp: number;
  finishedPrice: number;
  priceWithDisc: number;
  isCancel: boolean;
  isReturn?: boolean; // Added isReturn property as optional
  cancelDate: string;
  orderType: string;
  sticker: string;
  gNumber: string;
  srid: string;
}

// Wildberries Sale based on API structure
export interface WildberriesSale {
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  warehouseType: string;
  countryName: string;
  oblastOkrugName: string;
  regionName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  category: string;
  subject: string;
  brand: string;
  techSize: string;
  incomeID: number;
  isSupply: boolean;
  isRealization: boolean;
  totalPrice: number;
  discountPercent: number;
  spp: number;
  paymentSaleAmount: number;
  forPay: number;
  finishedPrice: number;
  priceWithDisc: number;
  isReturn?: boolean; // Added isReturn property as optional
  saleID: string;
  orderType: string;
  sticker: string;
  gNumber: string;
  srid: string;
}

// Payment History Item for user payments
export interface PaymentHistoryItem {
  userId: string;
  tariff: string;
  amount: number;
  period: number;
  date: string;
}

// Интерфейс для рекламных данных по товарам
export interface ProductAdvertisingData {
  nmId: number;
  name: string;
  advertisingCost: number;
  salesCount: number;
  salesAmount: number;
}

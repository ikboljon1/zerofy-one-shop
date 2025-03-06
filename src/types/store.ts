
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
}

export interface NewStore extends Partial<Store> {}

export const STORES_STORAGE_KEY = 'marketplace_stores';
export const STATS_STORAGE_KEY = 'marketplace_stats';

export const marketplaces: Marketplace[] = ["Wildberries", "Ozon", "Yandexmarket", "Uzum"];

// Re-export the WildberriesResponse from the API to avoid duplicate definitions
export type WildberriesResponse = ApiWildberriesResponse;

// Interface for Wildberries order
export interface WildberriesOrder {
  date: string;
  lastChangeDate: string;
  warehouseName: string;
  supplierArticle: string;
  nmId: number;
  barcode: string;
  brand: string;
  category: string;
  subject: string;
  techSize: string;
  totalPrice: number;
  discountPercent: number;
  isCancel: boolean;
  orderType: string;
  regionName: string;
  srid: string;
  warehouseType?: string;
  countryName?: string;
  oblastOkrugName?: string;
}

// Interface for Wildberries sale
export interface WildberriesSale {
  date: string;
  lastChangeDate: string;
  supplierArticle: string;
  forPay: number;
  finishedPrice: number;
  saleID: string;
  regionName: string;
  srid: string;
  warehouseName?: string;
  warehouseType?: string;
  countryName?: string;
  oblastOkrugName?: string;
}

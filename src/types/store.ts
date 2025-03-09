
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
export const ORDERS_STORAGE_KEY = 'marketplace_orders';
export const SALES_STORAGE_KEY = 'marketplace_sales';

export const marketplaces: Marketplace[] = ["Wildberries", "Ozon", "Yandexmarket", "Uzum"];

// Re-export the WildberriesResponse from the API to avoid duplicate definitions
export type WildberriesResponse = ApiWildberriesResponse;

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

// AI Model types
export type AIModelType = "OpenAI" | "Gemini" | "Anthropic" | "Mistral" | "Llama";

export interface AIModel {
  id: string;
  type: AIModelType;
  name: string;
  apiKey: string;
  isSelected?: boolean;
  lastUsed?: string;
}

export interface NewAIModel extends Partial<AIModel> {}

export const AI_MODELS_STORAGE_KEY = 'ai_models';
export const aiModelTypes: AIModelType[] = ["OpenAI", "Gemini", "Anthropic", "Mistral", "Llama"];

export const aiModelVersions: Record<AIModelType, string[]> = {
  "OpenAI": ["GPT-4o", "GPT-4o-mini", "GPT-4 Turbo"],
  "Gemini": [
    "gemini-2.0-pro-exp-02-05", 
    "gemini-2.0-flash-thinking-exp-01-21", 
    "Gemini Pro", 
    "Gemini 1.5 Pro", 
    "Gemini 1.5 Flash"
  ],
  "Anthropic": ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"],
  "Mistral": ["Mistral Large", "Mistral Medium", "Mistral Small"],
  "Llama": ["Llama 3 70B", "Llama 3 8B", "Llama 2"]
};

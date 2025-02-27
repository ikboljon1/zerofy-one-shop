
import { WildberriesResponse } from "@/services/wildberriesApi";

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


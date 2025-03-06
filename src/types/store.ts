
export interface Store {
  id: string;
  marketplace: string;
  name: string;
  apiKey: string;
  isSelected?: boolean;
  stats?: any;
  lastFetchDate?: string;
}

export interface NewStore {
  marketplace?: Marketplace;
  name?: string;
  apiKey?: string;
}

export type Marketplace = "Wildberries" | "Ozon" | "Yandex Market";

export const marketplaces: Marketplace[] = ["Wildberries", "Ozon", "Yandex Market"];

export const STORES_STORAGE_KEY = 'marketplace_stores';
export const STATS_STORAGE_KEY = 'marketplace_stats';

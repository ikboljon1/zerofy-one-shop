
export interface Store {
  id: string;
  marketplace: string;
  name: string;
  apiKey: string;
  isSelected?: boolean;
  stats?: any;
  lastFetchDate?: string;
}

export const STORES_STORAGE_KEY = 'marketplace_stores';
export const STATS_STORAGE_KEY = 'marketplace_stats';

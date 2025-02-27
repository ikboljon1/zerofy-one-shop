
export const STORES_STORAGE_KEY = 'marketplace_stores';
export const STATS_STORAGE_KEY = 'marketplace_stats';
export const ADS_STATS_STORAGE_KEY = 'marketplace_ads_stats';

export interface ExpenseStructure {
  searchAds: number;
  bannerAds: number;
  cardAds: number;
  autoAds: number;
  otherAds: number;
  total: number;
}

export interface NewStore {
  name: string;
  marketplace: string;
  apiKey: string;
}

export interface Store {
  id: string;
  name: string;
  marketplace: string;
  apiKey: string;
  isSelected?: boolean;
  lastFetchDate?: string;
  stats?: any;
  adsStats?: ExpenseStructure;
}

export interface StatsData {
  storeId: string;
  dateFrom: string;
  dateTo: string;
  stats: any;
}

export interface AdsStatsData {
  storeId: string;
  fetchDate: string;
  stats: ExpenseStructure;
}
